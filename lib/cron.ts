import cron from 'node-cron';
import { scrapeGoldPrices } from './scraper';
import prisma from './prisma';
import { saveDailySummary } from './portfolio';
import { runDailyGoldAnalysis } from './gold-ai';

let isScheduled = false;

/**
 * Daily schedule at 08:30 Asia/Jakarta (01:30 UTC) for scrapers
 * and 09:10 Asia/Jakarta (02:10 UTC) for AI Gold Analysis.
 * If data already exists for the day, it is deleted and replaced.
 */
export function initCron() {
  if (isScheduled) return; // prevent duplicate scheduling on HMR
  isScheduled = true;

  console.log('[CRON] Initialized — daily scrape scheduled at 08:30 WIB (01:30 UTC), AI Analysis scheduled at 09:10 WIB (02:10 UTC)');

  // 1. Daily Gold Prices Scraper & Snapshot (08:30 WIB / 01:30 UTC)
  cron.schedule('30 1 * * *', async () => {
    console.log('[CRON] Running daily gold price scrape...');
    try {
      const scrapedData = await scrapeGoldPrices();
      const now = new Date();
      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date(now);
      todayEnd.setHours(23, 59, 59, 999);

      if (scrapedData.length > 0) {
        await prisma.$transaction(async (tx) => {
          // Delete existing prices for today
          await tx.priceHistory.deleteMany({
            where: {
              date: {
                gte: todayStart,
                lte: todayEnd,
              },
            },
          });

          // Insert fresh prices
          await Promise.all(
            scrapedData.map((data) =>
              tx.priceHistory.create({
                data: { ...data, date: now },
              })
            )
          );

          // Delete existing summaries for today
          await tx.dailyPortfolioSummary.deleteMany({
            where: {
              date: {
                gte: todayStart,
                lte: todayEnd,
              },
            },
          });
        });

        // Recalculate and save daily summary
        const summary = await saveDailySummary();
        console.log(`[CRON] Scrape complete: ${scrapedData.length} prices, ${summary.length} portfolio snapshots`);
      } else {
        console.log('[CRON] No data scraped, skipping update.');
      }
    } catch (error) {
      console.error('[CRON] Daily scrape failed:', error);
    }
  });

  // 2. Daily AI Gold Price Analysis (09:10 WIB / 02:10 UTC)
  cron.schedule('10 2 * * *', async () => {
    console.log('[CRON] Running daily AI gold vendor price analysis...');
    try {
      await runDailyGoldAnalysis();
      console.log('[CRON] Daily AI gold price analysis complete.');
    } catch (error) {
      console.error('[CRON] Daily AI gold analysis failed:', error);
    }
  });
}

