const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from backend/.env
dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const dbConfig = {
  host: 'docker3.loeitech.org',
  port: 56442, // Connect directly to PostgreSQL (NOT PgBouncer)
  user: 'admin_ltc',
  password: process.env.DB_PASSWORD || 'LTC_@dmission69',
  database: 'ltc_admission_db', // Connect to existing DB to create the new one
  ssl: false
};

async function initTestDb() {
  const client = new Client(dbConfig);
  
  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL server (Direct Port: 56442).');
    await client.end();

    // 1. Try to connect to the test database to see if it exists
    const checkClient = new Client({ ...dbConfig, database: 'ltc_admission_test' });
    let exists = false;
    try {
      await checkClient.connect();
      exists = true;
      console.log('ℹ️ Database "ltc_admission_test" already exists.');
      await checkClient.end();
    } catch (err) {
      if (err.code === '3D000') { // invalid_catalog_name (database does not exist)
        exists = false;
      } else {
        throw err;
      }
    }

    if (!exists) {
      console.log('🚀 Creating database "ltc_admission_test"...');
      const creatorClient = new Client(dbConfig);
      await creatorClient.connect();
      await creatorClient.query('CREATE DATABASE ltc_admission_test');
      await creatorClient.end();
      console.log('✅ Database created successfully.');
    }

    // 2. Connect to the new database
    const testDbClient = new Client({
      ...dbConfig,
      database: 'ltc_admission_test'
    });
    await testDbClient.connect();
    console.log('✅ Connected to "ltc_admission_test".');

    // 3. Test a simple query
    await testDbClient.query('SELECT 1');
    console.log('✅ Simple query (SELECT 1) succeeded.');

    // 4. Read and execute schema.sql
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('⏳ Initializing schema and seed data...');
    try {
      await testDbClient.query(schemaSql);
      console.log('✨ Test database initialized successfully!');
    } catch (schemaErr) {
      console.error('❌ Error executing schema.sql:', schemaErr.message);
      console.error('Stack trace:', schemaErr.stack);
      throw schemaErr;
    }
    await testDbClient.end();
  } catch (err) {
    console.error('❌ Error initializing test database:', {
      message: err.message,
      code: err.code,
      detail: err.detail,
      hint: err.hint,
      where: err.where
    });
    if (err.stack) console.error(err.stack);
    process.exit(1);
  }
}

initTestDb();
