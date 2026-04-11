import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function check() {
  const prices = await prisma.priceHistory.findMany({
    where: {
      type: 'GALERI24',
      weight: 1,
    },
    orderBy: { date: 'desc' },
    take: 5,
  });
  console.log("Latest 5 records for GALERI24 1g:");
  for (const p of prices) {
    console.log(`Date: ${p.date.toISOString()} | Buy: ${p.priceBuy} | Sell: ${p.priceSell}`);
  }
}

check().catch(console.error).finally(() => { prisma.$disconnect(); pool.end(); });
