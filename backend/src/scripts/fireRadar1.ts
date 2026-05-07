// /src/scripts/fireRadar1.ts

import { db } from '../config/db.js';
import { targetCompanies } from '../shared/schema.js';
import { eq } from 'drizzle-orm';
import { ingestGreenhouseJobs } from '../modules/ingestion/radar/greenhouse.js';
import { sweepLever } from '../modules/ingestion/radar/lever.js';

async function firePremiumRadar() {
  console.log('\n[PREMIUM OVERRIDE] 🚀 Firing Direct ATS Radar Engine...');

  try {
    // 1. Fetch all specific direct ATS targets from your database
    const targets = await db.select()
      .from(targetCompanies)
      .where(eq(targetCompanies.isActive, true));

    console.log(`\n[RADAR] Found ${targets.length} active ATS targets in the Command Center.`);

    if (targets.length === 0) {
      console.log('[RADAR] No targets found. Did you run seedTargets.ts?');
      process.exit(0);
    }

    // 2. Loop through the Hitlist
    console.log('\n[RADAR] 🌐 Initiating Direct Server-to-Server Extraction...\n');
    
    for (const target of targets) {
      // We will try BOTH endpoints for every company. 
      // If they don't use Greenhouse, it fails silently and tries Lever. 
      // This is the ultimate brute-force discovery method!
      
      await ingestGreenhouseJobs(target.boardToken, target.name);
      await sweepLever(target.name, target.boardToken);
      
      // Brief pause so we don't get banned for hitting their APIs too fast
      await new Promise(resolve => setTimeout(resolve, 3000)); 
    }

    console.log('\n[RADAR] 🏁 Premium ATS manual sweep complete. Vault updated with elite jobs.');
    process.exit(0);

  } catch (error: any) {
    console.error('[RADAR] ❌ Fatal error during manual sweep:', error.message);
    process.exit(1);
  }
}

// Fire the engine!
firePremiumRadar();