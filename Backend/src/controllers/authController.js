/**
 * Auth Controller
 * Responsável por:
 * 1. Validar entrada (formato, tipos)
 * 2. Chamar o service com os dados validados
 * 3. Retornar resposta HTTP apropriada
 * 
 * NÃO faz:
 * - Queries SQL diretas (usa service/repository)
 * - Lógica de negócio (usa service)
 */

import * as authService from '../services/authService.js'

export const register = async (req, reply) => {
  try {
    const { email, name, password, passwordConfirm } = req.body

    // Validação de entrada
    if (!email || !name || !password || !passwordConfirm) {
      return reply.code(400).send({
        error: 'Email, nome, senha e confirmação de senha são obrigatórios',
      })
    }

    if (password !== passwordConfirm) {
      return reply.code(400).send({
        error: 'As senhas não conferem',
      })
    }

    if (typeof email !== 'string' || typeof name !== 'string') {
      return reply.code(400).send({
        error: 'Email e nome devem ser textos',
      })
    }

    // Chamar service (lógica de negócio)
    const user = await authService.register(req.server.db, email, name, password)

    // Gerar token JWT
    const token = await reply.jwtSign(
      { userId: user.id, email: user.email },
      { expiresIn: '24h' }
    )

    return reply.code(201).send({
      message: 'Usuário registrado com sucesso',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.nome,
      },
    })
  } catch (err) {
    req.log.error(err)

    if (err.message.includes('Email já cadastrado')) {
      return reply.code(409).send({
        error: err.message,
      })
    }

    if (err.message.includes('Senha deve ter')) {
      return reply.code(400).send({
        error: err.message,
      })
    }

    return reply.code(500).send({
      error: 'Erro ao registrar usuário',
      message: err.message,
    })
  }
}

export const login = async (req, reply) => {
  try {
    const { email, password } = req.body

    // Validação de entrada
    if (!email || !password) {
      return reply.code(400).send({
        error: 'Email e senha são obrigatórios',
      })
    }

    if (typeof email !== 'string' || typeof password !== 'string') {
      return reply.code(400).send({
        error: 'Email e senha devem ser textos',
      })
    }

    // Chamar service (lógica de negócio)
    const user = await authService.login(req.server.db, email, password)

    // Gerar token JWT
    const token = await reply.jwtSign(
      { userId: user.id, email: user.email },
      { expiresIn: '24h' }
    )

    return reply.code(200).send({
      message: 'Login realizado com sucesso',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.nome,
      },
    })
  } catch (err) {
    req.log.error(err)

    if (err.message.includes('Credenciais inválidas')) {
      return reply.code(401).send({
        error: err.message,
      })
    }

    return reply.code(500).send({
      error: 'Erro ao realizar login',
      message: err.message,
    })
  }
}

export const logout = async (req, reply) => {
  try {
    // Chamar service (para lógica futura de blacklist)
    const result = await authService.logout(req.user.userId)

    return reply.code(200).send(result)
  } catch (err) {
    req.log.error(err)
    return reply.code(500).send({
      error: 'Erro ao realizar logout',
      message: err.message,
    })
  }
}

export const me = async (req, reply) => {
  try {
    // Buscar dados completos do usuário
    const user = await authService.getUserById(req.server.db, req.user.userId)

    return reply.code(200).send({
      user,
    })
  } catch (err) {
    req.log.error(err)
    return reply.code(500).send({
      error: 'Erro ao buscar dados do usuário',
      message: err.message,
    })
  }
}
