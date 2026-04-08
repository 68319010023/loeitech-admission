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

async function checkTables(dbName) {
  const client = new Client({ ...dbConfig, database: dbName });
  try {
    await client.connect();
    const res = await client.query(`
      SELECT tablename 
      FROM pg_catalog.pg_tables 
      WHERE schemaname != 'pg_catalog' AND schemaname != 'information_schema'
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
  const prodTables = await checkTables('ltc_admission_db');
  const testTables = await checkTables('ltc_admission_test');

  console.log('\n--- Production (ltc_admission_db) ---');
  console.log(`Total: ${prodTables.length}`);
  console.log(prodTables.join(', '));

  console.log('\n--- Testing (ltc_admission_test) ---');
  console.log(`Total: ${testTables.length}`);
  console.log(testTables.join(', '));

  const onlyProd = prodTables.filter(x => !testTables.includes(x));
  const onlyTest = testTables.filter(x => !prodTables.includes(x));

  if (onlyProd.length > 0) console.log(`\n⚠️ Only in Prod: ${onlyProd.join(', ')}`);
  if (onlyTest.length > 0) console.log(`\n⚠️ Only in Test: ${onlyTest.join(', ')}`);
}

run();
