/**
 * User Repository
 * Responsável APENAS por operações SQL
 * Sem lógica de negócio, sem validações, sem hash de senha
 */

export const findByEmail = async (db, email) => {
  const [rows] = await db.query(
    'SELECT id, email, senha_hash, nome FROM usuarios WHERE email = ? LIMIT 1',
    [email]
  )
  return rows?.[0] || null
}

export const findById = async (db, userId) => {
  const [rows] = await db.query(
    'SELECT id, email, nome FROM usuarios WHERE id = ? LIMIT 1',
    [userId]
  )
  return rows?.[0] || null
}

export const create = async (db, { email, nome, senhaHash }) => {
  const [result] = await db.query(
    'INSERT INTO usuarios (email, nome, senha_hash) VALUES (?, ?, ?)',
    [email, nome, senhaHash]
  )
  return result.insertId
}

export const findByEmailWithPassword = async (db, email) => {
  const [rows] = await db.query(
    'SELECT id, email, senha_hash, nome FROM usuarios WHERE email = ? LIMIT 1',
    [email]
  )
  return rows?.[0] || null
}

export const emailExists = async (db, email) => {
  const [rows] = await db.query(
    'SELECT id FROM usuarios WHERE email = ? LIMIT 1',
    [email]
  )
  return rows.length > 0
}
