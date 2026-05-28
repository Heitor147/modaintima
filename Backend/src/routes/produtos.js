import {
  atualizar,
  buscarPorId,
  criar,
  listar,
  remover,
} from '../controllers/produtosController.js'

export async function produtosRoutes(app) {
  app.get('/produtos', listar)
  app.get('/produtos/:id', buscarPorId)
  app.post('/produtos', { preHandler: [app.authenticate] }, criar)
  app.put('/produtos/:id', { preHandler: [app.authenticate] }, atualizar)
  app.delete('/produtos/:id', { preHandler: [app.authenticate] }, remover)
}
