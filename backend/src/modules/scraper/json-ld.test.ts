import * as cheerio from 'cheerio';
import { analyzeJobMatch } from '../ai-summarizer/ai.service.js';

// Scraper with two extraction paths:
// Path A: Structured JSON-LD data (preferred, most accurate)
// Path B: Gemini AI fallback for unstructured pages
export const scrapeCustomJob = async (targetUrl: string) => {
  console.log(`\n🌐 Fetching HTML from: ${targetUrl}`);

  try {
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml'
      }
    });

    const html = await response.text();
    const $ = cheerio.load(html);
    let jobData: any = null;

    $('script[type="application/ld+json"]').each((_, element) => {
      try {
        const jsonContent = $(element).html();
        if (jsonContent) {
          const parsed = JSON.parse(jsonContent);
          if (parsed['@type'] === 'JobPosting') jobData = parsed;
          if (parsed['@graph']) {
            const graphJob = parsed['@graph'].find((item: any) => item['@type'] === 'JobPosting');
            if (graphJob) jobData = graphJob;
          }
        }
      } catch (e) {}
    });

    if (jobData) {
      console.log('✅ SUCCESS (Path A)! Found hidden JobPosting data.');
      return {
        title: jobData.title,
        company: jobData.hiringOrganization?.name || 'Unknown',
        remote: jobData.jobLocationType === 'TELECOMMUTE',
        techStack: [],
        salary: jobData.baseSalary
          ? `${jobData.baseSalary.value?.minValue} - ${jobData.baseSalary.value?.maxValue}`
          : 'Not Disclosed'
      };
    }

    console.log('⚠️ No JSON-LD found. Activating Gemini AI Fallback...');

    const rawBodyText = $('body').text().replace(/\s+/g, ' ').trim().substring(0, 4000);
    
    // Use analyzeJobMatch as a best-effort fallback — pass raw text as the description
    const aiParsedData = await analyzeJobMatch(
      'Unknown Role',
      'Unknown Company',
      rawBodyText,
      'General candidate'
    );

    if (aiParsedData) {
      console.log('🤖 AI Extracted Data (best-effort fallback)');
      return {
        title: 'Unknown Role',
        company: 'Unknown Company',
        remote: false,
        techStack: aiParsedData.techStack || [],
        salary: aiParsedData.salary || 'Not Disclosed',
      };
    } else {
      console.log('❌ AI failed to parse the document.');
      return null;
    }

  } catch (error) {
    console.error(`Failed to scrape ${targetUrl}:`, error);
    return null;
  }
};