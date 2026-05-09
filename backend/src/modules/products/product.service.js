import { AppError } from '../../middleware/errorHandler.js'
import { withTransaction } from '../../db/db.js'

function categoryPrefix(category) {
  const c = (category || '').toUpperCase().replace(/[^A-Z0-9]/g, '')
  return (c.slice(0, 2) || 'BO').padEnd(2, 'X').slice(0, 2)
}

function materialSegment(materialKey) {
  const m = (materialKey || '').toUpperCase().replace(/[^A-Z0-9]/g, '')
  return (m.slice(0, 3) || 'GEN').padEnd(3, 'X').slice(0, 3)
}

function formatBomRow(row) {
  const isCustom = !row.raw_material_id
  const materialName = isCustom
    ? row.custom_material_name
    : row.rm_name || row.material_name
  return {
    bom_id: row.id,
    material_name: materialName,
    material_code: row.material_code || null,
    quantity_per_unit: Number(row.quantity_per_unit),
    unit: row.unit,
    bom_type: row.bom_type,
    is_custom: isCustom,
    raw_material_id: row.raw_material_id,
    custom_material_name: row.custom_material_name,
    custom_unit: row.custom_unit,
    notes: row.notes,
  }
}

function formatPackingRow(row) {
  return {
    id: row.id,
    packing_type: row.packing_type,
    material_name: row.material_name,
    quantity: row.quantity != null ? Number(row.quantity) : null,
    unit: row.unit,
    notes: row.notes,
  }
}

export function productService(repo) {
  return {
    async list(query) {
      const includeInactive = query.include_inactive === 'true'
      const { rows, total } = await repo.list({
        page: query.page,
        limit: query.limit,
        category: query.category,
        q: query.q,
        includeInactive,
      })
      return {
        data: rows,
        pagination: {
          page: query.page,
          limit: query.limit,
          total,
          total_pages: Math.ceil(total / query.limit) || 0,
        },
      }
    },

    async getById(id) {
      const p = await repo.findById(id)
      if (!p) throw new AppError('Product not found', 404)
      const [bom, packing] = await Promise.all([repo.getBom(id), repo.getPacking(id)])
      return {
        ...serializeProduct(p),
        bom: bom.map(formatBomRow),
        packing: packing.map(formatPackingRow),
      }
    },

    async create(body) {
      try {
        return await withTransaction(async (client) => {
          const product = await repo.insertProduct(client, body)
          for (const line of body.bom || []) {
            await repo.insertBomLine(client, product.id, line)
          }
          for (const pl of body.packing || []) {
            if (
              pl.material_name &&
              pl.quantity != null &&
              pl.unit
            ) {
              await repo.insertPackingLine(client, product.id, pl)
            }
          }
          const bomCount = (body.bom || []).length
          const packCount = (body.packing || []).filter(
            (x) => x.material_name && x.quantity != null && x.unit
          ).length
          return {
            success: true,
            product_id: product.id,
            item_code: product.item_code,
            message: `Product created with ${bomCount} BOM items and ${packCount} packing items`,
          }
        })
      } catch (e) {
        if (e.code === '23505') throw new AppError('item_code already exists', 409)
        throw e
      }
    },

    async update(id, body) {
      try {
        const { packing, bom, ...header } = body
        const row = await withTransaction(async (client) => {
          const updated = await repo.updateProductWithClient(client, id, header)
          if (!updated) return null
          if (packing !== undefined) {
            await repo.deletePackingByProduct(client, id)
            for (const pl of packing || []) {
              if (pl.material_name && pl.quantity != null && pl.unit) {
                await repo.insertPackingLine(client, id, pl)
              }
            }
          }
          if (bom !== undefined) {
            await repo.deleteBomByProduct(client, id)
            for (const line of bom || []) {
              await repo.insertBomLine(client, id, line)
            }
          }
          return updated
        })
        if (!row) throw new AppError('Product not found', 404)
        return serializeProduct(row)
      } catch (e) {
        if (e.code === '23505') throw new AppError('item_code already exists', 409)
        throw e
      }
    },

    async softDelete(id) {
      const row = await repo.softDelete(id)
      if (!row) throw new AppError('Product not found', 404)
      return { success: true, product_id: id, is_active: false }
    },

    async suggestItemCode(category, materialKey) {
      const prefix = categoryPrefix(category)
      const matSeg = materialSegment(materialKey)
      const last = await repo.getMaxSequenceForPrefix(prefix, matSeg)
      const next = String(last + 1).padStart(3, '0')
      return { item_code: `${prefix}-${matSeg}-${next}` }
    },
  }
}

function serializeProduct(p) {
  return {
    id: p.id,
    item_code: p.item_code,
    product_name: p.product_name,
    category: p.category,
    marble_type: p.marble_type,
    color: p.color,
    thickness_mm: numOrNull(p.thickness_mm),
    size_length_mm: numOrNull(p.size_length_mm),
    size_width_mm: numOrNull(p.size_width_mm),
    size_height_mm: numOrNull(p.size_height_mm),
    has_wood: p.has_wood,
    has_mdf: p.has_mdf,
    has_metal: p.has_metal,
    has_glass: p.has_glass,
    has_fabric: p.has_fabric,
    has_custom: p.has_custom,
    is_active: p.is_active,
    created_at: p.created_at,
    updated_at: p.updated_at,
  }
}

function numOrNull(v) {
  if (v == null) return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}
