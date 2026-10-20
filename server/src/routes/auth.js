import express from 'express';
import {
  signup,
  login,
  refreshToken,
  logout,
  getCurrentUser,
  setup2FA,
  verify2FA,
  forgotPassword,
  resetPassword,
  getActiveSessions,
  logoutAllDevices,
  downloadUserData,
  deleteAccount
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { loginRateLimiter } from '../middleware/rateLimit.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', loginRateLimiter, login);
router.post('/refresh', refreshToken);
router.post('/logout', logout);
router.get('/me', authenticate, getCurrentUser);

// 2FA Routes
router.post('/2fa/setup', authenticate, setup2FA);
router.post('/2fa/verify', authenticate, verify2FA);

// Password recovery
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Security & Account Settings
router.get('/sessions', authenticate, getActiveSessions);
router.post('/sessions/logout-all', authenticate, logoutAllDevices);
router.get('/export-data', authenticate, downloadUserData);
router.delete('/account', authenticate, deleteAccount);

export default router;
