import bcrypt from 'bcryptjs'
import * as authRepository from './auth.repository.js'
import { AppError } from '../../core/errors/app-error.js'

export const login = async (email, password) => {
  const user = await authRepository.findByEmail(email)

  if (!user || user.ativo === 0) {
    throw new AppError('Credenciais inválidas', 401)
  }

  const passwordMatches = await bcrypt.compare(password, user.senha_hash)

  if (!passwordMatches) {
    throw new AppError('Credenciais inválidas', 401)
  }

  return {
    id: user.id,
    email: user.email,
    nome: user.nome,
    perfil: user.perfil || 'usuario',
  }
}

export const register = async (email, nome, password) => {
  const emailAlreadyExists = await authRepository.emailExists(email)

  if (emailAlreadyExists) {
    throw new AppError('Email já cadastrado', 409)
  }

  if (password.length < 6) {
    throw new AppError('Senha deve ter no mínimo 6 caracteres', 400)
  }

  const senhaHash = await bcrypt.hash(password, 10)

  const userId = await authRepository.create({
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
  const user = await authRepository.findById(userId)

  if (!user) {
    throw new AppError('Usuário não encontrado', 404)
  }

  return {
    id: user.id,
    email: user.email,
    nome: user.nome,
    perfil: user.perfil || 'usuario',
  }
}