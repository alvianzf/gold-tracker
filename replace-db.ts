import { PrismaClient, GoldType, HoldingStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import path from 'path';
import axios from 'axios';
import * as cheerio from 'cheerio';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const GOLD_TYPE_MAPPING: Record<string, GoldType> = {
  'HARGA ANTAM': GoldType.ANTAM,
  'HARGA UBS': GoldType.UBS,
  'HARGA GALERI 24': GoldType.GALERI24,
};

async function scrapeGoldPrices() {
  const { data } = await axios.get('https://galeri24.co.id/harga-emas', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
  });
  const $ = cheerio.load(data);
  const results: any[] = [];

  $('div.bg-primary-100.font-medium.text-center').each((_, element) => {
    const headerText = $(element).text().toUpperCase();
    let matchedType: GoldType | null = null;
    for (const [key, value] of Object.entries(GOLD_TYPE_MAPPING)) {
      if (headerText.trim() === key) {
        matchedType = value;
        break;
      }
    }

    if (matchedType) {
      const table = $(element).next();
      table.find('.grid.grid-cols-5').each((index, row) => {
        if (index === 0) return;
        const cols = $(row).find('div');
        if (cols.length >= 3) {
          const weightStr = $(cols[0]).text().trim().replace(',', '.').replace(/[^\d.]/g, '');
          const priceBuyStr = $(cols[1]).text().trim().replace(/[^\d]/g, '');
          const priceSellStr = $(cols[2]).text().trim().replace(/[^\d]/g, '');

          const weight = parseFloat(weightStr);
          const priceBuy = parseFloat(priceBuyStr);
          const priceSell = parseFloat(priceSellStr);

          if (!isNaN(weight) && !isNaN(priceBuy)) {
            results.push({
              type: matchedType,
              weight,
              priceBuy,
              priceSell: isNaN(priceSell) ? 0 : priceSell,
            });
          }
        }
      });
    }
  });
  return results;
}

async function getPortfolioSummary(userId: string, latestPrices: any[]) {
  const holdings = await prisma.holding.findMany({
    where: { status: HoldingStatus.ACTIVE, userId },
  });

  let totalValue = 0;
  let totalCost = 0;

  for (const holding of holdings) {
    const priceData = latestPrices.find(
      (p) => p.type === holding.type && p.weight === holding.weight
    );
    const currentValuePrice = priceData ? (priceData.priceSell && priceData.priceSell > 0 ? priceData.priceSell : priceData.priceBuy) : 0;
    totalValue += currentValuePrice;
    totalCost += holding.buyPrice;
  }

  const totalProfit = totalValue - totalCost;
  const profitPercent = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;

  return { totalValue, totalCost, totalProfit, profitPercent };
}

async function main() {
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);

  const scrapedPrices = await scrapeGoldPrices();
  if (scrapedPrices.length === 0) {
    throw new Error('No prices scraped. Aborting.');
  }

  await prisma.$transaction(async (tx) => {
    await tx.priceHistory.deleteMany({
      where: { date: { gte: todayStart, lte: todayEnd } },
    });
    
    await Promise.all(
      scrapedPrices.map((p) =>
        tx.priceHistory.create({
          data: { ...p, date: now },
        })
      )
    );

    await tx.dailyPortfolioSummary.deleteMany({
      where: { date: { gte: todayStart, lte: todayEnd } },
    });

    const users = await tx.user.findMany();
    for (const user of users) {
      const holdingsCount = await tx.holding.count({
        where: { status: HoldingStatus.ACTIVE, userId: user.id }
      });
      if (holdingsCount > 0) {
        const summary = await getPortfolioSummary(user.id, scrapedPrices);
        await tx.dailyPortfolioSummary.create({
          data: {
            userId: user.id,
            totalValue: summary.totalValue,
            totalCost: summary.totalCost,
            totalProfit: summary.totalProfit,
            profitPercent: summary.profitPercent,
            date: now,
          },
        });
      }
    }
  });

  console.log('Replacement completed successfully.');
}

main().catch(console.error).finally(() => { prisma.$disconnect(); pool.end(); });
