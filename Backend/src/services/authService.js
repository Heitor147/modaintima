/**
 * Auth Service
 * Responsável pela LÓGICA DE NEGÓCIO
 * Verifica credenciais, gera tokens, valida regras de negócio
 * Não conhece HTTP, não chama SQL diretamente
 */

import bcrypt from 'bcryptjs'
import * as userRepository from '../repository/userRepository.js'

export const login = async (db, email, password) => {
  // Buscar usuário via repository
  const user = await userRepository.findByEmailWithPassword(db, email)

  if (!user) {
    throw new Error('Credenciais inválidas')
  }

  // Comparar senha
  const passwordMatches = await bcrypt.compare(password, user.senha_hash)

  if (!passwordMatches) {
    throw new Error('Credenciais inválidas')
  }

  // Retornar dados do usuário (sem a senha)
  return {
    id: user.id,
    email: user.email,
    nome: user.nome,
  }
}

export const register = async (db, email, nome, password) => {
  // Verificar se email já existe
  const emailAlreadyExists = await userRepository.emailExists(db, email)

  if (emailAlreadyExists) {
    throw new Error('Email já cadastrado')
  }

  // Validar comprimento mínimo de senha
  if (password.length < 6) {
    throw new Error('Senha deve ter no mínimo 6 caracteres')
  }

  // Hash da senha
  const senhaHash = await bcrypt.hash(password, 10)

  // Criar usuário via repository
  const userId = await userRepository.create(db, {
    email,
    nome,
    senhaHash,
  })

  return {
    id: userId,
    email,
    nome,
  }
}

export const logout = async (userId) => {
  // TODO: Se implementar blacklist de tokens, fazer aqui
  return {
    message: 'Logout realizado com sucesso',
  }
}

export const getUserById = async (db, userId) => {
  const user = await userRepository.findById(db, userId)

  if (!user) {
    throw new Error('Usuário não encontrado')
  }

  return user
}
