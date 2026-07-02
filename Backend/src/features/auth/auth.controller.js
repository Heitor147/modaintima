import * as authService from './auth.service.js'
import { AUTH_COOKIE_NAME, AUTH_COOKIE_OPTIONS } from '../../core/middlewares/auth.js'
import { AppError } from '../../core/errors/app-error.js'

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
  const { email, name, password, passwordConfirm } = req.body

  if (password !== passwordConfirm) {
    throw new AppError('As senhas não conferem', 400)
  }

  const user = await authService.register(email, name, password)
  const token = await signUserToken(reply, user)

  reply.setCookie(AUTH_COOKIE_NAME, token, AUTH_COOKIE_OPTIONS)

  return reply.code(201).send({
    message: 'Usuário registrado com sucesso',
    user: {
      id: user.id,
      email: user.email,
      name: user.nome,
      perfil: user.perfil,
    },
  })
}

export const login = async (req, reply) => {
  const { email, password } = req.body

  const user = await authService.login(email, password)
  const token = await signUserToken(reply, user)

  reply.setCookie(AUTH_COOKIE_NAME, token, AUTH_COOKIE_OPTIONS)

  return reply.code(200).send({
    message: 'Login realizado com sucesso',
    user: {
      id: user.id,
      email: user.email,
      name: user.nome,
      perfil: user.perfil,
    },
  })
}

export const logout = async (req, reply) => {
  const result = await authService.logout(req.user.sub)

  reply.clearCookie(AUTH_COOKIE_NAME, {
    path: AUTH_COOKIE_OPTIONS.path,
  })

  return reply.code(200).send(result)
}

export const me = async (req, reply) => {
  const currentUser = await authService.getUserById(req.user.sub)

  return reply.code(200).send({
    user: {
      sub: req.user.sub,
      email: currentUser.email || req.user.email,
      perfil: currentUser.perfil || req.user.perfil || 'usuario',
    },
  })
}