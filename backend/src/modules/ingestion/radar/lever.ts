// /src/modules/ingestion/radar/lever.ts

import axios from 'axios';
import { pool } from '../../../config/db.js';

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
    cutoffDate.setDate(cutoffDate.getDate() - 45); // 45 days ago

    for (const job of rawJobs) {
      const titleString = (job.text || '').toLowerCase();
      const locationString = (job.categories?.location || '').toLowerCase();
      const commitmentString = (job.categories?.commitment || '').toLowerCase();
      const descString = (job.descriptionPlain || job.description || '').toLowerCase();
      
      // --- THE FRESHNESS BOUNCER ---
      const jobDate = new Date(job.createdAt);
      if (jobDate < cutoffDate) continue;

      // --- THE TECH BOUNCER ---
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

      // --- THE ULTIMATE FRESHER DETECTOR ---
      const isFresherOk = 
        titleString.includes('intern') || titleString.includes('fresher') || 
        titleString.includes('entry level') || titleString.includes('sde 1') || 
        titleString.includes('sde i') || titleString.includes('associate') || 
        descString.includes('0 years') || descString.includes('0-1 years') ||
        descString.includes('recent graduate') || descString.includes('university grad');

      if (isRemote || country === 'India') {
        jobsToInsert.push({
          external_job_id: `lever-${job.id}`,
          company_name: companyName,
          title: job.text, 
          location: job.categories?.location || 'Unspecified',
          description: job.descriptionPlain || '',
          is_remote: isRemote,
          country: country,
          apply_url: job.hostedUrl, 
          fresher_ok: isFresherOk,
          is_featured: true // Auto-feature premium jobs
        });
      }
    }

    if (jobsToInsert.length === 0) {
      console.log(`[RADAR] 🚫 Dropped all jobs for ${companyName} (No fresh, tech, India/Remote roles).`);
      return;
    }

    console.log(`[RADAR] 🏗️ Filtered down to ${jobsToInsert.length} Premium Tech Lever jobs. Executing Injection...`);

    for (const job of jobsToInsert) {
      try {
        await pool.query(
          `INSERT INTO jobs (external_job_id, company_name, title, location, description, is_remote, country, apply_url, fresher_ok, is_featured) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           ON CONFLICT (external_job_id) DO NOTHING`,
          [job.external_job_id, job.company_name, job.title, job.location, job.description, job.is_remote, job.country, job.apply_url, job.fresher_ok, job.is_featured]
        );
      } catch (dbError) {
         // Silently ignore duplicates
      }
    }

    console.log(`[RADAR] ✅ Successfully injected ${companyName} (Lever) into Neon Vault.`);

  } catch (error: any) {
    if (error.response?.status === 404) {
      // Silently ignore, means they don't use Lever
    } else {
      console.error(`[RADAR] 🚨 Error scraping Lever for ${companyName}:`, error.message);
    }
  }
}