import { verifyAccessToken } from '../utils/jwt.js';
import { db } from '../db/connection.js';

export function authenticate(req, res, next) {
  // Extract token from httpOnly cookie or Authorization Bearer header
  const token = req.cookies?.cf_access_token || (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : null);

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const payload = verifyAccessToken(token);
  if (!payload) {
    return res.status(401).json({ error: 'Invalid or expired access token' });
  }

  // Look up user to verify account is still active and valid
  const user = db.prepare('SELECT id, username, email, role, is_verified FROM users WHERE id = ?').get(payload.userId);
  if (!user) {
    return res.status(401).json({ error: 'User no longer exists' });
  }

  req.user = user;
  next();
}

export function optionalAuth(req, res, next) {
  const token = req.cookies?.cf_access_token || (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : null);
  if (token) {
    const payload = verifyAccessToken(token);
    if (payload) {
      const user = db.prepare('SELECT id, username, email, role FROM users WHERE id = ?').get(payload.userId);
      if (user) req.user = user;
    }
  }
  next();
}

export function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (req.user.role !== role && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access forbidden: insufficient permissions' });
    }
    next();
  };
}
