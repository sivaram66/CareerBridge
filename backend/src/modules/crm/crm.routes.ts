import { Router } from 'express';
import { trackJobHandler, getPipelineHandler } from './crm.controller.js';
import { requireAuth } from '../../shared/middleware/auth.middleware.js';

const router = Router();

// POST /api/crm/track - Create or update a tracked job
router.post('/track', requireAuth, trackJobHandler);

// GET /api/crm/pipeline - Get all tracked jobs for the logged-in user
router.get('/pipeline', requireAuth, getPipelineHandler);

export default router;