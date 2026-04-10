import 'dotenv/config';
import prisma from '../lib/prisma';

async function check() {
  const prices = await prisma.priceHistory.findMany({
    where: { type: 'ANTAM', weight: 1 },
    orderBy: { date: 'asc' },
  });

  console.log('ANTAM 1g items in DB:');
  for (const p of prices) {
    console.log(`id=${p.id} date=${p.date.toISOString()} buy=${p.priceBuy} sell=${p.priceSell}`);
  }
}

check().catch(console.error).finally(() => prisma.$disconnect());
