import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { generateFinancialSuggestion } from '@/lib/ai';
import { startOfDay, endOfDay } from 'date-fns';

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const today = new Date();
    const existing = await prisma.aiSuggestion.findFirst({
      where: {
        userId: user.id as string,
        date: {
          gte: startOfDay(today),
          lte: endOfDay(today),
        },
      },
    });

    if (existing) {
      return NextResponse.json(existing);
    }

    // Generate new suggestion if none exists for today
    const transactions = await prisma.financeTransaction.findMany({
      where: { userId: user.id as string },
      orderBy: { date: 'desc' },
      take: 20, // Take last 20 for context
    });

    const suggestionContent = await generateFinancialSuggestion(transactions);

    const newSuggestion = await prisma.aiSuggestion.create({
      data: {
        content: suggestionContent || 'Keep tracking to see insights!',
        userId: user.id as string,
        date: today,
      },
    });

    return NextResponse.json(newSuggestion);
  } catch (error) {
    console.error('Fetch Suggestion Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const today = new Date();
    const existing = await prisma.aiSuggestion.findFirst({
      where: {
        userId: user.id as string,
        date: {
          gte: startOfDay(today),
          lte: endOfDay(today),
        },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'No daily suggestion to regenerate' }, { status: 404 });
    }

    if (existing.regenerated) {
      return NextResponse.json({ error: 'Regeneration limit reached for today' }, { status: 403 });
    }

    const transactions = await prisma.financeTransaction.findMany({
      where: { userId: user.id as string },
      orderBy: { date: 'desc' },
      take: 20,
    });

    const newContent = await generateFinancialSuggestion(transactions);

    const updated = await prisma.aiSuggestion.update({
      where: { id: existing.id },
      data: {
        content: newContent || 'Insight updated!',
        regenerated: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Regenerate Suggestion Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
