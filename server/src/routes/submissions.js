import express from 'express';
import { runCode, submitCode, getSubmissions, getSubmissionDetail, runPlaygroundCode } from '../controllers/submissionController.js';
import { authenticate } from '../middleware/auth.js';
import { rateLimiter } from '../middleware/rateLimit.js';

const router = express.Router();

router.post('/run', rateLimiter({ max: 30, windowMs: 60000 }), runCode);
router.post('/playground', rateLimiter({ max: 30, windowMs: 60000 }), runPlaygroundCode);
router.post('/submit', authenticate, rateLimiter({ max: 15, windowMs: 60000 }), submitCode);
router.get('/history', authenticate, getSubmissions);
router.get('/:id', authenticate, getSubmissionDetail);

export default router;
