const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://username:password@localhost:5432/ltc_admission_db'
});

async function checkSlips() {
  try {
    const result = await pool.query('SELECT app_id, slip_name, slip_path, paid_at FROM payments WHERE slip_name IS NOT NULL LIMIT 5');
    
    console.log('=== ข้อมูลสลิปในฐานข้อมูล ===');
    console.log(JSON.stringify(result.rows, null, 2));
    
    console.log('\n=== ตรวจสอบไฟล์จริง ===');
    const fs = require('fs');
    
    result.rows.forEach(row => {
      if (row.slip_path) {
        const exists = fs.existsSync(row.slip_path);
        console.log(`Path: ${row.slip_path} -> ${exists ? '✓ มีไฟล์' : '✗ ไม่มีไฟล์'}`);
      }
    });
    
    await pool.end();
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

checkSlips();
