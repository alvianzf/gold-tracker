import { NextResponse } from 'next/server';
import { scrapeGoldPrices } from '@/lib/scraper';
import prisma from '@/lib/prisma';
import { saveDailySummary } from '@/lib/portfolio';

export async function POST() {
  try {
    const scrapedData = await scrapeGoldPrices();
    const now = new Date();

    // Store in PriceHistory
    await prisma.$transaction(
      scrapedData.map((data) =>
        prisma.priceHistory.create({
          data: {
            ...data,
            date: now,
          },
        })
      )
    );

    // After scraping, save daily portfolio summary snapshot
    const summary = await saveDailySummary();

    return NextResponse.json({
      message: 'Scraping and summary completed successfully',
      scrapedCount: scrapedData.length,
      summary,
    });
  } catch (error) {
    console.error('Scraping error:', error);
    return NextResponse.json({ error: 'Failed to scrape prices' }, { status: 500 });
  }
}
