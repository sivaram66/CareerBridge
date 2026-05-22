/**
 * seedJobs.ts — Seeds real jobs from public Greenhouse/Lever board APIs.
 * No API key required — these are public job boards.
 * Run on first startup when the jobs table is empty.
 */

import { db } from '../config/db.js';
import { jobs } from '../shared/schema.js';
import { count } from 'drizzle-orm';

// Top Indian + global companies with verified public Greenhouse/Lever boards
const GREENHOUSE_COMPANIES = [
  { company: 'Swiggy',        token: 'swiggy' },
  { company: 'Razorpay',      token: 'razorpay' },
  { company: 'Freshworks',    token: 'freshworks' },
  { company: 'BrowserStack',  token: 'browserstack' },
  { company: 'Postman',       token: 'postman' },
  { company: 'Meesho',        token: 'meesho' },
  { company: 'CleverTap',     token: 'clevertap' },
  { company: 'Chargebee',     token: 'chargebee' },
  { company: 'Whatfix',       token: 'whatfix' },
  { company: 'Cred',          token: 'cred' },
  { company: 'Hasura',        token: 'hasura' },
  { company: 'Wingify',       token: 'wingify' },
  { company: 'MoEngage',      token: 'moengage' },
  { company: 'LambdaTest',    token: 'lambdatest' },
  { company: 'Darwinbox',     token: 'darwinbox' },
];

const LEVER_COMPANIES = [
  { company: 'Razorpay', token: 'razorpay' },
  { company: 'CRED',     token: 'cred' },
  { company: 'Groww',    token: 'groww' },
];

const INDIA_KEYWORDS = ['india', 'bangalore', 'bengaluru', 'hyderabad', 'mumbai', 'pune', 'delhi', 'chennai', 'remote', 'gurgaon', 'noida'];

function isIndiaOrRemote(location?: string): boolean {
  if (!location) return true; // Include jobs with no location listed
  const loc = location.toLowerCase();
  return INDIA_KEYWORDS.some(kw => loc.includes(kw));
}

function isFresherFriendly(title: string, content: string): boolean {
  const text = (title + ' ' + content).toLowerCase();
  if (/\b(10\+|8\+|7\+|6\+|5\+)\s*years?\b/.test(text)) return false;
  if (/\b(senior|lead|principal|head of|director|vp |chief)\b/.test(text)) return false;
  return true;
}

async function fetchGreenhouse(company: string, token: string): Promise<any[]> {
  try {
    const url = `https://boards-api.greenhouse.io/v1/boards/${token}/jobs?content=true`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return [];
    const data = await res.json() as { jobs: any[] };
    return data.jobs || [];
  } catch {
    return [];
  }
}

async function fetchLever(company: string, token: string): Promise<any[]> {
  try {
    const url = `https://api.lever.co/v0/postings/${token}?mode=json`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return [];
    const data = await res.json() as any[];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function seedJobsIfEmpty(): Promise<void> {
  try {
    const result = await db.select({ value: count() }).from(jobs);
    const jobCount = result[0]?.value ?? 0;
    
    if (jobCount > 0) {
      console.log(`📦 DB already has ${jobCount} jobs. Skipping seed.`);
      return;
    }

    console.log('🌱 Jobs table is empty. Seeding from public job boards...');
    let totalInserted = 0;

    // Fetch Greenhouse jobs
    for (const { company, token } of GREENHOUSE_COMPANIES) {
      const rawJobs = await fetchGreenhouse(company, token);
      
      const filtered = rawJobs
        .filter(j => isIndiaOrRemote(j.location?.name))
        .slice(0, 10); // max 10 per company

      for (const j of filtered) {
        const externalId = `gh_${token}_${j.id}`;
        const title = j.title || 'Software Engineer';
        const location = j.location?.name || 'India';
        const description = j.content || '';

        try {
          await db.insert(jobs).values({
            externalJobId: externalId,
            companyName: company,
            title,
            location,
            applyUrl: j.absolute_url || `https://boards.greenhouse.io/${token}/jobs/${j.id}`,
            description: description.slice(0, 5000),
            isRemote: location.toLowerCase().includes('remote'),
            fresherOk: isFresherFriendly(title, description),
            isFeatured: false,
            country: 'India',
          }).onConflictDoNothing({ target: jobs.externalJobId });
          totalInserted++;
        } catch {
          // Skip duplicates silently
        }
      }
      console.log(`  ✅ ${company}: ${filtered.length} jobs`);
      await new Promise(r => setTimeout(r, 300)); // rate limit
    }

    // Fetch Lever jobs
    for (const { company, token } of LEVER_COMPANIES) {
      const rawJobs = await fetchLever(company, token);
      
      const filtered = rawJobs
        .filter(j => isIndiaOrRemote(j.categories?.location))
        .slice(0, 10);

      for (const j of filtered) {
        const externalId = `lv_${token}_${j.id}`;
        const title = j.text || 'Software Engineer';
        const location = j.categories?.location || 'India';
        const description = j.descriptionBody || j.description || '';

        try {
          await db.insert(jobs).values({
            externalJobId: externalId,
            companyName: company,
            title,
            location,
            applyUrl: j.hostedUrl || `https://jobs.lever.co/${token}/${j.id}`,
            description: description.slice(0, 5000),
            isRemote: location.toLowerCase().includes('remote'),
            fresherOk: isFresherFriendly(title, description),
            isFeatured: false,
            country: 'India',
          }).onConflictDoNothing({ target: jobs.externalJobId });
          totalInserted++;
        } catch {
          // Skip duplicates silently
        }
      }
      console.log(`  ✅ ${company} (Lever): ${filtered.length} jobs`);
      await new Promise(r => setTimeout(r, 300));
    }

    console.log(`\n🎉 Seeding complete! Inserted ~${totalInserted} jobs from Indian tech companies.`);
  } catch (err: any) {
    console.error('❌ Job seeding failed:', err.message);
  }
}
