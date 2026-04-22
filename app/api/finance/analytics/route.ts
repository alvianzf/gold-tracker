import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { startOfDay, endOfDay } from 'date-fns';

export async function GET(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const start = searchParams.get('start');
    const end = searchParams.get('end');
    const search = searchParams.get('search');

    const where: any = { userId: user.id as string };
    
    if (search) {
      where.OR = [
        { purpose: { contains: search, mode: 'insensitive' } },
        { source: { contains: search, mode: 'insensitive' } },
        { details: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (start || end) {
      where.date = {};
      if (start) where.date.gte = new Date(start);
      if (end) where.date.lte = new Date(end);
    }

    // Fetch all filtered transactions for aggregation
    // In a real high-scale app, we'd use groupBy more extensively or a specialized analytics DB
    const transactions = await prisma.financeTransaction.findMany({
      where,
      orderBy: { date: 'asc' },
    });

    // Also fetch global transactions for the same range (ignoring search/filters if needed)
    // Actually, the current component shows "Total Monthly" vs "Active Filtered"
    // So we need global stats for the same date range but without search/source/purpose filters
    
    const globalWhere: any = { userId: user.id as string };
    if (start || end) {
      globalWhere.date = {};
      if (start) globalWhere.date.gte = new Date(start);
      if (end) globalWhere.date.lte = new Date(end);
    }

    const globalTransactions = await prisma.financeTransaction.findMany({
      where: globalWhere,
      orderBy: { date: 'asc' },
    });

    return NextResponse.json({
      transactions,
      globalTransactions,
    });
  } catch (error) {
    console.error('Error fetching finance analytics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
