import * as cheerio from 'cheerio';

export const findJobsInSitemap = async (sitemapUrl: string) => {
  console.log(`🗺️ Scanning Sitemap: ${sitemapUrl}`);
  
  try {
    const response = await fetch(sitemapUrl);
    const xml = await response.text();

    const $ = cheerio.load(xml, { xmlMode: true });
    const jobUrls: string[] = [];

    $('loc').each((_, element) => {
      const url = $(element).text();
      // Apple job links contain '/details/' — this filters out non-job pages
      if (url.includes('/details/')) {
        jobUrls.push(url);
      }
    });

    console.log(`✅ SUCCESS! Found ${jobUrls.length} total job links!`);
    console.log('Here are the first 3 to prove it:');
    console.log(jobUrls.slice(0, 10));

    return jobUrls;

  } catch (error) {
    console.error('❌ Failed to parse sitemap:', error);
    return [];
  }
};

findJobsInSitemap('https://jobs.apple.com/sitemap/sitemap-jobs-en-us.xml');