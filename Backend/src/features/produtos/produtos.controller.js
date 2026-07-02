import * as produtosService from './produtos.service.js'

export const listar = async (req, reply) => {
  const produtos = await produtosService.listar()

  if (produtos.length === 0) {
    return reply.code(200).send({
      message: 'Não há produtos cadastrados ainda!',
      produtos: [],
    })
  }

  return reply.code(200).send({ produtos })
}

export const buscarPorId = async (req, reply) => {
  const produto = await produtosService.buscarPorId(req.params.id)

  return reply.code(200).send({ produto })
}

export const criar = async (req, reply) => {
  const produto = await produtosService.criar(req.body)

  return reply.code(201).send({
    message: 'Produto criado com sucesso',
    produto,
  })
}

export const atualizar = async (req, reply) => {
  const produto = await produtosService.atualizar(req.params.id, req.body)

  return reply.code(200).send({
    message: 'Produto atualizado com sucesso',
    produto,
  })
}

export const remover = async (req, reply) => {
  const result = await produtosService.remover(req.params.id)

  return reply.code(200).send({
    message: result.message,
  })
}