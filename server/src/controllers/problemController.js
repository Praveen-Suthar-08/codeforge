import { db } from '../db/connection.js';

// Simple LRU cache for problems and leaderboard
class SimpleLRU {
  constructor(max = 100, ttlMs = 60000) {
    this.max = max;
    this.ttlMs = ttlMs;
    this.cache = new Map();
  }
  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    this.cache.delete(key);
    this.cache.set(key, item);
    return item.value;
  }
  set(key, value) {
    if (this.cache.size >= this.max) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    this.cache.set(key, { value, expiry: Date.now() + this.ttlMs });
  }
  clear() {
    this.cache.clear();
  }
}

export const cache = new SimpleLRU(150, 60000); // 1-minute TTL

export function getProblems(req, res) {
  const { q, difficulty, tag, status, page = 1, limit = 20 } = req.query;
  const cacheKey = `problems:${q || ''}:${difficulty || ''}:${tag || ''}:${status || ''}:${page}:${limit}:${req.user?.id || 'anon'}`;
  
  const cached = cache.get(cacheKey);
  if (cached) return res.json(cached);

  let query = 'SELECT id, title, slug, difficulty, points, category, tags, companies FROM problems WHERE 1=1';
  const params = [];

  if (q && q.trim()) {
    const rawTerms = q.trim().split(/\s+/).filter(t => t.length > 1);
    if (rawTerms.length > 0) {
      const conditions = [];
      for (const term of rawTerms) {
        conditions.push('(title LIKE ? OR description LIKE ? OR tags LIKE ? OR category LIKE ?)');
        params.push(`%${term}%`, `%${term}%`, `%${term}%`, `%${term}%`);
      }
      query += ` AND (${conditions.join(' OR ')})`;
    } else {
      query += ' AND (title LIKE ? OR description LIKE ? OR tags LIKE ?)';
      params.push(`%${q.trim()}%`, `%${q.trim()}%`, `%${q.trim()}%`);
    }
  }
  if (difficulty) {
    query += ' AND difficulty = ?';
    params.push(difficulty);
  }
  if (tag) {
    query += ' AND tags LIKE ?';
    params.push(`%${tag}%`);
  }

  const allProblems = db.prepare(query).all(...params).map(p => ({
    ...p,
    tags: JSON.parse(p.tags || '[]'),
    companies: JSON.parse(p.companies || '[]')
  }));

  // Fetch user solved set if authenticated
  let solvedSet = new Set();
  let bookmarkedSet = new Set();
  if (req.user) {
    const solvedRows = db.prepare("SELECT DISTINCT problem_id FROM submissions WHERE user_id = ? AND verdict = 'Accepted'").all(req.user.id);
    solvedSet = new Set(solvedRows.map(r => r.problem_id));
    const bookmarks = db.prepare('SELECT problem_id FROM user_problem_meta WHERE user_id = ? AND is_bookmarked = 1').all(req.user.id);
    bookmarkedSet = new Set(bookmarks.map(r => r.problem_id));
  }

  let filtered = allProblems.map(p => ({
    ...p,
    isSolved: solvedSet.has(p.id),
    isBookmarked: bookmarkedSet.has(p.id)
  }));

  if (status === 'solved') {
    filtered = filtered.filter(p => p.isSolved);
  } else if (status === 'todo') {
    filtered = filtered.filter(p => !p.isSolved);
  }

  const total = filtered.length;
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const paginated = filtered.slice((pageNum - 1) * limitNum, pageNum * limitNum);

  const responseData = {
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum) || 1,
    problems: paginated
  };

  cache.set(cacheKey, responseData);
  return res.json(responseData);
}

export function getProblemBySlug(req, res) {
  const { slug } = req.params;
  const problem = db.prepare('SELECT * FROM problems WHERE slug = ? OR id = ?').get(slug, slug);
  if (!problem) return res.status(404).json({ error: 'Problem not found' });

  // Get user draft if available
  let draftCode = null;
  let meta = null;
  if (req.user) {
    const draft = db.prepare('SELECT code, language FROM drafts WHERE user_id = ? AND problem_id = ?').get(req.user.id, problem.id);
    if (draft) draftCode = draft;
    meta = db.prepare('SELECT is_bookmarked, notes FROM user_problem_meta WHERE user_id = ? AND problem_id = ?').get(req.user.id, problem.id);
  }

  // Sanitize test cases: hide secret arguments from public frontend payload
  const rawTestCases = JSON.parse(problem.test_cases || '[]');
  const publicTestCases = rawTestCases.map((tc, idx) => ({
    id: idx + 1,
    args: tc.is_hidden ? 'Hidden test input' : tc.args,
    expected: tc.is_hidden ? 'Hidden expected output' : tc.expected,
    isHidden: Boolean(tc.is_hidden)
  }));

  return res.json({
    problem: {
      ...problem,
      tags: JSON.parse(problem.tags || '[]'),
      companies: JSON.parse(problem.companies || '[]'),
      examples: JSON.parse(problem.examples || '[]'),
      starter_code: JSON.parse(problem.starter_code || '{}'),
      hints: JSON.parse(problem.hints || '[]'),
      test_cases: publicTestCases
    },
    draft: draftCode,
    userMeta: meta || { is_bookmarked: 0, notes: '' }
  });
}

export function saveDraft(req, res) {
  const { problemId, language, code } = req.body;
  if (!problemId || !code) return res.status(400).json({ error: 'Missing required draft details' });

  db.prepare(`
    INSERT INTO drafts (user_id, problem_id, language, code, updated_at)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(user_id, problem_id, language) DO UPDATE SET code = excluded.code, updated_at = excluded.updated_at
  `).run(req.user.id, problemId, language || 'javascript', code, Date.now());

  return res.json({ message: 'Draft autosaved' });
}

export function toggleBookmark(req, res) {
  const { problemId } = req.params;
  const current = db.prepare('SELECT is_bookmarked FROM user_problem_meta WHERE user_id = ? AND problem_id = ?').get(req.user.id, problemId);
  const newState = current?.is_bookmarked ? 0 : 1;

  db.prepare(`
    INSERT INTO user_problem_meta (user_id, problem_id, is_bookmarked, notes, updated_at)
    VALUES (?, ?, ?, '', ?)
    ON CONFLICT(user_id, problem_id) DO UPDATE SET is_bookmarked = excluded.is_bookmarked, updated_at = excluded.updated_at
  `).run(req.user.id, problemId, newState, Date.now());

  cache.clear();
  return res.json({ is_bookmarked: newState });
}

export function saveNotes(req, res) {
  const { problemId } = req.params;
  const { notes } = req.body;

  db.prepare(`
    INSERT INTO user_problem_meta (user_id, problem_id, is_bookmarked, notes, updated_at)
    VALUES (?, ?, 0, ?, ?)
    ON CONFLICT(user_id, problem_id) DO UPDATE SET notes = excluded.notes, updated_at = excluded.updated_at
  `).run(req.user.id, problemId, notes || '', Date.now());

  return res.json({ message: 'Notes saved' });
}
