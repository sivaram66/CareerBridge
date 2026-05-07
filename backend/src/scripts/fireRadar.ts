// /src/scripts/fireRadar.ts

import { db } from '../config/db.js';
import { targetCompanies } from '../shared/schema.js';
import { eq } from 'drizzle-orm';
import { sweepGoogleJobs } from '../modules/ingestion/radar/googleJobs.js';

async function fireEngineNow() {
  console.log('\n[MANUAL OVERRIDE] 🚀 Firing Radar engine immediately...');

  try {
    console.log('\n[RADAR] 🌐 Launching the MASSIVE Tech & AI Sweep...');

    // Note: We increased the page limit to 10 pages (100 jobs per query)
    // We removed "startup" and "fresher" from the query because our Bouncer logic 
    // inside googleJobs.ts already automatically tags "Fresher OK" by reading the description!

    // ==========================================
    // 🏢 1. THE BANGALORE SWEEP (Tech Capital)
    // ==========================================
    console.log('\n[RADAR] 📍 Sweeping Bangalore...');
    await sweepGoogleJobs('Software Engineer Bangalore', 10);
    await sweepGoogleJobs('Full Stack Developer Bangalore', 10);
    await sweepGoogleJobs('Frontend Developer Bangalore', 10);
    await sweepGoogleJobs('Backend Developer Node.js Bangalore', 10);
    await sweepGoogleJobs('Data Scientist Bangalore', 10);

    // ==========================================
    // 🏢 2. PUNE & HYDERABAD SWEEP (Enterprise Hubs)
    // ==========================================
    console.log('\n[RADAR] 📍 Sweeping Pune & Hyderabad...');
    await sweepGoogleJobs('Software Engineer Pune', 10);
    await sweepGoogleJobs('React Developer Pune', 10);
    await sweepGoogleJobs('Software Developer Hyderabad', 10);
    await sweepGoogleJobs('Java Developer Hyderabad', 10);

    // ==========================================
    // 🏢 3. MUMBAI & NCR (Delhi/Noida/Gurgaon)
    // ==========================================
    console.log('\n[RADAR] 📍 Sweeping Mumbai & NCR...');
    await sweepGoogleJobs('Software Engineer Mumbai', 10);
    await sweepGoogleJobs('Python Developer Noida', 10);
    await sweepGoogleJobs('Web Developer Gurgaon', 10);

    // ==========================================
    // 🌐 4. THE BROAD REMOTE SWEEP
    // ==========================================
    console.log('\n[RADAR] 🌍 Sweeping Remote India...');
    await sweepGoogleJobs('Software Engineer Remote India', 10);
    await sweepGoogleJobs('MERN Stack Remote India', 10);
    await sweepGoogleJobs('AI Engineer Remote India', 10);
    await sweepGoogleJobs('Product Designer Remote India', 10);


    console.log('\n[RADAR] 🏁 Massive Sweep Complete. Check your database!');
    process.exit(0);

  } catch (error: any) {
    console.error('[RADAR] ❌ Fatal error during manual sweep:', error.message);
    process.exit(1);
  }
}

// Automatically execute the function when this file is run
fireEngineNow();