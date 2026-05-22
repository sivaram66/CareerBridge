import axios from 'axios';
import { db } from '../../../config/db.js';
import { jobs } from '../../../shared/schema.js';

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

export async function sweepLever(companyName: string, boardToken: string) {
  try {
    const url = `https://api.lever.co/v0/postings/${boardToken}?mode=json`;
    console.log(`\n[RADAR - LEVER] 📡 Scanning: ${companyName}`);

    const response = await axios.get(url, { timeout: 10000 });
    const rawJobs = response.data;

    if (!rawJobs || rawJobs.length === 0) {
      console.log(`[RADAR] ⚠️ No jobs found for ${companyName}.`);
      return;
    }

    const jobsToInsert: any[] = [];
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 45);

    // Cap per company to maintain feed diversity
    const MAX_JOBS_PER_COMPANY = 5;

    for (const job of rawJobs) {
      const titleString = (job.text || '').toLowerCase();
      const locationString = (job.categories?.location || '').toLowerCase();
      const commitmentString = (job.categories?.commitment || '').toLowerCase();
      const descString = (job.descriptionPlain || job.description || '');

      const jobDate = new Date(job.createdAt);
      if (jobDate < cutoffDate) continue;

      const isTechRole =
        titleString.includes('engineer') || titleString.includes('developer') ||
        titleString.includes('software') || titleString.includes('data') ||
        titleString.includes('product') || titleString.includes('design') ||
        titleString.includes('backend') || titleString.includes('frontend') ||
        titleString.includes('fullstack') || titleString.includes('full stack') ||
        titleString.includes('ai ') || titleString.includes('machine learning') ||
        titleString.includes('sde') || titleString.includes('intern');

      if (!isTechRole) continue;

      let isRemote = false;
      let country = 'Unknown';

      if (locationString.includes('remote') || locationString.includes('anywhere') ||
          commitmentString.includes('remote') || job.workplaceType === 'remote') {
        isRemote = true;
      }

      if (locationString.includes('india') || locationString.includes('ind') ||
          locationString.includes('bengaluru') || locationString.includes('bangalore') ||
          locationString.includes('mumbai') || locationString.includes('delhi') ||
          locationString.includes('gurugram') || locationString.includes('noida') ||
          locationString.includes('pune') || locationString.includes('hyderabad')) {
        country = 'India';
      }

      const { experienceString, fresherOk } = parseExperienceRequirements(descString, job.text || '');

      if (isRemote || country === 'India') {
        jobsToInsert.push({
          externalJobId: `lever-${job.id}`,
          companyName: companyName,
          title: job.text,
          location: job.categories?.location || 'Unspecified',
          description: job.descriptionPlain || '',
          isRemote: isRemote,
          country: country,
          applyUrl: job.hostedUrl,
          experience: experienceString,
          fresherOk: fresherOk,
          isFeatured: true,
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

    console.log(`[RADAR] 🏗️ Filtered down to ${jobsToInsert.length} Premium Tech Lever jobs. Executing Injection...`);

    await db.insert(jobs)
      .values(jobsToInsert)
      .onConflictDoNothing({ target: jobs.externalJobId });

    console.log(`[RADAR] ✅ Successfully injected ${companyName} (Lever) into Neon Vault.`);

  } catch (error: any) {
    if (error.response?.status === 404) {
      // Silently skip — company not on Lever
    } else {
      console.error(`[RADAR] 🚨 Error scraping Lever for ${companyName}:`, error.message);
    }
  }
}