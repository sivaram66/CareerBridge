import cron from 'node-cron';
import { db } from '../../config/db.js';
import { targetCompanies, jobs } from '../../shared/schema.js';
import { eq } from 'drizzle-orm';
import { fetchGreenhouseJobs } from './aggregator.service.js';

// 1. We import your ACTUAL smart function from the scraper module
import { processJobUrl } from '../scraper/scraper.service.js'; 

export const startAggregatorCron = () => {
  console.log('CRON: Aggregator scheduler initialized.');

  // Run at 02:00 AM every single day
  cron.schedule('0 2 * * *', async () => {
    console.log('CRON: Waking up to fetch new jobs...');

    try {
      // Get all active target companies
      const companies = await db.select()
        .from(targetCompanies)
        .where(eq(targetCompanies.isActive, true));

      // Loop through each company
      for (const company of companies) {
        console.log(`CRON: Processing ${company.name}...`);
        
        // Only run Greenhouse logic if that's their ATS
        if (company.atsProvider === 'greenhouse') {
          const newJobs = await fetchGreenhouseJobs(company.boardToken);

          // Process each job found
          for (const job of newJobs) {
            // Check if job already exists in our database
            const existingJob = await db.select()
              .from(jobs)
              .where(eq(jobs.applyUrl, job.applyUrl));

            if (existingJob.length === 0) {
              console.log(`CRON: Found new job! Scraping: ${job.title}`);
              
              try {
                // 2. We just trigger your smart scraper function!
                // It automatically handles the AI AND saving to the database.
                await processJobUrl(company.name, job.applyUrl);
              } catch (scrapeError) {
                console.error(`CRON: Failed to process ${job.applyUrl}`, scrapeError);
              }
            }
          }
        }
      }
      console.log('CRON: Nightly aggregation complete!');
    } catch (error) {
      console.error('CRON: Aggregation failed:', error);
    }
  });
};