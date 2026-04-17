import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { date, amount, source, type, purpose, photoUrl, thumbnailUrl } = body;

    const existing = await prisma.financeTransaction.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== user.id as string) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    const updated = await prisma.financeTransaction.update({
      where: { id },
      data: {
        date: date ? new Date(date) : undefined,
        amount: amount ? parseFloat(amount) : undefined,
        source,
        type,
        purpose,
        photoUrl,
        thumbnailUrl,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating finance transaction:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.financeTransaction.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== user.id) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    await prisma.financeTransaction.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting finance transaction:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
