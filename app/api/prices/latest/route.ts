import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const latestPrices = await prisma.priceHistory.findMany({
      orderBy: { date: 'desc' },
      distinct: ['type', 'weight'],
    });

    return NextResponse.json(latestPrices);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch latest prices' }, { status: 500 });
  }
}
