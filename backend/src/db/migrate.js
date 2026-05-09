import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import mysql from 'mysql2/promise'

dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), '../../.env') })

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function main() {
  const host = process.env.MYSQL_HOST || 'localhost'
  const port = process.env.MYSQL_PORT ? Number(process.env.MYSQL_PORT) : 3306
  const user = process.env.MYSQL_USER || 'root'
  const password = process.env.MYSQL_PASSWORD || ''
  const database = process.env.MYSQL_DATABASE || 'balaji_overseas'

  if (!database) {
    console.error('MYSQL_DATABASE is not set. Copy backend/.env.example to backend/.env')
    process.exit(1)
  }
  const conn = await mysql.createConnection({ host, port, user, password, database, multipleStatements: true })
  try {
    await conn.query(
      `CREATE TABLE IF NOT EXISTS schema_migrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    )
    const dir = path.join(__dirname, 'migrations')
    const files = fs
      .readdirSync(dir)
      .filter((f) => f.endsWith('.sql'))
      .sort()

    for (const file of files) {
      const [rows] = await conn.query('SELECT 1 FROM schema_migrations WHERE name = ?', [file])
      if (rows.length) continue
      const sql = fs.readFileSync(path.join(dir, file), 'utf8')
      try {
        await conn.query('START TRANSACTION')
        await conn.query(sql)
        await conn.query('INSERT INTO schema_migrations (name) VALUES (?)', [file])
        await conn.query('COMMIT')
        console.log('Applied migration:', file)
      } catch (e) {
        await conn.query('ROLLBACK')
        throw e
      }
    }
    console.log('Migrations complete.')
  } finally {
    await conn.end()
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
