// backend/scripts/checkUsers.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '56442'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER?.trim(),
  password: process.env.DB_PASSWORD,
  ssl: false,
});

async function checkUsers() {
  try {
    const result = await pool.query(
      'SELECT id, username, role, created_at FROM users ORDER BY created_at DESC'
    );
    
    console.log('=== Users in Database ===');
    console.log('Total users:', result.rows.length);
    
    if (result.rows.length === 0) {
      console.log('❌ No users found in database');
      console.log('\nTo add test users, run:');
      console.log('psql -d your_database -f database/create_test_user.sql');
    } else {
      console.log('\n📋 User List:');
      result.rows.forEach((user, index) => {
        console.log(`${index + 1}. Username: ${user.username}, Role: ${user.role}, Created: ${user.created_at}`);
      });
      
      console.log('\n🔑 Test with these credentials:');
      console.log('- Username: admin, Password: admin123');
      console.log('- Username: staff, Password: staff123');
      console.log('- Username: test, Password: password');
    }
    
  } catch (error) {
    console.error('❌ Error checking users:', error.message);
  } finally {
    await pool.end();
  }
}

checkUsers();
