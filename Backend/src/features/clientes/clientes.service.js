import * as clientesRepository from './clientes.repository.js'
import { AppError } from '../../core/errors/app-error.js'

const invalidIdMessage = 'ID do cliente inválido'
const notFoundMessage = 'Cliente não encontrado'

const parseClientId = (value) => {
  const id = Number(value)
  return Number.isInteger(id) && id > 0 ? id : null
}

const normalizeClientPayload = (payload = {}) => ({
  nome: payload.nome,
  cpf: payload.cpf ?? null,
  telefone: payload.telefone ?? null,
  email: payload.email ?? null,
  endereco: payload.endereco ?? null,
  ativo: typeof payload.ativo === 'undefined' ? 1 : payload.ativo,
})

const buildDuplicateFieldError = (field) => {
  return new AppError(
    field === 'cpf'
      ? 'Já existe um cliente cadastrado com este CPF.'
      : field === 'telefone'
        ? 'Já existe um cliente cadastrado com este telefone.'
        : 'Já existe um cliente cadastrado com este e-mail.',
    400,
    {
      code: 'DUPLICATE_CLIENT_DATA',
      details: { field },
    }
  )
}

const checkDuplicateClientData = async (payload, excludeId = null) => {
  if (payload.cpf) {
    const duplicateByCpf = await clientesRepository.findByCpf(payload.cpf, excludeId)

    if (duplicateByCpf) {
      throw buildDuplicateFieldError('cpf')
    }
  }

  if (payload.email) {
    const duplicateByEmail = await clientesRepository.findByEmail(payload.email, excludeId)

    if (duplicateByEmail) {
      throw buildDuplicateFieldError('email')
    }
  }

  if (payload.telefone) {
    const duplicateByTelefone = await clientesRepository.findByTelefone(payload.telefone, excludeId)

    if (duplicateByTelefone) {
      throw buildDuplicateFieldError('telefone')
    }
  }
}

export const listar = async () => {
  return clientesRepository.findAll()
}

export const buscarPorId = async (idValue) => {
  const id = parseClientId(idValue)

  if (!id) {
    throw new AppError(invalidIdMessage, 400)
  }

  const cliente = await clientesRepository.findById(id)

  if (!cliente) {
    throw new AppError(notFoundMessage, 404)
  }

  return cliente
}

export const criar = async (payload) => {
  const normalizedPayload = normalizeClientPayload(payload)

  if (!normalizedPayload.nome) {
    throw new AppError('Nome do cliente é obrigatório', 400)
  }

  if (!normalizedPayload.cpf) {
    throw new AppError('CPF do cliente é obrigatório', 400)
  }

  if (normalizedPayload.cpf && !String(normalizedPayload.cpf).trim()) {
    normalizedPayload.cpf = null
  }

  await checkDuplicateClientData(normalizedPayload)

  const clienteId = await clientesRepository.create(normalizedPayload)
  return clientesRepository.findById(clienteId)
}

export const atualizar = async (idValue, payload) => {
  const id = parseClientId(idValue)

  if (!id) {
    throw new AppError(invalidIdMessage, 400)
  }

  const clienteAtual = await clientesRepository.findById(id)

  if (!clienteAtual) {
    throw new AppError(notFoundMessage, 404)
  }

  const normalizedPayload = normalizeClientPayload({
    ...clienteAtual,
    ...payload,
  })

  await checkDuplicateClientData(normalizedPayload, id)

  await clientesRepository.update(id, normalizedPayload)

  return clientesRepository.findById(id)
}

export const inativar = async (idValue) => {
  const id = parseClientId(idValue)

  if (!id) {
    throw new AppError(invalidIdMessage, 400)
  }

  const cliente = await clientesRepository.findById(id)

  if (!cliente) {
    throw new AppError(notFoundMessage, 404)
  }

  await clientesRepository.inactivate(id)

  return { message: 'Cliente inativado com sucesso' }
}