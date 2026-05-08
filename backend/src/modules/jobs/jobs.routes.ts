import { Router } from 'express';
import { getJobsHandler, getJobById, analyzeJobWithAI } from './jobs.controller.js';

const router = Router();

// GET  /api/jobs       — all active jobs for the explorer feed
// GET  /api/jobs/:id   — single job details
// POST /api/jobs/:id/analyze — Gemini AI match analysis
router.get('/', getJobsHandler);
router.get('/:id', getJobById);
router.post('/:id/analyze', analyzeJobWithAI);

export default router;