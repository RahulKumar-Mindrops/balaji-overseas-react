import React, { useState, useEffect, useCallback } from 'react'
import { Plus, Edit2, Trash2, X, ChevronDown, ChevronUp, Wand2, AlertCircle } from 'lucide-react'
import {
  fetchProducts,
  fetchProduct,
  createProduct,
  updateProduct,
  deleteProduct as apiDeleteProduct,
  suggestItemCode,
} from '../api/products.js'
import { fetchMaterials } from '../api/materials.js'

const PACKING_TYPES = ['CARTON', 'INNER', 'BUBBLE', 'THERMOCOL']
const BOM_TYPES = ['PRODUCTION', 'PACKING', 'FINISHING', 'CUSTOM']
const UNIT_OPTIONS = ['sqft', 'sqmtr', 'pcs', 'kg', 'meter', 'set', 'liter']
const CATEGORIES = [
  'Marble Box',
  'Inlay Tray',
  'Furniture',
  'Bathroom',
  'Decor',
  'Flooring',
  'Kitchen',
  'Custom',
]

function emptyPackingSlots() {
  return PACKING_TYPES.map((packing_type) => ({
    packing_type,
    material_name: '',
    quantity: '',
    unit: 'pcs',
  }))
}

function emptyForm() {
  return {
    item_code: '',
    product_name: '',
    category: '',
    marble_type: '',
    color: '',
    thickness_mm: '',
    size_length_mm: '',
    size_width_mm: '',
    size_height_mm: '',
    has_wood: false,
    has_mdf: false,
    has_metal: false,
    has_glass: false,
    has_fabric: false,
    has_custom: false,
    bom: [],
    packing: emptyPackingSlots(),
  }
}

function mapApiProductToCard(p) {
  const bomPreview = (p.bom || []).map((b) => ({
    material: b.material_name,
    qty: b.quantity_per_unit,
    unit: b.unit,
  }))
  return {
    id: p.id,
    itemCode: p.item_code,
    name: p.product_name,
    category: p.category || '',
    marbleType: p.marble_type || '',
    color: p.color || '',
    thickness: p.thickness_mm != null ? `${p.thickness_mm} mm` : '',
    size:
      p.size_length_mm != null && p.size_width_mm != null
        ? `${p.size_length_mm} × ${p.size_width_mm}${p.size_height_mm != null ? ` × ${p.size_height_mm}` : ''} mm`
        : '',
    bom: bomPreview,
    bomLineCount: p.bom_line_count ?? bomPreview.length,
    packing: (p.packing || []).reduce((acc, row) => {
      acc[row.packing_type?.toLowerCase() || ''] = [
        row.material_name,
        row.quantity,
        row.unit,
      ]
        .filter(Boolean)
        .join(' ')
      return acc
    }, {}),
    _raw: p,
  }
}

function buildPayload(form) {
  const num = (v) => {
    const n = parseFloat(v)
    return v === '' || v == null || Number.isNaN(n) ? null : n
  }
  const bom = (form.bom || []).map((row) => {
    if (row.use_custom) {
      return {
        custom_material_name: (row.custom_material_name || '').trim(),
        custom_unit: (row.custom_unit || '').trim() || row.unit,
        quantity_per_unit: parseFloat(row.quantity_per_unit),
        unit: row.unit,
        bom_type: row.bom_type || 'PRODUCTION',
      }
    }
    return {
      raw_material_id: parseInt(row.raw_material_id, 10),
      quantity_per_unit: parseFloat(row.quantity_per_unit),
      unit: row.unit,
      bom_type: row.bom_type || 'PRODUCTION',
    }
  })
  const packing = (form.packing || [])
    .filter((r) => (r.material_name || '').trim() && r.quantity !== '' && r.unit)
    .map((r) => ({
      packing_type: r.packing_type,
      material_name: r.material_name.trim(),
      quantity: parseFloat(r.quantity),
      unit: r.unit,
    }))
  return {
    item_code: (form.item_code || '').trim().toUpperCase(),
    product_name: (form.product_name || '').trim(),
    category: form.category || null,
    marble_type: form.marble_type || null,
    color: form.color || null,
    thickness_mm: num(form.thickness_mm),
    size_length_mm: num(form.size_length_mm),
    size_width_mm: num(form.size_width_mm),
    size_height_mm: num(form.size_height_mm),
    has_wood: !!form.has_wood,
    has_mdf: !!form.has_mdf,
    has_metal: !!form.has_metal,
    has_glass: !!form.has_glass,
    has_fabric: !!form.has_fabric,
    has_custom: !!form.has_custom,
    bom,
    packing,
  }
}

function ProductModal({ productId, materials, onSave, onClose }) {
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(!!productId)
  const [error, setError] = useState('')
  const [bomDraft, setBomDraft] = useState({
    use_custom: false,
    raw_material_id: '',
    custom_material_name: '',
    custom_unit: '',
    quantity_per_unit: '',
    unit: 'sqft',
    bom_type: 'PRODUCTION',
  })

  useEffect(() => {
    if (!productId) {
      setForm(emptyForm())
      setLoading(false)
      return
    }
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError('')
      try {
        const res = await fetchProduct(productId)
        const d = res.data
        if (cancelled) return
        setForm({
          item_code: d.item_code || '',
          product_name: d.product_name || '',
          category: d.category || '',
          marble_type: d.marble_type || '',
          color: d.color || '',
          thickness_mm: d.thickness_mm ?? '',
          size_length_mm: d.size_length_mm ?? '',
          size_width_mm: d.size_width_mm ?? '',
          size_height_mm: d.size_height_mm ?? '',
          has_wood: !!d.has_wood,
          has_mdf: !!d.has_mdf,
          has_metal: !!d.has_metal,
          has_glass: !!d.has_glass,
          has_fabric: !!d.has_fabric,
          has_custom: !!d.has_custom,
          bom: (d.bom || []).map((b) => ({
            use_custom: !!b.is_custom,
            raw_material_id: b.raw_material_id ? String(b.raw_material_id) : '',
            custom_material_name: b.custom_material_name || '',
            custom_unit: b.custom_unit || '',
            quantity_per_unit: String(b.quantity_per_unit ?? ''),
            unit: b.unit,
            bom_type: b.bom_type || 'PRODUCTION',
          })),
          packing: PACKING_TYPES.map((pt) => {
            const row = (d.packing || []).find((p) => p.packing_type === pt)
            return {
              packing_type: pt,
              material_name: row?.material_name || '',
              quantity: row?.quantity != null ? String(row.quantity) : '',
              unit: row?.unit || 'pcs',
            }
          }),
        })
      } catch (e) {
        if (!cancelled) setError(e.message || 'Failed to load product')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [productId])

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const setPack = (i, k, v) =>
    setForm((f) => ({
      ...f,
      packing: f.packing.map((p, idx) => (idx === i ? { ...p, [k]: v } : p)),
    }))

  const addBom = () => {
    const q = parseFloat(bomDraft.quantity_per_unit)
    if (!bomDraft.use_custom) {
      if (!bomDraft.raw_material_id || Number.isNaN(q) || q <= 0) return
    } else {
      if (!(bomDraft.custom_material_name || '').trim() || Number.isNaN(q) || q <= 0) return
      if (!(bomDraft.custom_unit || '').trim()) return
    }
    setForm((f) => ({
      ...f,
      bom: [
        ...f.bom,
        {
          use_custom: bomDraft.use_custom,
          raw_material_id: bomDraft.raw_material_id,
          custom_material_name: bomDraft.custom_material_name,
          custom_unit: bomDraft.custom_unit,
          quantity_per_unit: String(q),
          unit: bomDraft.unit,
          bom_type: bomDraft.bom_type,
        },
      ],
    }))
    setBomDraft({
      use_custom: false,
      raw_material_id: '',
      custom_material_name: '',
      custom_unit: '',
      quantity_per_unit: '',
      unit: 'sqft',
      bom_type: 'PRODUCTION',
    })
  }

  const removeBom = (i) =>
    setForm((f) => ({ ...f, bom: f.bom.filter((_, idx) => idx !== i) }))
  const updateBom = (i, k, v) =>
    setForm((f) => ({
      ...f,
      bom: f.bom.map((b, idx) => (idx === i ? { ...b, [k]: v } : b)),
    }))

  const suggestCode = async () => {
    setError('')
    try {
      const cat = form.category || 'Custom'
      const mat = form.marble_type || form.category || 'GEN'
      const res = await suggestItemCode(cat, mat)
      set('item_code', res.data?.item_code || res.item_code || '')
    } catch (e) {
      setError(e.message || 'Could not suggest code')
    }
  }

  const submit = async () => {
    setError('')
    try {
      const payload = buildPayload(form)
      await onSave({ productId, payload })
    } catch (e) {
      setError(e.message || 'Save failed')
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal modal-lg">
        <div className="modal-header">
          <h3>{productId ? 'Edit Product Profile' : 'New Product Profile'}</h3>
          <button type="button" onClick={onClose} style={{ background: 'none', color: 'var(--text2)', padding: 4 }}>
            <X size={18} />
          </button>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 12px',
                background: 'var(--red-dim)',
                borderRadius: 'var(--radius)',
                fontSize: 13,
                color: '#e88884',
              }}
            >
              <AlertCircle size={16} /> {error}
            </div>
          )}
          {loading ? (
            <div style={{ color: 'var(--text3)' }}>Loading…</div>
          ) : (
            <>
              <div>
                <div className="section-title">Basic Information</div>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Item code *</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input
                        value={form.item_code}
                        onChange={(e) => set('item_code', e.target.value)}
                        placeholder="BO-MRB-001"
                        style={{ flex: 1 }}
                      />
                      <button type="button" className="btn btn-ghost btn-sm" onClick={suggestCode} title="Suggest code">
                        <Wand2 size={14} /> Suggest
                      </button>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Product name *</label>
                    <input
                      value={form.product_name}
                      onChange={(e) => set('product_name', e.target.value)}
                      placeholder="White Marble Box 4x4"
                    />
                  </div>
                  <div className="form-group">
                    <label>Category</label>
                    <select value={form.category} onChange={(e) => set('category', e.target.value)}>
                      <option value="">Select…</option>
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Marble type</label>
                    <input
                      value={form.marble_type}
                      onChange={(e) => set('marble_type', e.target.value)}
                      placeholder="Makrana White"
                    />
                  </div>
                  <div className="form-group">
                    <label>Color</label>
                    <input value={form.color} onChange={(e) => set('color', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Thickness (mm)</label>
                    <input
                      type="number"
                      value={form.thickness_mm}
                      onChange={(e) => set('thickness_mm', e.target.value)}
                      placeholder="15"
                    />
                  </div>
                  <div className="form-group">
                    <label>Length (mm)</label>
                    <input
                      type="number"
                      value={form.size_length_mm}
                      onChange={(e) => set('size_length_mm', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Width (mm)</label>
                    <input
                      type="number"
                      value={form.size_width_mm}
                      onChange={(e) => set('size_width_mm', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Height (mm)</label>
                    <input
                      type="number"
                      value={form.size_height_mm}
                      onChange={(e) => set('size_height_mm', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div>
                <div className="section-title">Material flags</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
                  {[
                    ['has_wood', 'Wood'],
                    ['has_mdf', 'MDF'],
                    ['has_metal', 'Metal'],
                    ['has_glass', 'Glass'],
                    ['has_fabric', 'Fabric'],
                    ['has_custom', 'Custom'],
                  ].map(([k, label]) => (
                    <label key={k} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                      <input type="checkbox" checked={!!form[k]} onChange={(e) => set(k, e.target.checked)} />
                      <span style={{ fontSize: 13, color: 'var(--text2)' }}>{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <div className="section-title">Bill of Materials</div>
                {form.bom.length > 0 && (
                  <table style={{ marginBottom: 10 }}>
                    <thead>
                      <tr>
                        <th>Material</th>
                        <th>Qty / unit</th>
                        <th>Unit</th>
                        <th>Type</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {form.bom.map((b, i) => (
                        <tr key={i}>
                          <td>
                            {b.use_custom ? (
                              <span>{b.custom_material_name}</span>
                            ) : (
                              <select
                                value={b.raw_material_id}
                                onChange={(e) => updateBom(i, 'raw_material_id', e.target.value)}
                                style={{ padding: '5px 8px' }}
                              >
                                <option value="">—</option>
                                {materials.map((m) => (
                                  <option key={m.id} value={String(m.id)}>
                                    {m.material_code} — {m.material_name}
                                  </option>
                                ))}
                              </select>
                            )}
                          </td>
                          <td>
                            <input
                              type="number"
                              value={b.quantity_per_unit}
                              onChange={(e) => updateBom(i, 'quantity_per_unit', e.target.value)}
                              style={{ padding: '5px 8px', width: 90 }}
                            />
                          </td>
                          <td>
                            <select
                              value={b.unit}
                              onChange={(e) => updateBom(i, 'unit', e.target.value)}
                              style={{ padding: '5px 8px' }}
                            >
                              {UNIT_OPTIONS.map((u) => (
                                <option key={u} value={u}>
                                  {u}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <select
                              value={b.bom_type}
                              onChange={(e) => updateBom(i, 'bom_type', e.target.value)}
                              style={{ padding: '5px 8px' }}
                            >
                              {BOM_TYPES.map((t) => (
                                <option key={t} value={t}>
                                  {t}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <button type="button" className="btn btn-danger btn-sm" onClick={() => removeBom(i)}>
                              <Trash2 size={12} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, fontSize: 13 }}>
                  <input
                    type="checkbox"
                    checked={bomDraft.use_custom}
                    onChange={(e) => setBomDraft((r) => ({ ...r, use_custom: e.target.checked }))}
                  />
                  Custom material (not in master list)
                </label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                  {!bomDraft.use_custom ? (
                    <div className="form-group" style={{ flex: 2, minWidth: 200 }}>
                      <label>Raw material</label>
                      <select
                        value={bomDraft.raw_material_id}
                        onChange={(e) => setBomDraft((r) => ({ ...r, raw_material_id: e.target.value }))}
                      >
                        <option value="">Select…</option>
                        {materials.map((m) => (
                          <option key={m.id} value={String(m.id)}>
                            {m.material_code} — {m.material_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <>
                      <div className="form-group" style={{ flex: 2, minWidth: 160 }}>
                        <label>Custom name</label>
                        <input
                          value={bomDraft.custom_material_name}
                          onChange={(e) => setBomDraft((r) => ({ ...r, custom_material_name: e.target.value }))}
                        />
                      </div>
                      <div className="form-group" style={{ width: 100 }}>
                        <label>Custom unit</label>
                        <input
                          value={bomDraft.custom_unit}
                          onChange={(e) => setBomDraft((r) => ({ ...r, custom_unit: e.target.value }))}
                          placeholder="set"
                        />
                      </div>
                    </>
                  )}
                  <div className="form-group" style={{ width: 90 }}>
                    <label>Qty / unit</label>
                    <input
                      type="number"
                      value={bomDraft.quantity_per_unit}
                      onChange={(e) => setBomDraft((r) => ({ ...r, quantity_per_unit: e.target.value }))}
                    />
                  </div>
                  <div className="form-group" style={{ width: 110 }}>
                    <label>Unit</label>
                    <select value={bomDraft.unit} onChange={(e) => setBomDraft((r) => ({ ...r, unit: e.target.value }))}>
                      {UNIT_OPTIONS.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group" style={{ minWidth: 130 }}>
                    <label>Type</label>
                    <select
                      value={bomDraft.bom_type}
                      onChange={(e) => setBomDraft((r) => ({ ...r, bom_type: e.target.value }))}
                    >
                      {BOM_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={addBom} style={{ marginBottom: 2 }}>
                    <Plus size={14} /> Add line
                  </button>
                </div>
              </div>

              <div>
                <div className="section-title">Packing (fixed slots)</div>
                <table>
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Material name</th>
                      <th>Qty</th>
                      <th>Unit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {form.packing.map((row, i) => (
                      <tr key={row.packing_type}>
                        <td style={{ fontWeight: 600, color: 'var(--gold)' }}>{row.packing_type}</td>
                        <td>
                          <input
                            value={row.material_name}
                            onChange={(e) => setPack(i, 'material_name', e.target.value)}
                            style={{ padding: '5px 8px' }}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            value={row.quantity}
                            onChange={(e) => setPack(i, 'quantity', e.target.value)}
                            style={{ padding: '5px 8px', width: 90 }}
                          />
                        </td>
                        <td>
                          <select
                            value={row.unit}
                            onChange={(e) => setPack(i, 'unit', e.target.value)}
                            style={{ padding: '5px 8px' }}
                          >
                            {UNIT_OPTIONS.map((u) => (
                              <option key={u} value={u}>
                                {u}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" disabled={loading} onClick={submit}>
            <Plus size={14} /> {productId ? 'Update' : 'Create'} product
          </button>
        </div>
      </div>
    </div>
  )
}

function ProductCard({ product, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const [detail, setDetail] = useState(null)

  useEffect(() => {
    if (!expanded) {
      setDetail(null)
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetchProduct(product.id)
        if (!cancelled) setDetail(res.data)
      } catch {
        if (!cancelled) setDetail(null)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [expanded, product.id])

  const bomRows =
    detail?.bom?.map((b) => ({
      material: b.material_name,
      qty: b.quantity_per_unit,
      unit: b.unit,
    })) || product.bom
  const packRows = detail?.packing || null

  return (
    <div className="card" style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span
              style={{
                fontFamily: 'monospace',
                fontSize: 12,
                color: 'var(--gold)',
                background: 'var(--gold-dim)',
                padding: '2px 8px',
                borderRadius: 4,
              }}
            >
              {product.itemCode}
            </span>
            {product.category && <span className="badge badge-blue">{product.category}</span>}
            {product._raw?.is_active === false && (
              <span className="badge badge-red">Inactive</span>
            )}
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 600 }}>{product.name}</h3>
          <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>
            {[product.marbleType, product.color, product.thickness, product.size].filter(Boolean).join(' · ')}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setExpanded((e) => !e)}>
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />} BOM ({product.bomLineCount ?? product.bom.length})
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => onEdit(product.id)}>
            <Edit2 size={13} />
          </button>
          <button type="button" className="btn btn-danger btn-sm" onClick={() => onDelete(product.id)}>
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {expanded && (
        <div style={{ marginTop: 14, borderTop: '1px solid var(--border)', paddingTop: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <div className="section-title">Bill of Materials</div>
              <table>
                <thead>
                  <tr>
                    <th>Material</th>
                    <th>Qty</th>
                    <th>Unit</th>
                  </tr>
                </thead>
                <tbody>
                  {bomRows.map((b, i) => (
                    <tr key={i}>
                      <td>{b.material}</td>
                      <td style={{ fontVariantNumeric: 'tabular-nums' }}>{b.qty}</td>
                      <td>{b.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div>
              <div className="section-title">Packing</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {PACKING_TYPES.map((k) => {
                  const row = packRows?.find((r) => r.packing_type === k)
                  const label = row
                    ? [row.material_name, row.quantity, row.unit].filter(Boolean).join(' ')
                    : product.packing[k.toLowerCase()] || '—'
                  return (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                      <span style={{ color: 'var(--text3)' }}>{k}:</span>
                      <span style={{ color: 'var(--text)' }}>{label}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Products() {
  const [list, setList] = useState([])
  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(true)
  const [listError, setListError] = useState('')
  const [modalId, setModalId] = useState(null)
  const [search, setSearch] = useState('')
  const [showInactive, setShowInactive] = useState(false)

  const loadList = useCallback(async () => {
    setListError('')
    setLoading(true)
    try {
      const res = await fetchProducts({
        limit: 100,
        page: 1,
        q: search.trim() || undefined,
        include_inactive: showInactive,
      })
      setList((res.data || []).map(mapApiProductToCard))
    } catch (e) {
      setListError(e.message || 'Could not load products')
      setList([])
    } finally {
      setLoading(false)
    }
  }, [search, showInactive])

  useEffect(() => {
    loadList()
  }, [loadList])

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetchMaterials()
        setMaterials(res.data || [])
      } catch {
        setMaterials([])
      }
    })()
  }, [])

  const handleSave = async ({ productId, payload }) => {
    if (productId) {
      await updateProduct(productId, payload)
    } else {
      await createProduct(payload)
    }
    setModalId(null)
    await loadList()
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this product?')) return
    try {
      await apiDeleteProduct(id)
      await loadList()
    } catch (e) {
      alert(e.message || 'Delete failed')
    }
  }

  const filtered = list

  return (
    <div>
      <div className="page-header">
        <h2>Product Profiles</h2>
        <button type="button" className="btn btn-primary" onClick={() => setModalId('new')}>
          <Plus size={14} /> New product
        </button>
      </div>

      <div style={{ marginBottom: 16, display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, code, category…"
          style={{ maxWidth: 320 }}
        />
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
          <input type="checkbox" checked={showInactive} onChange={(e) => setShowInactive(e.target.checked)} />
          Show inactive
        </label>
      </div>

      {listError && (
        <div
          style={{
            marginBottom: 12,
            padding: '10px 14px',
            background: 'var(--red-dim)',
            borderRadius: 'var(--radius)',
            fontSize: 13,
            color: '#e88884',
          }}
        >
          {listError}
        </div>
      )}

      <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 14 }}>
        {loading ? 'Loading…' : `${filtered.length} products`}
      </div>

      {!loading &&
        filtered.map((p) => (
          <ProductCard key={p.id} product={p} onEdit={setModalId} onDelete={handleDelete} />
        ))}

      {modalId != null && (
        <ProductModal
          productId={modalId === 'new' ? null : modalId}
          materials={materials}
          onSave={handleSave}
          onClose={() => setModalId(null)}
        />
      )}
    </div>
  )
}
