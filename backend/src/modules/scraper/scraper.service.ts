import * as cheerio from 'cheerio';
import { analyzeJobMatch } from '../ai-summarizer/ai.service.js';
import { createJob } from '../jobs/jobs.service.js';

export const processJobUrl = async (companyName: string, jobUrl: string) => {
  try {
    const response = await fetch(jobUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml'
      }
    });
    const html = await response.text();

    const $ = cheerio.load(html);
    $('script, style, nav, footer, header').remove();
    const rawText = $('body').text().replace(/\s+/g, ' ').trim().substring(0, 4000);

    console.log(`🧠 AI processing job from ${companyName}...`);
    const aiSummary = await analyzeJobMatch(
      companyName,
      companyName,
      rawText,
      'General candidate profile'
    );

    console.log(`💾 Saving clean data to database...`);
    const savedJob = await createJob({
      externalJobId: `scraped-${Buffer.from(jobUrl).toString('base64').substring(0, 24)}`,
      companyName: companyName,
      title: 'Software Engineer', // Best effort when JSON-LD is not available
      description: rawText.substring(0, 1000),
      applyUrl: jobUrl,
      isRemote: false,
      fresherOk: false,
      isFeatured: false,
    });

    return savedJob;
  } catch (error) {
    console.error(`Scraping failed for ${jobUrl}:`, error);
    throw new Error('Scraping pipeline failed');
  }
};