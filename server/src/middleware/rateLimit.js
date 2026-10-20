// Memory-based rate limiter and lockout tracker
const loginAttempts = new Map(); // ip -> { count, firstAttemptTime }
const requestLimits = new Map(); // ip:endpoint -> { count, resetTime }

export function rateLimiter({ windowMs = 60 * 1000, max = 60, message = 'Too many requests, please try again later.' } = {}) {
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress || '127.0.0.1';
    const key = `${ip}:${req.baseUrl || req.path}`;
    const now = Date.now();

    const current = requestLimits.get(key) || { count: 0, resetTime: now + windowMs };
    if (now > current.resetTime) {
      current.count = 1;
      current.resetTime = now + windowMs;
    } else {
      current.count += 1;
    }

    requestLimits.set(key, current);

    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - current.count));
    res.setHeader('X-RateLimit-Reset', Math.ceil(current.resetTime / 1000));

    if (current.count > max) {
      return res.status(429).json({ error: message });
    }

    next();
  };
}

export function loginRateLimiter(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress || '127.0.0.1';
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 mins window
  const maxAttempts = 10;

  const record = loginAttempts.get(ip) || { count: 0, firstAttemptTime: now };
  if (now - record.firstAttemptTime > windowMs) {
    record.count = 1;
    record.firstAttemptTime = now;
  } else {
    record.count += 1;
  }

  loginAttempts.set(ip, record);

  if (record.count > maxAttempts) {
    return res.status(429).json({
      error: 'Too many failed login attempts. Please wait 15 minutes before trying again.'
    });
  }

  next();
}

// Clean up memory maps periodically to prevent leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of requestLimits.entries()) {
    if (now > val.resetTime) requestLimits.delete(key);
  }
  for (const [key, val] of loginAttempts.entries()) {
    if (now - val.firstAttemptTime > 15 * 60 * 1000) loginAttempts.delete(key);
  }
}, 5 * 60 * 1000);
