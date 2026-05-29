import db from '../db/connection.js'

const BAD_FIELD_ERROR = 'ER_BAD_FIELD_ERROR'

function normalizeClient(row) {
  if (!row) return null

  return {
    id: row.id,
    nome: row.nome,
    telefone: row.telefone ?? null,
    email: row.email ?? null,
    endereco: row.endereco ?? null,
    ativo: typeof row.ativo === 'undefined' ? 1 : row.ativo,
    criado_em: row.criado_em ?? null,
  }
}

export const findAll = async () => {
  try {
    const [rows] = await db.query(
      'SELECT id, nome, telefone, email, endereco, ativo, criado_em FROM clientes ORDER BY id DESC'
    )

    return rows.map(normalizeClient)
  } catch (err) {
    if (err?.code !== BAD_FIELD_ERROR) throw err

    const [rows] = await db.query('SELECT id, nome FROM clientes ORDER BY id DESC')
    return rows.map(normalizeClient)
  }
}

export const findById = async (clienteId) => {
  try {
    const [rows] = await db.query(
      'SELECT id, nome, telefone, email, endereco, ativo, criado_em FROM clientes WHERE id = ? LIMIT 1',
      [clienteId]
    )

    return normalizeClient(rows?.[0] || null)
  } catch (err) {
    if (err?.code !== BAD_FIELD_ERROR) throw err

    const [rows] = await db.query('SELECT id, nome FROM clientes WHERE id = ? LIMIT 1', [clienteId])
    return normalizeClient(rows?.[0] || null)
  }
}

export const create = async ({ nome, telefone, email, endereco, ativo }) => {
  const [result] = await db.query(
    `INSERT INTO clientes
      (nome, telefone, email, endereco, ativo)
     VALUES (?, ?, ?, ?, ?)`,
    [nome, telefone, email, endereco, ativo]
  )

  return result.insertId
}

export const update = async (clienteId, { nome, telefone, email, endereco, ativo }) => {
  const [result] = await db.query(
    `UPDATE clientes
        SET nome = ?, telefone = ?, email = ?, endereco = ?, ativo = ?
      WHERE id = ?`,
    [nome, telefone, email, endereco, ativo, clienteId]
  )

  return result.affectedRows
}

export const inactivate = async (clienteId) => {
  const [result] = await db.query('UPDATE clientes SET ativo = 0 WHERE id = ?', [clienteId])

  return result.affectedRows
}
