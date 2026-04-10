import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { GoldType } from '@prisma/client';
import { subDays } from 'date-fns';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') as GoldType | null;
    const range = searchParams.get('range') || '30d';

    let dateLimit = subDays(new Date(), 30);
    if (range === '7d') dateLimit = subDays(new Date(), 7);
    if (range === '90d') dateLimit = subDays(new Date(), 90);
    if (range === 'all') dateLimit = new Date(0);

    const prices = await prisma.priceHistory.findMany({
      where: {
        type: type || undefined,
        weight: 1, // Restrict graph to exactly 1 gram items preventing multi-denomination axis breakage
        date: { gte: dateLimit },
      },
      orderBy: { date: 'asc' },
    });

    return NextResponse.json(prices);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch price history' }, { status: 500 });
  }
}
