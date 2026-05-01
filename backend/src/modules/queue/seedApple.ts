import { findJobsInSitemap } from '../scraper/sitemap.test';
import { scrapeQueue } from './jobQueue';

const seedAppleJobs = async () => {
  console.log('🚀 Booting up the Sitemap Radar...');
  
  const appleJobUrls = await findJobsInSitemap('https://jobs.apple.com/sitemap/sitemap-jobs-en-us.xml');
  
  if (appleJobUrls.length === 0) return;

  console.log(`📦 Sending ${appleJobUrls.length} jobs to the Redis Queue...`);

  let count = 0;
  const queuePromises = appleJobUrls.map(async (url) => {
    await scrapeQueue.add('scrape-apple', { url: url });
    count++;
    if (count % 500 === 0) console.log(`...Added ${count} jobs to queue...`);
  });

  await Promise.all(queuePromises);

  console.log(`✅ SUCCESS! All jobs are in the queue.`);
  process.exit(0);
};

seedAppleJobs();