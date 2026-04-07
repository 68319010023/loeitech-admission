const { Client } = require('pg');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const dbConfig = {
  host: 'docker3.loeitech.org',
  port: 56442,
  user: 'admin_ltc',
  password: process.env.DB_PASSWORD || 'LTC_@dmission69',
  ssl: false
};

async function getTables(dbName) {
  const client = new Client({ ...dbConfig, database: dbName });
  try {
    await client.connect();
    const res = await client.query(`
      SELECT tablename 
      FROM pg_catalog.pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `);
    await client.end();
    return res.rows.map(row => row.tablename);
  } catch (err) {
    console.error(`❌ Error checking ${dbName}:`, err.message);
    return [];
  }
}

async function run() {
  const prod = await getTables('ltc_admission_db');
  const test = await getTables('ltc_admission_test');

  console.log('PROD TABLES:', prod.length, JSON.stringify(prod));
  console.log('TEST TABLES:', test.length, JSON.stringify(test));
  
  const onlyProd = prod.filter(x => !test.includes(x));
  const onlyTest = test.filter(x => !prod.includes(x));

  console.log('ONLY PROD:', onlyProd);
  console.log('ONLY TEST:', onlyTest);
}

run();
