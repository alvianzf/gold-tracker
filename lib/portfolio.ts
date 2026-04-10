import prisma from './prisma';
import { HoldingStatus } from '@prisma/client';

export interface PortfolioSummary {
  totalValue: number;
  totalCost: number;
  totalProfit: number;
  profitPercent: number;
}

export async function getLatestPrices() {
  // Get the most recent price for each type and weight combination
  const prices = await prisma.priceHistory.findMany({
    orderBy: { date: 'desc' },
    distinct: ['type', 'weight'],
  });
  return prices;
}

export async function calculateHoldingPL(
  holding: { type: string; weight: number; buyPrice: number; [key: string]: unknown },
  latestPrices: { type: string; weight: number; priceBuy: number; priceSell?: number | null; [key: string]: unknown }[]
) {
  const priceData = latestPrices.find(
    (p) => p.type === holding.type && p.weight === holding.weight
  );

  if (!priceData) return { ...holding, currentValue: 0, pl: 0, plPercent: 0 };

  const currentValue = (priceData.priceSell && priceData.priceSell > 0) ? priceData.priceSell : priceData.priceBuy; // We use current buyback price as true liquidation "fair value"
  const pl = currentValue - holding.buyPrice;
  const plPercent = holding.buyPrice > 0 ? (pl / holding.buyPrice) * 100 : 0;

  return {
    ...holding,
    currentValue,
    pl,
    plPercent,
  };
}

export async function getPortfolioSummary(userId: string): Promise<PortfolioSummary> {
  const holdings = await prisma.holding.findMany({
    where: { status: HoldingStatus.ACTIVE, userId },
  });

  const latestPrices = await getLatestPrices();
  
  let totalValue = 0;
  let totalCost = 0;

  for (const holding of holdings) {
    const enriched = await calculateHoldingPL(holding, latestPrices);
    totalValue += enriched.currentValue;
    totalCost += enriched.buyPrice;
  }

  const totalProfit = totalValue - totalCost;
  const profitPercent = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;

  return {
    totalValue,
    totalCost,
    totalProfit,
    profitPercent,
  };
}

export async function saveDailySummary() {
  const users = await prisma.user.findMany();
  const summaries = [];
  
  for (const user of users) {
    const summary = await getPortfolioSummary(user.id);
    
    // Only snapshot if they actively hold items
    const holdingsCount = await prisma.holding.count({ 
      where: { status: HoldingStatus.ACTIVE, userId: user.id }
    });
    
    if (holdingsCount > 0) {
      const record = await prisma.dailyPortfolioSummary.create({
        data: {
          userId: user.id,
          totalValue: summary.totalValue,
          totalCost: summary.totalCost,
          totalProfit: summary.totalProfit,
          profitPercent: summary.profitPercent,
          date: new Date(),
        },
      });
      summaries.push(record);
    }
  }
  
  return summaries;
}
