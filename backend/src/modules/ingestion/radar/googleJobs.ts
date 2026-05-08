// /src/modules/ingestion/radar/googleJobs.ts

import axios from 'axios';
import { pool } from '../../../config/db.js';
import crypto from 'crypto';

// 🧠 SMART EXPERIENCE PARSER
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
    const minYears = parseInt(match[1]);
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
  
  // Title overrides
  if (!isSeniorRole && title.match(/(intern|fresher|entry level)/i)) {
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

        // 1. Check for Remote Status
        if (locationString.includes('remote') || 
            locationString.includes('anywhere') || 
            titleString.includes('remote')) {
          isRemote = true;
        }

        // 2. Detect Country (India Focus)
        if (locationString.includes('india') || locationString.includes('ind') || 
            locationString.includes('bengaluru') || locationString.includes('bangalore') || 
            locationString.includes('mumbai') || locationString.includes('delhi') || 
            locationString.includes('gurugram') || locationString.includes('noida') || 
            locationString.includes('pune') || locationString.includes('hyderabad')) {
          country = 'India';
        }

        // 3. THE BOUNCER: Strict India/Remote check
        if (isRemote || country === 'India') {
          const applyLink = job.apply_options?.[0]?.link || job.share_link || 'https://google.com/jobs';
          const rawId = job.job_id || `${job.title}-${job.company_name}`;
          const safeHash = crypto.createHash('sha256').update(rawId).digest('hex').substring(0, 16);

          const logoUrl = job.thumbnail || null;
          
          // --- THE SMART PARSER ---
          const { experienceString, fresherOk } = parseExperienceRequirements(job.description || '', job.title || '');

          let salaryRange = null;
          if (job.extensions && Array.isArray(job.extensions)) {
            const salaryExt = job.extensions.find((ext: string) => 
              ext.includes('₹') || ext.includes('$') || ext.includes('a year') || ext.includes('a month')
            );
            if (salaryExt) salaryRange = salaryExt;
          }

          jobsToInsert.push({
            external_job_id: `google-${safeHash}`,
            company_name: job.company_name || 'Unknown Startup',
            title: job.title,
            location: job.location || 'Unspecified',
            description: job.description || '',
            is_remote: isRemote,
            country: country,
            apply_url: applyLink,
            logo_url: logoUrl,
            experience: experienceString,
            fresher_ok: fresherOk,
            salary_range: salaryRange,
            is_featured: false
          });
        }
      }

      if (jobsToInsert.length > 0) {
        for (const job of jobsToInsert) {
          try {
            await pool.query(
              `INSERT INTO jobs (
                external_job_id, company_name, title, location, description, 
                is_remote, country, apply_url, logo_url, experience, fresher_ok, salary_range, is_featured
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
              ON CONFLICT (external_job_id) DO NOTHING`,
              [
                job.external_job_id, job.company_name, job.title, job.location, job.description, 
                job.is_remote, job.country, job.apply_url, job.logo_url, job.experience, job.fresher_ok, job.salary_range, job.is_featured
              ]
            );
            totalInjectedForQuery++;
          } catch (dbError) {
             console.error(`[DB ERROR]:`, dbError.message);
          }
        }
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