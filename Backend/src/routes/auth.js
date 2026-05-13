import { login, logout, me } from '../controllers/authController.js'

export async function authRoutes(app) {
  // Rota pública de login
  app.post('/auth/login', async (req, reply) => {
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
