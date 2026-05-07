// /src/modules/ingestion/radar/googleJobs.ts

import axios from 'axios';
import { pool } from '../../../config/db.js';
import crypto from 'crypto';

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
        const descString = (job.description || '').toLowerCase();
        
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

          // --- NEW: ADVANCED DATA EXTRACTION ---

          // Logo is usually returned as 'thumbnail' by SerpApi
          const logoUrl = job.thumbnail || null;

          // Fresher Check (Hunting for keywords in title and description)
          const isFresherOk = titleString.includes('intern') || 
                              titleString.includes('fresher') || 
                              titleString.includes('entry level') || 
                              descString.includes('0 years') || 
                              descString.includes('0-1 years') ||
                              descString.includes('recent graduate');

          // Salary Extraction (SerpApi usually puts this in the 'extensions' array)
          let salaryRange = null;
          if (job.extensions && Array.isArray(job.extensions)) {
            // Look for strings containing currency or salary keywords
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
            fresher_ok: isFresherOk,
            salary_range: salaryRange,
            is_featured: false // Defaults to false. Can be upgraded later!
          });
        }
      }

      if (jobsToInsert.length > 0) {
        for (const job of jobsToInsert) {
          try {
            // --- NEW: UPDATED SQL INSERT QUERY ---
            await pool.query(
              `INSERT INTO jobs (
                external_job_id, company_name, title, location, description, 
                is_remote, country, apply_url, logo_url, fresher_ok, salary_range, is_featured
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
              ON CONFLICT (external_job_id) DO NOTHING`,
              [
                job.external_job_id, job.company_name, job.title, job.location, job.description, 
                job.is_remote, job.country, job.apply_url, job.logo_url, job.fresher_ok, job.salary_range, job.is_featured
              ]
            );
            totalInjectedForQuery++;
          } catch (dbError) {
             // Silently ignore duplicates
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