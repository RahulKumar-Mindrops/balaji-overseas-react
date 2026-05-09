export function bomRepository(pool) {
  return {
    async findLine(productId, bomId) {
      const [rows] = await pool.query(
        `SELECT * FROM product_bom WHERE id = ? AND product_id = ?`,
        [bomId, productId]
      )
      return rows[0] || null
    },

    async insertLine(client, productId, line) {
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

    async updateLine(productId, bomId, line) {
      const sets = []
      const vals = []
      const map = [
        ['raw_material_id', 'raw_material_id'],
        ['custom_material_name', 'custom_material_name'],
        ['custom_unit', 'custom_unit'],
        ['quantity_per_unit', 'quantity_per_unit'],
        ['unit', 'unit'],
        ['bom_type', 'bom_type'],
        ['notes', 'notes'],
      ]
      for (const [key, col] of map) {
        if (line[key] !== undefined) {
          sets.push(`${col} = ?`)
          vals.push(line[key])
        }
      }
      if (!sets.length) {
        const [rows] = await pool.query(
          `SELECT * FROM product_bom WHERE id = ? AND product_id = ?`,
          [bomId, productId]
        )
        return rows[0] || null
      }
      vals.push(bomId, productId)
      await pool.query(
        `UPDATE product_bom SET ${sets.join(', ')}
         WHERE id = ? AND product_id = ?`,
        vals
      )
      const [rows] = await pool.query(
        `SELECT * FROM product_bom WHERE id = ? AND product_id = ?`,
        [bomId, productId]
      )
      return rows[0] || null
    },

    async deleteLine(productId, bomId) {
      const [res] = await pool.query(
        `DELETE FROM product_bom WHERE id = ? AND product_id = ?`,
        [bomId, productId]
      )
      return res.affectedRows > 0
    },
  }
}
