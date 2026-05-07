// /src/modules/ingestion/radar/cron.ts

import cron from 'node-cron';
import { db } from '../../../config/db.js';
import { targetCompanies } from '../../../shared/schema.js';
import { eq } from 'drizzle-orm';
import { ingestGreenhouseJobs } from './greenhouse.js';
import { sweepLever } from './lever.js';
import { sweepGoogleJobs } from './googleJobs.js'; 
import { cleanVault } from '../../../scripts/janitor.js';

export function startRadarCron() {
  // ========================================================
  // 1. THE DAILY ATS SWEEP (Every night at 2:00 AM)
  // ========================================================
  // '0 2 * * *' means: Minute 0, Hour 2 (2:00 AM), Every single day.
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
        // 1. Try Greenhouse
        await ingestGreenhouseJobs(target.boardToken, target.name);
        
        // 2. Try Lever (Updated to match our new signature!)
        await sweepLever(target.name, target.boardToken);
        
        // 3. The Neon Safety Valve (3 seconds to prevent ETIMEDOUT crashes)
        await new Promise(resolve => setTimeout(resolve, 3000));
      }

      console.log('\n[CRON] 🏁 Daily ATS Radar sweep complete. Vault updated.');

    } catch (error: any) {
      console.error('[CRON] 🚨 Fatal error during Daily ATS sweep:', error.message);
    }
  });


  // ========================================================
  // 2. THE WEEKLY GOOGLE SWEEP (Every Sunday at 3:00 AM)
  // ========================================================
  // '0 3 * * 0' means: Minute 0, Hour 3 (3:00 AM), Day of Week 0 (Sunday).
  cron.schedule('0 3 * * 0', async () => {
    console.log('\n[CRON] ⏰ Waking up Google Jobs Radar for WEEKLY sweep...');

    try {
      // Launching our broad, city-specific tech sweeps
      await sweepGoogleJobs('Software Engineer Bangalore', 10);
      await sweepGoogleJobs('Full Stack Developer Pune', 10);
      await sweepGoogleJobs('Frontend Developer Hyderabad', 10);
      await sweepGoogleJobs('Software Engineer Remote India', 10);
      
      console.log('\n[CRON] 🏁 Weekly Google Radar sweep complete.');

    } catch (error: any) {
      console.error('[CRON] 🚨 Fatal error during Weekly Google sweep:', error.message);
    }
  });


  // Status log so you know it booted up properly
  console.log('⏱️ Radar Cron Engine Initialized:');
  console.log('   -> 🏢 Daily ATS Sweep: 2:00 AM');
  console.log('   -> 🌐 Weekly Google Sweep: Sundays at 3:00 AM');
}