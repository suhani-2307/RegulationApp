import dotenv from 'dotenv'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import pg from 'pg'

// Always load server/.env, no matter which folder the server is started from
const envPath = fileURLToPath(new URL('./.env', import.meta.url))
dotenv.config({ path: envPath })

if (!process.env.DATABASE_URL) {
  console.error(
    existsSync(envPath)
      ? `${envPath} was found but has no DATABASE_URL line. Add: DATABASE_URL=postgres://USER:PASSWORD@localhost:5432/DBNAME`
      : `No .env file at ${envPath}. Create it with: DATABASE_URL=postgres://USER:PASSWORD@localhost:5432/DBNAME`,
  )
  process.exit(1)
}

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  // Set DATABASE_SSL=true for hosted databases that require SSL
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
})

export const query = (text, params) => pool.query(text, params)
