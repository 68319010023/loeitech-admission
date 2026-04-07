import { Pool } from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const pool = new Pool({
  host: 'docker3.loeitech.org',
  port: 56442,
  database: 'ltc_admission_db',
  user: 'admin_ltc',
  password: process.env.DB_PASSWORD,
  ssl: false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

pool.connect((err, _client, release) => {
  if (err) {
    console.error('❌ DB Error:', err.message)
  } else {
    console.log('✅ DB Connected!')
    release()
  }
})

export default pool