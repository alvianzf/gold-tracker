import 'dotenv/config';
import prisma from '../lib/prisma';

async function check() {
  const prices = await prisma.priceHistory.findMany({
    orderBy: { date: 'desc' },
    distinct: ['type', 'weight'],
  });

  console.log('Latest prices returned:');
  for (const p of prices.filter(p => p.weight === 1)) {
    console.log(`${p.type} 1g: date=${p.date.toISOString()}, buy=${p.priceBuy}, sell=${p.priceSell}`);
  }
}

check().catch(console.error).finally(() => prisma.$disconnect());
