import { Router } from 'express';
import { updateProfileHandler } from './profile.controller.js';
import { requireAuth } from '../../shared/middleware/auth.middleware.js';

const router = Router();

// PUT /api/profile
// Notice we put `requireAuth` in the middle! This acts as a bouncer.
router.put('/', requireAuth, updateProfileHandler);

export default router;