import 'dotenv/config'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import db from './db/connection.js'
import { authRoutes } from './routes/auth.js'
 
const app = Fastify({ logger: true })

app.decorate('db', db)
app.addHook('onClose', async () => {
  await db.end()
})

await app.register(cors, {
  origin: true,
})
 
await app.register(jwt, {
  secret: process.env.JWT_SECRET,
})
 
app.decorate('authenticate', async (req, reply) => {
  try {
    await req.jwtVerify()
  } catch {
    reply.code(401).send({ error: 'Token inválido ou ausente.' })
  }
})

app.get('/health/db', async (req, reply) => {
  try {
    const [rows] = await db.query('SELECT 1 AS ok')
    reply.code(200).send({ db: 'ok', rows })
  } catch (err) {
    reply.code(500).send({ db: 'error', message: err.message })
  }
})

// Registrar rotas
await app.register(authRoutes)

const PORT = process.env.PORT || 3333
 
try {
  const address = await app.listen({ port: PORT, host: '0.0.0.0' })
  app.log.info(`Servidor rodando em ${address}`)
} catch (err) {
  app.log.error(err)
  process.exit(1)
}