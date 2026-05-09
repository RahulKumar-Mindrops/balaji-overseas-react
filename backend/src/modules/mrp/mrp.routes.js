import { Router } from 'express'
import { mrpController } from './mrp.controller.js'
import { validateBody } from '../shared/validate.js'
import { mrpCalculateSchema } from './mrp.validator.js'

export function createMrpRoutes() {
  const r = Router()
  const ctrl = mrpController()
  r.post('/calculate', validateBody(mrpCalculateSchema), (req, res, next) =>
    ctrl.calculate(req, res, next)
  )
  r.get('/orders/:orderId/calculate', (req, res, next) =>
    ctrl.calculateForOrder(req, res, next)
  )
  return r
}
