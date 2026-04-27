import { db } from '../../config/db.js';
import { jobs } from '../../shared/schema.js';
import { desc } from 'drizzle-orm';

// Fetch all jobs, sorting premium ones to the top
export const getAllJobs = async () => {
  return await db
    .select()
    .from(jobs)
    .orderBy(desc(jobs.isPremium), desc(jobs.createdAt));
};

// Insert a new job (We will use this manually and later for the scraper)
export const createJob = async (jobData: typeof jobs.$inferInsert) => {
  const result = await db.insert(jobs).values(jobData).returning();
  return result[0];
};