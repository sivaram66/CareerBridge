import { Router } from 'express';
import { handleSocialWebhook } from './aggregator.controller.js';

const router = Router();

// POST /api/aggregator/webhook/social
router.post('/webhook/social', handleSocialWebhook);

export default router;