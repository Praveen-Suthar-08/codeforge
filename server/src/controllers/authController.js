import { z } from 'zod';
import argon2 from 'argon2';
import crypto from 'crypto';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import { db } from '../db/connection.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';

// Input Schemas
export const SignUpSchema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain alphanumeric characters, underscores, and dashes'),
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character'),
  terms: z.literal(true, { errorMap: () => ({ message: 'You must accept the terms and conditions' }) })
});

export const LoginSchema = z.object({
  identifier: z.string().min(1, 'Email or username is required'),
  password: z.string().min(1, 'Password is required'),
  twoFactorCode: z.string().optional(),
  rememberMe: z.boolean().optional()
});

function setAuthCookies(res, accessToken, refreshToken) {
  const isProd = process.env.NODE_ENV === 'production';

  res.cookie('cf_access_token', accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000, // 15 mins
    path: '/'
  });

  if (refreshToken) {
    res.cookie('cf_refresh_token', refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/api/auth'
    });
  }
}

function clearAuthCookies(res) {
  res.clearCookie('cf_access_token', { path: '/' });
  res.clearCookie('cf_refresh_token', { path: '/api/auth' });
}

export function logAuditEvent(userId, eventType, req, metadata = {}) {
  try {
    const ip = req.ip || req.connection?.remoteAddress || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'unknown';
    db.prepare(`
      INSERT INTO audit_logs (id, user_id, event_type, ip_address, user_agent, metadata, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(crypto.randomUUID(), userId, eventType, ip, ua, JSON.stringify(metadata), Date.now());
  } catch (err) {
    console.error('Failed to write audit log:', err);
  }
}

// 1. Sign Up Controller
export async function signup(req, res) {
  const parseResult = SignUpSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.errors[0].message });
  }

  const { username, email, password } = parseResult.data;

  // Check uniqueness without generic disclosure
  const existing = db.prepare('SELECT id, email, username FROM users WHERE email = ? OR username = ?').get(email.toLowerCase(), username);
  if (existing) {
    if (existing.email.toLowerCase() === email.toLowerCase()) {
      return res.status(400).json({ error: 'Email address already in use' });
    }
    return res.status(400).json({ error: 'Username already taken' });
  }

  const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
  const userId = crypto.randomUUID();
  const now = Date.now();

  db.prepare(`
    INSERT INTO users (id, username, email, password_hash, role, is_verified, created_at, updated_at)
    VALUES (?, ?, ?, ?, 'user', 1, ?, ?)
  `).run(userId, username, email.toLowerCase(), passwordHash, now, now);

  logAuditEvent(userId, 'USER_REGISTERED', req);

  const accessToken = signAccessToken({ userId, username, role: 'user' });
  const refreshToken = signRefreshToken({ userId });

  // Store refresh token
  const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
  db.prepare(`
    INSERT INTO refresh_tokens (id, user_id, token_hash, user_agent, ip_address, expires_at, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(crypto.randomUUID(), userId, tokenHash, req.headers['user-agent'], req.ip, now + 7 * 86400000, now);

  setAuthCookies(res, accessToken, refreshToken);

  return res.status(201).json({
    message: 'Account created successfully',
    user: { id: userId, username, email, role: 'user', twoFactorEnabled: false }
  });
}

// 2. Login Controller
export async function login(req, res) {
  const parseResult = LoginSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.errors[0].message });
  }

  const { identifier, password, twoFactorCode } = parseResult.data;
  const user = db.prepare('SELECT * FROM users WHERE email = ? OR username = ?').get(identifier.toLowerCase(), identifier);

  // Generic invalid credentials message to prevent user enumeration
  if (!user) {
    return res.status(401).json({ error: 'Invalid email/username or password' });
  }

  // Check account lockout
  const now = Date.now();
  if (user.lockout_until && user.lockout_until > now) {
    const minutesLeft = Math.ceil((user.lockout_until - now) / 60000);
    return res.status(403).json({ error: `Account is temporarily locked. Try again in ${minutesLeft} minute(s).` });
  }

  const isPasswordValid = await argon2.verify(user.password_hash, password);
  if (!isPasswordValid) {
    const attempts = user.failed_login_attempts + 1;
    let lockoutUntil = 0;
    if (attempts >= 5) {
      lockoutUntil = now + 15 * 60 * 1000; // 15 minute lockout
    }
    db.prepare('UPDATE users SET failed_login_attempts = ?, lockout_until = ? WHERE id = ?').run(attempts, lockoutUntil, user.id);
    logAuditEvent(user.id, 'LOGIN_FAILED', req);
    return res.status(401).json({ error: 'Invalid email/username or password' });
  }

  // Handle 2FA if enabled
  if (user.two_factor_enabled) {
    if (!twoFactorCode) {
      return res.status(200).json({ require2FA: true, userId: user.id });
    }
    const verified = speakeasy.totp.verify({
      secret: user.two_factor_secret,
      encoding: 'base32',
      token: twoFactorCode,
      window: 1
    });

    let backupUsed = false;
    if (!verified && user.two_factor_backup_codes) {
      const backupCodes = JSON.parse(user.two_factor_backup_codes);
      const codeIndex = backupCodes.indexOf(twoFactorCode);
      if (codeIndex !== -1) {
        backupUsed = true;
        backupCodes.splice(codeIndex, 1);
        db.prepare('UPDATE users SET two_factor_backup_codes = ? WHERE id = ?').run(JSON.stringify(backupCodes), user.id);
      }
    }

    if (!verified && !backupUsed) {
      return res.status(401).json({ error: 'Invalid two-factor authentication code' });
    }
  }

  // Reset failed login counter on success
  db.prepare('UPDATE users SET failed_login_attempts = 0, lockout_until = 0 WHERE id = ?').run(user.id);
  logAuditEvent(user.id, 'LOGIN_SUCCESS', req);

  const accessToken = signAccessToken({ userId: user.id, username: user.username, role: user.role });
  const refreshToken = signRefreshToken({ userId: user.id });

  // Store refresh token
  const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
  db.prepare(`
    INSERT INTO refresh_tokens (id, user_id, token_hash, user_agent, ip_address, expires_at, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(crypto.randomUUID(), user.id, tokenHash, req.headers['user-agent'] || '', req.ip || '', now + 7 * 86400000, now);

  setAuthCookies(res, accessToken, refreshToken);

  return res.json({
    message: 'Logged in successfully',
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      twoFactorEnabled: Boolean(user.two_factor_enabled)
    }
  });
}

// 3. Refresh Token Rotation
export async function refreshToken(req, res) {
  const token = req.cookies?.cf_refresh_token;
  if (!token) {
    return res.status(401).json({ error: 'No refresh token provided' });
  }

  const payload = verifyRefreshToken(token);
  if (!payload) {
    clearAuthCookies(res);
    return res.status(401).json({ error: 'Expired or invalid refresh token' });
  }

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const storedToken = db.prepare('SELECT * FROM refresh_tokens WHERE user_id = ? AND token_hash = ?').get(payload.userId, tokenHash);

  if (!storedToken) {
    // Potential token reuse / compromise detected: invalidate all refresh tokens for this user
    db.prepare('DELETE FROM refresh_tokens WHERE user_id = ?').run(payload.userId);
    clearAuthCookies(res);
    return res.status(401).json({ error: 'Invalid refresh token state' });
  }

  // Rotate token
  db.prepare('DELETE FROM refresh_tokens WHERE id = ?').run(storedToken.id);

  const user = db.prepare('SELECT id, username, email, role, two_factor_enabled FROM users WHERE id = ?').get(payload.userId);
  if (!user) {
    clearAuthCookies(res);
    return res.status(401).json({ error: 'User not found' });
  }

  const now = Date.now();
  const newAccessToken = signAccessToken({ userId: user.id, username: user.username, role: user.role });
  const newRefreshToken = signRefreshToken({ userId: user.id });
  const newTokenHash = crypto.createHash('sha256').update(newRefreshToken).digest('hex');

  db.prepare(`
    INSERT INTO refresh_tokens (id, user_id, token_hash, user_agent, ip_address, expires_at, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(crypto.randomUUID(), user.id, newTokenHash, req.headers['user-agent'] || '', req.ip || '', now + 7 * 86400000, now);

  setAuthCookies(res, newAccessToken, newRefreshToken);

  return res.json({
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      twoFactorEnabled: Boolean(user.two_factor_enabled)
    }
  });
}

// 4. Logout Controller
export async function logout(req, res) {
  const token = req.cookies?.cf_refresh_token;
  if (token) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    db.prepare('DELETE FROM refresh_tokens WHERE token_hash = ?').run(tokenHash);
  }
  if (req.user) {
    logAuditEvent(req.user.id, 'USER_LOGOUT', req);
  }
  clearAuthCookies(res);
  return res.json({ message: 'Logged out successfully' });
}

// 5. Get Current User Info
export async function getCurrentUser(req, res) {
  const user = db.prepare('SELECT id, username, email, role, two_factor_enabled, created_at FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  return res.json({
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      twoFactorEnabled: Boolean(user.two_factor_enabled),
      createdAt: user.created_at
    }
  });
}

// 6. Setup 2FA
export async function setup2FA(req, res) {
  const secret = speakeasy.generateSecret({ name: `CodeForge (${req.user.username})` });
  const qrDataUrl = await qrcode.toDataURL(secret.otpauth_url);

  // Generate 8 backup codes
  const backupCodes = Array.from({ length: 8 }, () => crypto.randomBytes(4).toString('hex').toUpperCase());

  db.prepare(`
    UPDATE users SET two_factor_secret = ?, two_factor_backup_codes = ? WHERE id = ?
  `).run(secret.base32, JSON.stringify(backupCodes), req.user.id);

  return res.json({
    secret: secret.base32,
    qrCode: qrDataUrl,
    backupCodes
  });
}

export async function verify2FA(req, res) {
  const { code } = req.body;
  const user = db.prepare('SELECT two_factor_secret FROM users WHERE id = ?').get(req.user.id);
  if (!user?.two_factor_secret) {
    return res.status(400).json({ error: '2FA setup was not initiated' });
  }

  const verified = speakeasy.totp.verify({
    secret: user.two_factor_secret,
    encoding: 'base32',
    token: code,
    window: 1
  });

  if (!verified) {
    return res.status(400).json({ error: 'Invalid verification code' });
  }

  db.prepare('UPDATE users SET two_factor_enabled = 1 WHERE id = ?').run(req.user.id);
  logAuditEvent(req.user.id, '2FA_ENABLED', req);

  return res.json({ message: 'Two-factor authentication enabled successfully' });
}

// 7. Password Reset Request
export async function forgotPassword(req, res) {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  const user = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
  // Always return identical success message to prevent user enumeration
  if (user) {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour

    db.prepare(`
      INSERT INTO password_reset_tokens (token, user_id, expires_at, used)
      VALUES (?, ?, ?, 0)
    `).run(token, user.id, expiresAt);

    // Free developer console output / Mailpit link
    console.log(`[PASSWORD RESET LINK for ${email}]: http://localhost:5173/#/reset-password?token=${token}`);
  }

  return res.json({ message: 'If an account exists with this email, a reset link has been dispatched.' });
}

export async function resetPassword(req, res) {
  const { token, newPassword } = req.body;
  if (!token || !newPassword || newPassword.length < 8) {
    return res.status(400).json({ error: 'Valid token and minimum 8-character password required' });
  }

  const record = db.prepare('SELECT * FROM password_reset_tokens WHERE token = ? AND used = 0').get(token);
  if (!record || record.expires_at < Date.now()) {
    return res.status(400).json({ error: 'Invalid or expired password reset token' });
  }

  const newHash = await argon2.hash(newPassword, { type: argon2.argon2id });
  db.prepare('UPDATE users SET password_hash = ?, failed_login_attempts = 0, lockout_until = 0 WHERE id = ?').run(newHash, record.user_id);
  db.prepare('UPDATE password_reset_tokens SET used = 1 WHERE token = ?').run(token);

  // Invalidate existing sessions
  db.prepare('DELETE FROM refresh_tokens WHERE user_id = ?').run(record.user_id);
  logAuditEvent(record.user_id, 'PASSWORD_RESET_SUCCESS', req);

  return res.json({ message: 'Password has been reset successfully. Please log in.' });
}

// 8. Account Settings & Data Export
export async function getActiveSessions(req, res) {
  const sessions = db.prepare('SELECT id, user_agent, ip_address, created_at, expires_at FROM refresh_tokens WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
  return res.json({ sessions });
}

export async function logoutAllDevices(req, res) {
  db.prepare('DELETE FROM refresh_tokens WHERE user_id = ?').run(req.user.id);
  clearAuthCookies(res);
  logAuditEvent(req.user.id, 'LOGOUT_ALL_DEVICES', req);
  return res.json({ message: 'Logged out of all devices successfully' });
}

export async function downloadUserData(req, res) {
  const user = db.prepare('SELECT id, username, email, role, created_at FROM users WHERE id = ?').get(req.user.id);
  const submissions = db.prepare('SELECT * FROM submissions WHERE user_id = ?').all(req.user.id);
  const drafts = db.prepare('SELECT * FROM drafts WHERE user_id = ?').all(req.user.id);
  const auditLogs = db.prepare('SELECT event_type, created_at FROM audit_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT 50').all(req.user.id);

  return res.json({
    user,
    submissions,
    drafts,
    auditLogs,
    exportedAt: new Date().toISOString()
  });
}

export async function deleteAccount(req, res) {
  db.prepare('DELETE FROM users WHERE id = ?').run(req.user.id);
  clearAuthCookies(res);
  return res.json({ message: 'Account permanently deleted' });
}
