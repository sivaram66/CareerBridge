import { scrapeQueue } from '../queue/jobQueue.js';

// Placeholder URL — replace with Adzuna, Jooble, or SerpApi endpoint in production
const EXTERNAL_API_URL = 'https://api.example-job-board.com/v1/jobs?keyword=node.js&location=remote';

export const fetchJobsFromExternalAPI = async () => {
  console.log('🌊 [FIREHOSE] Opening the external job API valve...');

  try {
    const response = await fetch(EXTERNAL_API_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`External API failed with status: ${response.status}`);
    }

    const data = await response.json();
    const jobListings = data.results || []; 

    if (jobListings.length === 0) {
      console.log('🤷‍♂️ [FIREHOSE] No new jobs found from the API right now.');
      return;
    }

    console.log(`🎯 [FIREHOSE] Found ${jobListings.length} new jobs! Pushing to the conveyor belt...`);

    for (const job of jobListings) {
      if (job.job_url) {
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