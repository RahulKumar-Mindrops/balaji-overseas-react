import React, { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { Plus, X, AlertTriangle, Edit2 } from 'lucide-react'
import { calculateMrp } from '../api/mrp.js'
import { useProductCatalog } from '../hooks/useProductCatalog.js'

// ─── INVENTORY ───────────────────────────────────────────────
export function Inventory() {
  const { inventory, addInventory, updateInventory } = useApp()
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({ material: '', category: '', qty: '', unit: 'SqFt', minStock: '' })
  const categories = ['Marble', 'Wood', 'MDF', 'Metal', 'Fittings', 'Electrical', 'Consumable', 'Packing']
  const units = ['SqFt', 'SqMtr', 'Mtr', 'Kg', 'Pcs', 'Set', 'Tube', 'Ltr', 'Roll']

  const save = () => {
    if (modal === 'new') addInventory({ ...form, qty: parseFloat(form.qty), minStock: parseFloat(form.minStock) })
    else updateInventory(modal.id, { ...form, qty: parseFloat(form.qty), minStock: parseFloat(form.minStock) })
    setModal(null)
  }
  const openNew = () => { setForm({ material: '', category: '', qty: '', unit: 'SqFt', minStock: '' }); setModal('new') }
  const openEdit = (item) => { setForm({ ...item }); setModal(item) }

  return (
    <div>
      <div className="page-header">
        <h2>Inventory</h2>
        <button className="btn btn-primary" onClick={openNew}><Plus size={14} /> Add Material</button>
      </div>
      <div style={{ marginBottom: 14, display: 'flex', gap: 14 }}>
        <div className="stat-card" style={{ flex: 1, padding: '14px 18px' }}>
          <div style={{ fontSize: 11, color: 'var(--text3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Total Materials</div>
          <div style={{ fontSize: 24, fontFamily: 'Playfair Display', color: 'var(--gold)', marginTop: 4 }}>{inventory.length}</div>
        </div>
        <div className="stat-card" style={{ flex: 1, padding: '14px 18px' }}>
          <div style={{ fontSize: 11, color: 'var(--text3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Low Stock Alerts</div>
          <div style={{ fontSize: 24, fontFamily: 'Playfair Display', color: 'var(--red)', marginTop: 4 }}>{inventory.filter(i => i.qty < i.minStock).length}</div>
        </div>
      </div>
      <div className="card" style={{ padding: 0 }}>
        <table>
          <thead><tr><th>Material</th><th>Category</th><th>Stock</th><th>Unit</th><th>Min Stock</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {inventory.map(item => {
              const isLow = item.qty < item.minStock
              const pct = Math.min(100, Math.round((item.qty / item.minStock) * 100))
              return (
                <tr key={item.id}>
                  <td style={{ fontWeight: 500, color: 'var(--text)' }}>{item.material}</td>
                  <td><span className="badge badge-blue">{item.category}</span></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ color: isLow ? 'var(--red)' : 'var(--text)', fontWeight: isLow ? 600 : 400 }}>{item.qty}</span>
                      <div style={{ width: 60, height: 4, background: 'var(--surface3)', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: isLow ? 'var(--red)' : 'var(--green)', borderRadius: 2 }} />
                      </div>
                    </div>
                  </td>
                  <td>{item.unit}</td>
                  <td style={{ color: 'var(--text3)' }}>{item.minStock}</td>
                  <td>{isLow ? <span className="badge badge-red"><AlertTriangle size={10} /> Low</span> : <span className="badge badge-green">OK</span>}</td>
                  <td><button className="btn btn-ghost btn-sm" onClick={() => openEdit(item)}><Edit2 size={13} /></button></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {modal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{modal === 'new' ? 'Add Material' : 'Update Stock'}</h3>
              <button onClick={() => setModal(null)} style={{ background: 'none', color: 'var(--text2)' }}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group full"><label>Material Name</label><input value={form.material} onChange={e => setForm(f => ({ ...f, material: e.target.value }))} /></div>
                <div className="form-group"><label>Category</label><select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}><option value="">Select...</option>{categories.map(c => <option key={c}>{c}</option>)}</select></div>
                <div className="form-group"><label>Unit</label><select value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}>{units.map(u => <option key={u}>{u}</option>)}</select></div>
                <div className="form-group"><label>Current Qty</label><input type="number" value={form.qty} onChange={e => setForm(f => ({ ...f, qty: e.target.value }))} /></div>
                <div className="form-group"><label>Min Stock Level</label><input type="number" value={form.minStock} onChange={e => setForm(f => ({ ...f, minStock: e.target.value }))} /></div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={save}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── MRP PAGE ────────────────────────────────────────────────
export function MRP() {
  const { orders } = useApp()
  const [selected, setSelected] = useState(orders[0]?.id || '')
  const [requirements, setRequirements] = useState([])
  const [mrpError, setMrpError] = useState('')
  const [mrpLoading, setMrpLoading] = useState(false)

  useEffect(() => {
    const order = orders.find((o) => o.id === selected)
    if (!selected || !order?.items?.length) {
      setRequirements([])
      setMrpError('')
      return
    }
    let cancelled = false
    ;(async () => {
      setMrpLoading(true)
      setMrpError('')
      try {
        const items = order.items.map((it) => ({
          item_code: it.itemCode,
          quantity: it.qty,
        }))
        const res = await calculateMrp(items)
        const req = res.data?.requirements || []
        const short = res.data?.shortages || []
        const rows = req.map((r) => {
          const s = short.find(
            (x) => x.material_name === r.material_name && x.unit === r.unit
          )
          const total = r.required_qty
          const pending = s ? s.shortage : 0
          const available = s ? s.available : total
          return {
            material: r.material_name,
            unit: r.unit,
            total,
            available,
            pending,
          }
        })
        if (!cancelled) setRequirements(rows)
      } catch (e) {
        if (!cancelled) {
          setMrpError(e.message || 'MRP request failed')
          setRequirements([])
        }
      } finally {
        if (!cancelled) setMrpLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [selected, orders])

  const order = orders.find((o) => o.id === selected)
  const shortage = requirements.filter((r) => r.pending > 0)

  return (
    <div>
      <div className="page-header"><h2>Material Requirements Planning</h2></div>
      <div style={{ marginBottom: 18, display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: 11, color: 'var(--text3)', display: 'block', marginBottom: 5, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Select Order</label>
          <select value={selected} onChange={e => setSelected(e.target.value)} style={{ maxWidth: 400 }}>
            <option value="">Choose an order...</option>
            {orders.map(o => <option key={o.id} value={o.id}>{o.poNumber} — {o.client}</option>)}
          </select>
        </div>
        {order && (
          <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '10px 16px', fontSize: 13 }}>
            Ship by: <strong style={{ color: 'var(--gold)' }}>{new Date(order.shipmentDate).toLocaleDateString('en-IN')}</strong>
          </div>
        )}
      </div>

      {shortage.length > 0 && (
        <div style={{ marginBottom: 14, padding: '12px 16px', background: 'var(--red-dim)', border: '1px solid rgba(217,83,79,0.3)', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
          <AlertTriangle size={16} color="var(--red)" />
          <span style={{ color: '#e88884' }}><strong>{shortage.length} material(s)</strong> need to be purchased to fulfill this order.</span>
        </div>
      )}

      {mrpError && (
        <div style={{ marginBottom: 12, padding: '10px 14px', background: 'var(--orange-dim)', borderRadius: 'var(--radius)', fontSize: 13, color: '#f5c57a' }}>
          {mrpError} (Start the API and run migrations, or use mock orders only after seeding the database.)
        </div>
      )}

      {mrpLoading && <p style={{ color: 'var(--text3)' }}>Calculating…</p>}

      {!mrpLoading && requirements.length > 0 ? (
        <div className="card" style={{ padding: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Material</th>
                <th>Unit</th>
                <th>Total Required</th>
                <th>Available Inventory</th>
                <th>Pending Purchase</th>
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
                  <td style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600, color: r.pending > 0 ? 'var(--orange)' : 'var(--text3)' }}>{r.pending || '—'}</td>
                  <td>{r.pending > 0 ? <span className="badge badge-red">Shortage</span> : <span className="badge badge-green">Sufficient</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : !mrpLoading && selected ? (
        <p style={{ color: 'var(--text3)' }}>No BOM data for selected order.</p>
      ) : !mrpLoading ? (
        <p style={{ color: 'var(--text3)' }}>Select an order to view material requirements.</p>
      ) : null}
    </div>
  )
}

// ─── PURCHASE ORDERS ─────────────────────────────────────────
export function PurchaseOrders() {
  const { purchaseOrders, addPO, updatePO, vendors } = useApp()
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ supplier: '', material: '', qty: '', unit: 'SqFt', rate: '', deliveryDate: '', status: 'Pending' })
  const suppliers = vendors.filter(v => v.category === 'Supplier').map(v => v.name)
  const units = ['SqFt', 'SqMtr', 'Mtr', 'Kg', 'Pcs', 'Set']
  const statusColors = { 'Pending': 'orange', 'Confirmed': 'blue', 'Delivered': 'green', 'Cancelled': 'red' }

  const save = () => {
    const qty = parseFloat(form.qty), rate = parseFloat(form.rate)
    addPO({ ...form, qty, rate, total: qty * rate })
    setModal(false)
  }

  return (
    <div>
      <div className="page-header">
        <h2>Purchase Orders</h2>
        <button className="btn btn-primary" onClick={() => setModal(true)}><Plus size={14} /> New PO</button>
      </div>
      <div className="card" style={{ padding: 0 }}>
        <table>
          <thead><tr><th>PO ID</th><th>Supplier</th><th>Material</th><th>Qty</th><th>Rate (₹)</th><th>Total (₹)</th><th>Delivery Date</th><th>Status</th></tr></thead>
          <tbody>
            {purchaseOrders.map(po => (
              <tr key={po.id}>
                <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--gold)' }}>{po.id}</td>
                <td style={{ color: 'var(--text)', fontWeight: 500 }}>{po.supplier}</td>
                <td>{po.material}</td>
                <td>{po.qty} {po.unit}</td>
                <td>₹{po.rate.toLocaleString()}</td>
                <td style={{ fontWeight: 600 }}>₹{po.total.toLocaleString()}</td>
                <td>{new Date(po.deliveryDate).toLocaleDateString('en-IN')}</td>
                <td>
                  <select value={po.status} onChange={e => updatePO(po.id, { status: e.target.value })} style={{ padding: '4px 8px', fontSize: 12, width: 'auto' }}>
                    {['Pending', 'Confirmed', 'Delivered', 'Cancelled'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {modal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header"><h3>New Purchase Order</h3><button onClick={() => setModal(false)} style={{ background: 'none', color: 'var(--text2)' }}><X size={18} /></button></div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group"><label>Supplier</label>
                  <select value={form.supplier} onChange={e => setForm(f => ({ ...f, supplier: e.target.value }))}>
                    <option value="">Select...</option>{suppliers.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group"><label>Material</label><input value={form.material} onChange={e => setForm(f => ({ ...f, material: e.target.value }))} /></div>
                <div className="form-group"><label>Quantity</label><input type="number" value={form.qty} onChange={e => setForm(f => ({ ...f, qty: e.target.value }))} /></div>
                <div className="form-group"><label>Unit</label><select value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}>{units.map(u => <option key={u}>{u}</option>)}</select></div>
                <div className="form-group"><label>Rate (₹)</label><input type="number" value={form.rate} onChange={e => setForm(f => ({ ...f, rate: e.target.value }))} /></div>
                <div className="form-group"><label>Delivery Date</label><input type="date" value={form.deliveryDate} onChange={e => setForm(f => ({ ...f, deliveryDate: e.target.value }))} /></div>
              </div>
              {form.qty && form.rate && <div style={{ marginTop: 12, padding: '10px 14px', background: 'var(--surface2)', borderRadius: 'var(--radius)', fontSize: 14 }}>
                Total: <strong style={{ color: 'var(--gold)' }}>₹{(parseFloat(form.qty) * parseFloat(form.rate)).toLocaleString()}</strong>
              </div>}
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={save}>Create PO</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── JOB WORK ────────────────────────────────────────────────
export function JobWork() {
  const { jobWork, addJobWork, updateJobWork, orders, vendors } = useApp()
  const products = useProductCatalog()
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ orderId: '', itemCode: '', process: '', vendor: '', qty: '', rate: '', dueDate: '', status: 'Pending' })
  const jwVendors = vendors.filter(v => v.category === 'Job Work').map(v => v.name)
  const processes = ['Marble Cutting & Polishing', 'Wood Framework Assembly', 'Metal Fabrication', 'LED Integration & Wiring', 'MDF Cabinet Work', 'Glass Fitting', 'Fabric Upholstery', 'Surface Finishing', 'Packing']
  const statusColors = { 'Pending': 'orange', 'In Progress': 'blue', 'Completed': 'green', 'On Hold': 'red' }

  const save = () => {
    const qty = parseInt(form.qty), rate = parseFloat(form.rate)
    addJobWork({ ...form, qty, rate, total: qty * rate })
    setModal(false)
  }

  return (
    <div>
      <div className="page-header">
        <h2>Job Work Tracking</h2>
        <button className="btn btn-primary" onClick={() => setModal(true)}><Plus size={14} /> New Job Work</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 18 }}>
        {['Pending', 'In Progress', 'Completed', 'On Hold'].map(s => (
          <div key={s} className="stat-card" style={{ padding: '12px 16px' }}>
            <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s}</div>
            <div style={{ fontSize: 22, fontFamily: 'Playfair Display', marginTop: 4, color: `var(--${statusColors[s]})` }}>
              {jobWork.filter(j => j.status === s).length}
            </div>
          </div>
        ))}
      </div>
      <div className="card" style={{ padding: 0 }}>
        <table>
          <thead><tr><th>JW ID</th><th>Order</th><th>Process</th><th>Vendor</th><th>Qty</th><th>Rate</th><th>Total</th><th>Due Date</th><th>Status</th></tr></thead>
          <tbody>
            {jobWork.map(jw => (
              <tr key={jw.id}>
                <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--gold)' }}>{jw.id}</td>
                <td style={{ fontSize: 12, color: 'var(--text3)' }}>{jw.orderId}</td>
                <td style={{ fontWeight: 500, color: 'var(--text)' }}>{jw.process}</td>
                <td>{jw.vendor}</td>
                <td>{jw.qty}</td>
                <td>₹{jw.rate}</td>
                <td style={{ fontWeight: 600 }}>₹{jw.total.toLocaleString()}</td>
                <td>{new Date(jw.dueDate).toLocaleDateString('en-IN')}</td>
                <td>
                  <select value={jw.status} onChange={e => updateJobWork(jw.id, { status: e.target.value })} style={{ padding: '4px 8px', fontSize: 12, width: 'auto' }}>
                    {['Pending', 'In Progress', 'Completed', 'On Hold'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {modal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header"><h3>New Job Work</h3><button onClick={() => setModal(false)} style={{ background: 'none', color: 'var(--text2)' }}><X size={18} /></button></div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group"><label>Order</label>
                  <select value={form.orderId} onChange={e => setForm(f => ({ ...f, orderId: e.target.value }))}>
                    <option value="">Select...</option>{orders.map(o => <option key={o.id} value={o.id}>{o.poNumber}</option>)}
                  </select>
                </div>
                <div className="form-group"><label>Item Code</label>
                  <select value={form.itemCode} onChange={e => setForm(f => ({ ...f, itemCode: e.target.value }))}>
                    <option value="">Select...</option>{products.map(p => <option key={p.itemCode} value={p.itemCode}>{p.itemCode}</option>)}
                  </select>
                </div>
                <div className="form-group full"><label>Process</label>
                  <select value={form.process} onChange={e => setForm(f => ({ ...f, process: e.target.value }))}>
                    <option value="">Select...</option>{processes.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div className="form-group full"><label>Vendor</label>
                  <select value={form.vendor} onChange={e => setForm(f => ({ ...f, vendor: e.target.value }))}>
                    <option value="">Select...</option>{jwVendors.map(v => <option key={v}>{v}</option>)}
                  </select>
                </div>
                <div className="form-group"><label>Quantity</label><input type="number" value={form.qty} onChange={e => setForm(f => ({ ...f, qty: e.target.value }))} /></div>
                <div className="form-group"><label>Rate (₹/pc)</label><input type="number" value={form.rate} onChange={e => setForm(f => ({ ...f, rate: e.target.value }))} /></div>
                <div className="form-group"><label>Due Date</label><input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} /></div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={save}>Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── PAYMENTS ────────────────────────────────────────────────
export function Payments() {
  const { payments, addPayment, updatePayment, vendors, jobWork } = useApp()
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ vendor: '', jobWorkId: '', totalAmount: '', paid: '', lastPayment: '' })

  const save = () => {
    const total = parseFloat(form.totalAmount), paid = parseFloat(form.paid)
    addPayment({ ...form, totalAmount: total, paid, pending: total - paid })
    setModal(false)
  }
  const recordPayment = (id, amount) => {
    const p = payments.find(x => x.id === id)
    if (!p) return
    const newPaid = Math.min(p.totalAmount, p.paid + parseFloat(amount || 0))
    updatePayment(id, { paid: newPaid, pending: p.totalAmount - newPaid, lastPayment: new Date().toISOString().split('T')[0] })
  }

  const totalPending = payments.reduce((s, p) => s + p.pending, 0)
  const totalPaid = payments.reduce((s, p) => s + p.paid, 0)

  return (
    <div>
      <div className="page-header">
        <h2>Job Work Payments</h2>
        <button className="btn btn-primary" onClick={() => setModal(true)}><Plus size={14} /> Add Payment Record</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 18 }}>
        <div className="stat-card">
          <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Total Paid</div>
          <div style={{ fontSize: 26, fontFamily: 'Playfair Display', color: 'var(--green)' }}>₹{totalPaid.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Total Pending</div>
          <div style={{ fontSize: 26, fontFamily: 'Playfair Display', color: 'var(--red)' }}>₹{totalPending.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Vendors with Balance</div>
          <div style={{ fontSize: 26, fontFamily: 'Playfair Display', color: 'var(--orange)' }}>{payments.filter(p => p.pending > 0).length}</div>
        </div>
      </div>
      <div className="card" style={{ padding: 0 }}>
        <table>
          <thead><tr><th>ID</th><th>Vendor</th><th>Job Work</th><th>Total (₹)</th><th>Paid (₹)</th><th>Pending (₹)</th><th>Last Payment</th><th>Action</th></tr></thead>
          <tbody>
            {payments.map(p => (
              <tr key={p.id}>
                <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--gold)' }}>{p.id}</td>
                <td style={{ fontWeight: 500, color: 'var(--text)' }}>{p.vendor}</td>
                <td style={{ fontSize: 12, color: 'var(--text3)' }}>{p.jobWorkId}</td>
                <td>₹{p.totalAmount.toLocaleString()}</td>
                <td style={{ color: 'var(--green)' }}>₹{p.paid.toLocaleString()}</td>
                <td style={{ color: p.pending > 0 ? 'var(--red)' : 'var(--green)', fontWeight: 600 }}>
                  {p.pending > 0 ? `₹${p.pending.toLocaleString()}` : '—'}
                </td>
                <td>{p.lastPayment ? new Date(p.lastPayment).toLocaleDateString('en-IN') : '—'}</td>
                <td>
                  {p.pending > 0 && (
                    <button className="btn btn-ghost btn-sm" onClick={() => {
                      const amt = prompt(`Record payment for ${p.vendor} (pending: ₹${p.pending}):`)
                      if (amt) recordPayment(p.id, amt)
                    }}>
                      Pay
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {modal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header"><h3>New Payment Record</h3><button onClick={() => setModal(false)} style={{ background: 'none', color: 'var(--text2)' }}><X size={18} /></button></div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group full"><label>Vendor</label>
                  <select value={form.vendor} onChange={e => setForm(f => ({ ...f, vendor: e.target.value }))}>
                    <option value="">Select...</option>{vendors.map(v => <option key={v.id}>{v.name}</option>)}
                  </select>
                </div>
                <div className="form-group full"><label>Job Work Reference</label>
                  <select value={form.jobWorkId} onChange={e => setForm(f => ({ ...f, jobWorkId: e.target.value }))}>
                    <option value="">Select...</option>{jobWork.map(jw => <option key={jw.id} value={jw.id}>{jw.id} — {jw.process}</option>)}
                  </select>
                </div>
                <div className="form-group"><label>Total Amount (₹)</label><input type="number" value={form.totalAmount} onChange={e => setForm(f => ({ ...f, totalAmount: e.target.value }))} /></div>
                <div className="form-group"><label>Already Paid (₹)</label><input type="number" value={form.paid} onChange={e => setForm(f => ({ ...f, paid: e.target.value }))} /></div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={save}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── VENDORS ─────────────────────────────────────────────────
export function Vendors() {
  const { vendors, addJobWork } = useApp()
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ name: '', category: 'Job Work', contact: '', gstin: '' })
  const [localVendors, setLocalVendors] = useState(vendors)

  const save = () => {
    setLocalVendors(v => [...v, { ...form, id: 'V' + Date.now() }])
    setModal(false)
  }

  return (
    <div>
      <div className="page-header">
        <h2>Vendors</h2>
        <button className="btn btn-primary" onClick={() => setModal(true)}><Plus size={14} /> Add Vendor</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {localVendors.map(v => (
          <div key={v.id} className="card" style={{ position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>{v.name}</div>
                <span className={`badge badge-${v.category === 'Job Work' ? 'blue' : 'gold'}`}>{v.category}</span>
              </div>
            </div>
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 5 }}>
              <div style={{ fontSize: 12, color: 'var(--text3)' }}>📞 {v.contact}</div>
              <div style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--text3)' }}>GST: {v.gstin}</div>
            </div>
          </div>
        ))}
      </div>
      {modal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header"><h3>Add Vendor</h3><button onClick={() => setModal(false)} style={{ background: 'none', color: 'var(--text2)' }}><X size={18} /></button></div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group full"><label>Vendor Name</label><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
                <div className="form-group"><label>Category</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                    <option>Job Work</option><option>Supplier</option><option>Transporter</option>
                  </select>
                </div>
                <div className="form-group"><label>Contact</label><input value={form.contact} onChange={e => setForm(f => ({ ...f, contact: e.target.value }))} /></div>
                <div className="form-group full"><label>GSTIN</label><input value={form.gstin} onChange={e => setForm(f => ({ ...f, gstin: e.target.value }))} placeholder="e.g. 08AADCM1234F1Z5" /></div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={save}>Add Vendor</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
