import db from '../db/connection.js'

const BAD_FIELD_ERROR = 'ER_BAD_FIELD_ERROR'

function normalizeUser(row) {
  if (!row) return null

  return {
    id: row.id,
    email: row.email,
    senha_hash: row.senha_hash,
    nome: row.nome,
    perfil: row.perfil || 'usuario',
    ativo: typeof row.ativo === 'undefined' ? 1 : row.ativo,
  }
}

export const findByEmail = async (email) => {
  try {
    const [rows] = await db.query(
      'SELECT id, email, senha_hash, nome, perfil, ativo FROM usuarios WHERE email = ? LIMIT 1',
      [email]
    )

    return normalizeUser(rows?.[0] || null)
  } catch (err) {
    if (err?.code !== BAD_FIELD_ERROR) throw err

    const [rows] = await db.query(
      'SELECT id, email, senha_hash, nome FROM usuarios WHERE email = ? LIMIT 1',
      [email]
    )

    return normalizeUser(rows?.[0] || null)
  }
}

export const findById = async (userId) => {
  try {
    const [rows] = await db.query(
      'SELECT id, email, nome, perfil, ativo FROM usuarios WHERE id = ? LIMIT 1',
      [userId]
    )

    const user = rows?.[0] || null
    if (!user) return null

    return {
      id: user.id,
      email: user.email,
      nome: user.nome,
      perfil: user.perfil || 'usuario',
      ativo: typeof user.ativo === 'undefined' ? 1 : user.ativo,
    }
  } catch (err) {
    if (err?.code !== BAD_FIELD_ERROR) throw err

    const [rows] = await db.query('SELECT id, email, nome FROM usuarios WHERE id = ? LIMIT 1', [userId])
    const user = rows?.[0] || null
    if (!user) return null

    return {
      id: user.id,
      email: user.email,
      nome: user.nome,
      perfil: 'usuario',
      ativo: 1,
    }
  }
}

export const create = async ({ email, nome, senhaHash }) => {
  const [result] = await db.query(
    'INSERT INTO usuarios (email, nome, senha_hash) VALUES (?, ?, ?)',
    [email, nome, senhaHash]
  )

  return result.insertId
}

export const emailExists = async (email) => {
  const [rows] = await db.query(
    'SELECT id FROM usuarios WHERE email = ? LIMIT 1',
    [email]
  )

  return rows.length > 0
}
