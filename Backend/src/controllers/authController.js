import bcrypt from 'bcryptjs'

export const login = async (req, reply) => {
  try {
    const { email, password } = req.body

    // Validação básica
    if (!email || !password) {
      return reply.code(400).send({
        error: 'Email e senha são obrigatórios',
      })
    }

    // Buscar usuário no banco pelo email (tabela local: usuarios)
    const [rows] = await req.server.db.query(
      'SELECT id, email, senha_hash AS password, nome FROM usuarios WHERE email = ? LIMIT 1',
      [email]
    )

    if (!rows || rows.length === 0) {
      return reply.code(401).send({ error: 'Credenciais inválidas' })
    }

    const user = rows[0]

    // Comparar senha informada com hash armazenado
    const passwordMatches = await bcrypt.compare(password, user.password)

    if (!passwordMatches) {
      return reply.code(401).send({ error: 'Credenciais inválidas' })
    }

    // Gerar token JWT (usa o decorator do fastify)
    const token = await reply.jwtSign(
      { userId: user.id, email: user.email },
      { expiresIn: '24h' }
    )

    // Retornar dados do usuário sem a senha
    return reply.code(200).send({
      message: 'Login realizado com sucesso',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.nome,
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
