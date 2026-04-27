import { Router } from 'express';
import type { Request, Response } from 'express';
import { processJobUrl } from './scraper.service.js';
const router = Router();

// POST /api/scraper/run
router.post('/run', async (req: Request, res: Response): Promise<void> => {
  const { companyName, jobUrl } = req.body;

  if (!companyName || !jobUrl) {
    res.status(400).json({ error: 'Missing companyName or jobUrl' });
    return;
  }

  try {
    const newJob = await processJobUrl(companyName, jobUrl);
    res.status(201).json({ message: 'Job successfully scraped and saved!', job: newJob });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process job URL' });
  }
});

export default router;