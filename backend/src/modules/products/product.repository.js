export function productRepository(pool) {
  return {
    async list({ page, limit, category, q, includeInactive }) {
      const offset = (page - 1) * limit
      const conds = []
      const params = []

      if (!includeInactive) {
        conds.push(`p.is_active = TRUE`)
      }
      if (category) {
        conds.push(`LOWER(TRIM(COALESCE(p.category, ''))) = LOWER(TRIM(?))`)
        params.push(category)
      }
      if (q) {
        conds.push(
          `(p.product_name LIKE ? OR p.item_code LIKE ? OR COALESCE(p.category,'') LIKE ?)`
        )
        params.push(`%${q}%`, `%${q}%`, `%${q}%`)
      }
      const where = conds.length ? `WHERE ${conds.join(' AND ')}` : ''

      const [countR] = await pool.query(
        `SELECT COUNT(*) AS c FROM products p ${where}`,
        params
      )
      const total = Number(countR[0].c)

      const listParams = [...params, limit, offset]
      const [rows] = await pool.query(
        `SELECT p.id, p.item_code, p.product_name, p.category, p.marble_type, p.color,
                p.thickness_mm, p.size_length_mm, p.size_width_mm, p.size_height_mm,
                p.has_wood, p.has_mdf, p.has_metal, p.has_glass, p.has_fabric, p.has_custom,
                p.is_active, p.created_at, p.updated_at,
                (SELECT COUNT(*) FROM product_bom b WHERE b.product_id = p.id) AS bom_line_count
         FROM products p ${where}
         ORDER BY p.id DESC
         LIMIT ? OFFSET ?`,
        listParams
      )
      return { rows, total }
    },

    async findById(id) {
      const [rows] = await pool.query(`SELECT * FROM products WHERE id = ?`, [id])
      return rows[0] || null
    },

    async findByItemCode(itemCode) {
      const [rows] = await pool.query(`SELECT id FROM products WHERE item_code = ?`, [itemCode])
      return rows[0] || null
    },

    async insertProduct(client, p) {
      const [result] = await client.query(
        `INSERT INTO products (
          item_code, product_name, category, marble_type, color,
          thickness_mm, size_length_mm, size_width_mm, size_height_mm,
          has_wood, has_mdf, has_metal, has_glass, has_fabric, has_custom, is_active
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, COALESCE(?, TRUE)
        )`,
        [
          p.item_code,
          p.product_name,
          p.category ?? null,
          p.marble_type ?? null,
          p.color ?? null,
          p.thickness_mm ?? null,
          p.size_length_mm ?? null,
          p.size_width_mm ?? null,
          p.size_height_mm ?? null,
          p.has_wood ?? false,
          p.has_mdf ?? false,
          p.has_metal ?? false,
          p.has_glass ?? false,
          p.has_fabric ?? false,
          p.has_custom ?? false,
          p.is_active,
        ]
      )
      const [rows] = await client.query(`SELECT * FROM products WHERE id = ?`, [result.insertId])
      return rows[0]
    },

    async updateProduct(id, p) {
      return this._updateProductQuery(pool, id, p)
    },

    async updateProductWithClient(client, id, p) {
      return this._updateProductQuery(client, id, p)
    },

    async _updateProductQuery(db, id, p) {
      const sets = []
      const vals = []
      const map = [
        ['item_code', 'item_code'],
        ['product_name', 'product_name'],
        ['category', 'category'],
        ['marble_type', 'marble_type'],
        ['color', 'color'],
        ['thickness_mm', 'thickness_mm'],
        ['size_length_mm', 'size_length_mm'],
        ['size_width_mm', 'size_width_mm'],
        ['size_height_mm', 'size_height_mm'],
        ['has_wood', 'has_wood'],
        ['has_mdf', 'has_mdf'],
        ['has_metal', 'has_metal'],
        ['has_glass', 'has_glass'],
        ['has_fabric', 'has_fabric'],
        ['has_custom', 'has_custom'],
        ['is_active', 'is_active'],
      ]
      for (const [key, col] of map) {
        if (p[key] !== undefined) {
          sets.push(`${col} = ?`)
          vals.push(p[key])
        }
      }
      if (!sets.length) {
        const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [id])
        return rows[0] || null
      }
      sets.push(`updated_at = NOW()`)
      vals.push(id)
      await db.query(
        `UPDATE products SET ${sets.join(', ')} WHERE id = ?`,
        vals
      )
      const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [id])
      return rows[0] || null
    },

    async softDelete(id) {
      await pool.query(`UPDATE products SET is_active = FALSE, updated_at = NOW() WHERE id = ?`, [id])
      const [rows] = await pool.query(`SELECT * FROM products WHERE id = ?`, [id])
      return rows[0] || null
    },

    async insertBomLine(client, productId, line) {
      const [result] = await client.query(
        `INSERT INTO product_bom (
          product_id, raw_material_id, custom_material_name, custom_unit,
          quantity_per_unit, unit, bom_type, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          productId,
          line.raw_material_id ?? null,
          line.custom_material_name ?? null,
          line.custom_unit ?? null,
          line.quantity_per_unit,
          line.unit,
          line.bom_type || 'PRODUCTION',
          line.notes ?? null,
        ]
      )
      const [rows] = await client.query('SELECT * FROM product_bom WHERE id = ?', [result.insertId])
      return rows[0]
    },

    async insertPackingLine(client, productId, line) {
      const [result] = await client.query(
        `INSERT INTO product_packing (product_id, packing_type, material_name, quantity, unit, notes)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          productId,
          line.packing_type,
          line.material_name ?? null,
          line.quantity ?? null,
          line.unit ?? null,
          line.notes ?? null,
        ]
      )
      const [rows] = await client.query('SELECT * FROM product_packing WHERE id = ?', [result.insertId])
      return rows[0]
    },

    async deleteBomByProduct(client, productId) {
      await client.query('DELETE FROM product_bom WHERE product_id = ?', [productId])
    },

    async deletePackingByProduct(client, productId) {
      await client.query('DELETE FROM product_packing WHERE product_id = ?', [productId])
    },

    async getBom(productId) {
      const [rows] = await pool.query(
        `SELECT b.*, rm.material_code, rm.material_name AS rm_name
         FROM product_bom b
         LEFT JOIN raw_materials rm ON rm.id = b.raw_material_id
         WHERE b.product_id = ?
         ORDER BY b.id`,
        [productId]
      )
      return rows
    },

    async getPacking(productId) {
      const [rows] = await pool.query(
        `SELECT * FROM product_packing WHERE product_id = ? ORDER BY id`,
        [productId]
      )
      return rows
    },

    async getMaxSequenceForPrefix(prefix, matSeg) {
      const pattern = `${prefix}-${matSeg}-%`
      const [rows] = await pool.query(
        `SELECT item_code FROM products WHERE item_code LIKE ? ORDER BY item_code DESC LIMIT 50`,
        [pattern]
      )
      let maxSeq = 0
      const re = new RegExp(`^${escapeRe(prefix)}-${escapeRe(matSeg)}-(\\d{3})$`, 'i')
      for (const r of rows) {
        const m = r.item_code.match(re)
        if (m) maxSeq = Math.max(maxSeq, parseInt(m[1], 10))
      }
      return maxSeq
    },
  }
}

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
