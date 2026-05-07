// /src/modules/jobs/jobs.controller.ts

import express,{ type Request, type Response } from 'express';
import { db } from '../../config/db.js';
import { jobs } from '../../shared/schema.js';
import { eq } from 'drizzle-orm';
import { getAllJobs } from './jobs.service.js'; 

// Import the brain from our newly separated AI service!
import { analyzeJobMatch } from '../ai-summarizer/ai.service.js'; 

// ==========================================
// 1. Fetch All Jobs (Main Feed)
// ==========================================
export const getJobsHandler = async (req: Request, res: Response) => {
  try {
    const allJobs = await getAllJobs(); 
    res.json(allJobs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// ==========================================
// 2. Fetch a Single Job (Job Details Page)
// ==========================================
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

// ==========================================
// 3. The AI Analyzer Engine
// ==========================================
export const analyzeJobWithAI = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userProfile } = req.body; 

    // Fetch the job from DB
    const [job] = await db.select().from(jobs).where(eq(jobs.id, parseInt(id)));
    if (!job) return res.status(404).json({ error: 'Job not found' });

    // Let the AI Service do the heavy lifting
    const aiAnalysis = await analyzeJobMatch(
      job.title, 
      job.companyName || 'Confidential', 
      job.description || '', 
      userProfile
    );

    // Send the structured data back to React
    res.json({ analysis: aiAnalysis });

  } catch (error: any) {
    console.error("AI Error:", error);
    res.status(500).json({ error: 'Failed to analyze job.' });
  }
};