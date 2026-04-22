import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getLatestPrices, calculateHoldingPL, getPortfolioSummary } from '@/lib/portfolio';
import { getSessionUser } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, weight, buyPrice, buyDate, serialNumber, receiptUrl } = body;

    const user = await getSessionUser();
    if (!user || user.id == null) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const holding = await prisma.$transaction(async (tx) => {
      const h = await tx.holding.create({
        data: {
          userId: user.id as string,
          type,
          weight,
          buyPrice,
          buyDate: new Date(buyDate),
          serialNumber,
          receiptUrl,
          status: 'ACTIVE',
        },
      });

      await tx.transaction.create({
        data: {
          holdingId: h.id,
          type: 'BUY',
          price: buyPrice,
          date: new Date(buyDate),
        },
      });

      return h;
    });

    return NextResponse.json(holding);
  } catch (error) {
    console.error('Failed to create holding:', error);
    return NextResponse.json({ error: 'Failed to create holding' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.id == null) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const [holdings, total, portfolioSummary] = await Promise.all([
      prisma.holding.findMany({
        where: { status: 'ACTIVE', userId: user.id as string },
        orderBy: { createdAt: 'desc' },
        include: { transactions: true },
        take: limit,
        skip: skip,
      }),
      prisma.holding.count({
        where: { status: 'ACTIVE', userId: user.id as string },
      }),
      getPortfolioSummary(user.id as string)
    ]);

    const latestPrices = await getLatestPrices();
    
    const enrichedHoldings = await Promise.all(
      holdings.map((h) => calculateHoldingPL(h, latestPrices))
    );

    return NextResponse.json({
      data: enrichedHoldings,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      summary: portfolioSummary
    });
  } catch (error) {
    console.error('Failed to fetch holdings:', error);
    return NextResponse.json({ error: 'Failed to fetch holdings' }, { status: 500 });
  }
}
