/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function seedUser() {
  console.log('Seeding default user from .env...');
  const username = process.env.NEXT_DEFAULT_USERNAME;
  const password = process.env.NEXT_DEFAULT_PASSWORD;

  if (!username || !password) {
    console.warn('Skipping seeding: NEXT_DEFAULT_USERNAME or NEXT_DEFAULT_PASSWORD not found in .env');
    return;
  }

  try {
    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
      console.log(`User ${username} already exists. Skipping.`);
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        role: 'ADMIN',
      },
    });

    console.log(`Successfully created default user: ${username}`);
  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedUser();
