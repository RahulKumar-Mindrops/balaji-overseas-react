import { AppError } from '../../middleware/errorHandler.js'
import { withTransaction } from '../../db/db.js'

export function orderService(repo) {
  return {
    async list(query) {
      const page = Math.max(1, parseInt(query.page || '1', 10))
      const limit = Math.min(100, Math.max(1, parseInt(query.limit || '20', 10)))
      const q = query.q ? String(query.q).trim() : ''
      const { rows, total } = await repo.list({ page, limit, q: q || undefined })
      return {
        data: rows,
        pagination: { page, limit, total, total_pages: Math.ceil(total / limit) || 0 },
      }
    },

    async getById(id) {
      const order = await repo.getOrder(id)
      if (!order) throw new AppError('Order not found', 404)
      const items = await repo.getOrderItems(id)
      return {
        id: order.id,
        po_number: order.po_number,
        client_name: order.client_name,
        order_date: order.order_date,
        shipment_date: order.shipment_date,
        status: order.status,
        created_at: order.created_at,
        updated_at: order.updated_at,
        items: items.map((it) => ({
          id: it.id,
          product_id: it.product_id,
          item_code: it.item_code,
          product_name: it.product_name,
          quantity: it.quantity,
        })),
      }
    },

    async create(body) {
      try {
        return await withTransaction(async (client) => {
          const order = await repo.createOrder(client, body)
          await repo.replaceItems(client, order.id, body.items)
          return { success: true, order_id: order.id, po_number: order.po_number }
        })
      } catch (e) {
        if (e.code === '23505') throw new AppError('PO number already exists', 409)
        if (e.code === '23503') throw new AppError('Invalid product_id in items', 400)
        throw e
      }
    },

    async update(id, body) {
      try {
        return await withTransaction(async (client) => {
          const existing = await repo.getOrder(id)
          if (!existing) throw new AppError('Order not found', 404)
          const order = await repo.updateOrder(client, id, body)
          if (body.items !== undefined) {
            await repo.replaceItems(client, id, body.items)
          }
          return order
        })
      } catch (e) {
        if (e.code === '23505') throw new AppError('PO number already exists', 409)
        if (e.code === '23503') throw new AppError('Invalid product_id in items', 400)
        throw e
      }
    },

    async remove(id) {
      const ok = await repo.deleteOrder(id)
      if (!ok) throw new AppError('Order not found', 404)
      return { deleted: true }
    },

    async listOverrides(orderItemId) {
      const rows = await repo.listOverrides(orderItemId)
      return rows.map((r) => ({
        id: r.id,
        order_item_id: r.order_item_id,
        bom_id: r.bom_id,
        overridden_qty: Number(r.overridden_qty),
        notes: r.notes,
        unit: r.unit,
        bom_type: r.bom_type,
        material_name: r.raw_material_id ? r.rm_name : r.custom_material_name,
        material_code: r.material_code || null,
        is_custom: !r.raw_material_id,
      }))
    },

    async upsertOverride(orderItemId, body) {
      try {
        return await withTransaction(async (client) => {
          const row = await repo.upsertOverride(client, orderItemId, body)
          return row
        })
      } catch (e) {
        if (e.code === '23503') throw new AppError('Invalid order_item_id or bom_id', 400)
        throw e
      }
    },

    async deleteOverride(orderItemId, bomId) {
      const ok = await repo.deleteOverride(orderItemId, bomId)
      if (!ok) throw new AppError('Override not found', 404)
      return { deleted: true }
    },
  }
}

