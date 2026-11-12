import 'dotenv/config'
import pg from 'pg'

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set. Create server/.env with DATABASE_URL=postgres://USER:PASSWORD@localhost:5432/DBNAME')
  process.exit(1)
}

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  // Set DATABASE_SSL=true for hosted databases that require SSL
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
})

export const query = (text, params) => pool.query(text, params)
