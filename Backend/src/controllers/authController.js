export const login = async (req, reply) => {
  try {
    const { email, password } = req.body

    // Validação básica
    if (!email || !password) {
      return reply.code(400).send({
        error: 'Email e senha são obrigatórios',
      })
    }

    // TODO: Implementar verificação de credenciais no banco de dados
    // TODO: Implementar hash/verificação de senha
    // TODO: Implementar geração de token JWT

    // Placeholder para demonstração
    const token = app.jwt.sign(
      { email },
      { expiresIn: '24h' }
    )

    return reply.code(200).send({
      message: 'Login realizado com sucesso',
      token,
      user: {
        email,
      },
    })
  } catch (err) {
    req.log.error(err)
    return reply.code(500).send({
      error: 'Erro ao realizar login',
      message: err.message,
    })
  }
}

export const logout = async (req, reply) => {
  try {
    // TODO: Implementar logout (invalidar token se necessário)
    return reply.code(200).send({
      message: 'Logout realizado com sucesso',
    })
  } catch (err) {
    req.log.error(err)
    return reply.code(500).send({
      error: 'Erro ao realizar logout',
      message: err.message,
    })
  }
}

export const me = async (req, reply) => {
  try {
    // Verifica se o usuário está autenticado (protegido pela rota)
    const user = req.user

    return reply.code(200).send({
      user,
    })
  } catch (err) {
    req.log.error(err)
    return reply.code(500).send({
      error: 'Erro ao buscar dados do usuário',
      message: err.message,
    })
  }
}
