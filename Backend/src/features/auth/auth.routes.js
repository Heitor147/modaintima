import { register, login, logout, me } from './auth.controller.js'

export async function authRoutes(app) {
  const registerSchema = {
    body: {
      type: 'object',
      required: ['email', 'name', 'password', 'passwordConfirm'],
      additionalProperties: false,
      properties: {
        email: { type: 'string', format: 'email' },
        name: { type: 'string', minLength: 1 },
        password: { type: 'string', minLength: 6 },
        passwordConfirm: { type: 'string', minLength: 6 },
      },
    },
  }

  const loginSchema = {
    body: {
      type: 'object',
      required: ['email', 'password'],
      additionalProperties: false,
      properties: {
        email: { type: 'string', format: 'email' },
        password: { type: 'string', minLength: 1 },
      },
    },
  }

  app.post('/auth/register', { schema: registerSchema }, async (req, reply) => {
    return register(req, reply)
  })

  app.post('/auth/login', { schema: loginSchema }, async (req, reply) => {
    return login(req, reply)
  })

  app.post('/auth/logout', { preHandler: [app.authenticate] }, async (req, reply) => {
    return logout(req, reply)
  })

  app.get('/auth/me', { preHandler: [app.authenticate] }, async (req, reply) => {
    return me(req, reply)
  })
}