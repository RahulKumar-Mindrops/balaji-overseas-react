export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err)

  const status = err.statusCode || err.status || 500
  const message = err.message || 'Internal server error'
  const details = err.details

  res.status(status).json({
    success: false,
    error: message,
    ...(details ? { details } : {}),
  })
}

export class AppError extends Error {
  constructor(message, statusCode = 400, details) {
    super(message)
    this.statusCode = statusCode
    this.details = details
  }
}
