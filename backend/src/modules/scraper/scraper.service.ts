import * as cheerio from 'cheerio';
import { summarizeJobDescription } from '../ai-summarizer/ai.service.js';
import { createJob } from '../jobs/jobs.service.js';

export const processJobUrl = async (companyName: string, jobUrl: string) => {
  try {
    const response = await fetch(jobUrl);
    const html = await response.text();

    const $ = cheerio.load(html);
    $('script, style, nav, footer, header').remove();
    const rawText = $('body').text().replace(/\s+/g, ' ').trim();

    console.log(`🧠 AI processing job from ${companyName}...`);
    const aiSummary = await summarizeJobDescription(companyName, jobUrl, rawText);

    console.log(`💾 Saving clean data to database...`);
    const savedJob = await createJob({
      companyName: aiSummary.companyName,
      title: aiSummary.title,
      description: aiSummary.description,
      salaryRange: aiSummary.salaryRange,
      applyUrl: aiSummary.applyUrl,
      isRemoteIndia: true,
      isPremium: false
    });

    return savedJob;
  } catch (error) {
    console.error(`Scraping failed for ${jobUrl}:`, error);
    throw new Error('Scraping pipeline failed');
  }
};