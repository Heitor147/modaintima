import * as clientesService from '../services/clientesService.js'

export const listar = async (req, reply) => {
  try {
    const clientes = await clientesService.listar()

    if (clientes.length === 0) {
      return reply.code(200).send({
        message: 'Não há clientes cadastrados ainda!',
        clientes: [],
      })
    }

    return reply.code(200).send({ clientes })
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
    const cliente = await clientesService.buscarPorId(req.params.id)

    return reply.code(200).send({ cliente })
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
    const cliente = await clientesService.criar(req.body)

    return reply.code(201).send({
      message: 'Cliente criado com sucesso',
      cliente,
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
    const cliente = await clientesService.atualizar(req.params.id, req.body)

    return reply.code(200).send({
      message: 'Cliente atualizado com sucesso',
      cliente,
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

export const inativar = async (req, reply) => {
  try {
    const result = await clientesService.inativar(req.params.id)

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
