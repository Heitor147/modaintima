import crypto from 'crypto'

export async function withTransaction(pool, fn) {
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()
    const result = await fn(conn)
    await conn.commit()
    return result
  } catch (err) {
    try {
      await conn.rollback()
    } catch (e) {
      // ignore rollback error
    }
    throw err
  } finally {
    conn.release()
  }
}

export function newCorrelationId() {
  return crypto.randomUUID?.() || crypto.randomBytes(16).toString('hex')
}
