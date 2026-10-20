import jwt from 'jsonwebtoken';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'codeforge-super-secret-access-token-key-2026';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'codeforge-super-secret-refresh-token-key-2026';

export function signAccessToken(payload) {
  // Short-lived access token: 15 minutes
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: '15m' });
}

export function signRefreshToken(payload) {
  // Rotating refresh token: 7 days
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: '7d' });
}

export function verifyAccessToken(token) {
  try {
    return jwt.verify(token, ACCESS_SECRET);
  } catch (err) {
    return null;
  }
}

export function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, REFRESH_SECRET);
  } catch (err) {
    return null;
  }
}
