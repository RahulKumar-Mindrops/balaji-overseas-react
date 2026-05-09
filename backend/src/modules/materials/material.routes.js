import { Router } from 'express'
import { materialRepository } from './material.repository.js'
import { materialService } from './material.service.js'
import { materialController } from './material.controller.js'
import { validateBody } from '../shared/validate.js'
import { createMaterialSchema, updateMaterialSchema } from './material.validator.js'

export function createMaterialRoutes(pool) {
  const r = Router()
  const repo = materialRepository(pool)
  const service = materialService(repo)
  const ctrl = materialController(service)

  r.get('/', (req, res, next) => ctrl.list(req, res, next))
  r.post('/', validateBody(createMaterialSchema), (req, res, next) => ctrl.create(req, res, next))
  r.put('/:id', validateBody(updateMaterialSchema), (req, res, next) => ctrl.update(req, res, next))

  return r
}
