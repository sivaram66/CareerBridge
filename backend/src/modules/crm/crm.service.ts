import { db } from '../../config/db.js';
import { jobApplications, jobs } from '../../shared/schema.js';
import { eq, and } from 'drizzle-orm';

export const trackJob = async (userId: number, jobId: number, status: string) => {
  const existingRecords = await db.select()
    .from(jobApplications)
    .where(and(
      eq(jobApplications.userId, userId),
      eq(jobApplications.jobId, jobId)
    ));

  const existingRecord = existingRecords[0];

  if (existingRecord) {
    const updated = await db.update(jobApplications)
      .set({ status, updatedAt: new Date() })
      .where(eq(jobApplications.id, existingRecord.id))
      .returning();
    return updated[0];
  }

  const newRecord = await db.insert(jobApplications)
    .values({ userId, jobId, status })
    .returning();
    
  return newRecord[0];
};

export const getUserPipeline = async (userId: number) => {
  return await db.select({
    applicationId: jobApplications.id,
    status: jobApplications.status,
    appliedAt: jobApplications.updatedAt,
    job: jobs
  })
  .from(jobApplications)
  .innerJoin(jobs, eq(jobApplications.jobId, jobs.id))
  .where(eq(jobApplications.userId, userId));
};