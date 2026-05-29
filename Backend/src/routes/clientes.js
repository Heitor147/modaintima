import {
  listar,
  buscarPorId,
  criar,
  atualizar,
  inativar,
} from '../controllers/clientesController.js'

export async function clientesRoutes(app) {
  app.get('/clientes', listar)
  app.get('/clientes/:id', buscarPorId)
  app.post('/clientes', { onRequest: [app.authenticate] }, criar)
  app.put('/clientes/:id', { onRequest: [app.authenticate] }, atualizar)
  app.delete('/clientes/:id', { onRequest: [app.authenticate] }, inativar)
}