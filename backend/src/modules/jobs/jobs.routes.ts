import { Router } from 'express';
import { getJobsHandler, createJobHandler, getJobMatchHandler } from './jobs.controller.js';
import { requireAuth } from '../../shared/middleware/auth.middleware.js'; // Import the bouncer

const router = Router();

router.get('/', getJobsHandler);
router.post('/', createJobHandler);

// GET /api/jobs/:id/match
// New protected route that triggers the AI
router.get('/:id/match', requireAuth, getJobMatchHandler);

export default router;