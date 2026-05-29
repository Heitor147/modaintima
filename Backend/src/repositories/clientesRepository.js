import db from '../db/connection.js'

const BAD_FIELD_ERROR = 'ER_BAD_FIELD_ERROR'
const DUPLICATE_ENTRY_ERROR = 'ER_DUP_ENTRY'

function normalizeClient(row) {
  if (!row) return null

  return {
    id: row.id,
    nome: row.nome,
    cpf: row.cpf ?? null,
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
      'SELECT id, nome, cpf, telefone, email, endereco, ativo, criado_em FROM clientes ORDER BY id DESC'
    )

    return rows.map(normalizeClient)
  } catch (err) {
    if (err?.code !== BAD_FIELD_ERROR) throw err

    const [rows] = await db.query('SELECT id, nome, cpf FROM clientes ORDER BY id DESC')
    return rows.map(normalizeClient)
  }
}

export const findById = async (clienteId) => {
  try {
    const [rows] = await db.query(
      'SELECT id, nome, cpf, telefone, email, endereco, ativo, criado_em FROM clientes WHERE id = ? LIMIT 1',
      [clienteId]
    )

    return normalizeClient(rows?.[0] || null)
  } catch (err) {
    if (err?.code !== BAD_FIELD_ERROR) throw err

    const [rows] = await db.query('SELECT id, nome, cpf FROM clientes WHERE id = ? LIMIT 1', [clienteId])
    return normalizeClient(rows?.[0] || null)
  }
}

const mapDuplicateEntryError = (err) => {
  const message = String(err?.sqlMessage || err?.message || '')

  if (message.includes('cpf')) {
    const duplicateError = new Error('Já existe um cliente cadastrado com este CPF.')
    duplicateError.statusCode = 400
    duplicateError.duplicateField = 'cpf'
    return duplicateError
  }

  if (message.includes('email')) {
    const duplicateError = new Error('Já existe um cliente cadastrado com este e-mail.')
    duplicateError.statusCode = 400
    duplicateError.duplicateField = 'email'
    return duplicateError
  }

  return err
}

export const create = async ({ nome, cpf, telefone, email, endereco, ativo }) => {
  try {
    const [result] = await db.query(
      `INSERT INTO clientes
        (nome, cpf, telefone, email, endereco, ativo)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nome, cpf, telefone, email, endereco, ativo]
    )

    return result.insertId
  } catch (err) {
    if (err?.code === DUPLICATE_ENTRY_ERROR) {
      throw mapDuplicateEntryError(err)
    }

    throw err
  }
}

export const update = async (clienteId, { nome, cpf, telefone, email, endereco, ativo }) => {
  try {
    const [result] = await db.query(
      `UPDATE clientes
          SET nome = ?, cpf = ?, telefone = ?, email = ?, endereco = ?, ativo = ?
        WHERE id = ?`,
      [nome, cpf, telefone, email, endereco, ativo, clienteId]
    )

    return result.affectedRows
  } catch (err) {
    if (err?.code === DUPLICATE_ENTRY_ERROR) {
      throw mapDuplicateEntryError(err)
    }

    throw err
  }
}

export const inactivate = async (clienteId) => {
  const [result] = await db.query('UPDATE clientes SET ativo = 0 WHERE id = ?', [clienteId])

  return result.affectedRows
}

export const findByEmail = async (email, excludeId = null) => {
  const params = [email]
  let sql = 'SELECT id, nome, cpf, telefone, email, endereco, ativo, criado_em FROM clientes WHERE email = ?'

  if (excludeId) {
    sql += ' AND id <> ?'
    params.push(excludeId)
  }

  sql += ' LIMIT 1'

  const [rows] = await db.query(sql, params)
  return normalizeClient(rows?.[0] || null)
}

export const findByTelefone = async (telefone, excludeId = null) => {
  const params = [telefone]
  let sql = 'SELECT id, nome, cpf, telefone, email, endereco, ativo, criado_em FROM clientes WHERE telefone = ?'

  if (excludeId) {
    sql += ' AND id <> ?'
    params.push(excludeId)
  }

  sql += ' LIMIT 1'

  const [rows] = await db.query(sql, params)
  return normalizeClient(rows?.[0] || null)
}

export const findByCpf = async (cpf, excludeId = null) => {
  const params = [cpf]
  let sql = 'SELECT id, nome, cpf, telefone, email, endereco, ativo, criado_em FROM clientes WHERE cpf = ?'

  if (excludeId) {
    sql += ' AND id <> ?'
    params.push(excludeId)
  }

  sql += ' LIMIT 1'

  const [rows] = await db.query(sql, params)
  return normalizeClient(rows?.[0] || null)
}
