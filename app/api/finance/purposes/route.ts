import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    let purposes = await prisma.financePurpose.findMany({
      where: { userId: user.id as string },
      orderBy: { name: 'asc' },
    });

    // Seed default purposes if none exist
    if (purposes.length === 0) {
      const defaultNames = ['Savings', 'Food & Drink', 'Transport', 'Daily Needs'];
      
      await prisma.financePurpose.createMany({
        data: defaultNames.map(name => ({
          name,
          userId: user.id as string,
        }))
      });

      purposes = await prisma.financePurpose.findMany({
        where: { userId: user.id as string },
        orderBy: { name: 'asc' },
      });
    }

    return NextResponse.json(purposes);
  } catch (error) {
    console.error('Error fetching finance purposes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
