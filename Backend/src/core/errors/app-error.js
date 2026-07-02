export class AppError extends Error {
  constructor(message, statusCode = 500, options = {}) {
    super(message)

    this.name = 'AppError'
    this.statusCode = statusCode
    this.code = options.code || null
    this.error = options.error || null
    this.details = options.details || null
    this.expose = typeof options.expose === 'boolean' ? options.expose : statusCode < 500
    this.cause = options.cause
  }
}