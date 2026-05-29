import {
  listar,
  buscarPorId,
  criar,
  atualizar,
  inativar,
} from '../controllers/clientesController.js'

export async function clientesRoutes(app) {
  const clienteSchema = {
    body: {
      type: 'object',
      required: ['nome', 'cpf'],
      additionalProperties: false,
      properties: {
        nome: { type: 'string', minLength: 1 },
        cpf: { type: 'string', minLength: 11 },
        telefone: { type: 'string' },
        email: { type: 'string', format: 'email' },
        endereco: { type: 'string' },
        ativo: { type: 'integer', minimum: 0, maximum: 1 },
      },
    },
  }

  app.get('/clientes', listar)
  app.get('/clientes/:id', buscarPorId)
  app.post('/clientes', { onRequest: [app.authenticate], schema: clienteSchema }, criar)
  app.put('/clientes/:id', { onRequest: [app.authenticate], schema: clienteSchema }, atualizar)
  app.delete('/clientes/:id', { onRequest: [app.authenticate] }, inativar)
}