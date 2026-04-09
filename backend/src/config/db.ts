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
});

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
