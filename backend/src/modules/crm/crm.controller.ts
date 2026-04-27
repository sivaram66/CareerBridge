import type { Response } from 'express';
import type { AuthRequest } from '../../shared/middleware/auth.middleware.js';
import * as crmService from './crm.service.js';

export const trackJobHandler = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { jobId, status } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const trackedJob = await crmService.trackJob(userId, jobId, status);
    res.status(200).json(trackedJob);
  } catch (error) {
    console.error('Track job error:', error);
    res.status(500).json({ error: 'Failed to track job' });
  }
};

export const getPipelineHandler = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const pipeline = await crmService.getUserPipeline(userId);
    res.status(200).json(pipeline);
  } catch (error) {
    console.error('Fetch pipeline error:', error);
    res.status(500).json({ error: 'Failed to fetch user pipeline' });
  }
};