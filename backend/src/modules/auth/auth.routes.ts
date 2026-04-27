import { Router } from 'express';
import { registerUserHandler, loginUserHandler } from './auth.controller.js';

const router = Router();

// POST /api/auth/register
router.post('/register', registerUserHandler);

// POST /api/auth/login
router.post('/login', loginUserHandler);

export default router;