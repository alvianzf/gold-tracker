import cron from 'node-cron';
import { scrapeGoldPrices } from './scraper';
import prisma from './prisma';
import { saveDailySummary } from './portfolio';

let isScheduled = false;

/**
 * Daily schedule at 09:00 Asia/Jakarta (02:00 UTC)
 * Scrapes fresh gold prices and saves portfolio snapshots.
 */
export function initCron() {
  if (isScheduled) return; // prevent duplicate scheduling on HMR
  isScheduled = true;

  console.log('[CRON] Initialized — daily scrape scheduled at 09:00 WIB (02:00 UTC)');

  cron.schedule('0 2 * * *', async () => {
    console.log('[CRON] Running daily gold price scrape...');
    try {
      const scrapedData = await scrapeGoldPrices();
      const now = new Date();

      await prisma.$transaction(
        scrapedData.map((data) =>
          prisma.priceHistory.create({
            data: { ...data, date: now },
          })
        )
      );

      const summary = await saveDailySummary();
      console.log(`[CRON] Scrape complete: ${scrapedData.length} prices, ${summary.length} portfolio snapshots`);
    } catch (error) {
      console.error('[CRON] Daily scrape failed:', error);
    }
  });
}
