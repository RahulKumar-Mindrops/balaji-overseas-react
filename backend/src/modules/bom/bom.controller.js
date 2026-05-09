import { AppError } from '../../middleware/errorHandler.js'

export function bomController(service) {
  const pid = (req) => {
    const id = parseInt(req.params.productId, 10)
    if (Number.isNaN(id)) throw new AppError('Invalid product id', 400)
    return id
  }

  return {
    async list(req, res, next) {
      try {
        const rows = await service.list(pid(req))
        res.json({ success: true, data: rows })
      } catch (e) {
        next(e)
      }
    },

    async create(req, res, next) {
      try {
        const row = await service.addLine(pid(req), req.body)
        res.status(201).json({ success: true, data: row })
      } catch (e) {
        next(e)
      }
    },

    async update(req, res, next) {
      try {
        const bomId = parseInt(req.params.bomId, 10)
        if (Number.isNaN(bomId)) throw new AppError('Invalid bom id', 400)
        const row = await service.updateLine(pid(req), bomId, req.body)
        res.json({ success: true, data: row })
      } catch (e) {
        next(e)
      }
    },

    async remove(req, res, next) {
      try {
        const bomId = parseInt(req.params.bomId, 10)
        if (Number.isNaN(bomId)) throw new AppError('Invalid bom id', 400)
        await service.deleteLine(pid(req), bomId)
        res.json({ success: true, deleted: true })
      } catch (e) {
        next(e)
      }
    },

    async bulk(req, res, next) {
      try {
        const rows = await service.bulkReplace(pid(req), req.body.bom)
        res.json({ success: true, data: rows, count: rows.length })
      } catch (e) {
        next(e)
      }
    },
  }
}
