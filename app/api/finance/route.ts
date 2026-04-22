import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;
    
    const search = searchParams.get('search');
    const start = searchParams.get('start');
    const end = searchParams.get('end');

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

    const [transactions, total, stats, allFilteredTransactions] = await Promise.all([
      prisma.financeTransaction.findMany({
        where,
        orderBy: { date: 'desc' },
        take: limit,
        skip: skip,
      }),
      prisma.financeTransaction.count({ where }),
      prisma.financeTransaction.groupBy({
        where,
        by: ['type'],
        _sum: { amount: true },
      }),
      prisma.financeTransaction.findMany({
        where,
        orderBy: { date: 'desc' },
      })
    ]);

    const statsMap = stats.reduce((acc, s) => {
      acc[s.type] = s._sum.amount || 0;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      data: transactions,
      analyticsData: allFilteredTransactions,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      stats: {
        totalIncome: statsMap['CREDIT'] || 0,
        totalExpense: statsMap['DEBIT'] || 0,
        balance: (statsMap['CREDIT'] || 0) - (statsMap['DEBIT'] || 0),
      }
    });
  } catch (error) {
    console.error('Error fetching finance transactions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await req.json();
    const { date, amount, source, type, purpose, photoUrl, thumbnailUrl } = body;

    if (!date || !amount || !source || !type || !purpose) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const transaction = await prisma.financeTransaction.create({
      data: {
        date: new Date(date),
        amount: parseFloat(amount),
        source,
        type,
        purpose,
        photoUrl,
        thumbnailUrl,
        userId: user.id as string,
      },
    });

    // Auto-save purpose for future suggestions
    await prisma.financePurpose.upsert({
      where: {
        name_userId: {
          name: purpose,
          userId: user.id as string,
        },
      },
      update: {},
      create: {
        name: purpose,
        userId: user.id as string,
      },
    });

    return NextResponse.json(transaction);
  } catch (error) {
    console.error('Error creating finance transaction:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
