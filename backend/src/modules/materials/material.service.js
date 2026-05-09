import { AppError } from '../../middleware/errorHandler.js'

export function materialService(repo) {
  return {
    async list(query) {
      return repo.findAll({ includeInactive: query.include_inactive === 'true' })
    },

    async create(body) {
      try {
        return await repo.insert(body)
      } catch (e) {
        if (e.code === '23505') throw new AppError('Material code already exists', 409)
        throw e
      }
    },

    async update(id, body) {
      const existing = await repo.findById(id)
      if (!existing) throw new AppError('Material not found', 404)
      try {
        const row = await repo.update(id, body)
        if (!row) throw new AppError('Material not found', 404)
        return row
      } catch (e) {
        if (e.code === '23505') throw new AppError('Material code already exists', 409)
        throw e
      }
    },
  }
}
