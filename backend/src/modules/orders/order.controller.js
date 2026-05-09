import { AppError } from '../../middleware/errorHandler.js'

export function orderController(service) {
  const idParam = (req, key = 'id') => {
    const id = parseInt(req.params[key], 10)
    if (Number.isNaN(id)) throw new AppError('Invalid id', 400)
    return id
  }

  return {
    async list(req, res, next) {
      try {
        const out = await service.list(req.query)
        res.json({ success: true, ...out })
      } catch (e) {
        next(e)
      }
    },

    async getById(req, res, next) {
      try {
        const data = await service.getById(idParam(req))
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
        const data = await service.update(idParam(req), req.body)
        res.json({ success: true, data })
      } catch (e) {
        next(e)
      }
    },

    async remove(req, res, next) {
      try {
        const data = await service.remove(idParam(req))
        res.json({ success: true, data })
      } catch (e) {
        next(e)
      }
    },

    async listOverrides(req, res, next) {
      try {
        const orderItemId = idParam(req, 'orderItemId')
        const data = await service.listOverrides(orderItemId)
        res.json({ success: true, data })
      } catch (e) {
        next(e)
      }
    },

    async upsertOverride(req, res, next) {
      try {
        const orderItemId = idParam(req, 'orderItemId')
        const data = await service.upsertOverride(orderItemId, req.body)
        res.status(201).json({ success: true, data })
      } catch (e) {
        next(e)
      }
    },

    async deleteOverride(req, res, next) {
      try {
        const orderItemId = idParam(req, 'orderItemId')
        const bomId = idParam(req, 'bomId')
        const data = await service.deleteOverride(orderItemId, bomId)
        res.json({ success: true, data })
      } catch (e) {
        next(e)
      }
    },
  }
}

