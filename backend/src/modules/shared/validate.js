import { AppError } from '../../middleware/errorHandler.js'

export function validateBody(schema) {
  return (req, res, next) => {
    const parsed = schema.safeParse(req.body)
    if (!parsed.success) {
      return next(
        new AppError('Validation failed', 400, parsed.error.flatten())
      )
    }
    req.body = parsed.data
    next()
  }
}

export function validateQuery(schema) {
  return (req, res, next) => {
    const parsed = schema.safeParse(req.query)
    if (!parsed.success) {
      return next(
        new AppError('Invalid query', 400, parsed.error.flatten())
      )
    }
    req.validatedQuery = parsed.data
    next()
  }
}
