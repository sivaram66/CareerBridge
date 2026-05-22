import cron from 'node-cron';
import { fetchInternshipsFromGoogle } from './aggregator.service.js';

export const startAggregatorCron = () => {
  console.log('⏰ [CRON] Aggregator scheduler initialized. Waiting for next cycle...');

  // Runs at minute 0 past every 6th hour
  cron.schedule('0 */6 * * *', async () => {
    console.log('\n=============================================');
    console.log('⏰ [CRON] Waking up the Aggregator Engine...');
    console.log('=============================================');

    try {
      await fetchInternshipsFromGoogle();
    } catch (error) {
      console.error('❌ [CRON] Aggregator cycle failed:', error);
    }
  });
};