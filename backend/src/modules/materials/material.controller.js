export function materialController(service) {
  return {
    async list(req, res, next) {
      try {
        const rows = await service.list(req.query)
        res.json({ success: true, data: rows })
      } catch (e) {
        next(e)
      }
    },

    async create(req, res, next) {
      try {
        const row = await service.create(req.body)
        res.status(201).json({ success: true, data: row })
      } catch (e) {
        next(e)
      }
    },

    async update(req, res, next) {
      try {
        const id = parseInt(req.params.id, 10)
        if (Number.isNaN(id)) throw new Error('Invalid id')
        const row = await service.update(id, req.body)
        res.json({ success: true, data: row })
      } catch (e) {
        next(e)
      }
    },
  }
}
