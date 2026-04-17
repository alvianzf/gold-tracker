import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { subDays, startOfDay, endOfDay } from 'date-fns';
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

    // 1. Get Gold history
    const goldHistory = await prisma.dailyPortfolioSummary.findMany({
      where: {
        userId: user.id as string,
        date: { gte: dateLimit },
      },
      orderBy: { date: 'asc' },
    });

    // 2. Get all Finance transactions to compute running balance
    const financeTransactions = await prisma.financeTransaction.findMany({
      where: { userId: user.id as string },
      orderBy: { date: 'asc' },
    });

    // 3. Combine. For each day in gold history, find total cash up to that day
    const combinedHistory = goldHistory.map(snapshot => {
      const snapshotDate = endOfDay(new Date(snapshot.date));
      
      const cashBalance = financeTransactions
        .filter(tx => new Date(tx.date) <= snapshotDate)
        .reduce((sum, tx) => {
          return tx.type === 'CREDIT' ? sum + tx.amount : sum - tx.amount;
        }, 0);

      return {
        date: snapshot.date,
        goldValue: snapshot.totalValue,
        cashValue: cashBalance,
        totalNetWorth: snapshot.totalValue + cashBalance,
      };
    });

    return NextResponse.json(combinedHistory);
  } catch (error) {
    console.error('Failed to fetch net worth history:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
