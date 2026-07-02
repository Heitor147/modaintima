import * as clientesService from './clientes.service.js'

export const listar = async (req, reply) => {
  const clientes = await clientesService.listar()

  if (clientes.length === 0) {
    return reply.code(200).send({
      message: 'Não há clientes cadastrados ainda!',
      clientes: [],
    })
  }

  return reply.code(200).send({ clientes })
}

export const buscarPorId = async (req, reply) => {
  const cliente = await clientesService.buscarPorId(req.params.id)

  return reply.code(200).send({ cliente })
}

export const criar = async (req, reply) => {
  const cliente = await clientesService.criar(req.body)

  return reply.code(201).send({
    message: 'Cliente criado com sucesso',
    cliente,
  })
}

export const atualizar = async (req, reply) => {
  const cliente = await clientesService.atualizar(req.params.id, req.body)

  return reply.code(200).send({
    message: 'Cliente atualizado com sucesso',
    cliente,
  })
}

export const inativar = async (req, reply) => {
  const result = await clientesService.inativar(req.params.id)

  return reply.code(200).send({
    message: result.message,
  })
}