import * as clientesRepository from '../repositories/clientesRepository.js'

const invalidIdMessage = 'ID do cliente inválido'
const notFoundMessage = 'Cliente não encontrado'

const parseClientId = (value) => {
  const id = Number(value)
  return Number.isInteger(id) && id > 0 ? id : null
}

const normalizeClientPayload = (payload = {}) => ({
  nome: payload.nome,
  telefone: payload.telefone ?? null,
  email: payload.email ?? null,
  endereco: payload.endereco ?? null,
  ativo: typeof payload.ativo === 'undefined' ? 1 : payload.ativo,
})

export const listar = async () => {
  return clientesRepository.findAll()
}

export const buscarPorId = async (idValue) => {
  const id = parseClientId(idValue)

  if (!id) {
    const error = new Error(invalidIdMessage)
    error.statusCode = 400
    throw error
  }

  const cliente = await clientesRepository.findById(id)

  if (!cliente) {
    const error = new Error(notFoundMessage)
    error.statusCode = 404
    throw error
  }

  return cliente
}

export const criar = async (payload) => {
  const normalizedPayload = normalizeClientPayload(payload)

  if (!normalizedPayload.nome) {
    const error = new Error('Nome do cliente é obrigatório')
    error.statusCode = 400
    throw error
  }

  const clienteId = await clientesRepository.create(normalizedPayload)
  return clientesRepository.findById(clienteId)
}

export const atualizar = async (idValue, payload) => {
  const id = parseClientId(idValue)

  if (!id) {
    const error = new Error(invalidIdMessage)
    error.statusCode = 400
    throw error
  }

  const clienteAtual = await clientesRepository.findById(id)

  if (!clienteAtual) {
    const error = new Error(notFoundMessage)
    error.statusCode = 404
    throw error
  }

  const normalizedPayload = normalizeClientPayload({
    ...clienteAtual,
    ...payload,
  })

  await clientesRepository.update(id, normalizedPayload)

  return clientesRepository.findById(id)
}

export const inativar = async (idValue) => {
  const id = parseClientId(idValue)

  if (!id) {
    const error = new Error(invalidIdMessage)
    error.statusCode = 400
    throw error
  }

  const cliente = await clientesRepository.findById(id)

  if (!cliente) {
    const error = new Error(notFoundMessage)
    error.statusCode = 404
    throw error
  }

  await clientesRepository.inactivate(id)

  return { message: 'Cliente inativado com sucesso' }
}
