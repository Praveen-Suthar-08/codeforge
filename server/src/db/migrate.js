import { db } from './connection.js';

export function runMigrations() {
  console.log('Running database migrations...');

  db.exec(`
    -- Users table
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user', -- 'user' or 'admin'
      is_verified INTEGER NOT NULL DEFAULT 1,
      two_factor_secret TEXT,
      two_factor_enabled INTEGER NOT NULL DEFAULT 0,
      two_factor_backup_codes TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      failed_login_attempts INTEGER NOT NULL DEFAULT 0,
      lockout_until INTEGER NOT NULL DEFAULT 0
    );

    -- Refresh Tokens table
    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token_hash TEXT NOT NULL,
      user_agent TEXT,
      ip_address TEXT,
      expires_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Password Reset Tokens
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      used INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Problems table
    CREATE TABLE IF NOT EXISTS problems (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      difficulty TEXT NOT NULL, -- Easy, Medium, Hard
      points INTEGER NOT NULL DEFAULT 10,
      category TEXT NOT NULL,
      tags TEXT NOT NULL, -- JSON array
      companies TEXT, -- JSON array
      function_name TEXT NOT NULL,
      description TEXT NOT NULL,
      examples TEXT NOT NULL, -- JSON array of {input, output, explanation}
      starter_code TEXT NOT NULL, -- JSON map by language {javascript, python, cpp, java}
      hints TEXT, -- JSON array
      editorial TEXT,
      test_cases TEXT NOT NULL, -- JSON array of {args, expected, is_hidden}
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    -- Submissions table
    CREATE TABLE IF NOT EXISTS submissions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      problem_id TEXT NOT NULL,
      language TEXT NOT NULL,
      code TEXT NOT NULL,
      verdict TEXT NOT NULL, -- Accepted, Wrong Answer, Time Limit Exceeded, Runtime Error, Compile Error
      runtime_ms INTEGER NOT NULL DEFAULT 0,
      memory_kb INTEGER NOT NULL DEFAULT 0,
      passed_test_cases INTEGER NOT NULL DEFAULT 0,
      total_test_cases INTEGER NOT NULL DEFAULT 0,
      details TEXT, -- JSON details per test case
      created_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE
    );

    -- Drafts table
    CREATE TABLE IF NOT EXISTS drafts (
      user_id TEXT NOT NULL,
      problem_id TEXT NOT NULL,
      language TEXT NOT NULL,
      code TEXT NOT NULL,
      updated_at INTEGER NOT NULL,
      PRIMARY KEY (user_id, problem_id, language),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE
    );

    -- Bookmarks & Notes
    CREATE TABLE IF NOT EXISTS user_problem_meta (
      user_id TEXT NOT NULL,
      problem_id TEXT NOT NULL,
      is_bookmarked INTEGER NOT NULL DEFAULT 0,
      notes TEXT,
      updated_at INTEGER NOT NULL,
      PRIMARY KEY (user_id, problem_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE
    );

    -- Contests table
    CREATE TABLE IF NOT EXISTS contests (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      start_time INTEGER NOT NULL,
      end_time INTEGER NOT NULL,
      problem_ids TEXT NOT NULL, -- JSON array of problem IDs
      created_at INTEGER NOT NULL
    );

    -- Contest Registrations
    CREATE TABLE IF NOT EXISTS contest_registrations (
      contest_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      score INTEGER NOT NULL DEFAULT 0,
      finish_time INTEGER NOT NULL DEFAULT 0,
      registered_at INTEGER NOT NULL,
      PRIMARY KEY (contest_id, user_id),
      FOREIGN KEY (contest_id) REFERENCES contests(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Discussions / Comments
    CREATE TABLE IF NOT EXISTS comments (
      id TEXT PRIMARY KEY,
      problem_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      content TEXT NOT NULL,
      upvotes INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Audit Logs
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      event_type TEXT NOT NULL,
      ip_address TEXT,
      user_agent TEXT,
      metadata TEXT, -- JSON details
      created_at INTEGER NOT NULL
    );

    -- Projects Module
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      difficulty TEXT NOT NULL,
      steps TEXT NOT NULL, -- JSON array of checklist tasks
      starter_files TEXT NOT NULL, -- JSON map
      created_at INTEGER NOT NULL
    );

    -- User Project Progress
    CREATE TABLE IF NOT EXISTS user_projects (
      user_id TEXT NOT NULL,
      project_id TEXT NOT NULL,
      completed_steps TEXT NOT NULL, -- JSON array of step IDs
      updated_at INTEGER NOT NULL,
      PRIMARY KEY (user_id, project_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    -- Indices for fast querying and low latency
    CREATE INDEX IF NOT EXISTS idx_submissions_user_problem ON submissions(user_id, problem_id);
    CREATE INDEX IF NOT EXISTS idx_submissions_created ON submissions(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id);
    CREATE INDEX IF NOT EXISTS idx_problems_difficulty ON problems(difficulty);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
  `);

  console.log('Database migrations completed successfully.');
}

if (process.argv[1]?.endsWith('migrate.js')) {
  runMigrations();
}
