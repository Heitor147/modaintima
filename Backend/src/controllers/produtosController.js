import * as produtosService from '../services/produtosService.js'

export const listar = async (req, reply) => {
  try {
    const produtos = await produtosService.listar()

    if (produtos.length === 0) {
      return reply.code(200).send({
        message: 'Não há produtos cadastrados ainda!',
        produtos: [],
      })
    }

    return reply.code(200).send({ produtos })
  } catch (err) {
    req.log.error(err)
    return reply.code(500).send({
      error: 'Internal Server Error',
      message: 'Erro interno',
    })
  }
}

export const buscarPorId = async (req, reply) => {
  try {
    const produto = await produtosService.buscarPorId(req.params.id)

    return reply.code(200).send({ produto })
  } catch (err) {
    req.log.error(err)
    if (err.statusCode === 400) {
      return reply.code(400).send({
        error: 'Bad Request',
        message: err.message,
      })
    }

    if (err.statusCode === 404) {
      return reply.code(404).send({
        error: 'Not Found',
        message: err.message,
      })
    }

    return reply.code(500).send({
      error: 'Internal Server Error',
      message: 'Erro interno',
    })
  }
}

export const criar = async (req, reply) => {
  try {
    const produto = await produtosService.criar(req.body)

    return reply.code(201).send({
      message: 'Produto criado com sucesso',
      produto,
    })
  } catch (err) {
    req.log.error(err)
    if (err.statusCode === 400) {
      return reply.code(400).send({
        error: 'Bad Request',
        message: err.message,
      })
    }

    return reply.code(500).send({
      error: 'Internal Server Error',
      message: 'Erro interno',
    })
  }
}

export const atualizar = async (req, reply) => {
  try {
    const produto = await produtosService.atualizar(req.params.id, req.body)

    return reply.code(200).send({
      message: 'Produto atualizado com sucesso',
      produto,
    })
  } catch (err) {
    req.log.error(err)
    if (err.statusCode === 400) {
      return reply.code(400).send({
        error: 'Bad Request',
        message: err.message,
      })
    }

    if (err.statusCode === 404) {
      return reply.code(404).send({
        error: 'Not Found',
        message: err.message,
      })
    }

    return reply.code(500).send({
      error: 'Internal Server Error',
      message: 'Erro interno',
    })
  }
}

export const remover = async (req, reply) => {
  try {
    const result = await produtosService.remover(req.params.id)

    return reply.code(200).send({
      message: result.message,
    })
  } catch (err) {
    req.log.error(err)
    if (err.statusCode === 400) {
      return reply.code(400).send({
        error: 'Bad Request',
        message: err.message,
      })
    }

    if (err.statusCode === 404) {
      return reply.code(404).send({
        error: 'Not Found',
        message: err.message,
      })
    }

    return reply.code(500).send({
      error: 'Internal Server Error',
      message: 'Erro interno',
    })
  }
}