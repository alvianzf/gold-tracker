import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> } // Note: Route params are inherently awaited in newer Next.js patterns, though older Next supports sync. Next 15 prefers Promise<{id}>
) {
  try {
    const user = await getSessionUser();
    if (!user || user.id == null) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Support either async params resolution or direct extraction
    const awaitedParams = await params;
    const { id } = awaitedParams;
    
    const body = await req.json();
    const sellPrice = body.sellPrice;
    
    if (!sellPrice || sellPrice <= 0) {
      return NextResponse.json({ error: 'Valid sell price is required' }, { status: 400 });
    }

    const holding = await prisma.holding.findFirst({
      where: { id: id, userId: user.id },
    });

    if (!holding) {
      return NextResponse.json({ error: 'Holding not found' }, { status: 404 });
    }

    if (holding.status === 'SOLD') {
      return NextResponse.json({ error: 'Holding is already sold' }, { status: 400 });
    }

    // Execute transaction safely inside Prisma db scope
    const transaction = await prisma.$transaction(async (tx) => {
      // 1. Mark Holding as SOLD
      const updatedHolding = await tx.holding.update({
        where: { id },
        data: { status: 'SOLD' },
      });

      // 2. Create the SELL transaction
      const sysTx = await tx.transaction.create({
        data: {
          holdingId: holding.id,
          type: 'SELL',
          price: sellPrice,
          date: new Date(),
        },
      });
      
      return { updatedHolding, sysTx };
    });

    return NextResponse.json({ success: true, transaction });
  } catch (error) {
    console.error('Failed to sell holding:', error);
    return NextResponse.json({ error: 'Failed to process sell transaction' }, { status: 500 });
  }
}
