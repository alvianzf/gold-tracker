/* eslint-disable @typescript-eslint/no-require-imports */
const { scrapeGoldPrices } = require('./lib/scraper');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function initialScrape() {
  console.log('Running initial bootstrap scrape...');
  try {
    const data = await scrapeGoldPrices();
    const now = new Date();
    
    for (const item of data) {
      await prisma.priceHistory.create({
        data: {
          ...item,
          date: now,
        }
      });
    }
    
    console.log(`Successfully imported ${data.length} price records.`);
  } catch (error) {
    console.error('Bootstrap failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

initialScrape();
