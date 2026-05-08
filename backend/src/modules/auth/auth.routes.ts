import { Router } from 'express';
import { register, login, verifyOtp } from './auth.controller.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/register', register);
router.post('/verify-otp', verifyOtp);
router.post('/login', login);

export default router;