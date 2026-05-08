import { Router } from 'express';
import { trackJobHandler, getPipelineHandler } from './crm.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';

const router = Router();

// POST /api/crm/track — create or update a tracked job application
router.post('/track', requireAuth, trackJobHandler);

// GET /api/crm/pipeline — get all tracked jobs for the logged-in user
router.get('/pipeline', requireAuth, getPipelineHandler);

export default router;