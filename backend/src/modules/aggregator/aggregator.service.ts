import { scrapeQueue } from '../queue/jobQueue.js';

// We are using a generic API URL here for the example. 
// In production, this would be your Adzuna, Jooble, or SerpApi endpoint.
const EXTERNAL_API_URL = 'https://api.example-job-board.com/v1/jobs?keyword=node.js&location=remote';

export const fetchJobsFromExternalAPI = async () => {
  console.log('🌊 [FIREHOSE] Opening the external job API valve...');

  try {
    // 1. Ask the external API for the latest jobs
    const response = await fetch(EXTERNAL_API_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${process.env.API_KEY}` // You will need this for real APIs
      }
    });

    if (!response.ok) {
      throw new Error(`External API failed with status: ${response.status}`);
    }

    const data = await response.json();
    
    // Assume the API returns an array of objects, and each object has a 'job_url' property
    const jobListings = data.results || []; 

    if (jobListings.length === 0) {
      console.log('🤷‍♂️ [FIREHOSE] No new jobs found from the API right now.');
      return;
    }

    console.log(`🎯 [FIREHOSE] Found ${jobListings.length} new jobs! Pushing to the conveyor belt...`);

    // 2. Loop through the results and drop each URL onto your Redis Queue
    for (const job of jobListings) {
      if (job.job_url) {
        // We add it to the exact same queue your Apple Radar uses
        await scrapeQueue.add('scrape-job', { 
          url: job.job_url,
          companyName: job.company_name || 'Unknown' 
        });
      }
    }

    console.log('✅ [FIREHOSE] Successfully loaded all new jobs onto the Redis Queue.');

  } catch (error) {
    console.error('❌ [FIREHOSE] Error fetching from external API:', error);
  }
};