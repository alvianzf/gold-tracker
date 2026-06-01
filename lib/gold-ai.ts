import OpenAI from 'openai';
import prisma from './prisma';
import { GoldType } from '@prisma/client';

const apiKey = process.env.NEXT_AI_API_KEY;

if (!apiKey) {
  console.warn('NEXT_AI_API_KEY is not defined in environment variables');
}

const openai = new OpenAI({
  apiKey: apiKey || '',
  //@ts-ignore - Using SumoPod AI proxy
  baseURL: 'https://ai.sumopod.com/v1',
});

export interface GoldVendorRecommendation {
  vendor: GoldType;
  recommendation: 'BUY' | 'SELL' | 'HOLD';
  reasons: string[];
  details: string;
}

export async function runDailyGoldAnalysis(): Promise<GoldVendorRecommendation[]> {
  const vendors: GoldType[] = ['ANTAM', 'UBS', 'GALERI24'];
  const now = new Date();
  
  // Start and end of today
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);

  // 1. Gather historical pricing data for the past 10 days for each vendor
  const priceHistoryByVendor: Record<GoldType, any[]> = {
    ANTAM: [],
    UBS: [],
    GALERI24: [],
  };

  for (const vendor of vendors) {
    const history = await prisma.priceHistory.findMany({
      where: {
        type: vendor,
        weight: 1, // Benchmark standard (1 gram)
      },
      orderBy: { date: 'desc' },
      take: 10,
    });
    priceHistoryByVendor[vendor] = history;
  }

  // 2. Prepare contextual prompt for the AI
  let contextDescription = 'HISTORICAL GOLD PRICE LOGS (1 GRAM):\n\n';
  for (const vendor of vendors) {
    contextDescription += `--- ${vendor} Price History ---\n`;
    if (priceHistoryByVendor[vendor].length === 0) {
      contextDescription += 'No price records found.\n';
    } else {
      priceHistoryByVendor[vendor].forEach((p, idx) => {
        const formattedDate = new Date(p.date).toISOString().split('T')[0];
        contextDescription += `Date: ${formattedDate} | Buy: Rp ${p.priceBuy.toLocaleString('id-ID')} | Sell (Buyback): ${p.priceSell ? 'Rp ' + p.priceSell.toLocaleString('id-ID') : 'N/A'}\n`;
      });
    }
    contextDescription += '\n';
  }

  const prompt = `
    You are an elite Precious Metals Analyst and Macro-Economist. Analyze the historical gold price data below and provide a market advisory recommendation ("BUY", "SELL", or "HOLD") for each of the three gold vendors: ANTAM, UBS, and GALERI24.

    ${contextDescription}

    CRITICAL INSTRUCTIONS:
    1. For each vendor, assess the price trend (e.g. upward, downward, volatile), current valuation, and the spread between the Buy Price (what the user pays to buy gold) and Sell Price (what the vendor pays to buy back gold).
    2. Provide a recommendation: "BUY" if prices are consolidated/low or technicals show an immediate entry point, "SELL" if prices are at peak resistance/all-time highs and spreads are tight, or "HOLD" if the trend is uncertain/sideways and it's better to wait.
    3. Provide exactly 3 high-impact, professional, and localized reasons (in a bulleted format) supporting the recommendation.
    4. Provide a detailed, deep-dive analytical paragraph (details) discussing the moving average support, resistance levels, spread percentage (Buyback vs Buy price), and optimal entry/exit strategies.
    5. Output the response strictly in JSON format. Do not wrap in markdown code blocks like \`\`\`json. Output raw JSON ONLY.

    REQUIRED JSON FORMAT:
    {
      "analyses": [
        {
          "vendor": "ANTAM",
          "recommendation": "BUY",
          "reasons": [
            "Reason 1 about prices consolidation near key supports",
            "Reason 2 about buy-back spread of X% representing low friction",
            "Reason 3 about global macroeconomic tailwinds"
          ],
          "details": "Technical breakdown discussing specific price targets, support at Rp X, and resistance at Rp Y..."
        },
        {
          "vendor": "UBS",
          "recommendation": "HOLD",
          "reasons": [
            "Reason 1...",
            "Reason 2...",
            "Reason 3..."
          ],
          "details": "Technical breakdown..."
        },
        {
          "vendor": "GALERI24",
          "recommendation": "SELL",
          "reasons": [
            "Reason 1...",
            "Reason 2...",
            "Reason 3..."
          ],
          "details": "Technical breakdown..."
        }
      ]
    }
  `;

  try {
    const response = await openai.chat.completions.create({
      model: 'gemini/gemini-2.5-flash',
      messages: [
        { role: 'system', content: 'You are an elite precious metals strategist who delivers rigorous, highly accurate, and mathematically sound investment advice in Indonesian rupiah gold markets.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 1500,
      temperature: 0.7
    });

    const rawContent = response.choices[0].message.content || '{}';
    // Clean up response if there are markdown blocks (in case Gemini still adds them despite instructions)
    const cleanedContent = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const parsedData = JSON.parse(cleanedContent);
    const analyses: GoldVendorRecommendation[] = parsedData.analyses || [];

    if (analyses.length > 0) {
      // 3. Write/Update these records in the database
      await prisma.$transaction(async (tx) => {
        // Clear any existing analyses for today to avoid duplicates
        await tx.goldAnalysis.deleteMany({
          where: {
            date: {
              gte: todayStart,
              lte: todayEnd,
            }
          }
        });

        // Save fresh analyses
        await Promise.all(
          analyses.map((item) =>
            tx.goldAnalysis.create({
              data: {
                vendor: item.vendor,
                recommendation: item.recommendation,
                reasons: JSON.stringify(item.reasons),
                details: item.details,
                date: now,
              }
            })
          )
        );
      });
      
      console.log(`[GOLD-AI] Successfully stored ${analyses.length} gold analyses in database.`);
      return analyses;
    } else {
      throw new Error('AI returned an empty analysis list');
    }
  } catch (error) {
    console.error('[GOLD-AI] Error during gold price analysis generation:', error);
    throw error;
  }
}
