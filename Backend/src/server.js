import 'dotenv/config'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import cookie from '@fastify/cookie'
import jwt from '@fastify/jwt'
import db from './db/connection.js'
import { authRoutes } from './features/auth/auth.routes.js'
import { clientesRoutes } from './features/clientes/clientes.routes.js'
import { produtosRoutes } from './features/produtos/produtos.routes.js'
import { getEnv } from './config/env.js'
import { authenticate, AUTH_COOKIE_NAME } from './core/middlewares/auth.js'
import { AppError } from './core/errors/app-error.js'
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
    const validationDetails = error.validation.map((item) => ({
      field: item?.instancePath ? item.instancePath.replace(/^\//, '') : 'payload',
      message: item?.message || 'Campo inválido',
    }))

    return reply.code(400).send({
      error: 'Bad Request',
      message: validationDetails.length === 1 ? validationDetails[0].message : 'Um ou mais campos estão inválidos',
      details: validationDetails,
    })
  }

  req.log.error(error)

  const shouldExposeMessage = error instanceof AppError || statusCode < 500 || error.expose === true

  const response = {
    error:
      error.error ||
      error.code ||
      (statusCode >= 500 ? 'Internal Server Error' : error.name || 'Error'),
    message: shouldExposeMessage ? error.message : 'Erro interno',
  }

  if (error.details) {
    response.details = error.details
  }

  return reply.code(statusCode).send(response)
})

await app.register(cors, {
  origin: env.CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
})

await app.register(cookie)

await app.register(jwt, {
  secret: env.JWT_SECRET,
  cookie: {
    cookieName: AUTH_COOKIE_NAME,
    signed: false,
  },
})

app.decorate('authenticate', authenticate)

app.get('/health/db', async (req, reply) => {
  const [rows] = await req.server.db.query('SELECT 1 AS ok')
  return reply.code(200).send({ db: 'ok', rows })
})

await app.register(authRoutes)
await app.register(clientesRoutes)
await app.register(produtosRoutes)

try {
  const address = await app.listen({ port: env.PORT, host: '0.0.0.0' })
  app.log.info(`Servidor rodando em ${address}`)
} catch (err) {
  app.log.error(err)
  process.exit(1)
}
