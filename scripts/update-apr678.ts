import 'dotenv/config';
import prisma from '../lib/prisma';

// ============================================================
// REAL PRICES: April 6, 7, 8 — sourced from user-provided data
// ============================================================

interface PriceEntry {
  type: 'ANTAM' | 'UBS' | 'GALERI24';
  weight: number;
  priceBuy: number;
  priceSell: number;
}

// ---------- APR 6 (has buyback prices) ----------
const apr6: PriceEntry[] = [
  // ANTAM
  { type: 'ANTAM', weight: 0.5, priceBuy: 1539000, priceSell: 1345000 },
  { type: 'ANTAM', weight: 1,   priceBuy: 2972000, priceSell: 2690000 },
  { type: 'ANTAM', weight: 2,   priceBuy: 5881000, priceSell: 5380000 },
  { type: 'ANTAM', weight: 3,   priceBuy: 8795000, priceSell: 8070000 },
  { type: 'ANTAM', weight: 5,   priceBuy: 14623000, priceSell: 13450000 },
  { type: 'ANTAM', weight: 10,  priceBuy: 29188000, priceSell: 26901000 },
  { type: 'ANTAM', weight: 25,  priceBuy: 72839000, priceSell: 66923000 },
  { type: 'ANTAM', weight: 50,  priceBuy: 145595000, priceSell: 133846000 },
  { type: 'ANTAM', weight: 100, priceBuy: 291109000, priceSell: 267692000 },
  // GALERI24
  { type: 'GALERI24', weight: 0.5, priceBuy: 1505000, priceSell: 1346000 },
  { type: 'GALERI24', weight: 1,   priceBuy: 2870000, priceSell: 2692000 },
  { type: 'GALERI24', weight: 2,   priceBuy: 5672000, priceSell: 5385000 },
  { type: 'GALERI24', weight: 5,   priceBuy: 14076000, priceSell: 13463000 },
  { type: 'GALERI24', weight: 10,  priceBuy: 28076000, priceSell: 26927000 },
  { type: 'GALERI24', weight: 25,  priceBuy: 69812000, priceSell: 66989000 },
  { type: 'GALERI24', weight: 50,  priceBuy: 139514000, priceSell: 133979000 },
  { type: 'GALERI24', weight: 100, priceBuy: 278891000, priceSell: 267959000 },
  { type: 'GALERI24', weight: 250, priceBuy: 695513000, priceSell: 666599000 },
  { type: 'GALERI24', weight: 500, priceBuy: 1391025000, priceSell: 1333198000 },
  { type: 'GALERI24', weight: 1000, priceBuy: 2782049000, priceSell: 2666397000 },
  // UBS
  { type: 'UBS', weight: 0.5, priceBuy: 1560000, priceSell: 1345000 },
  { type: 'UBS', weight: 1,   priceBuy: 2885000, priceSell: 2690000 },
  { type: 'UBS', weight: 2,   priceBuy: 5724000, priceSell: 5380000 },
  { type: 'UBS', weight: 5,   priceBuy: 14144000, priceSell: 13450000 },
  { type: 'UBS', weight: 10,  priceBuy: 28139000, priceSell: 26901000 },
  { type: 'UBS', weight: 25,  priceBuy: 70209000, priceSell: 66923000 },
  { type: 'UBS', weight: 50,  priceBuy: 140130000, priceSell: 133846000 },
  { type: 'UBS', weight: 100, priceBuy: 280150000, priceSell: 267692000 },
  { type: 'UBS', weight: 250, priceBuy: 700168000, priceSell: 665933000 },
  { type: 'UBS', weight: 500, priceBuy: 1398692000, priceSell: 1331866000 },
];

// ---------- APR 7 (buy prices only — no buyback provided) ----------
const apr7: PriceEntry[] = [
  // ANTAM
  { type: 'ANTAM', weight: 0.5, priceBuy: 1534000, priceSell: 0 },
  { type: 'ANTAM', weight: 1,   priceBuy: 2964000, priceSell: 0 },
  { type: 'ANTAM', weight: 2,   priceBuy: 5866000, priceSell: 0 },
  { type: 'ANTAM', weight: 3,   priceBuy: 8773000, priceSell: 0 },
  { type: 'ANTAM', weight: 5,   priceBuy: 14586000, priceSell: 0 },
  { type: 'ANTAM', weight: 10,  priceBuy: 29115000, priceSell: 0 },
  { type: 'ANTAM', weight: 25,  priceBuy: 72657000, priceSell: 0 },
  { type: 'ANTAM', weight: 50,  priceBuy: 145231000, priceSell: 0 },
  { type: 'ANTAM', weight: 100, priceBuy: 290381000, priceSell: 0 },
  // UBS
  { type: 'UBS', weight: 0.5, priceBuy: 1553000, priceSell: 0 },
  { type: 'UBS', weight: 1,   priceBuy: 2874000, priceSell: 0 },
  { type: 'UBS', weight: 2,   priceBuy: 5703000, priceSell: 0 },
  { type: 'UBS', weight: 5,   priceBuy: 14090000, priceSell: 0 },
  { type: 'UBS', weight: 10,  priceBuy: 28033000, priceSell: 0 },
  { type: 'UBS', weight: 25,  priceBuy: 69944000, priceSell: 0 },
  { type: 'UBS', weight: 50,  priceBuy: 139600000, priceSell: 0 },
  { type: 'UBS', weight: 100, priceBuy: 279091000, priceSell: 0 },
  { type: 'UBS', weight: 250, priceBuy: 697521000, priceSell: 0 },
  { type: 'UBS', weight: 500, priceBuy: 1393404000, priceSell: 0 },
  // GALERI24
  { type: 'GALERI24', weight: 0.5, priceBuy: 1500000, priceSell: 0 },
  { type: 'GALERI24', weight: 1,   priceBuy: 2860000, priceSell: 0 },
  { type: 'GALERI24', weight: 2,   priceBuy: 5650000, priceSell: 0 },
  { type: 'GALERI24', weight: 5,   priceBuy: 14022000, priceSell: 0 },
  { type: 'GALERI24', weight: 10,  priceBuy: 27970000, priceSell: 0 },
  { type: 'GALERI24', weight: 25,  priceBuy: 69549000, priceSell: 0 },
  { type: 'GALERI24', weight: 50,  priceBuy: 138986000, priceSell: 0 },
  { type: 'GALERI24', weight: 100, priceBuy: 277836000, priceSell: 0 },
  { type: 'GALERI24', weight: 250, priceBuy: 692883000, priceSell: 0 },
  { type: 'GALERI24', weight: 500, priceBuy: 1385766000, priceSell: 0 },
  { type: 'GALERI24', weight: 1000, priceBuy: 2771531000, priceSell: 0 },
];

// ---------- APR 8 (buy prices only — no buyback provided) ----------
const apr8: PriceEntry[] = [
  // ANTAM
  { type: 'ANTAM', weight: 0.5, priceBuy: 1500000, priceSell: 0 },
  { type: 'ANTAM', weight: 1,   priceBuy: 2900000, priceSell: 0 },
  { type: 'ANTAM', weight: 2,   priceBuy: 5740000, priceSell: 0 },
  { type: 'ANTAM', weight: 3,   priceBuy: 8585000, priceSell: 0 },
  { type: 'ANTAM', weight: 5,   priceBuy: 14275000, priceSell: 0 },
  { type: 'ANTAM', weight: 10,  priceBuy: 28495000, priceSell: 0 },
  { type: 'ANTAM', weight: 25,  priceBuy: 71112000, priceSell: 0 },
  { type: 'ANTAM', weight: 50,  priceBuy: 142145000, priceSell: 0 },
  { type: 'ANTAM', weight: 100, priceBuy: 284212000, priceSell: 0 },
  { type: 'ANTAM', weight: 250, priceBuy: 710265000, priceSell: 0 },
  { type: 'ANTAM', weight: 500, priceBuy: 1420320000, priceSell: 0 },
  { type: 'ANTAM', weight: 1000, priceBuy: 2840600000, priceSell: 0 },
  // GALERI24
  { type: 'GALERI24', weight: 0.5, priceBuy: 1526000, priceSell: 0 },
  { type: 'GALERI24', weight: 1,   priceBuy: 2908000, priceSell: 0 },
  { type: 'GALERI24', weight: 2,   priceBuy: 5747000, priceSell: 0 },
  { type: 'GALERI24', weight: 5,   priceBuy: 14261000, priceSell: 0 },
  { type: 'GALERI24', weight: 10,  priceBuy: 28447000, priceSell: 0 },
  { type: 'GALERI24', weight: 25,  priceBuy: 70736000, priceSell: 0 },
  { type: 'GALERI24', weight: 50,  priceBuy: 141360000, priceSell: 0 },
  { type: 'GALERI24', weight: 100, priceBuy: 282581000, priceSell: 0 },
  { type: 'GALERI24', weight: 250, priceBuy: 704717000, priceSell: 0 },
  { type: 'GALERI24', weight: 500, priceBuy: 1409432000, priceSell: 0 },
  { type: 'GALERI24', weight: 1000, priceBuy: 2818862000, priceSell: 0 },
  // UBS
  { type: 'UBS', weight: 0.5, priceBuy: 1556000, priceSell: 0 },
  { type: 'UBS', weight: 1,   priceBuy: 2879000, priceSell: 0 },
  { type: 'UBS', weight: 2,   priceBuy: 5713000, priceSell: 0 },
  { type: 'UBS', weight: 5,   priceBuy: 14117000, priceSell: 0 },
  { type: 'UBS', weight: 10,  priceBuy: 28085000, priceSell: 0 },
  { type: 'UBS', weight: 25,  priceBuy: 70077000, priceSell: 0 },
  { type: 'UBS', weight: 50,  priceBuy: 139866000, priceSell: 0 },
  { type: 'UBS', weight: 100, priceBuy: 279620000, priceSell: 0 },
  { type: 'UBS', weight: 250, priceBuy: 698844000, priceSell: 0 },
  { type: 'UBS', weight: 500, priceBuy: 1396048000, priceSell: 0 },
];

const dayMap: { dateStr: string; data: PriceEntry[] }[] = [
  { dateStr: '2026-04-06', data: apr6 },
  { dateStr: '2026-04-07', data: apr7 },
  { dateStr: '2026-04-08', data: apr8 },
];

async function updateDays() {
  for (const day of dayMap) {
    const startOfDay = new Date(day.dateStr + 'T00:00:00Z');
    const endOfDay = new Date(day.dateStr + 'T23:59:59Z');
    const dateValue = new Date(day.dateStr + 'T12:00:00Z');

    // Delete existing data for this day
    const deleted = await prisma.priceHistory.deleteMany({
      where: { date: { gte: startOfDay, lte: endOfDay } }
    });
    console.log(`[${day.dateStr}] Deleted ${deleted.count} old records`);

    // Insert real data
    for (const p of day.data) {
      await prisma.priceHistory.create({
        data: {
          type: p.type,
          weight: p.weight,
          priceBuy: p.priceBuy,
          priceSell: p.priceSell,
          date: dateValue,
        }
      });
    }
    console.log(`[${day.dateStr}] Inserted ${day.data.length} records`);

    // Recalculate DailyPortfolioSummary
    await prisma.dailyPortfolioSummary.deleteMany({
      where: { date: { gte: startOfDay, lte: endOfDay } }
    });

    const holdings = await prisma.holding.findMany({ where: { status: 'ACTIVE' } });
    const users = await prisma.user.findMany();
    const allPrices = await prisma.priceHistory.findMany({
      where: { date: { gte: startOfDay, lte: endOfDay } }
    });

    for (const user of users) {
      const activeHoldings = holdings.filter(h => h.userId === user.id && new Date(h.buyDate) <= dateValue);
      if (activeHoldings.length === 0) continue;

      let totalValue = 0;
      let totalCost = 0;
      for (const holding of activeHoldings) {
        totalCost += holding.buyPrice;
        const hPrice = allPrices.find(p => p.type === holding.type && p.weight === holding.weight);
        if (hPrice) {
          totalValue += (hPrice.priceSell && hPrice.priceSell > 0) ? hPrice.priceSell : hPrice.priceBuy;
        } else {
          totalValue += holding.buyPrice;
        }
      }

      const totalProfit = totalValue - totalCost;
      const profitPercent = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;

      await prisma.dailyPortfolioSummary.create({
        data: { userId: user.id, date: dateValue, totalValue, totalCost, totalProfit, profitPercent }
      });
    }
    console.log(`[${day.dateStr}] Portfolio summaries recalculated`);
  }

  console.log('\nAll done!');
}

updateDays().catch(console.error).finally(() => prisma.$disconnect());
