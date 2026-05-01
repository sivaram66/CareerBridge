import { Router } from 'express';
import type { Request, Response } from 'express';
import { fetchGreenhouseJobs } from './aggregator.service.js';
import { addTargetCompanyHandler } from './aggregator.controller.js'; // <-- Import the new controller

const router = Router();

// POST /api/aggregator/companies - Add a new startup to the hit list
router.post('/companies', addTargetCompanyHandler);

// GET /api/aggregator/test/:company - Your existing test route
router.get('/test/:company', async (req: Request, res: Response) => {
  const companyToken = req.params.company;
  try {
    const jobs = await fetchGreenhouseJobs(companyToken);
    res.status(200).json({ 
      company: companyToken,
      totalJobs: jobs.length,
      jobs: jobs 
    });
  } catch (error) {
    res.status(500).json({ error: 'Test failed' });
  }
});

export default router;