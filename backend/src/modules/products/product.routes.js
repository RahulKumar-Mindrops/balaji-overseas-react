import { Router } from 'express'
import { productRepository } from './product.repository.js'
import { productService } from './product.service.js'
import { productController } from './product.controller.js'
import { validateBody, validateQuery } from '../shared/validate.js'
import {
  createProductSchema,
  updateProductSchema,
  listProductsQuerySchema,
  suggestItemCodeQuerySchema,
} from './product.validator.js'
import { z } from 'zod'

const searchQuerySchema = listProductsQuerySchema.extend({
  q: z.string().min(1, 'q is required'),
})

export function createProductRoutes(pool) {
  const r = Router()
  const repo = productRepository(pool)
  const service = productService(repo)
  const ctrl = productController(service)

  r.get(
    '/suggest-item-code',
    validateQuery(suggestItemCodeQuerySchema),
    (req, res, next) => ctrl.suggestItemCode(req, res, next)
  )
  r.get('/search', validateQuery(searchQuerySchema), (req, res, next) => ctrl.list(req, res, next))
  r.get('/', validateQuery(listProductsQuerySchema), (req, res, next) => ctrl.list(req, res, next))
  r.post('/', validateBody(createProductSchema), (req, res, next) => ctrl.create(req, res, next))
  r.get('/:id', (req, res, next) => ctrl.getById(req, res, next))
  r.put('/:id', validateBody(updateProductSchema), (req, res, next) => ctrl.update(req, res, next))
  r.delete('/:id', (req, res, next) => ctrl.remove(req, res, next))

  return r
}
