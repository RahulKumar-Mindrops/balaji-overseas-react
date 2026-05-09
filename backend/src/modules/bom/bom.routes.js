import { Router } from 'express'
import { bomRepository } from './bom.repository.js'
import { bomService } from './bom.service.js'
import { bomController } from './bom.controller.js'
import { validateBody } from '../shared/validate.js'
import {
  bomBulkSchema,
  createBomLineSchema,
  updateBomLineSchema,
} from './bom.validator.js'

export function createBomRoutes(pool) {
  const r = Router({ mergeParams: true })
  const bomRepo = bomRepository(pool)
  const service = bomService(pool, bomRepo)
  const ctrl = bomController(service)

  r.get('/', (req, res, next) => ctrl.list(req, res, next))
  r.post('/bulk', validateBody(bomBulkSchema), (req, res, next) => ctrl.bulk(req, res, next))
  r.post('/', validateBody(createBomLineSchema), (req, res, next) => ctrl.create(req, res, next))
  r.put('/:bomId', validateBody(updateBomLineSchema), (req, res, next) => ctrl.update(req, res, next))
  r.delete('/:bomId', (req, res, next) => ctrl.remove(req, res, next))

  return r
}
