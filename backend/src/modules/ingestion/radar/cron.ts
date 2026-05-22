import cron from 'node-cron';
import { db } from '../../../config/db.js';
import { targetCompanies } from '../../../shared/schema.js';
import { eq } from 'drizzle-orm';
import { ingestGreenhouseJobs } from './greenhouse.js';
import { sweepLever } from './lever.js';
import { sweepGoogleJobs } from './googleJobs.js';
import { sweepInternships } from './internship.js';
import { cleanVault } from '../../../scripts/janitor.js';

export function startRadarCron() {

  // ─────────────────────────────────────────────────────────────
  // CRON 1: Daily ATS Sweep — 2:00 AM
  // Scans all active target companies via Greenhouse + Lever APIs
  // ─────────────────────────────────────────────────────────────
  cron.schedule('0 2 * * *', async () => {
    console.log('\n[CRON] ⏰ Waking up Direct ATS Radar at 2:00 AM...');
    console.log('\n[CRON] ⏰ Triggering Database Janitor...');
    await cleanVault();

    try {
      const targets = await db.select()
        .from(targetCompanies)
        .where(eq(targetCompanies.isActive, true));

      console.log(`[CRON] Found ${targets.length} active targets.`);

      if (targets.length === 0) {
        console.log('[CRON] No targets found. Going back to sleep.');
        return;
      }

      for (const target of targets) {
        await ingestGreenhouseJobs(target.boardToken, target.name);
        await sweepLever(target.name, target.boardToken);
        // 3s pause between companies to prevent Neon ETIMEDOUT crashes
        await new Promise(resolve => setTimeout(resolve, 3000));
      }

      console.log('\n[CRON] 🏁 Daily ATS Radar sweep complete. Vault updated.');

    } catch (error: any) {
      console.error('[CRON] 🚨 Fatal error during Daily ATS sweep:', error.message);
    }
  });


  // ─────────────────────────────────────────────────────────────
  // CRON 2: Daily Internship Sweep — 4:00 AM
  // Dedicated sweep for Indian internships and fresher roles
  // Uses 17 targeted SerpAPI queries
  // ─────────────────────────────────────────────────────────────
  cron.schedule('0 4 * * *', async () => {
    console.log('\n[CRON] 🎓 Waking up Internship Radar at 4:00 AM...');

    try {
      await sweepInternships();
      console.log('\n[CRON] 🏁 Daily Internship sweep complete.');
    } catch (error: any) {
      console.error('[CRON] 🚨 Fatal error during Internship sweep:', error.message);
    }
  });


  // ─────────────────────────────────────────────────────────────
  // CRON 3: Weekly Google Jobs Sweep — Sundays at 3:00 AM
  // Broad city-specific tech job searches for experienced roles
  // ─────────────────────────────────────────────────────────────
  cron.schedule('0 3 * * 0', async () => {
    console.log('\n[CRON] ⏰ Waking up Google Jobs Radar for WEEKLY sweep...');

    try {
      // Experienced / Senior roles
      await sweepGoogleJobs('Software Engineer Bangalore', 10);
      await sweepGoogleJobs('Full Stack Developer Pune', 10);
      await sweepGoogleJobs('Frontend Developer Hyderabad', 10);
      await sweepGoogleJobs('Backend Developer Mumbai', 10);
      await sweepGoogleJobs('Software Engineer Remote India', 10);
      await sweepGoogleJobs('DevOps Engineer India', 5);
      await sweepGoogleJobs('Data Engineer India', 5);
      await sweepGoogleJobs('Product Manager India Tech', 5);
      await sweepGoogleJobs('Mobile Developer Android iOS India', 5);
      await sweepGoogleJobs('AI ML Engineer India', 5);

      console.log('\n[CRON] 🏁 Weekly Google Radar sweep complete.');

    } catch (error: any) {
      console.error('[CRON] 🚨 Fatal error during Weekly Google sweep:', error.message);
    }
  });


  // ─────────────────────────────────────────────────────────────
  // CRON 4: Mid-week Fresher Sweep — Wednesdays at 3:00 AM
  // Extra sweep for fresher/entry-level roles mid-week
  // ─────────────────────────────────────────────────────────────
  cron.schedule('0 3 * * 3', async () => {
    console.log('\n[CRON] ⏰ Waking up Mid-Week Fresher Radar (Wednesday 3:00 AM)...');

    try {
      await sweepGoogleJobs('Entry Level Software Engineer India', 5);
      await sweepGoogleJobs('Junior Developer Bangalore Pune', 5);
      await sweepGoogleJobs('Fresher IT Jobs India', 5);
      await sweepGoogleJobs('Associate Software Engineer India', 5);
      await sweepGoogleJobs('Graduate Trainee Engineer India', 5);

      console.log('\n[CRON] 🏁 Mid-week Fresher sweep complete.');
    } catch (error: any) {
      console.error('[CRON] 🚨 Fatal error during Mid-Week Fresher sweep:', error.message);
    }
  });

  console.log('⏱️  Radar Cron Engine Initialized:');
  console.log('   -> 🏢 Daily ATS Sweep (Greenhouse + Lever): 2:00 AM');
  console.log('   -> 🎓 Daily Internship Sweep (SerpAPI): 4:00 AM');
  console.log('   -> 🌐 Weekly Google Sweep (Experienced roles): Sundays at 3:00 AM');
  console.log('   -> 🌱 Mid-week Fresher Sweep: Wednesdays at 3:00 AM');
}