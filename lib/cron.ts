import cron from 'node-cron';
import axios from 'axios';

/**
 * Daily schedule at 09:00 Asia/Jakarta
 * Asia/Jakarta is UTC+7, so 09:00 WIB is 02:00 UTC
 */
export function initCron() {
  console.log('Initializing gold price scraper cron [09:00 Asia/Jakarta]');

  // '0 2 * * *' runs at 02:00 UTC
  cron.schedule('0 2 * * *', async () => {
    console.log('Running daily gold price scrape...');
    try {
      // We call our own API endpoint to trigger the scrape
      // In production, you'd use the full URL or a dedicated internal function
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      await axios.post(`${appUrl}/api/scrape`);
      console.log('Daily scrape completed successfully');
    } catch (error) {
      console.error('Daily scrape failed:', error);
    }
  });
}
