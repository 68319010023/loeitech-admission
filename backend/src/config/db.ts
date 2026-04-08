import { Pool } from 'pg'
import dotenv from 'dotenv'

dotenv.config()


const pool = new Pool({

  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '56442'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER?.trim(),
  password: process.env.DB_PASSWORD,
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
    console.log('PASSWORD:', JSON.stringify(process.env.DB_PASSWORD))
  } else {
    console.log('✅ DB Connected!')
    release()
  }
})

export default pool