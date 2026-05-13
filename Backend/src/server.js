import 'dotenv/config'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import db from './db/connection.js'
import { authRoutes } from './routes/auth.js'
import crypto from 'crypto'
 
const app = Fastify({ logger: true })

// Correlation id simples + expor no header
app.addHook('onRequest', async (req, reply) => {
  try {
    const existing = req.headers['x-correlation-id']
    const cid = existing || (crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex'))
    req.correlationId = cid
    reply.header('X-Correlation-ID', cid)
    try {
      req.log = req.log.child({ correlationId: cid })
    } catch (e) {
      // ignore if log child not supported
    }
  } catch (e) {
    // noop
  }
})

app.decorate('db', db)
app.addHook('onClose', async () => {
  await db.end()
})

await app.register(cors, {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
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
  // Error handler padronizado: { error, message, details }
  app.setErrorHandler((error, req, reply) => {
    const payload = {
      error: error.name || 'Error',
      message: error.message || 'Erro interno',
      details: error.validation || null,
    }
    reply.code(error.statusCode || 500).send(payload)
  })

  const address = await app.listen({ port: PORT, host: '0.0.0.0' })
  app.log.info(`Servidor rodando em ${address}`)
} catch (err) {
  app.log.error(err)
  process.exit(1)
}