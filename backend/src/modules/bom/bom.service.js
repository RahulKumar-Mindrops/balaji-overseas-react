import { AppError } from '../../middleware/errorHandler.js'
import { withTransaction } from '../../db/db.js'
import { productRepository } from '../products/product.repository.js'

function validateBomLineXor(line) {
  const hasRm = line.raw_material_id != null
  const hasCustom = !!(line.custom_material_name && String(line.custom_material_name).trim())
  if (!hasRm && !hasCustom) throw new AppError('BOM line: raw_material_id or custom_material_name required', 400)
  if (hasRm && hasCustom) throw new AppError('BOM line: cannot set both raw_material_id and custom_material_name', 400)
  if (hasCustom && (!line.custom_unit || !String(line.custom_unit).trim())) {
    throw new AppError('custom_unit required for custom materials', 400)
  }
}

export function bomService(pool, bomRepo) {
  const prodRepo = productRepository(pool)

  return {
    async list(productId) {
      const p = await prodRepo.findById(productId)
      if (!p) throw new AppError('Product not found', 404)
      return prodRepo.getBom(productId)
    },

    async addLine(productId, line) {
      validateBomLineXor(line)
      const p = await prodRepo.findById(productId)
      if (!p) throw new AppError('Product not found', 404)
      try {
        return await withTransaction((client) => bomRepo.insertLine(client, productId, line))
      } catch (e) {
        if (e.code === '23503') throw new AppError('Invalid raw_material_id', 400)
        throw e
      }
    },

    async updateLine(productId, bomId, line) {
      const existing = await bomRepo.findLine(productId, bomId)
      if (!existing) throw new AppError('BOM line not found', 404)
      const merged = { ...existing, ...line }
      validateBomLineXor({
        raw_material_id: merged.raw_material_id,
        custom_material_name: merged.custom_material_name,
        custom_unit: merged.custom_unit,
      })
      try {
        return await bomRepo.updateLine(productId, bomId, line)
      } catch (e) {
        if (e.code === '23514') throw new AppError('Invalid BOM data', 400)
        throw e
      }
    },

    async deleteLine(productId, bomId) {
      const ok = await bomRepo.deleteLine(productId, bomId)
      if (!ok) throw new AppError('BOM line not found', 404)
      return { deleted: true }
    },

    async bulkReplace(productId, lines) {
      const p = await prodRepo.findById(productId)
      if (!p) throw new AppError('Product not found', 404)
      for (const line of lines) validateBomLineXor(line)
      return withTransaction(async (client) => {
        await prodRepo.deleteBomByProduct(client, productId)
        const inserted = []
        for (const line of lines) {
          inserted.push(await bomRepo.insertLine(client, productId, line))
        }
        return inserted
      })
    },
  }
}
