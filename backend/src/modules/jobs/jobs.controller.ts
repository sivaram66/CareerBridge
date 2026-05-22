import express,{ type Request, type Response } from 'express';
import { db } from '../../config/db.js';
import { jobs } from '../../shared/schema.js';
import { eq } from 'drizzle-orm';
import { getAllJobs } from './jobs.service.js'; 
import { analyzeJobMatch } from '../ai-summarizer/ai.service.js'; 

export const getJobsHandler = async (req: Request, res: Response) => {
  try {
    console.log(`\n📥 GET /api/jobs requested...`);
    console.time("⏱️ Neon_DB_Query"); 

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    const paginatedJobs = await getAllJobs(page, limit); 
    
    console.timeEnd("⏱️ Neon_DB_Query"); 
    console.log(`✅ Successfully grabbed ${paginatedJobs.length} jobs. Sending to React...`);

    res.json(paginatedJobs);
  } catch (error: any) {
    console.error("Backend Error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getJobById = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
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
    const id = String(req.params.id);
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