import { pool } from '../../db/db.js'
import { AppError } from '../../middleware/errorHandler.js'

/**
 * Custom BOM lines (no raw_material_id) are not linked to inventory_stock.
 * Shortage logic treats available quantity as 0 for those materials.
 */
export async function calculateMaterialRequirement(productId, orderQty) {
  const [rows] = await pool.query(
    `SELECT b.id AS bom_id, b.raw_material_id, b.custom_material_name, b.custom_unit,
            b.quantity_per_unit, b.unit AS bom_unit, b.bom_type,
            rm.material_code, rm.material_name AS rm_material_name
     FROM product_bom b
     LEFT JOIN raw_materials rm ON rm.id = b.raw_material_id
     WHERE b.product_id = ?
     ORDER BY b.id`,
    [productId]
  )
  const q = Number(orderQty)
  return rows.map((row) => {
    const materialName = row.raw_material_id
      ? row.rm_material_name
      : row.custom_material_name
    return {
      bom_id: row.bom_id,
      material_name: materialName,
      material_code: row.material_code || null,
      raw_material_id: row.raw_material_id,
      is_custom: !row.raw_material_id,
      required_qty: Number(row.quantity_per_unit) * q,
      unit: row.bom_unit,
      bom_type: row.bom_type,
    }
  })
}

export async function checkInventoryShortage(requirements) {
  const shortages = []
  for (const req of requirements) {
    if (!req.raw_material_id) {
      shortages.push({
        material_name: req.material_name,
        material_code: req.material_code,
        required: req.required_qty,
        available: 0,
        shortage: req.required_qty,
        unit: req.unit,
        note: 'Custom BOM line — no inventory row',
      })
      continue
    }
    const [rows] = await pool.query(
      `SELECT inv.quantity_on_hand, inv.min_stock_level, rm.material_name, rm.material_code
       FROM inventory_stock inv
       JOIN raw_materials rm ON rm.id = inv.raw_material_id
       WHERE inv.raw_material_id = ?`,
      [req.raw_material_id]
    )
    const inv = rows[0]
    const available = inv ? Number(inv.quantity_on_hand) : 0
    const short = Math.max(0, req.required_qty - available)
    if (short > 0) {
      shortages.push({
        material_name: inv?.material_name || req.material_name,
        material_code: inv?.material_code || req.material_code,
        required: req.required_qty,
        available,
        shortage: short,
        unit: req.unit,
      })
    }
  }
  return shortages
}

function normName(s) {
  return (s || '').trim().toLowerCase()
}

async function aggregateRequirements(items) {
  const map = new Map()
  for (const { product_id, quantity } of items) {
    const lines = await calculateMaterialRequirement(product_id, quantity)
    for (const line of lines) {
      const key = line.raw_material_id
        ? `rm:${line.raw_material_id}:${line.unit}`
        : `c:${normName(line.material_name)}:${line.unit}`
      const prev = map.get(key)
      if (prev) {
        prev.required_qty += line.required_qty
      } else {
        map.set(key, { ...line })
      }
    }
  }
  return [...map.values()]
}

async function resolveItems(items) {
  const resolved = []
  for (const it of items) {
    if ('product_id' in it) {
      const [rows] = await pool.query(
        `SELECT id FROM products WHERE id = ? AND is_active = TRUE`,
        [it.product_id]
      )
      if (!rows.length) throw new AppError(`Product not found: ${it.product_id}`, 404)
      resolved.push({ product_id: it.product_id, quantity: it.quantity })
      continue
    }
    const code = String(it.item_code).trim().toUpperCase()
    const [rows] = await pool.query(
      `SELECT id FROM products WHERE item_code = ? AND is_active = TRUE`,
      [code]
    )
    if (!rows.length) throw new AppError(`Unknown item_code: ${it.item_code}`, 404)
    resolved.push({ product_id: rows[0].id, quantity: it.quantity })
  }
  return resolved
}

export async function calculateForOrderItems(items) {
  const resolved = await resolveItems(items)
  const requirements = await aggregateRequirements(resolved)
  const shortages = await checkInventoryShortage(requirements)
  return { requirements, shortages }
}

export async function calculateForOrderId(orderId) {
  const [orderRows] = await pool.query(`SELECT id FROM orders WHERE id = ?`, [orderId])
  if (!orderRows.length) throw new AppError('Order not found', 404)

  const [items] = await pool.query(
    `SELECT oi.id AS order_item_id, oi.product_id, oi.quantity
     FROM order_items oi
     WHERE oi.order_id = ?
     ORDER BY oi.id`,
    [orderId]
  )
  if (!items.length) return { requirements: [], shortages: [] }

  // Build per-item material requirements applying overrides:
  // required_qty = (override.overridden_qty OR product_bom.quantity_per_unit) * order_item.quantity
  const lines = []
  for (const it of items) {
    const [bom] = await pool.query(
      `SELECT b.id AS bom_id, b.raw_material_id, b.custom_material_name, b.custom_unit,
              b.quantity_per_unit, b.unit AS bom_unit, b.bom_type,
              rm.material_code, rm.material_name AS rm_material_name,
              ovr.overridden_qty
       FROM product_bom b
       LEFT JOIN raw_materials rm ON rm.id = b.raw_material_id
       LEFT JOIN order_bom_overrides ovr
         ON ovr.bom_id = b.id AND ovr.order_item_id = ?
       WHERE b.product_id = ?
       ORDER BY b.id`,
      [it.order_item_id, it.product_id]
    )
    for (const row of bom) {
      const qtyPerUnit = row.overridden_qty != null ? Number(row.overridden_qty) : Number(row.quantity_per_unit)
      const materialName = row.raw_material_id ? row.rm_material_name : row.custom_material_name
      lines.push({
        bom_id: row.bom_id,
        material_name: materialName,
        material_code: row.material_code || null,
        raw_material_id: row.raw_material_id,
        is_custom: !row.raw_material_id,
        required_qty: qtyPerUnit * Number(it.quantity),
        unit: row.bom_unit,
        bom_type: row.bom_type,
      })
    }
  }

  // Aggregate across order items
  const map = new Map()
  for (const line of lines) {
    const key = line.raw_material_id
      ? `rm:${line.raw_material_id}:${line.unit}`
      : `c:${normName(line.material_name)}:${line.unit}`
    const prev = map.get(key)
    if (prev) prev.required_qty += line.required_qty
    else map.set(key, { ...line })
  }

  const requirements = [...map.values()]
  const shortages = await checkInventoryShortage(requirements)
  return { requirements, shortages }
}
