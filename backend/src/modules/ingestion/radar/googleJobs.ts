import axios from 'axios';
import { db } from '../../../config/db.js';
import { jobs } from '../../../shared/schema.js';
import crypto from 'crypto';

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

  if (!isSeniorRole && title.match(/(intern|fresher|entry level|trainee|graduate)/i)) {
    isFresherOk = true;
    if (extractedExperience === "Not Specified") extractedExperience = "Fresher / Entry Level";
  }

  return { experienceString: extractedExperience, fresherOk: isFresherOk };
}

export async function sweepGoogleJobs(searchQuery: string, maxPages: number = 5) {
  const apiKey = process.env.SERPAPI_KEY;

  if (!apiKey) {
    console.error('[RADAR] ❌ SERPAPI_KEY is missing from .env file.');
    return;
  }

  console.log(`\n[RADAR - GOOGLE] 📡 Launching Deep Sweep for: "${searchQuery}" (Max ${maxPages} Pages)`);
  let totalInjectedForQuery = 0;

  for (let page = 0; page < maxPages; page++) {
    const startAt = page * 10;

    try {
      const response = await axios.get('https://serpapi.com/search.json', {
        params: {
          engine: 'google_jobs',
          q: searchQuery,
          hl: 'en',
          gl: 'in', // India results
          api_key: apiKey,
          start: startAt,
          htichips: "date_posted:week"
        }
      });

      const rawJobs = response.data.jobs_results;

      if (!rawJobs || rawJobs.length === 0) {
        console.log(`[RADAR] ⚠️ End of results reached for "${searchQuery}" at Page ${page + 1}.`);
        break;
      }

      const jobsToInsert: any[] = [];

      for (const job of rawJobs) {
        const locationString = (job.location || '').toLowerCase();
        const titleString = (job.title || '').toLowerCase();

        let isRemote = false;
        let country = 'Unknown';

        if (locationString.includes('remote') ||
            locationString.includes('anywhere') ||
            titleString.includes('remote')) {
          isRemote = true;
        }

        if (locationString.includes('india') || locationString.includes('ind') ||
            locationString.includes('bengaluru') || locationString.includes('bangalore') ||
            locationString.includes('mumbai') || locationString.includes('delhi') ||
            locationString.includes('gurugram') || locationString.includes('noida') ||
            locationString.includes('pune') || locationString.includes('hyderabad') ||
            locationString.includes('chennai') || locationString.includes('kolkata') ||
            locationString.includes('kochi') || locationString.includes('ahmedabad')) {
          country = 'India';
        }

        // Only ingest India-based or remote roles
        if (isRemote || country === 'India') {
          const applyLink = job.apply_options?.[0]?.link || job.share_link || 'https://google.com/jobs';
          const rawId = job.job_id || `${job.title}-${job.company_name}`;
          const safeHash = crypto.createHash('sha256').update(rawId).digest('hex').substring(0, 16);

          const logoUrl = job.thumbnail || null;
          const { experienceString, fresherOk } = parseExperienceRequirements(job.description || '', job.title || '');

          let salaryRange = null;
          if (job.extensions && Array.isArray(job.extensions)) {
            const salaryExt = job.extensions.find((ext: string) =>
              ext.includes('₹') || ext.includes('$') || ext.includes('a year') || ext.includes('a month') || ext.includes('LPA')
            );
            if (salaryExt) salaryRange = salaryExt;
          }

          jobsToInsert.push({
            externalJobId: `google-${safeHash}`,
            companyName: job.company_name || 'Unknown Startup',
            title: job.title,
            location: job.location || 'Unspecified',
            description: job.description || '',
            isRemote: isRemote,
            country: country,
            applyUrl: applyLink,
            logoUrl: logoUrl,
            experience: experienceString,
            fresherOk: fresherOk,
            salaryRange: salaryRange,
            isFeatured: false,
          });
        }
      }

      if (jobsToInsert.length > 0) {
        await db.insert(jobs)
          .values(jobsToInsert)
          .onConflictDoNothing({ target: jobs.externalJobId });

        totalInjectedForQuery += jobsToInsert.length;
        console.log(`[RADAR] 📄 Page ${page + 1}: Injected ${jobsToInsert.length} valid jobs.`);
      } else {
        console.log(`[RADAR] 🚫 Page ${page + 1}: All jobs dropped by Bouncer (Not India/Remote).`);
      }

      await new Promise(resolve => setTimeout(resolve, 1500));

    } catch (error: any) {
      console.error(`[RADAR] 🚨 Error sweeping Page ${page + 1}:`, error.message);
      break;
    }
  }

  console.log(`[RADAR] ✅ Sweep Complete. Total injected for "${searchQuery}": ${totalInjectedForQuery} jobs.`);
}