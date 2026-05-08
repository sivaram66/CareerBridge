import cron from 'node-cron';
import { db } from '../../../config/db.js';
import { targetCompanies } from '../../../shared/schema.js';
import { eq } from 'drizzle-orm';
import { ingestGreenhouseJobs } from './greenhouse.js';
import { sweepLever } from './lever.js';
import { sweepGoogleJobs } from './googleJobs.js'; 
import { cleanVault } from '../../../scripts/janitor.js';

export function startRadarCron() {
  // Daily ATS Sweep: 2:00 AM — scans Greenhouse + Lever for all active target companies
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


  // Weekly Google Sweep: Sundays at 3:00 AM — broad city-specific tech job searches
  cron.schedule('0 3 * * 0', async () => {
    console.log('\n[CRON] ⏰ Waking up Google Jobs Radar for WEEKLY sweep...');

    try {
      await sweepGoogleJobs('Software Engineer Bangalore', 10);
      await sweepGoogleJobs('Full Stack Developer Pune', 10);
      await sweepGoogleJobs('Frontend Developer Hyderabad', 10);
      await sweepGoogleJobs('Software Engineer Remote India', 10);
      
      console.log('\n[CRON] 🏁 Weekly Google Radar sweep complete.');

    } catch (error: any) {
      console.error('[CRON] 🚨 Fatal error during Weekly Google sweep:', error.message);
    }
  });

  console.log('⏱️ Radar Cron Engine Initialized:');
  console.log('   -> 🏢 Daily ATS Sweep: 2:00 AM');
  console.log('   -> 🌐 Weekly Google Sweep: Sundays at 3:00 AM');
}