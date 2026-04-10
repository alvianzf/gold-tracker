import 'dotenv/config';
import prisma from '../lib/prisma';

// Real prices from Galeri 24 official document: Kamis, 09 April 2026 Periode I
const apr9Date = new Date('2026-04-09T12:00:00Z');

const galeri24Prices = [
  { weight: 0.5, priceBuy: 1526000, priceSell: 1364000 },
  { weight: 1,   priceBuy: 2908000, priceSell: 2728000 },
  { weight: 2,   priceBuy: 5747000, priceSell: 5456000 },
  { weight: 5,   priceBuy: 14261000, priceSell: 13642000 },
  { weight: 10,  priceBuy: 28447000, priceSell: 27284000 },
  { weight: 25,  priceBuy: 70736000, priceSell: 67878000 },
  { weight: 50,  priceBuy: 141360000, priceSell: 135756000 },
  { weight: 100, priceBuy: 282581000, priceSell: 271512000 },
  { weight: 250, priceBuy: 704717000, priceSell: 675436000 },
  { weight: 500, priceBuy: 1409432000, priceSell: 1350873000 },
  { weight: 1000, priceBuy: 2818862000, priceSell: 2701747000 },
];

const antamPrices = [
  { weight: 0.5, priceBuy: 1560000, priceSell: 1362000 },
  { weight: 1,   priceBuy: 3016000, priceSell: 2725000 },
  { weight: 2,   priceBuy: 5970000, priceSell: 5451000 },
  { weight: 3,   priceBuy: 8929000, priceSell: 8177000 },
  { weight: 5,   priceBuy: 14846000, priceSell: 13628000 },
  { weight: 10,  priceBuy: 29635000, priceSell: 27257000 },
  { weight: 25,  priceBuy: 73957000, priceSell: 67810000 },
  { weight: 50,  priceBuy: 147831000, priceSell: 135620000 },
  { weight: 100, priceBuy: 295581000, priceSell: 271240000 },
  { weight: 250, priceBuy: 738676000, priceSell: 674762000 },
  { weight: 500, priceBuy: 1477133000, priceSell: 1349524000 },
  { weight: 1000, priceBuy: 2954224000, priceSell: 2699048000 },
];

async function updateApr9() {
  // Delete existing Apr 9 data for ANTAM and GALERI24
  const startOfDay = new Date('2026-04-09T00:00:00Z');
  const endOfDay = new Date('2026-04-09T23:59:59Z');

  const deleted = await prisma.priceHistory.deleteMany({
    where: {
      date: { gte: startOfDay, lte: endOfDay },
      type: { in: ['ANTAM', 'GALERI24'] },
    }
  });
  console.log(`Deleted ${deleted.count} old Apr 9 records for ANTAM + GALERI24`);

  // Insert real GALERI24 prices
  for (const p of galeri24Prices) {
    await prisma.priceHistory.create({
      data: {
        type: 'GALERI24',
        weight: p.weight,
        priceBuy: p.priceBuy,
        priceSell: p.priceSell,
        date: apr9Date,
      }
    });
  }
  console.log(`Inserted ${galeri24Prices.length} GALERI24 Apr 9 records`);

  // Insert real ANTAM prices
  for (const p of antamPrices) {
    await prisma.priceHistory.create({
      data: {
        type: 'ANTAM',
        weight: p.weight,
        priceBuy: p.priceBuy,
        priceSell: p.priceSell,
        date: apr9Date,
      }
    });
  }
  console.log(`Inserted ${antamPrices.length} ANTAM Apr 9 records`);

  // Also need to recalculate DailyPortfolioSummary for Apr 9
  await prisma.dailyPortfolioSummary.deleteMany({
    where: { date: { gte: startOfDay, lte: endOfDay } }
  });

  const holdings = await prisma.holding.findMany({ where: { status: 'ACTIVE' } });
  const users = await prisma.user.findMany();
  const allPricesForDay = await prisma.priceHistory.findMany({
    where: { date: { gte: startOfDay, lte: endOfDay } }
  });

  for (const user of users) {
    const activeHoldings = holdings.filter(h => h.userId === user.id && new Date(h.buyDate) <= apr9Date);
    if (activeHoldings.length === 0) continue;

    let totalValue = 0;
    let totalCost = 0;
    for (const holding of activeHoldings) {
      totalCost += holding.buyPrice;
      const hPrice = allPricesForDay.find(p => p.type === holding.type && p.weight === holding.weight);
      if (hPrice) {
        totalValue += (hPrice.priceSell && hPrice.priceSell > 0) ? hPrice.priceSell : hPrice.priceBuy;
      } else {
        totalValue += holding.buyPrice;
      }
    }

    const totalProfit = totalValue - totalCost;
    const profitPercent = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;

    await prisma.dailyPortfolioSummary.create({
      data: {
        userId: user.id,
        date: apr9Date,
        totalValue,
        totalCost,
        totalProfit,
        profitPercent
      }
    });
  }

  console.log('Portfolio summaries recalculated for Apr 9. Done!');
}

updateApr9().catch(console.error).finally(() => prisma.$disconnect());
