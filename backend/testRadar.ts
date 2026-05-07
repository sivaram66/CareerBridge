import { ingestGreenhouseJobs } from './src/modules/ingestion/radar/greenhouse.js';

async function fireRadar() {
  await ingestGreenhouseJobs('discord', 'Discord');
  await ingestGreenhouseJobs('figma', 'Figma');
  
  console.log('🏁 Radar test complete. Check your Neon database!');
  process.exit(0);
}

fireRadar();