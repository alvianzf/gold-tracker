import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const stats = await prisma.financeTransaction.groupBy({
      where: { userId: user.id as string },
      by: ['type'],
      _sum: { amount: true },
    });

    const statsMap = stats.reduce((acc, s) => {
      acc[s.type] = s._sum.amount || 0;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      totalIncome: statsMap['CREDIT'] || 0,
      totalExpense: statsMap['DEBIT'] || 0,
      balance: (statsMap['CREDIT'] || 0) - (statsMap['DEBIT'] || 0),
    });
  } catch (error) {
    console.error('Error fetching finance summary:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
