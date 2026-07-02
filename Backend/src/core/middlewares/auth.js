import { AppError } from '../errors/app-error.js'

export const AUTH_COOKIE_NAME = 'modaintima_token'

export const AUTH_COOKIE_OPTIONS = Object.freeze({
  path: '/',
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 60 * 60 * 24,
})

export const authenticate = async (req, reply) => {
  try {
    await req.jwtVerify()
  } catch {
    throw new AppError('Token inválido ou ausente.', 401)
  }
}