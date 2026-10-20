import crypto from 'crypto';

// CSRF token generation & validation double-submit cookie pattern
export function csrfProtection(req, res, next) {
  // If GET, HEAD, OPTIONS, generate and set CSRF cookie if not present
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    if (!req.cookies?.cf_csrf_token) {
      const csrfToken = crypto.randomBytes(32).toString('hex');
      res.cookie('cf_csrf_token', csrfToken, {
        httpOnly: false, // Accessible by JavaScript client to send in X-CSRF-Token header
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/'
      });
    }
    return next();
  }

  // For state-changing methods (POST, PUT, DELETE, PATCH)
  // Verify token from X-CSRF-Token header against cookie
  const headerToken = req.headers['x-csrf-token'];
  const cookieToken = req.cookies?.cf_csrf_token;

  // For developer ease in testing tools or API testing if authorized with Bearer token, we allow Bearer bypass
  const isBearerAuth = req.headers.authorization?.startsWith('Bearer ');
  if (isBearerAuth) {
    return next();
  }

  if (!cookieToken || !headerToken || headerToken !== cookieToken) {
    return res.status(403).json({ error: 'Invalid or missing CSRF token' });
  }

  next();
}
