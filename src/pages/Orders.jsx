import React, { useState, useEffect } from 'react'
import { useProductCatalog } from '../hooks/useProductCatalog.js'
import { calculateMrpForOrder } from '../api/mrp.js'
import { createOrder, deleteOrder, fetchOrders, fetchOrder, updateOrder as apiUpdateOrder } from '../api/orders.js'
import { Plus, X, ChevronDown, ChevronUp, BarChart3 } from 'lucide-react'

const statusColors = {
  'In Production': 'blue',
  'Material Planning': 'orange',
  'Dispatched': 'green',
  'Delivered': 'gold',
  'Pending': 'orange',
}

function OrderModal({ onSave, onClose, products }) {
  const [form, setForm] = useState({ poNumber: '', client: '', orderDate: '', shipmentDate: '', status: 'Material Planning', items: [] })
  const [itemRow, setItemRow] = useState({ itemCode: '', qty: '' })

  const addItem = () => {
    if (!itemRow.itemCode || !itemRow.qty) return
    const product = products.find(p => p.itemCode === itemRow.itemCode)
    setForm(f => ({ ...f, items: [...f.items, { ...itemRow, qty: parseInt(itemRow.qty), productName: product?.name || '' }] }))
    setItemRow({ itemCode: '', qty: '' })
  }
  const removeItem = (i) => setForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }))

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>New Export Order</h3>
          <button onClick={onClose} style={{ background: 'none', color: 'var(--text2)' }}><X size={18} /></button>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-grid">
            <div className="form-group"><label>PO Number *</label><input value={form.poNumber} onChange={e => setForm(f => ({ ...f, poNumber: e.target.value }))} placeholder="e.g. PO-US-2024-0001" /></div>
            <div className="form-group"><label>Client Name *</label><input value={form.client} onChange={e => setForm(f => ({ ...f, client: e.target.value }))} /></div>
            <div className="form-group"><label>Order Date</label><input type="date" value={form.orderDate} onChange={e => setForm(f => ({ ...f, orderDate: e.target.value }))} /></div>
            <div className="form-group"><label>Shipment Date</label><input type="date" value={form.shipmentDate} onChange={e => setForm(f => ({ ...f, shipmentDate: e.target.value }))} /></div>
            <div className="form-group full">
              <label>Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                {['Material Planning', 'In Production', 'Quality Check', 'Dispatched', 'Delivered'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div>
            <div className="section-title">Order Items</div>
            {form.items.length > 0 && (
              <table style={{ marginBottom: 10 }}>
                <thead><tr><th>Item Code</th><th>Product</th><th>Qty</th><th></th></tr></thead>
                <tbody>
                  {form.items.map((item, i) => (
                    <tr key={i}>
                      <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--gold)' }}>{item.itemCode}</td>
                      <td>{item.productName}</td>
                      <td>{item.qty}</td>
                      <td><button className="btn btn-danger btn-sm" onClick={() => removeItem(i)}><X size={12} /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
              <div className="form-group" style={{ flex: 2 }}>
                <label>Item Code</label>
                <select value={itemRow.itemCode} onChange={e => setItemRow(r => ({ ...r, itemCode: e.target.value }))}>
                  <option value="">Select product...</option>
                  {products.map(p => <option key={p.itemCode} value={p.itemCode}>{p.itemCode} — {p.name}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ width: 80 }}>
                <label>Qty</label>
                <input type="number" value={itemRow.qty} onChange={e => setItemRow(r => ({ ...r, qty: e.target.value }))} />
              </div>
              <button className="btn btn-ghost btn-sm" onClick={addItem} style={{ marginBottom: 2 }}><Plus size={14} /> Add</button>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => onSave(form)}><Plus size={14} /> Create Order</button>
        </div>
      </div>
    </div>
  )
}

function MRPModal({ order, onClose }) {
  const [requirements, setRequirements] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setErr('')
      try {
        const res = await calculateMrpForOrder(order.id)
        const req = res.data?.requirements || []
        const short = res.data?.shortages || []
        const rows = req.map((r) => {
          const s = short.find(
            (x) => x.material_name === r.material_name && x.unit === r.unit
          )
          const total = r.required_qty
          const pending = s ? s.shortage : 0
          const available = s ? s.available : total
          return { material: r.material_name, unit: r.unit, total, available, pending }
        })
        if (!cancelled) setRequirements(rows)
      } catch (e) {
        if (!cancelled) {
          setErr(e.message || 'MRP failed')
          setRequirements([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [order])

  return (
    <div className="modal-overlay">
      <div className="modal modal-lg">
        <div className="modal-header">
          <h3>Material Requirements — {order.poNumber}</h3>
          <button onClick={onClose} style={{ background: 'none', color: 'var(--text2)' }}><X size={18} /></button>
        </div>
        <div className="modal-body">
          <div style={{ marginBottom: 12, padding: '10px 14px', background: 'var(--surface2)', borderRadius: 'var(--radius)', fontSize: 13 }}>
            <strong>{order.client}</strong> · {order.items.length} item type(s) · Ship by {new Date(order.shipmentDate).toLocaleDateString('en-IN')}
          </div>
          {err && <p style={{ color: 'var(--orange)', marginBottom: 10 }}>{err}</p>}
          {loading ? (
            <p style={{ color: 'var(--text3)' }}>Loading…</p>
          ) : requirements.length === 0 ? (
            <p style={{ color: 'var(--text3)' }}>No BOM data available for this order.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Material</th>
                  <th>Unit</th>
                  <th>Total Required</th>
                  <th>Available</th>
                  <th>To Purchase</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {requirements.map((r, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 500, color: 'var(--text)' }}>{r.material}</td>
                    <td>{r.unit}</td>
                    <td style={{ fontVariantNumeric: 'tabular-nums' }}>{r.total}</td>
                    <td style={{ fontVariantNumeric: 'tabular-nums', color: r.available < r.total ? 'var(--red)' : 'var(--green)' }}>{r.available}</td>
                    <td style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600, color: r.pending > 0 ? 'var(--orange)' : 'var(--green)' }}>{r.pending}</td>
                    <td>
                      {r.pending > 0
                        ? <span className="badge badge-red">Short</span>
                        : <span className="badge badge-green">OK</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}

export default function Orders() {
  const products = useProductCatalog()
  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [ordersError, setOrdersError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [mrpOrder, setMrpOrder] = useState(null)
  const [filterStatus, setFilterStatus] = useState('All')
  const statuses = ['All', 'Material Planning', 'In Production', 'Quality Check', 'Dispatched', 'Delivered']

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setOrdersLoading(true)
      setOrdersError('')
      try {
        const res = await fetchOrders({ page: 1, limit: 200 })
        if (!cancelled) setOrders(res.data || [])
      } catch (e) {
        if (!cancelled) {
          setOrdersError(e.message || 'Failed to load orders')
          setOrders([])
        }
      } finally {
        if (!cancelled) setOrdersLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  const filtered = filterStatus === 'All' ? orders : orders.filter(o => o.status === filterStatus)

  const refreshOne = async (id) => {
    const res = await fetchOrder(id)
    const d = res.data
    setOrders((prev) => prev.map((o) => (o.id === id ? d : o)))
  }

  const create = async (form) => {
    const items = form.items.map((it) => {
      const p = products.find((x) => x.itemCode === it.itemCode)
      return { product_id: p?.id, quantity: it.qty }
    })
    if (items.some((x) => !x.product_id)) throw new Error('Select valid products')
    const payload = {
      po_number: form.poNumber,
      client_name: form.client,
      order_date: form.orderDate || null,
      shipment_date: form.shipmentDate || null,
      status: form.status,
      items,
    }
    const out = await createOrder(payload)
    const full = await fetchOrder(out.order_id)
    setOrders((prev) => [full.data, ...prev])
  }

  const updateStatus = async (id, status) => {
    await apiUpdateOrder(id, { status })
    await refreshOne(id)
  }

  const remove = async (id) => {
    if (!window.confirm('Delete this order?')) return
    await deleteOrder(id)
    setOrders((prev) => prev.filter((o) => o.id !== id))
  }

  return (
    <div>
      <div className="page-header">
        <h2>Export Orders</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={14} /> New Order</button>
      </div>

      <div className="chip-group" style={{ marginBottom: 16 }}>
        {statuses.map(s => (
          <button key={s} className={`chip ${filterStatus === s ? 'active' : ''}`} onClick={() => setFilterStatus(s)}>{s}</button>
        ))}
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table>
          <thead>
            <tr>
              <th>PO Number</th>
              <th>Client</th>
              <th>Order Date</th>
              <th>Shipment Date</th>
              <th>Items</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(o => (
              <tr key={o.id}>
                <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--gold)', fontWeight: 600 }}>{o.po_number}</td>
                <td style={{ color: 'var(--text)', fontWeight: 500 }}>{o.client_name}</td>
                <td>{o.order_date ? new Date(o.order_date).toLocaleDateString('en-IN') : '—'}</td>
                <td>{o.shipment_date ? new Date(o.shipment_date).toLocaleDateString('en-IN') : '—'}</td>
                <td>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {(o.items || []).map((item, i) => (
                      <span key={i} style={{ fontSize: 11, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 4, padding: '2px 6px', color: 'var(--text2)' }}>
                        {item.item_code} ×{item.quantity}
                      </span>
                    ))}
                  </div>
                </td>
                <td>
                  <select
                    value={o.status}
                    onChange={e => updateStatus(o.id, e.target.value)}
                    style={{ padding: '4px 8px', fontSize: 12, width: 'auto' }}
                  >
                    {['Material Planning', 'In Production', 'Quality Check', 'Dispatched', 'Delivered'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </td>
                <td>
                  <button className="btn btn-ghost btn-sm" onClick={() => setMrpOrder(o)} title="View Material Requirements">
                    <BarChart3 size={13} /> MRP
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => remove(o.id)} style={{ marginLeft: 8 }}>
                    <X size={13} /> Delete
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text3)', padding: '30px' }}>No orders found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {ordersError && <div style={{ marginTop: 12, color: 'var(--orange)' }}>{ordersError}</div>}
      {ordersLoading && <div style={{ marginTop: 12, color: 'var(--text3)' }}>Loading orders…</div>}

      {showModal && (
        <OrderModal
          products={products}
          onSave={async (o) => {
            await create(o)
            setShowModal(false)
          }}
          onClose={() => setShowModal(false)}
        />
      )}
      {mrpOrder && <MRPModal order={mrpOrder} onClose={() => setMrpOrder(null)} />}
    </div>
  )
}
