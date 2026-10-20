import express from 'express';
import { getProblems, getProblemBySlug, saveDraft, toggleBookmark, saveNotes } from '../controllers/problemController.js';
import { optionalAuth, authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', optionalAuth, getProblems);
router.get('/:slug', optionalAuth, getProblemBySlug);
router.post('/drafts', authenticate, saveDraft);
router.post('/:problemId/bookmark', authenticate, toggleBookmark);
router.post('/:problemId/notes', authenticate, saveNotes);

export default router;
