import type { Request, Response } from 'express';
import * as jobService from './jobs.service.js';
import { db } from '../../config/db.js';
import { userProfiles, jobs } from '../../shared/schema.js';
import { eq } from 'drizzle-orm';
import { calculateMatchScore } from '../ai-summarizer/ai.service.js';
import type { AuthRequest } from '../../shared/middleware/auth.middleware.js';


export const getJobsHandler = async (req: Request, res: Response) => {
  try {
    const allJobs = await jobService.getAllJobs();
    res.status(200).json(allJobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
};

export const createJobHandler = async (req: Request, res: Response) => {
  try {
    const newJob = await jobService.createJob(req.body);
    res.status(201).json(newJob);
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ error: 'Failed to create job listing' });
  }
};


export const getJobMatchHandler = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const jobId = parseInt(req.params.id); // Grabs the ID from the URL (e.g., /api/jobs/1/match)

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // 1. Get the user's saved tech stack
    const profileQuery = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId));
    const userStack = profileQuery[0]?.techStack;

    if (!userStack || userStack.length === 0) {
      res.status(400).json({ error: 'Please update your profile with your tech stack first.' });
      return;
    }

    // 2. Get the specific job description
    const jobQuery = await db.select().from(jobs).where(eq(jobs.id, jobId));
    const jobDesc = jobQuery[0]?.description;

    if (!jobDesc) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    // 3. Send both to Gemini
    const matchResult = await calculateMatchScore(userStack, jobDesc);
    res.status(200).json(matchResult);

  } catch (error) {
    console.error('Match calculation error:', error);
    res.status(500).json({ error: 'Failed to calculate match' });
  }
};