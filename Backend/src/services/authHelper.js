export const getUserFromRequest = (req) => {
  return req.user || null
}

export const requireUser = (req, reply) => {
  if (!req.user) {
    reply.code(401).send({ error: 'Unauthorized', message: 'Token inválido ou ausente.' })
  }
}
