import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { runDailyGoldAnalysis } from '@/lib/gold-ai';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

    // 1. Fetch analysis records for today
    let analyses = await prisma.goldAnalysis.findMany({
      where: {
        date: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // 2. If no analysis exists for today, fall back to the most recent daily analysis in history
    if (analyses.length === 0) {
      const mostRecent = await prisma.goldAnalysis.findFirst({
        orderBy: { date: 'desc' },
      });

      if (mostRecent) {
        // Find all other analyses from that same date
        const targetDateStart = new Date(mostRecent.date);
        targetDateStart.setHours(0, 0, 0, 0);
        const targetDateEnd = new Date(mostRecent.date);
        targetDateEnd.setHours(23, 59, 59, 999);

        analyses = await prisma.goldAnalysis.findMany({
          where: {
            date: {
              gte: targetDateStart,
              lte: targetDateEnd,
            },
          },
        });
      }
    }

    // 3. If there is absolutely no analysis in database history, trigger a fresh one on the fly
    if (analyses.length === 0) {
      console.log('[API] No gold analysis found in history. Triggering fresh generation on the fly...');
      try {
        const freshData = await runDailyGoldAnalysis();
        return NextResponse.json(freshData);
      } catch (err) {
        console.error('[API] Failed to run on-the-fly gold analysis:', err);
        return NextResponse.json({ error: 'No analysis history and on-the-fly generation failed' }, { status: 503 });
      }
    }

    // 4. Return parsed analyses (parsing reasons back to JSON array)
    const formatted = analyses.map((item: any) => {
      let reasonsArray: string[] = [];
      try {
        reasonsArray = JSON.parse(item.reasons);
      } catch {
        // Fallback in case it was stored as markdown or regular string
        reasonsArray = [item.reasons];
      }

      return {
        id: item.id,
        vendor: item.vendor,
        recommendation: item.recommendation,
        reasons: reasonsArray,
        details: item.details,
        date: item.date,
        createdAt: item.createdAt,
      };
    });

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('[API] GET /api/gold/analysis error:', error);
    return NextResponse.json({ error: 'Failed to retrieve gold analysis' }, { status: 500 });
  }
}

export async function POST() {
  try {
    // Check user session for authorization (only authenticated users can manually trigger AI sync)
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized credentials' }, { status: 401 });
    }

    console.log(`[API] AI Gold Analysis manual regeneration triggered by user: ${user.username}`);
    const freshData = await runDailyGoldAnalysis();
    
    return NextResponse.json(freshData);
  } catch (error) {
    console.error('[API] POST /api/gold/analysis error:', error);
    return NextResponse.json({ error: 'Failed to regenerate gold analysis' }, { status: 500 });
  }
}
