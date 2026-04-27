import * as cheerio from 'cheerio';
import { summarizeJobDescription } from '../ai-summarizer/ai.service.js';
import { createJob } from '../jobs/jobs.service.js';

export const processJobUrl = async (companyName: string, jobUrl: string) => {
  try {
    // 1. Fetch the raw HTML from the job posting
    const response = await fetch(jobUrl);
    const html = await response.text();

    // 2. Load it into Cheerio to parse it
    const $ = cheerio.load(html);

    // Remove scripts, styles, and navbars so we just get the core text
    $('script, style, nav, footer, header').remove();
    const rawText = $('body').text().replace(/\s+/g, ' ').trim();

    // 3. Send the raw text to our AI brain
    console.log(`🧠 AI processing job from ${companyName}...`);
    const aiSummary = await summarizeJobDescription(companyName, jobUrl, rawText);

    // 4. Save the cleanly formatted data into Neon DB using our existing jobs service
    console.log(`💾 Saving clean data to database...`);
    const savedJob = await createJob({
      companyName: aiSummary.companyName,
      title: aiSummary.title,
      description: aiSummary.description,
      salaryRange: aiSummary.salaryRange,
      applyUrl: aiSummary.applyUrl,
      isRemoteIndia: true, // Assuming we are targeting this niche
      isPremium: false     // Scraped jobs aren't premium by default
    });

    return savedJob;
  } catch (error) {
    console.error(`Scraping failed for ${jobUrl}:`, error);
    throw new Error('Scraping pipeline failed');
  }
};