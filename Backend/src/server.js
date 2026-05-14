import 'dotenv/config'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import db from './db/connection.js'
import { authRoutes } from './routes/auth.js'
import { produtosRoutes } from './routes/produtos.js'
import { getEnv } from './config/env.js'
import crypto from 'crypto'

const env = getEnv()
const app = Fastify({ logger: true })

app.addHook('onRequest', async (req, reply) => {
  try {
    const existing = req.headers['x-correlation-id']
    const cid = existing || (crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex'))
    req.correlationId = cid
    reply.header('X-Correlation-ID', cid)
    try {
      req.log = req.log.child({ correlationId: cid })
    } catch {
      // noop
    }
  } catch {
    // noop
  }
})

app.decorate('db', db)
app.addHook('onClose', async () => {
  await app.db.end()
})

app.setErrorHandler((error, req, reply) => {
  const statusCode = error.statusCode || 500

  if (error.validation) {
    return reply.code(400).send({
      error: 'Bad Request',
      message: 'Payload inválido',
      details: error.validation,
    })
  }

  req.log.error(error)

  return reply.code(statusCode).send({
    error: statusCode >= 500 ? 'Internal Server Error' : error.name || 'Error',
    message: statusCode >= 500 ? 'Erro interno' : error.message,
    details: null,
  })
})

await app.register(cors, {
  origin: env.CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
})

await app.register(jwt, {
  secret: env.JWT_SECRET,
})

app.decorate('authenticate', async (req, reply) => {
  try {
    await req.jwtVerify()
  } catch {
    reply.code(401).send({ error: 'Unauthorized', message: 'Token inválido ou ausente.' })
  }
})

app.get('/health/db', async (req, reply) => {
  try {
    const [rows] = await req.server.db.query('SELECT 1 AS ok')
    reply.code(200).send({ db: 'ok', rows })
  } catch (err) {
    reply.code(500).send({ db: 'error', message: err.message })
  }
})

await app.register(authRoutes)
await app.register(produtosRoutes)

try {
  const address = await app.listen({ port: env.PORT, host: '0.0.0.0' })
  app.log.info(`Servidor rodando em ${address}`)
} catch (err) {
  app.log.error(err)
  process.exit(1)
}
