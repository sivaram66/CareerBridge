import { db } from '../../../config/db.js'; 
import { jobs } from '../../../shared/schema.js'; 

interface GreenhouseJob {
  id: number;
  title: string;
  absolute_url: string;
  location: { name: string };
  departments?: { name: string }[];
  content?: string; 
  updated_at: string; 
}

function parseExperienceRequirements(jobDescription: string, jobTitle: string) {
  const text = (jobDescription || '').toLowerCase();
  const title = (jobTitle || '').toLowerCase();

  let extractedExperience = "Not Specified";
  let isFresherOk = false;

  const isSeniorRole = title.match(/(senior|sr|lead|staff|principal|manager|head|director)/i);
  const expRegex = /(\d+)\s*(?:\+|-|to)?\s*(\d+)?\s*(?:\+)?\s*(years?|yrs?)\s*(?:of\s*)?experience/i;
  const match = text.match(expRegex);

  if (match) {
    extractedExperience = match[0];
    const minYears = parseInt(match[1] ?? '0');
    if (minYears === 0 && !isSeniorRole) {
      isFresherOk = true;
    } else {
      isFresherOk = false;
    }
  } else {
    if (!isSeniorRole && text.match(/(fresher|entry-level|entry level|new grad|0 years|recent graduate)/i)) {
      isFresherOk = true;
      extractedExperience = "Fresher / Entry Level";
    }
  }

  if (!isSeniorRole && title.match(/(intern|fresher|entry level)/i)) {
      isFresherOk = true;
      if (extractedExperience === "Not Specified") extractedExperience = "Fresher / Entry Level";
  }

  return { experienceString: extractedExperience, fresherOk: isFresherOk };
}

export async function ingestGreenhouseJobs(boardToken: string, companyName: string) {
  console.log(`\n[RADAR - GREENHOUSE] 📡 Scanning: ${companyName} (${boardToken})`);

  try {
    const response = await fetch(`https://boards-api.greenhouse.io/v1/boards/${boardToken}/jobs?content=true`);
    
    if (!response.ok) {
      throw new Error(`API rejected request with status: ${response.status}`);
    }

    const data = await response.json();
    const rawJobs: GreenhouseJob[] = data.jobs;

    if (!rawJobs || rawJobs.length === 0) {
      console.log(`[RADAR] No jobs found for ${companyName}. Moving to next target.`);
      return;
    }

    const jobsToInsert: any[] = [];
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 45);

    // Cap per company to maintain feed diversity
    const MAX_JOBS_PER_COMPANY = 5;

    for (const job of rawJobs) {
      const titleString = (job.title || '').toLowerCase();
      const locationString = (job.location?.name || '').toLowerCase();
      
      const jobDate = new Date(job.updated_at);
      if (jobDate < cutoffDate) continue;

      const isTechRole = 
        titleString.includes('engineer') || titleString.includes('developer') || 
        titleString.includes('software') || titleString.includes('data') || 
        titleString.includes('product') || titleString.includes('design') || 
        titleString.includes('backend') || titleString.includes('frontend') ||
        titleString.includes('fullstack') || titleString.includes('full stack') ||
        titleString.includes('ai ') || titleString.includes('machine learning') ||
        titleString.includes('sde');

      if (!isTechRole) continue;

      let isRemote = false;
      let country = 'Unknown';

      if (locationString.includes('remote') || locationString.includes('anywhere')) {
        isRemote = true;
      }

      if (locationString.includes('india') || locationString.includes('ind') || 
          locationString.includes('bengaluru') || locationString.includes('bangalore') || 
          locationString.includes('mumbai') || locationString.includes('delhi') || 
          locationString.includes('gurugram') || locationString.includes('noida') || 
          locationString.includes('pune') || locationString.includes('hyderabad')) {
        country = 'India';
      }

      const { experienceString, fresherOk } = parseExperienceRequirements(job.content || '', job.title || '');

      if (isRemote || country === 'India') {
        jobsToInsert.push({
          externalJobId: `greenhouse-${job.id}`,
          companyName: companyName,
          title: job.title,
          location: job.location?.name || 'Unspecified', 
          description: job.content || '',
          isRemote: isRemote,
          country: country,
          applyUrl: job.absolute_url,
          experience: experienceString,
          fresherOk: fresherOk,
          isFeatured: true 
        });

        if (jobsToInsert.length >= MAX_JOBS_PER_COMPANY) {
          console.log(`[RADAR] 🛑 Diversity Cap Reached: Stopping at ${MAX_JOBS_PER_COMPANY} jobs for ${companyName}.`);
          break;
        }
      }
    }

    if (jobsToInsert.length === 0) {
      console.log(`[RADAR] 🚫 Dropped all jobs for ${companyName} (No fresh, tech, India/Remote roles).`);
      return;
    }

    console.log(`[RADAR] 🏗️ Filtered down to ${jobsToInsert.length} Premium Tech roles. Executing Injection...`);

    await db.insert(jobs)
      .values(jobsToInsert)
      .onConflictDoNothing({ 
        target: jobs.externalJobId 
      });

    console.log(`[RADAR] ✅ Successfully injected ${companyName} into Neon Vault.`);

  } catch (error: any) {
    if (error.message.includes('404')) {
    } else {
      console.error(`[RADAR] ❌ Mission Failed for ${companyName}:`, error.message);
    }
  }
}