import bcrypt from 'bcryptjs'
import * as usuariosRepository from '../repositories/usuariosRepository.js'

export const login = async (email, password) => {
  const user = await usuariosRepository.findByEmail(email)

  if (!user || user.ativo === 0) {
    throw new Error('Credenciais inválidas')
  }

  const passwordMatches = await bcrypt.compare(password, user.senha_hash)

  if (!passwordMatches) {
    throw new Error('Credenciais inválidas')
  }

  return {
    id: user.id,
    email: user.email,
    nome: user.nome,
    perfil: user.perfil || 'usuario',
  }
}

export const register = async (email, nome, password) => {
  const emailAlreadyExists = await usuariosRepository.emailExists(email)

  if (emailAlreadyExists) {
    throw new Error('Email já cadastrado')
  }

  if (password.length < 6) {
    throw new Error('Senha deve ter no mínimo 6 caracteres')
  }

  const senhaHash = await bcrypt.hash(password, 10)

  const userId = await usuariosRepository.create({
    email,
    nome,
    senhaHash,
  })

  return {
    id: userId,
    email,
    nome,
    perfil: 'usuario',
  }
}

export const logout = async () => {
  return {
    message: 'Logout realizado com sucesso',
  }
}

export const getUserById = async (userId) => {
  const user = await usuariosRepository.findById(userId)

  if (!user) {
    throw new Error('Usuário não encontrado')
  }

  return {
    id: user.id,
    email: user.email,
    nome: user.nome,
    perfil: user.perfil || 'usuario',
  }
}
