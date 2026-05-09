import { Router } from 'express'
import { validateBody } from '../shared/validate.js'
import { createOrderSchema, updateOrderSchema, bomOverrideUpsertSchema } from './order.validator.js'
import { orderRepository } from './order.repository.js'
import { orderService } from './order.service.js'
import { orderController } from './order.controller.js'

export function createOrderRoutes(pool) {
  const r = Router()
  const repo = orderRepository(pool)
  const service = orderService(repo)
  const ctrl = orderController(service)

  r.get('/', (req, res, next) => ctrl.list(req, res, next))
  r.post('/', validateBody(createOrderSchema), (req, res, next) => ctrl.create(req, res, next))
  r.get('/:id', (req, res, next) => ctrl.getById(req, res, next))
  r.put('/:id', validateBody(updateOrderSchema), (req, res, next) => ctrl.update(req, res, next))
  r.delete('/:id', (req, res, next) => ctrl.remove(req, res, next))

  r.get('/items/:orderItemId/bom-overrides', (req, res, next) => ctrl.listOverrides(req, res, next))
  r.post('/items/:orderItemId/bom-overrides', validateBody(bomOverrideUpsertSchema), (req, res, next) =>
    ctrl.upsertOverride(req, res, next)
  )
  r.delete('/items/:orderItemId/bom-overrides/:bomId', (req, res, next) => ctrl.deleteOverride(req, res, next))

  return r
}

