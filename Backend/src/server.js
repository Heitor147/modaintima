import 'dotenv/config'
import Fastify from 'fastify'
import jwt from 'jsonwebtoken'

import authRoutes    from './routes/auth.routes.js'
import produtosRoutes  from './routes/produtos.routes.js'
import estoqueRoutes   from './routes/estoque.routes.js'
import clientesRoutes  from './routes/clientes.routes.js'
import pedidosRoutes   from './routes/pedidos.routes.js'
import producaoRoutes  from './routes/producao.routes.js'
import financeiroRoutes from './routes/financeiro.routes.js'
import relatoriosRoutes from './routes/relatorios.routes.js'

const app = Fastify({ logger: true })

await app.register(import('@fastify/cors'), {
  origin: true,
})

app.addHook('preHandler', async (req, reply) => {
  const rotasPublicas = ['/auth/login']
  if (rotasPublicas.includes(req.routeOptions.url)) return

  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return reply.status(401).send({ error: 'Token não fornecido.' })
  }

  try {
    const token = authHeader.split(' ')[1]
    req.usuario = jwt.verify(token, process.env.JWT_SECRET)
  } catch {
    return reply.status(401).send({ error: 'Token inválido ou expirado.' })
  }
})

app.register(authRoutes,      { prefix: '/auth' })
app.register(produtosRoutes,  { prefix: '/produtos' })
app.register(estoqueRoutes,   { prefix: '/estoque' })
app.register(clientesRoutes,  { prefix: '/clientes' })
app.register(pedidosRoutes,   { prefix: '/pedidos' })
app.register(producaoRoutes,  { prefix: '/producao' })
app.register(financeiroRoutes,{ prefix: '/financeiro' })
app.register(relatoriosRoutes,{ prefix: '/relatorios' })

try {
  await app.listen({ port: Number(process.env.PORT) || 3333, host: '0.0.0.0' })
} catch (err) {
  app.log.error(err)
  process.exit(1)
}