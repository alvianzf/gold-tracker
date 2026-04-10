import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { GoldType } from '@prisma/client';
import { startOfDay } from 'date-fns';

export async function GET() {
  try {
    // Get distinct types to fetch for (weight 1 only for ticker)
    const types: GoldType[] = ['ANTAM', 'GALERI24', 'UBS'];
    
    const tickerData = await Promise.all(types.map(async (type) => {
      // Get the latest price
      const latest = await prisma.priceHistory.findFirst({
        where: { type, weight: 1 },
        orderBy: { date: 'desc' },
      });

      if (!latest) return null;

      // Get the previous day's price (latest price before today or before the latest record's date)
      // Usually "previous day" means the last record from a different day
      const previous = await prisma.priceHistory.findFirst({
        where: { 
          type, 
          weight: 1,
          date: { lt: startOfDay(latest.date) }
        },
        orderBy: { date: 'desc' },
      });

      return {
        ...latest,
        previousPriceBuy: previous?.priceBuy || latest.priceBuy,
        trend: !previous ? 'stable' : 
               latest.priceBuy > previous.priceBuy ? 'up' : 
               latest.priceBuy < previous.priceBuy ? 'down' : 'stable'
      };
    }));

    return NextResponse.json(tickerData.filter(Boolean));
  } catch (err) {
    console.error('Ticker API error:', err);
    return NextResponse.json({ error: 'Failed to fetch ticker data' }, { status: 500 });
  }
}
