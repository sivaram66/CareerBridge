import { sweepGoogleJobs } from '../ingestion/radar/googleJobs.js';

/**
 * Internship-focused aggregator sweep.
 * Replaces the old placeholder external API URL that was never implemented.
 * Runs targeted Google Jobs queries specifically for internships and fresher roles in India.
 */
export const fetchInternshipsFromGoogle = async () => {
  console.log('\n🌊 [AGGREGATOR] Launching internship-focused Google sweep...');

  const internshipQueries = [
    'Software Engineer Internship India 2025',
    'Frontend Developer Intern Bangalore',
    'Backend Developer Intern India',
    'Full Stack Intern Hyderabad Pune',
    'Data Science Intern India',
    'Machine Learning Intern India',
    'React Developer Intern India',
    'Node.js Intern India',
  ];

  for (const query of internshipQueries) {
    try {
      await sweepGoogleJobs(query, 3); // 3 pages per query
      // Small delay between queries to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (err: any) {
      console.error(`[AGGREGATOR] ❌ Failed query "${query}":`, err.message);
    }
  }

  console.log('\n✅ [AGGREGATOR] Internship sweep complete.');
};