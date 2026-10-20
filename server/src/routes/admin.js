import express from 'express';
import { db } from '../db/connection.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { cache } from '../controllers/problemController.js';

const router = express.Router();

router.use(authenticate, requireRole('admin'));

// System Health & Overview
router.get('/health', (req, res) => {
  const usersCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  const problemsCount = db.prepare('SELECT COUNT(*) as count FROM problems').get().count;
  const submissionsCount = db.prepare('SELECT COUNT(*) as count FROM submissions').get().count;

  return res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: Math.round(process.uptime()),
    memoryUsage: process.memoryUsage(),
    dbStats: {
      users: usersCount,
      problems: problemsCount,
      submissions: submissionsCount
    }
  });
});

// Users management
router.get('/users', (req, res) => {
  const users = db.prepare('SELECT id, username, email, role, is_verified, created_at, lockout_until FROM users ORDER BY created_at DESC LIMIT 100').all();
  return res.json({ users });
});

router.put('/users/:id/role', (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  if (!['user', 'admin'].includes(role)) return res.status(400).json({ error: 'Invalid role' });

  db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, id);
  return res.json({ message: 'Role updated' });
});

// Audit Logs
router.get('/audit-logs', (req, res) => {
  const logs = db.prepare(`
    SELECT a.*, u.username
    FROM audit_logs a
    LEFT JOIN users u ON a.user_id = u.id
    ORDER BY a.created_at DESC
    LIMIT 100
  `).all();

  return res.json({ logs });
});

// Problem Import/Export JSON
router.get('/export-problems', (req, res) => {
  const problems = db.prepare('SELECT * FROM problems').all().map(p => ({
    ...p,
    tags: JSON.parse(p.tags || '[]'),
    companies: JSON.parse(p.companies || '[]'),
    examples: JSON.parse(p.examples || '[]'),
    starter_code: JSON.parse(p.starter_code || '{}'),
    hints: JSON.parse(p.hints || '[]'),
    test_cases: JSON.parse(p.test_cases || '[]')
  }));

  res.setHeader('Content-Disposition', 'attachment; filename="codeforge-problems.json"');
  res.setHeader('Content-Type', 'application/json');
  return res.send(JSON.stringify(problems, null, 2));
});

router.post('/import-problems', (req, res) => {
  const problems = req.body;
  if (!Array.isArray(problems)) return res.status(400).json({ error: 'Expected JSON array of problems' });

  const insert = db.prepare(`
    INSERT OR REPLACE INTO problems (
      id, title, slug, difficulty, points, category, tags, companies,
      function_name, description, examples, starter_code, hints, editorial,
      test_cases, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const now = Date.now();
  db.transaction(() => {
    for (const p of problems) {
      insert.run(
        p.id,
        p.title,
        p.slug || p.id,
        p.difficulty || 'Easy',
        p.points || 10,
        p.category || 'General',
        JSON.stringify(p.tags || []),
        JSON.stringify(p.companies || []),
        p.function_name || 'solution',
        p.description || '',
        JSON.stringify(p.examples || []),
        JSON.stringify(p.starter_code || {}),
        JSON.stringify(p.hints || []),
        p.editorial || '',
        JSON.stringify(p.test_cases || []),
        now,
        now
      );
    }
  })();

  cache.clear();
  return res.json({ message: `Successfully imported ${problems.length} problems` });
});

export default router;
