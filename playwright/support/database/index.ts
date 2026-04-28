import { Kysely, PostgresDialect } from 'kysely'
import pg from 'pg'
import dotenv from 'dotenv'
import { Database } from './types'
import path from 'path'

// Ensure we load env dynamically from the project root .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') })

const { Pool } = pg

const dialect = new PostgresDialect({
  pool: new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
  })
})

export const db = new Kysely<Database>({
  dialect,
})
