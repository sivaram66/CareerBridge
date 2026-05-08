import { Router } from 'express';
import { getMyProfile, updateMyProfile } from './profile.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';

const router = Router();

router.use(requireAuth);

// GET /api/profile
router.get('/', getMyProfile);

// PUT /api/profile
router.put('/', updateMyProfile);

export default router;