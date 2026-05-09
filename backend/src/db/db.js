import dotenv from 'dotenv'
import mysql from 'mysql2/promise'

dotenv.config()

export const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  port: process.env.MYSQL_PORT ? Number(process.env.MYSQL_PORT) : 3306,
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'balaji_overseas',
  waitForConnections: true,
  connectionLimit: 10,
  namedPlaceholders: false,
})

export async function withTransaction(fn) {
  const conn = await pool.getConnection()
  try {
    await conn.query('START TRANSACTION')
    const result = await fn(conn)
    await conn.query('COMMIT')
    return result
  } catch (e) {
    await conn.query('ROLLBACK')
    throw e
  } finally {
    conn.release()
  }
}
