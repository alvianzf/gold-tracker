import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user || user.id == null) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const holding = await prisma.holding.findFirst({
      where: { id, userId: user.id as string },
      include: { transactions: true },
    });

    if (!holding) {
      return NextResponse.json({ error: 'Holding not found' }, { status: 404 });
    }

    return NextResponse.json(holding);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch holding' }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user || user.id == null) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    
    // First verify possession
    const existing = await prisma.holding.findFirst({ where: { id, userId: user.id as string } });
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const holding = await prisma.holding.update({
      where: { id },
      data: {
        ...body,
        buyDate: body.buyDate ? new Date(body.buyDate) : undefined,
      },
    });
    return NextResponse.json(holding);
  } catch {
    return NextResponse.json({ error: 'Failed to update holding' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user || user.id == null) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    
    // Verify possession before deletion
    const existing = await prisma.holding.findFirst({ where: { id, userId: user.id as string } });
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    await prisma.holding.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete holding' }, { status: 500 });
  }
}
