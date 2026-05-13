import * as authService from '../services/authService.js'

const invalidCredentialsMessage = 'Credenciais inválidas'

const signUserToken = (reply, user) => {
  return reply.jwtSign(
    {
      sub: user.id,
      email: user.email,
      perfil: user.perfil || 'usuario',
    },
    { expiresIn: '24h' }
  )
}

export const register = async (req, reply) => {
  try {
    const { email, name, password, passwordConfirm } = req.body

    if (password !== passwordConfirm) {
      return reply.code(400).send({
        error: 'Bad Request',
        message: 'As senhas não conferem',
      })
    }

    const user = await authService.register(email, name, password)
    const token = await signUserToken(reply, user)

    return reply.code(201).send({
      message: 'Usuário registrado com sucesso',
      token,
      user: {
        id: user.id,
        email: user.email,
        nome: user.nome,
        perfil: user.perfil,
      },
    })
  } catch (err) {
    req.log.error(err)

    if (err.message.includes('Email já cadastrado')) {
      return reply.code(409).send({
        error: 'Conflict',
        message: err.message,
      })
    }

    if (err.message.includes('Senha deve ter')) {
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

export const login = async (req, reply) => {
  try {
    const { email, password } = req.body

    const user = await authService.login(email, password)
    const token = await signUserToken(reply, user)

    return reply.code(200).send({
      message: 'Login realizado com sucesso',
      token,
      user: {
        id: user.id,
        email: user.email,
        nome: user.nome,
        perfil: user.perfil,
      },
    })
  } catch (err) {
    req.log.error(err)

    if (err.message.includes(invalidCredentialsMessage)) {
      return reply.code(401).send({
        error: 'Unauthorized',
        message: invalidCredentialsMessage,
      })
    }

    return reply.code(500).send({
      error: 'Internal Server Error',
      message: 'Erro interno',
    })
  }
}

export const logout = async (req, reply) => {
  try {
    const result = await authService.logout(req.user.sub)

    return reply.code(200).send(result)
  } catch (err) {
    req.log.error(err)
    return reply.code(500).send({
      error: 'Internal Server Error',
      message: 'Erro interno',
    })
  }
}

export const me = async (req, reply) => {
  const { sub, email, perfil } = req.user

  return reply.code(200).send({
    user: {
      sub,
      email,
      perfil,
    },
  })
}
