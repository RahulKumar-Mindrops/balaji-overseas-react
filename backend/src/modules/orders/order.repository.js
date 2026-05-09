export function orderRepository(pool) {
  return {
    async list({ page, limit, q }) {
      const offset = (page - 1) * limit
      const params = []
      let where = ''
      if (q) {
        params.push(`%${q}%`)
        where = `WHERE (o.po_number LIKE ? OR o.client_name LIKE ? OR o.status LIKE ?)`
        params.push(params[0], params[0])
      }
      const countSql = `SELECT COUNT(*) AS c FROM orders o ${where}`
      const [c] = await pool.query(countSql, params)
      const total = Number(c[0]?.c || 0)

      const listParams = [...params, limit, offset]
      const [rows] = await pool.query(
        `SELECT o.*,
                (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) AS item_count
         FROM orders o
         ${where}
         ORDER BY o.id DESC
         LIMIT ? OFFSET ?`,
        listParams
      )
      return { rows, total }
    },

    async getOrder(id) {
      const [rows] = await pool.query(`SELECT * FROM orders WHERE id = ?`, [id])
      return rows[0] || null
    },

    async getOrderItems(orderId) {
      const [rows] = await pool.query(
        `SELECT oi.id, oi.order_id, oi.product_id, oi.quantity,
                p.item_code, p.product_name
         FROM order_items oi
         JOIN products p ON p.id = oi.product_id
         WHERE oi.order_id = ?
         ORDER BY oi.id`,
        [orderId]
      )
      return rows
    },

    async createOrder(client, order) {
      const [result] = await client.query(
        `INSERT INTO orders (po_number, client_name, order_date, shipment_date, status)
         VALUES (?, ?, ?, ?, COALESCE(?, 'Material Planning'))`,
        [
          order.po_number,
          order.client_name,
          order.order_date || null,
          order.shipment_date || null,
          order.status,
        ]
      )
      const [rows] = await client.query(`SELECT * FROM orders WHERE id = ?`, [result.insertId])
      return rows[0]
    },

    async updateOrder(client, id, patch) {
      const sets = []
      const vals = []
      for (const [key, col] of [
        ['po_number', 'po_number'],
        ['client_name', 'client_name'],
        ['order_date', 'order_date'],
        ['shipment_date', 'shipment_date'],
        ['status', 'status'],
      ]) {
        if (patch[key] !== undefined) {
          sets.push(`${col} = ?`)
          vals.push(patch[key])
        }
      }
      if (!sets.length) {
        const [rows] = await client.query(`SELECT * FROM orders WHERE id = ?`, [id])
        return rows[0] || null
      }
      sets.push(`updated_at = NOW()`)
      vals.push(id)
      await client.query(
        `UPDATE orders SET ${sets.join(', ')} WHERE id = ?`,
        vals
      )
      const [rows] = await client.query(`SELECT * FROM orders WHERE id = ?`, [id])
      return rows[0] || null
    },

    async replaceItems(client, orderId, items) {
      await client.query(`DELETE FROM order_items WHERE order_id = ?`, [orderId])
      const inserted = []
      for (const it of items) {
        const [result] = await client.query(
          `INSERT INTO order_items (order_id, product_id, quantity)
           VALUES (?, ?, ?)`,
          [orderId, it.product_id, it.quantity]
        )
        inserted.push({ id: result.insertId, order_id: orderId, ...it })
      }
      return inserted
    },

    async deleteOrder(id) {
      const [res] = await pool.query(`DELETE FROM orders WHERE id = ?`, [id])
      return res.affectedRows > 0
    },

    async listOverrides(orderItemId) {
      const [rows] = await pool.query(
        `SELECT ovr.*, b.product_id, b.raw_material_id, b.custom_material_name, b.custom_unit,
                b.quantity_per_unit, b.unit, b.bom_type,
                rm.material_code, rm.material_name AS rm_name
         FROM order_bom_overrides ovr
         JOIN product_bom b ON b.id = ovr.bom_id
         LEFT JOIN raw_materials rm ON rm.id = b.raw_material_id
         WHERE ovr.order_item_id = ?
         ORDER BY ovr.id`,
        [orderItemId]
      )
      return rows
    },

    async upsertOverride(client, orderItemId, { bom_id, overridden_qty, notes }) {
      const [result] = await client.query(
        `INSERT INTO order_bom_overrides (order_item_id, bom_id, overridden_qty, notes)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE overridden_qty = VALUES(overridden_qty), notes = VALUES(notes)`,
        [orderItemId, bom_id, overridden_qty, notes ?? null]
      )
      const id = result.insertId
      if (id) {
        const [rows] = await client.query(`SELECT * FROM order_bom_overrides WHERE id = ?`, [id])
        return rows[0]
      }
      const [rows] = await client.query(
        `SELECT * FROM order_bom_overrides WHERE order_item_id = ? AND bom_id = ?`,
        [orderItemId, bom_id]
      )
      return rows[0]
    },

    async deleteOverride(orderItemId, bomId) {
      const [res] = await pool.query(
        `DELETE FROM order_bom_overrides WHERE order_item_id = ? AND bom_id = ?`,
        [orderItemId, bomId]
      )
      return res.affectedRows > 0
    },
  }
}

