import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { subDays } from 'date-fns';
import { getSessionUser } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const range = searchParams.get('range') || '30d';

    let dateLimit = subDays(new Date(), 30);
    if (range === '7d') dateLimit = subDays(new Date(), 7);
    if (range === '90d') dateLimit = subDays(new Date(), 90);
    if (range === 'all') dateLimit = new Date(0);

    const user = await getSessionUser();
    if (!user || user.id == null) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const history = await prisma.dailyPortfolioSummary.findMany({
      where: {
        userId: user.id as string,
        date: { gte: dateLimit },
      },
      orderBy: { date: 'asc' },
    });

    return NextResponse.json(history);
  } catch (error) {
    console.error('Failed to fetch portfolio history:', error);
    return NextResponse.json({ error: 'Failed to fetch portfolio history' }, { status: 500 });
  }
}
