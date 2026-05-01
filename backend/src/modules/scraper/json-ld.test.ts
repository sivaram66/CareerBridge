import * as cheerio from 'cheerio';
import { extractJobDataWithAI } from '../ai/geminiParser'; // 🧠 Import our AI Brain

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
    let jobData = null;

    // 1. Hunt for the hidden JSON-LD structured data (Path A)
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

    // 2. Path A: Clean JSON data found!
    if (jobData) {
      console.log('✅ SUCCESS (Path A)! Found hidden JobPosting data.');
      // Normalize it to match our AI output format so the database gets consistent data
      return {
        title: jobData.title,
        company: jobData.hiringOrganization?.name || 'Unknown',
        remote: jobData.jobLocationType === 'TELECOMMUTE',
        techStack: [], // JSON-LD rarely has tech stack, we'd have to parse description
        salary: jobData.baseSalary ? `${jobData.baseSalary.value.minValue} - ${jobData.baseSalary.value.maxValue}` : 'Not Disclosed'
      };
    } 
    
    // 3. Path B: THE FALLBACK (Send raw text to Gemini)
    console.log('⚠️ No JSON-LD found. Activating Gemini AI Fallback...');
    
    const rawBodyText = $('body').text().replace(/\s+/g, ' ').trim();
    
    // 🧠 Hand the text to the AI and wait for the structured JSON
    const aiParsedData = await extractJobDataWithAI(rawBodyText);

    if (aiParsedData) {
      console.log('🤖 AI Extracted Data:');
      console.log(aiParsedData);
      return aiParsedData;
    } else {
      console.log('❌ AI failed to parse the document.');
      return null;
    }

  } catch (error) {
    console.error(`Failed to scrape ${targetUrl}:`, error);
    return null;
  }
};

// --- RUN THE TEST ON AN APPLE REACT PAGE ---
const testUrl = 'https://jobs.apple.com/en-us/details/200606145-3810/software-engineering-internships'; 
scrapeCustomJob(testUrl);