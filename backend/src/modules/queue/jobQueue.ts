import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import { scrapeCustomJob } from '../scraper/json-ld.test.ts'; 
import { saveJobToDatabase } from '../db/saveJob.ts';
import dotenv from 'dotenv';
dotenv.config();

const REDIS_URL = process.env.REDIS_URL as string;

if (!REDIS_URL) {
  throw new Error(' REDIS_URL not found in .env');
}

const redisConnection = new IORedis(REDIS_URL, {
  maxRetriesPerRequest: null,
});

export const scrapeQueue = new Queue('job-scrape-queue', { connection: redisConnection });

const worker = new Worker('job-scrape-queue', async (job) => {
  const url = job.data.url;
  console.log(`\n[WORKER] 🚦 Processing Job: ${url}`);

  const extractedJobData = await scrapeCustomJob(url);

  if (extractedJobData) {
    await saveJobToDatabase(extractedJobData, url);
  }

  // Rate limit: prevent API bans from rapid-fire requests
  console.log('[WORKER] ⏳ Resting for 5 seconds...');
  await new Promise(resolve => setTimeout(resolve, 5000));

}, { 
  connection: redisConnection,
  concurrency: 1 
});

worker.on('completed', job => console.log(`[WORKER] ✅ Finished Job ${job.id}`));
worker.on('failed', (job, err) => console.log(`[WORKER] ❌ Failed Job ${job?.id}: ${err.message}`));