import express,{ type Request, type Response } from 'express';
import { db } from '../../config/db.js';
import { jobs } from '../../shared/schema.js';
import { eq } from 'drizzle-orm';
import { getAllJobs } from './jobs.service.js'; 
import { analyzeJobMatch } from '../ai-summarizer/ai.service.js'; 

export const getJobsHandler = async (req: Request, res: Response) => {
  try {
    const allJobs = await getAllJobs(); 
    res.json(allJobs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getJobById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [job] = await db.select().from(jobs).where(eq(jobs.id, parseInt(id)));
    
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json(job);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/jobs/:id/analyze — runs Gemini AI match analysis against user profile
export const analyzeJobWithAI = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userProfile } = req.body; 

    const [job] = await db.select().from(jobs).where(eq(jobs.id, parseInt(id)));
    if (!job) return res.status(404).json({ error: 'Job not found' });

    const aiAnalysis = await analyzeJobMatch(
      job.title, 
      job.companyName || 'Confidential', 
      job.description || '', 
      userProfile
    );

    res.json({ analysis: aiAnalysis });

  } catch (error: any) {
    console.error("AI Error:", error);
    res.status(500).json({ error: 'Failed to analyze job.' });
  }
};