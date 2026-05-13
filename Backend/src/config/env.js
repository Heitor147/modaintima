let cachedEnv

function toInt(value, fallback) {
  if (value === undefined || value === null || value === '') return fallback
  const parsed = Number.parseInt(value, 10)
  return Number.isNaN(parsed) ? fallback : parsed
}

export function getEnv() {
  if (cachedEnv) return cachedEnv

  const required = ['JWT_SECRET', 'DB_HOST', 'DB_USER', 'DB_NAME']
  const missing = required.filter((key) => !process.env[key])

  if (missing.length > 0) {
    throw new Error(`Variáveis de ambiente obrigatórias ausentes: ${missing.join(', ')}`)
  }

  cachedEnv = {
    PORT: toInt(process.env.PORT, 3333),
    JWT_SECRET: process.env.JWT_SECRET,
    DB_HOST: process.env.DB_HOST,
    DB_PORT: toInt(process.env.DB_PORT, 3306),
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD || '',
    DB_NAME: process.env.DB_NAME,
    DB_CONNECTION_LIMIT: toInt(process.env.DB_CONNECTION_LIMIT, 10),
    CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
  }

  return cachedEnv
}
