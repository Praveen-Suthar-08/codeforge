import express from 'express';
import { db } from '../db/connection.js';
import { authenticate } from '../middleware/auth.js';
import { cache } from '../controllers/problemController.js';

const router = express.Router();

// User Dashboard Stats
router.get('/stats', authenticate, (req, res) => {
  const userId = req.user.id;

  // Solved problems count and list
  const solvedRows = db.prepare(`
    SELECT DISTINCT p.id, p.difficulty, p.points
    FROM submissions s
    JOIN problems p ON s.problem_id = p.id
    WHERE s.user_id = ? AND s.verdict = 'Accepted'
  `).all(userId);

  const solvedSet = new Set(solvedRows.map(r => r.id));
  const totalScore = solvedRows.reduce((acc, curr) => acc + (curr.points || 0), 0);

  const difficultySplit = {
    Easy: solvedRows.filter(r => r.difficulty === 'Easy').length,
    Medium: solvedRows.filter(r => r.difficulty === 'Medium').length,
    Hard: solvedRows.filter(r => r.difficulty === 'Hard').length
  };

  // Total problems in system
  const totalProblems = db.prepare('SELECT COUNT(*) as count FROM problems').get().count;

  // Total user submissions
  const allUserSubs = db.prepare('SELECT verdict, language, created_at FROM submissions WHERE user_id = ? ORDER BY created_at ASC').all(userId);

  // Submissions per day & Heatmap (last 20 weeks / 140 days)
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const dayMs = 86400000;
  const dayCounts = {};

  allUserSubs.forEach(s => {
    const sDate = new Date(s.created_at);
    sDate.setHours(0, 0, 0, 0);
    const dayDiff = Math.floor((sDate.getTime() - now.getTime()) / dayMs);
    dayCounts[dayDiff] = (dayCounts[dayDiff] || 0) + 1;
  });

  // Calculate current streak
  let currentStreak = 0;
  let checkDay = 0;
  if (dayCounts[0]) {
    while (dayCounts[checkDay]) {
      currentStreak++;
      checkDay--;
    }
  } else if (dayCounts[-1]) {
    checkDay = -1;
    while (dayCounts[checkDay]) {
      currentStreak++;
      checkDay--;
    }
  }

  // Language usage breakdown
  const languageUsage = {};
  allUserSubs.forEach(s => {
    languageUsage[s.language] = (languageUsage[s.language] || 0) + 1;
  });

  // Level & XP (100 XP per level)
  const xp = totalScore * 10;
  const level = Math.floor(xp / 200) + 1;

  // Badges calculation
  const badges = [];
  if (solvedSet.size >= 1) badges.push({ id: 'first_ac', name: 'First Blood', desc: 'Solved your first problem', icon: '🎯' });
  if (solvedSet.size >= 10) badges.push({ id: 'ten_solved', name: 'Decathlete', desc: 'Solved 10 problems', icon: '⚡' });
  if (solvedSet.size >= 30) badges.push({ id: 'thirty_solved', name: 'Problem Master', desc: 'Solved 30 problems', icon: '👑' });
  if (currentStreak >= 3) badges.push({ id: 'streak_3', name: 'On Fire', desc: 'Maintained a 3-day coding streak', icon: '🔥' });
  if (difficultySplit.Hard >= 1) badges.push({ id: 'hard_solver', name: 'Titan Slayer', desc: 'Solved a Hard problem', icon: '⚔️' });

  return res.json({
    totalSolved: solvedSet.size,
    totalProblems,
    totalScore,
    xp,
    level,
    currentStreak,
    difficultySplit,
    languageUsage,
    dayCounts,
    badges,
    totalSubmissions: allUserSubs.length
  });
});

// Real-time Global Leaderboard
router.get('/leaderboard', (req, res) => {
  const cached = cache.get('global_leaderboard');
  if (cached) return res.json(cached);

  const rows = db.prepare(`
    SELECT u.id, u.username,
      COALESCE(SUM(DISTINCT CASE WHEN s.verdict = 'Accepted' THEN p.points ELSE 0 END), 0) as score,
      COUNT(DISTINCT CASE WHEN s.verdict = 'Accepted' THEN p.id ELSE NULL END) as solved_count,
      COUNT(s.id) as total_subs
    FROM users u
    LEFT JOIN submissions s ON u.id = s.user_id
    LEFT JOIN problems p ON s.problem_id = p.id
    GROUP BY u.id
    ORDER BY score DESC, solved_count DESC, u.created_at ASC
    LIMIT 50
  `).all();

  const result = {
    leaderboard: rows.map((r, i) => ({
      rank: i + 1,
      id: r.id,
      username: r.username,
      score: r.score,
      solvedCount: r.solved_count,
      totalSubs: r.total_subs
    }))
  };

  cache.set('global_leaderboard', result);
  return res.json(result);
});

// Community Discussions per Problem
router.get('/comments/:problemId', (req, res) => {
  const { problemId } = req.params;
  const comments = db.prepare(`
    SELECT c.id, c.content, c.upvotes, c.created_at, u.username
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.problem_id = ?
    ORDER BY c.created_at DESC
    LIMIT 50
  `).all(problemId);

  return res.json({ comments });
});

router.post('/comments/:problemId', authenticate, (req, res) => {
  const { problemId } = req.params;
  const { content } = req.body;
  if (!content || !content.trim()) return res.status(400).json({ error: 'Comment content is required' });

  const id = crypto.randomUUID();
  db.prepare(`
    INSERT INTO comments (id, problem_id, user_id, content, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, problemId, req.user.id, content.trim(), Date.now());

  return res.json({ message: 'Comment posted', id });
});

// Contests
router.get('/contests', (req, res) => {
  const contests = db.prepare('SELECT * FROM contests ORDER BY start_time DESC').all().map(c => ({
    ...c,
    problemIds: JSON.parse(c.problem_ids || '[]')
  }));
  return res.json({ contests });
});

// Guided Projects Module
router.get('/projects', (req, res) => {
  const projects = db.prepare('SELECT id, title, description, difficulty, steps, starter_files FROM projects').all().map(p => ({
    ...p,
    steps: JSON.parse(p.steps || '[]'),
    starterFiles: JSON.parse(p.starter_files || '{}')
  }));
  return res.json({ projects });
});

export default router;
