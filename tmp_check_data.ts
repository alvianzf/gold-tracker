import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '.env') });

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const today = new Date('2026-04-11');
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));

  console.log(`Checking data for: ${startOfDay.toISOString()} to ${endOfDay.toISOString()}`);

  const counts = await prisma.priceHistory.count({
    where: {
      date: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
  });

  console.log(`Found ${counts} records for today.`);

  const summaryCount = await prisma.dailyPortfolioSummary.count({
    where: {
      date: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
  });

  console.log(`Found ${summaryCount} portfolio summaries for today.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
