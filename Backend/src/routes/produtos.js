export async function produtosRoutes(app) {
  app.get('/produtos', async (req, reply) => {
    // TODO: Implementar listagem de produtos
    return { message: 'Lista de produtos' }
  })

  app.get('/produtos/:id', async (req, reply) => {
    // TODO: Implementar busca de produto por ID
    return { message: 'Produto por ID' }
  })

  app.post('/produtos', { onRequest: [app.authenticate] }, async (req, reply) => {
    // TODO: Implementar criação de produto
    return { message: 'Produto criado' }
  })

  app.put('/produtos/:id', { onRequest: [app.authenticate] }, async (req, reply) => {
    // TODO: Implementar atualização de produto
    return { message: 'Produto atualizado' }
  })

  app.delete('/produtos/:id', { onRequest: [app.authenticate] }, async (req, reply) => {
    // TODO: Implementar exclusão de produto
    return { message: 'Produto deletado' }
  })
}
