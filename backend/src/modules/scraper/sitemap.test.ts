import * as cheerio from 'cheerio';

export const findJobsInSitemap = async (sitemapUrl: string) => {
  console.log(`🗺️ Scanning Sitemap: ${sitemapUrl}`);
  
  try {
    // 1. Download the raw XML sitemap
    const response = await fetch(sitemapUrl);
    const xml = await response.text();

    // 2. Load the XML into Cheerio
    // We strictly enable xmlMode so it reads the tags correctly
    const $ = cheerio.load(xml, { xmlMode: true });
    const jobUrls: string[] = [];

    // 3. Scan every single <loc> (location) tag in the file
    $('loc').each((_, element) => {
      const url = $(element).text();
      
      // 4. The Filter: Apple job links contain '/details/'
      if (url.includes('/details/')) {
        jobUrls.push(url);
      }
    });

    // 5. Report the findings
    console.log(`✅ SUCCESS! Found ${jobUrls.length} total job links!`);
    console.log('Here are the first 3 to prove it:');
    console.log(jobUrls.slice(0, 10));

    return jobUrls;

  } catch (error) {
    console.error('❌ Failed to parse sitemap:', error);
    return [];
  }
};

// --- RUN THE TEST ON APPLE ---
findJobsInSitemap('https://jobs.apple.com/sitemap/sitemap-jobs-en-us.xml');