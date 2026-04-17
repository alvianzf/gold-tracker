const { Pool } = require('pg');
require('dotenv').config();

async function checkTable() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const res = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'FinanceTransaction'
      );
    `);
    console.log('Table exists:', res.rows[0].exists);
    
    // Also check lowercase version just in case
    const res2 = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'financetransaction'
      );
    `);
    console.log('Table exists (lowercase):', res2.rows[0].exists);

    // List all tables
    const res3 = await pool.query(`
      SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
    `);
    console.log('Tables in public schema:', res3.rows.map(r => r.table_name));

  } catch (err) {
    console.error('Error checking table:', err);
  } finally {
    await pool.end();
  }
}

checkTable();
