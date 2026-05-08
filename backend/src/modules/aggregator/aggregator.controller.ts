import type { Request, Response } from 'express';
import { scrapeQueue } from '../queue/jobQueue.js';

// POST /api/aggregator/webhook/social — receives job URLs from Zapier/Make.com
export const handleSocialWebhook = async (req: Request, res: Response): Promise<void> => {
  console.log('🚨 [WEBHOOK] Incoming transmission received!');

  try {
    const { jobUrl, companyName, source } = req.body;

    if (!jobUrl) {
      console.log('⚠️ [WEBHOOK] Rejected: No URL provided in the payload.');
      res.status(400).json({ error: 'Missing jobUrl in webhook payload' });
      return;
    }

    console.log(`🎯 [WEBHOOK] Sniper caught a new job from ${source || 'the web'}! Pushing to queue...`);

    await scrapeQueue.add('scrape-job', { 
      url: jobUrl,
      companyName: companyName || 'Unknown Startup' 
    });

    res.status(200).json({ success: true, message: 'Job successfully loaded onto the conveyor belt.' });

  } catch (error) {
    console.error('[WEBHOOK] Error processing incoming payload:', error);
    res.status(500).json({ error: 'Internal server error processing webhook' });
  }
};