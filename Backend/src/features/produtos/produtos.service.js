import * as produtosRepository from './produtos.repository.js'
import { AppError } from '../../core/errors/app-error.js'

const invalidIdMessage = 'ID do produto inválido'
const notFoundMessage = 'Produto não encontrado'

const parseProductId = (value) => {
  const id = Number(value)
  return Number.isInteger(id) && id > 0 ? id : null
}

const normalizeProductPayload = (payload = {}) => ({
  nome: payload.nome,
  categoria: payload.categoria ?? null,
  cor: payload.cor ?? null,
  tamanho: payload.tamanho ?? null,
  preco_custo: payload.preco_custo ?? null,
  preco_venda: payload.preco_venda ?? null,
  preco_unitario: payload.preco_unitario ?? null,
  estoque_minimo: payload.estoque_minimo ?? 0,
  ativo: typeof payload.ativo === 'undefined' ? 1 : payload.ativo,
})

export const listar = async () => {
  return produtosRepository.findAll()
}

export const buscarPorId = async (idValue) => {
  const id = parseProductId(idValue)

  if (!id) {
    throw new AppError(invalidIdMessage, 400)
  }

  const produto = await produtosRepository.findById(id)

  if (!produto) {
    throw new AppError(notFoundMessage, 404)
  }

  return produto
}

export const criar = async (payload) => {
  const normalizedPayload = normalizeProductPayload(payload)

  if (!normalizedPayload.nome) {
    throw new AppError('Nome do produto é obrigatório', 400)
  }

  const produtoId = await produtosRepository.create(normalizedPayload)
  return produtosRepository.findById(produtoId)
}

export const atualizar = async (idValue, payload) => {
  const id = parseProductId(idValue)

  if (!id) {
    throw new AppError(invalidIdMessage, 400)
  }

  const produtoAtual = await produtosRepository.findById(id)

  if (!produtoAtual) {
    throw new AppError(notFoundMessage, 404)
  }

  const normalizedPayload = normalizeProductPayload({
    ...produtoAtual,
    ...payload,
  })

  await produtosRepository.update(id, normalizedPayload)

  return produtosRepository.findById(id)
}

export const remover = async (idValue) => {
  const id = parseProductId(idValue)

  if (!id) {
    throw new AppError(invalidIdMessage, 400)
  }

  const produto = await produtosRepository.findById(id)

  if (!produto) {
    throw new AppError(notFoundMessage, 404)
  }

  await produtosRepository.remove(id)

  return { message: 'Produto inativado com sucesso' }
}