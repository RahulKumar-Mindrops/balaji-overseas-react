export function materialRepository(pool) {
  return {
    async findAll({ includeInactive = false } = {}) {
      const q = includeInactive
        ? `SELECT * FROM raw_materials ORDER BY material_name`
        : `SELECT * FROM raw_materials WHERE is_active = TRUE ORDER BY material_name`
      const [rows] = await pool.query(q)
      return rows
    },

    async findById(id) {
      const [rows] = await pool.query('SELECT * FROM raw_materials WHERE id = ?', [id])
      return rows[0] || null
    },

    async insert(data) {
      const [rows] = await pool.query(
        `INSERT INTO raw_materials (material_code, material_name, category, unit, description, is_active)
         VALUES (?, ?, ?, ?, ?, COALESCE(?, TRUE))`,
        [
          data.material_code,
          data.material_name,
          data.category ?? null,
          data.unit,
          data.description ?? null,
          data.is_active,
        ]
      )
      const [out] = await pool.query('SELECT * FROM raw_materials WHERE id = LAST_INSERT_ID()')
      return out[0]
    },

    async update(id, data) {
      const sets = []
      const vals = []
      let n = 1
      for (const [k, col] of [
        ['material_code', 'material_code'],
        ['material_name', 'material_name'],
        ['category', 'category'],
        ['unit', 'unit'],
        ['description', 'description'],
        ['is_active', 'is_active'],
      ]) {
        if (data[k] !== undefined) {
          sets.push(`${col} = ?`)
          vals.push(data[k])
        }
      }
      if (!sets.length) {
        const [rows] = await pool.query('SELECT * FROM raw_materials WHERE id = ?', [id])
        return rows[0] || null
      }
      vals.push(id)
      await pool.query(
        `UPDATE raw_materials SET ${sets.join(', ')} WHERE id = ?`,
        vals
      )
      const [rows] = await pool.query('SELECT * FROM raw_materials WHERE id = ?', [id])
      return rows[0] || null
    },
  }
}
