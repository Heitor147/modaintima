export async function clientesRoutes(app) {
  app.get('/clientes', async (req, reply) => {
    return reply.code(501).send({
      error: 'Not Implemented',
      message: 'Módulo de clientes ainda não implementado.',
    })
  })
}