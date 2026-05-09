import { AppError } from '../../middleware/errorHandler.js'

export function productController(service) {
  return {
    async list(req, res, next) {
      try {
        const q = req.validatedQuery
        const result = await service.list(q)
        res.json({ success: true, ...result })
      } catch (e) {
        next(e)
      }
    },

    async suggestItemCode(req, res, next) {
      try {
        const { category, material_key } = req.validatedQuery
        const data = await service.suggestItemCode(category, material_key)
        res.json({ success: true, data })
      } catch (e) {
        next(e)
      }
    },

    async getById(req, res, next) {
      try {
        const id = parseInt(req.params.id, 10)
        if (Number.isNaN(id)) throw new AppError('Invalid product id', 400)
        const data = await service.getById(id)
        res.json({ success: true, data })
      } catch (e) {
        next(e)
      }
    },

    async create(req, res, next) {
      try {
        const out = await service.create(req.body)
        res.status(201).json(out)
      } catch (e) {
        next(e)
      }
    },

    async update(req, res, next) {
      try {
        const id = parseInt(req.params.id, 10)
        if (Number.isNaN(id)) throw new AppError('Invalid product id', 400)
        const data = await service.update(id, req.body)
        res.json({ success: true, data })
      } catch (e) {
        next(e)
      }
    },

    async remove(req, res, next) {
      try {
        const id = parseInt(req.params.id, 10)
        if (Number.isNaN(id)) throw new AppError('Invalid product id', 400)
        const data = await service.softDelete(id)
        res.json({ success: true, ...data })
      } catch (e) {
        next(e)
      }
    },
  }
}
