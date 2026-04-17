import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const transactions = await prisma.financeTransaction.findMany({
      where: { userId: user.id },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json(transactions);
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
        userId: user.id,
      },
    });

    return NextResponse.json(transaction);
  } catch (error) {
    console.error('Error creating finance transaction:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
