import { Pool } from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

pool.connect((err, _client, release) => {
  if (err) {
    console.error('❌ DB Error full:', err)
    console.error('❌ DB Error message:', err.message)
    console.error('❌ DB Error code:', (err as any).code)
  } else {
    console.log('✅ DB Connected!')
    release()
  }
})

export default pool
