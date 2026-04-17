import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const purposes = await prisma.financePurpose.findMany();
  console.log('--- Master Purposes ---');
  console.log(purposes);

  const transactions = await prisma.financeTransaction.findMany({
    select: { source: true, purpose: true }
  });
  console.log('--- Transaction Unique Pairs ---');
  const uniqueSources = new Set(transactions.map(t => t.source));
  const uniquePurposes = new Set(transactions.map(t => t.purpose));
  console.log('Sources:', Array.from(uniqueSources));
  console.log('Purposes:', Array.from(uniquePurposes));
}

main().catch(console.error).finally(() => prisma.$disconnect());
