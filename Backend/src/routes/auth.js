import { register, login, logout, me } from '../controllers/authController.js'

export async function authRoutes(app) {
  const registerSchema = {
    body: {
      type: 'object',
      required: ['email', 'name', 'password', 'passwordConfirm'],
      properties: {
        email: { type: 'string', format: 'email' },
        name: { type: 'string' },
        password: { type: 'string', minLength: 6 },
        passwordConfirm: { type: 'string' },
      },
    },
  }

  const loginSchema = {
    body: {
      type: 'object',
      required: ['email', 'password'],
      properties: {
        email: { type: 'string', format: 'email' },
        password: { type: 'string' },
      },
    },
  }

  // Rota pública de registro
  app.post('/auth/register', { schema: registerSchema }, async (req, reply) => {
    return register(req, reply)
  })

  // Rota pública de login
  app.post('/auth/login', { schema: loginSchema }, async (req, reply) => {
    return login(req, reply)
  })

  // Rota de logout (protegida)
  app.post('/auth/logout', { onRequest: [app.authenticate] }, async (req, reply) => {
    return logout(req, reply)
  })

  // Rota para obter dados do usuário autenticado (protegida)
  app.get('/auth/me', { onRequest: [app.authenticate] }, async (req, reply) => {
    return me(req, reply)
  })
}
