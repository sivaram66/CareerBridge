import { pool } from '../../config/db.js';
export const saveJobToDatabase = async (jobData: any, originalUrl: string) => {
  if (!jobData) return false;

  const query = `
    INSERT INTO jobs (title, company_name, is_remote_india, salary_range, apply_url, description)
    VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (apply_url) DO NOTHING
    RETURNING id;
  `;

  const values = [
    jobData.title,
    jobData.company || 'Unknown',
    jobData.remote,
    jobData.salary,
    originalUrl,
    jobData.techStack && jobData.techStack.length > 0 
      ? `Tech Stack: ${jobData.techStack.join(', ')}` 
      : 'No specific tech stack extracted.'
  ];

  try {
    const result = await pool.query(query, values);
    
    if (result.rows.length > 0) {
      console.log(`💾 SAVED TO DB: ${jobData.title} at ${jobData.company}`);
      return true;
    } else {
      console.log(`⏭️ SKIPPED: ${jobData.title} already exists in database.`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Database Error saving ${jobData.title}:`, error);
    return false;
  }
};