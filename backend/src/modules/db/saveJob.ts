import { db } from '../../config/db.js';
import { jobs } from '../../shared/schema.js';

export const saveJobToDatabase = async (jobData: any, originalUrl: string) => {
  if (!jobData) return false;

  try {
    const externalJobId = `custom-${Buffer.from(originalUrl).toString('base64').substring(0, 24)}`;

    await db.insert(jobs)
      .values({
        externalJobId,
        title: jobData.title || 'Untitled',
        companyName: jobData.company || 'Unknown',
        isRemote: jobData.remote === true,
        salaryRange: jobData.salary || null,
        applyUrl: originalUrl,
        description: jobData.techStack && jobData.techStack.length > 0
          ? `Tech Stack: ${jobData.techStack.join(', ')}`
          : 'No specific tech stack extracted.',
        fresherOk: false,
        isFeatured: false,
      })
      .onConflictDoNothing({ target: jobs.externalJobId });

    console.log(`💾 SAVED TO DB: ${jobData.title} at ${jobData.company}`);
    return true;

  } catch (error: any) {
    console.error(`❌ Database Error saving ${jobData.title}:`, error.message);
    return false;
  }
};