import type { Request, Response } from 'express';
import { scrapeQueue } from '../queue/jobQueue.js';

export const handleSocialWebhook = async (req: Request, res: Response): Promise<void> => {
  console.log('🚨 [WEBHOOK] Incoming transmission received!');

  try {
    // 1. Unpack the payload sent by Zapier/Make.com
    const { jobUrl, companyName, source } = req.body;

    // 2. Validate the data
    if (!jobUrl) {
      console.log('⚠️ [WEBHOOK] Rejected: No URL provided in the payload.');
      res.status(400).json({ error: 'Missing jobUrl in webhook payload' });
      return;
    }

    console.log(`🎯 [WEBHOOK] Sniper caught a new job from ${source || 'the web'}! Pushing to queue...`);

    // 3. Drop it onto the exact same Redis Conveyor Belt
    await scrapeQueue.add('scrape-job', { 
      url: jobUrl,
      companyName: companyName || 'Unknown Startup' 
    });

    // 4. Send a receipt back to Zapier so it knows the delivery was successful
    res.status(200).json({ success: true, message: 'Job successfully loaded onto the conveyor belt.' });

  } catch (error) {
    console.error('[WEBHOOK] Error processing incoming payload:', error);
    res.status(500).json({ error: 'Internal server error processing webhook' });
  }
};