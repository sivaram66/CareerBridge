import { db } from '../../config/db.js';
import { jobs } from '../../shared/schema.js';
import { desc, eq } from 'drizzle-orm';

// Featured jobs are sorted to the top
export const getAllJobs = async (page: number = 1, limit: number = 50) => {
  const offset = (page - 1) * limit;

  const result = await db.select()
    .from(jobs)
    .orderBy(desc(jobs.id)) 
    .limit(limit)
    .offset(offset);

  return result;
};

export const createJob = async (jobData: typeof jobs.$inferInsert) => {
  const result = await db.insert(jobs).values(jobData).returning();
  return result[0];
};