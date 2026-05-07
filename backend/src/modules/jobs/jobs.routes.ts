// D:\Projects\CareerBridge\backend\src\modules\jobs\jobs.routes.ts

import { Router } from 'express';
// 👉 Update your imports to perfectly match what is actually in your controller!
import { getJobsHandler, getJobById, analyzeJobWithAI } from './jobs.controller.js';

const router = Router();

// 1. Fetch all jobs for the main JobExplorer feed
router.get('/', getJobsHandler);

// 2. Fetch a single job for the new Job Details page
router.get('/:id', getJobById);

// 3. The new Gemini AI Matcher route
router.post('/:id/analyze', analyzeJobWithAI);

export default router;