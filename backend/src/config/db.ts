import { Pool } from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === 'false' ? false : undefined,
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
