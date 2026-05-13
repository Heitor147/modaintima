import 'dotenv/config'
import db from './connection.js'

async function run() {
  try {
    const [rows] = await db.query('SELECT 1 AS ok')
    console.log('DB OK', rows)
    await db.end()
    process.exit(0)
  } catch (err) {
    console.error('DB ERROR', err.message)
    process.exit(1)
  }
}

run()
