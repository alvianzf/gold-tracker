import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { GoldType } from '@prisma/client';
import { getSessionUser } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.id == null) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') as GoldType | null;
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'date';

    const where: any = {
      holding: {
        userId: user.id as string,
      }
    };
    
    if (type) {
      where.holding.type = type;
    }

    if (search) {
      where.holding.OR = [
        { serialNumber: { contains: search, mode: 'insensitive' } },
        { receiptUrl: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = new Date(dateFrom);
      if (dateTo) where.date.lte = new Date(dateTo);
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: { holding: true },
      orderBy: {
        date: sortBy === 'date' ? 'desc' : undefined,
      },
    });

    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Failed to fetch transactions:', error);
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}

