import { db } from '../../config/db.js';
import { jobApplications, jobs } from '../../shared/schema.js';
import { eq, and } from 'drizzle-orm';

// 1. Save or Update a Job Application
export const trackJob = async (userId: number, jobId: number, status: string) => {
  // 1. Fetch any matching records from the database
  const existingRecords = await db.select()
    .from(jobApplications)
    .where(and(
      eq(jobApplications.userId, userId),
      eq(jobApplications.jobId, jobId)
    ));

  // 2. Extract the first item into a specific variable
  const existingRecord = existingRecords[0];

  // 3. Check if the variable actually holds an object (This makes TypeScript happy!)
  if (existingRecord) {
    const updated = await db.update(jobApplications)
      .set({ status, updatedAt: new Date() })
      .where(eq(jobApplications.id, existingRecord.id)) // No more TS errors here
      .returning();
    return updated[0];
  }

  // 4. If existingRecord is undefined, insert a brand new application
  const newRecord = await db.insert(jobApplications)
    .values({ userId, jobId, status })
    .returning();
    
  return newRecord[0];
};
// 2. Get a User's Pipeline (Joins the tables together)
export const getUserPipeline = async (userId: number) => {
  // This is a SQL INNER JOIN. We get the tracker data AND the actual job details.
  return await db.select({
    applicationId: jobApplications.id,
    status: jobApplications.status,
    appliedAt: jobApplications.updatedAt,
    job: jobs // Returns the full job object nested inside
  })
  .from(jobApplications)
  .innerJoin(jobs, eq(jobApplications.jobId, jobs.id))
  .where(eq(jobApplications.userId, userId));
};