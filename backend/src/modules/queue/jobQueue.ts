import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import { scrapeCustomJob } from '../scraper/json-ld.test.ts'; 
import { saveJobToDatabase } from '../db/saveJob.ts';

// 1. Paste your WORKING Upstash URL here
const REDIS_URL = 'rediss://default:gQAAAAAAAbThAAIgcDE1ODI2NGQ0YWI4YTQ0MTQyYmUyZmUwMGEzMjFhYTJkMg@sterling-pegasus-111841.upstash.io:6379'; // WAIT! Use the rediss:// string!
// It should look like: 'rediss://default:YOUR_PASSWORD@sterling-pegasus-111841.upstash.io:PORT'
const redisConnection = new IORedis('rediss://default:gQAAAAAAAbThAAIgcDE1ODI2NGQ0YWI4YTQ0MTQyYmUyZmUwMGEzMjFhYTJkMg@sterling-pegasus-111841.upstash.io:6379', {
  maxRetriesPerRequest: null,
});

// 2. Create the Queue
export const scrapeQueue = new Queue('job-scrape-queue', { connection: redisConnection });

// 3. Create the Worker (The Bouncer)
const worker = new Worker('job-scrape-queue', async (job) => {
  const url = job.data.url;
  console.log(`\n[WORKER] 🚦 Processing Job: ${url}`);

  // 2. Run the Extractor
  const extractedJobData = await scrapeCustomJob(url);

  // 3. Save it to Neon
  if (extractedJobData) {
    await saveJobToDatabase(extractedJobData, url);
  }

  console.log('[WORKER] ⏳ Resting for 2 seconds...');
  await new Promise(resolve => setTimeout(resolve, 2000));

}, { 
  connection: redisConnection,
  concurrency: 1 
});

worker.on('completed', job => console.log(`[WORKER] ✅ Finished Job ${job.id}`));
worker.on('failed', (job, err) => console.log(`[WORKER] ❌ Failed Job ${job?.id}: ${err.message}`));