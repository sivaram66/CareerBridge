import { Router } from 'express';
import { handleSocialWebhook } from './aggregator.controller.js';

const router = Router();

// The Webhook Endpoint: Listens for incoming POST requests
// Full URL will be: POST http://your-domain.com/api/aggregator/webhook/social
router.post('/webhook/social', handleSocialWebhook);

export default router;