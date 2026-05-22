import { sweepGoogleJobs } from './googleJobs.js';

/**
 * Dedicated internship sweep module.
 * Runs daily at 4:00 AM targeting Indian internships and fresher roles.
 * Uses aggressive fresherOk=true detection with internship-specific queries.
 */
export async function sweepInternships() {
  console.log('\n[INTERNSHIP RADAR] 🎓 Starting daily internship sweep for India...');

  const internshipQueries = [
    // Core internship searches
    'Software Engineer Intern India 2025',
    'Developer Intern Bangalore Hyderabad',
    'Full Stack Developer Intern India',
    'Frontend Intern React India',
    'Backend Intern Node.js India',

    // Fresher/Graduate searches
    'Fresher Software Engineer India',
    'Graduate Engineer Trainee India',
    'Campus Hire Software Developer India',
    'Junior Software Developer India Entry Level',
    'Associate Software Engineer India 0 years',

    // Domain-specific intern searches
    'Data Science Intern India',
    'Machine Learning Intern Bangalore',
    'UI UX Design Intern India',
    'DevOps Intern India',
    'Android iOS Developer Intern India',

    // Remote internships
    'Remote Software Intern India 2025',
    'Work From Home Developer Intern India',
  ];

  let totalSweeps = 0;

  for (const query of internshipQueries) {
    try {
      console.log(`[INTERNSHIP RADAR] 🔍 Sweeping: "${query}"`);
      await sweepGoogleJobs(query, 2); // 2 pages = 20 results per query
      totalSweeps++;
      // Rate limit pause
      await new Promise(resolve => setTimeout(resolve, 2500));
    } catch (err: any) {
      console.error(`[INTERNSHIP RADAR] ❌ Failed: "${query}":`, err.message);
    }
  }

  console.log(`\n[INTERNSHIP RADAR] 🏁 Sweep complete. Ran ${totalSweeps} queries.`);
}
