import db from '../db/connection.js'

const BAD_FIELD_ERROR = 'ER_BAD_FIELD_ERROR'

function normalizeProduct(row) {
  if (!row) return null

  return {
    id: row.id,
    nome: row.nome,
    categoria: row.categoria ?? null,
    cor: row.cor ?? null,
    tamanho: row.tamanho ?? null,
    preco_custo: row.preco_custo ?? null,
    preco_venda: row.preco_venda ?? null,
    preco_unitario: row.preco_unitario ?? null,
    estoque_minimo: typeof row.estoque_minimo === 'undefined' ? 0 : row.estoque_minimo,
    ativo: typeof row.ativo === 'undefined' ? 1 : row.ativo,
    criado_em: row.criado_em ?? null,
  }
}

export const findAll = async () => {
  try {
    const [rows] = await db.query(
      'SELECT id, nome, categoria, cor, tamanho, preco_custo, preco_venda, preco_unitario, estoque_minimo, ativo, criado_em FROM produtos ORDER BY id DESC'
    )

    return rows.map(normalizeProduct)
  } catch (err) {
    if (err?.code !== BAD_FIELD_ERROR) throw err

    const [rows] = await db.query('SELECT id, nome FROM produtos ORDER BY id DESC')
    return rows.map(normalizeProduct)
  }
}

export const findById = async (produtoId) => {
  try {
    const [rows] = await db.query(
      'SELECT id, nome, categoria, cor, tamanho, preco_custo, preco_venda, preco_unitario, estoque_minimo, ativo, criado_em FROM produtos WHERE id = ? LIMIT 1',
      [produtoId]
    )

    return normalizeProduct(rows?.[0] || null)
  } catch (err) {
    if (err?.code !== BAD_FIELD_ERROR) throw err

    const [rows] = await db.query('SELECT id, nome FROM produtos WHERE id = ? LIMIT 1', [produtoId])
    return normalizeProduct(rows?.[0] || null)
  }
}

export const create = async ({
  nome,
  categoria,
  cor,
  tamanho,
  preco_custo,
  preco_venda,
  preco_unitario,
  estoque_minimo,
  ativo,
}) => {
  const [result] = await db.query(
    `INSERT INTO produtos
      (nome, categoria, cor, tamanho, preco_custo, preco_venda, preco_unitario, estoque_minimo, ativo)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [nome, categoria, cor, tamanho, preco_custo, preco_venda, preco_unitario, estoque_minimo, ativo]
  )

  return result.insertId
}

export const update = async (
  produtoId,
  { nome, categoria, cor, tamanho, preco_custo, preco_venda, preco_unitario, estoque_minimo, ativo }
) => {
  const [result] = await db.query(
    `UPDATE produtos
        SET nome = ?,
            categoria = ?,
            cor = ?,
            tamanho = ?,
            preco_custo = ?,
            preco_venda = ?,
            preco_unitario = ?,
            estoque_minimo = ?,
            ativo = ?
      WHERE id = ?`,
    [nome, categoria, cor, tamanho, preco_custo, preco_venda, preco_unitario, estoque_minimo, ativo, produtoId]
  )

  return result.affectedRows
}

export const remove = async (produtoId) => {
  const [result] = await db.query('UPDATE produtos SET ativo = 0 WHERE id = ?', [produtoId])

  return result.affectedRows
}