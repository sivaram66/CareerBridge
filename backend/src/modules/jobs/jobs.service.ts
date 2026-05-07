import { db } from '../../config/db.js';
import { jobs } from '../../shared/schema.js';
import { desc, eq } from 'drizzle-orm';

// Fetch all jobs, sorting premium ones to the top
export const getAllJobs = async () => {
  return await db
    .select()
    .from(jobs)
    .where(eq(jobs.isActive, true))
    .orderBy(desc(jobs.isFeatured), desc(jobs.createdAt));
    res.status(500).json({ error: "Failed to fetch jobs" });
};

// Insert a new job (We will use this manually and later for the scraper)bs
export const createJob = async (jobData: typeof jobs.$inferInsert) => {
  const result = await db.insert(jobs).values(jobData).returning();
  return result[0];
};