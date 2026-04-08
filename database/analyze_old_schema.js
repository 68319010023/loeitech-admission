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

async function getColumnInfo(dbName, tableName) {
  const client = new Client({ ...dbConfig, database: dbName });
  try {
    await client.connect();
    const res = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = $1
      ORDER BY ordinal_position;
    `, [tableName]);
    await client.end();
    return res.rows;
  } catch (err) {
    console.error(`❌ Error checking ${dbName}.${tableName}:`, err.message);
    return [];
  }
}

async function run() {
  const tables = ['applicants', 'documents', 'enrollments', 'users'];
  for (const table of tables) {
    const columns = await getColumnInfo('ltc_admission_db', table);
    console.log(`\n--- TABLE: ${table} ---`);
    columns.forEach(c => {
      console.log(`${c.column_name} (${c.data_type}) ${c.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
  }
}

run();
