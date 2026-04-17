const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
require('dotenv').config();

async function testPrisma() {
  const connectionString = process.env.DATABASE_URL;
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    console.log('Fetching finance transactions...');
    const result = await prisma.financeTransaction.findMany();
    console.log('Result:', result);
  } catch (err) {
    console.error('Prisma Error:', err);
  } finally {
    await pool.end();
  }
}

testPrisma();
