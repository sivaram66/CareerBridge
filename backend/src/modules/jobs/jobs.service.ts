import { db } from '../../config/db.js';
import { jobs } from '../../shared/schema.js';
import { desc, eq } from 'drizzle-orm';

// Featured jobs are sorted to the top
export const getAllJobs = async () => {
  return await db
    .select()
    .from(jobs)
    .where(eq(jobs.isActive, true))
    .orderBy(desc(jobs.isFeatured), desc(jobs.createdAt));
};

export const createJob = async (jobData: typeof jobs.$inferInsert) => {
  const result = await db.insert(jobs).values(jobData).returning();
  return result[0];
};