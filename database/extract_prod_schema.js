const { Client } = require('pg');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const dbConfig = {
  host: 'docker3.loeitech.org',
  port: 56442,
  user: 'admin_ltc',
  password: process.env.DB_PASSWORD || 'LTC_@dmission69',
  database: 'ltc_admission_db',
  ssl: false
};

async function getFullSchema() {
  const client = new Client(dbConfig);
  try {
    await client.connect();
    console.log('--- TABLES & COLUMNS ---');
    const cols = await client.query(`
      SELECT table_name, column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public'
      ORDER BY table_name, ordinal_position;
    `);
    
    let currentTable = '';
    cols.rows.forEach(row => {
      if (row.table_name !== currentTable) {
        currentTable = row.table_name;
        console.log(`\nTABLE: ${currentTable}`);
      }
      console.log(`  - ${row.column_name} (${row.data_type}) ${row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'} ${row.column_default ? 'DEFAULT ' + row.column_default : ''}`);
    });

    console.log('\n--- CONSTRAINTS (PK/FK) ---');
    const constraints = await client.query(`
      SELECT
          tc.table_name, 
          kcu.column_name, 
          tc.constraint_type,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name 
      FROM 
          information_schema.table_constraints AS tc 
          JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
          JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
            AND ccu.table_schema = tc.table_schema
      WHERE tc.table_schema = 'public';
    `);
    constraints.rows.forEach(c => {
      console.log(`${c.table_name}.${c.column_name} [${c.constraint_type}] ${c.foreign_table_name ? '-> ' + c.foreign_table_name + '.' + c.foreign_column_name : ''}`);
    });

    await client.end();
  } catch (err) {
    console.error('❌ Error fetching schema:', err.message);
  }
}

getFullSchema();
