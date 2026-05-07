// /src/modules/ingestion/radar/greenhouse.ts

import { db } from '../../../config/db.js'; 
import { jobs } from '../../../shared/schema.js'; 

interface GreenhouseJob {
  id: number;
  title: string;
  absolute_url: string;
  location: { name: string };
  departments?: { name: string }[];
  content?: string; // We will force Greenhouse to give us this
  updated_at: string; // Internal freshness timestamp
}

export async function ingestGreenhouseJobs(boardToken: string, companyName: string) {
  console.log(`\n[RADAR - GREENHOUSE] 📡 Scanning: ${companyName} (${boardToken})`);

  try {
    // 1. Force the API to give us the full descriptions (?content=true)
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
    
    // Calculate the cutoff date (45 days ago)
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 45);

    for (const job of rawJobs) {
      const titleString = (job.title || '').toLowerCase();
      const locationString = (job.location?.name || '').toLowerCase();
      const descString = (job.content || '').toLowerCase();
      
      // --- THE FRESHNESS BOUNCER ---
      const jobDate = new Date(job.updated_at);
      if (jobDate < cutoffDate) {
        continue; // Job is too old, drop it silently
      }

      // --- THE TECH BOUNCER ---
      const isTechRole = 
        titleString.includes('engineer') || titleString.includes('developer') || 
        titleString.includes('software') || titleString.includes('data') || 
        titleString.includes('product') || titleString.includes('design') || 
        titleString.includes('backend') || titleString.includes('frontend') ||
        titleString.includes('fullstack') || titleString.includes('full stack') ||
        titleString.includes('ai ') || titleString.includes('machine learning') ||
        titleString.includes('sde');

      if (!isTechRole) {
        continue; // Not a tech role, drop it silently
      }

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

      // --- THE ULTIMATE FRESHER DETECTOR ---
      const isFresherOk = 
        titleString.includes('intern') || titleString.includes('fresher') || 
        titleString.includes('entry level') || titleString.includes('sde 1') || 
        titleString.includes('sde i') || titleString.includes('associate') || 
        descString.includes('0 years') || descString.includes('0-1 years') ||
        descString.includes('recent graduate') || descString.includes('university grad');

      // --- THE LOCATION BOUNCER ---
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
          fresherOk: isFresherOk,
          isFeatured: true // Let's auto-feature these since they are premium ATS jobs!
        });
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
      // Don't clutter logs with 404s, it just means they don't use Greenhouse
    } else {
      console.error(`[RADAR] ❌ Mission Failed for ${companyName}:`, error.message);
    }
  }
}