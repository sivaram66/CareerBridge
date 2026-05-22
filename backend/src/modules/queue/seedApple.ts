// This is a one-off seed script for Apple jobs via sitemap.
// Disabled: sitemap.test module was removed. Keeping as reference only.
// To re-enable, restore ../scraper/sitemap.test.ts and update imports.

// import { findJobsInSitemap } from '../scraper/sitemap.test.js';
// import { scrapeQueue } from './jobQueue.js';

// const seedAppleJobs = async () => {
//   console.log('🚀 Booting up the Sitemap Radar...');
//   const appleJobUrls = await findJobsInSitemap('https://jobs.apple.com/sitemap/sitemap-jobs-en-us.xml');
//   if (appleJobUrls.length === 0) return;
//   console.log(`📦 Sending ${appleJobUrls.length} jobs to the Redis Queue...`);
//   for (const url of appleJobUrls) {
//     await scrapeQueue.add('scrape-apple', { url });
//   }
//   console.log(`✅ SUCCESS! All jobs are in the queue.`);
//   process.exit(0);
// };

// seedAppleJobs();

export {};