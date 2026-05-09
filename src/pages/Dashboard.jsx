import React from 'react'
import { useApp } from '../context/AppContext'
import { AlertTriangle, TrendingUp, Clock, DollarSign, Package, Truck, Wrench, ChevronRight } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts'

const orderStatusChart = [
  { name: 'In Production', count: 2 },
  { name: 'Mat. Planning', count: 1 },
  { name: 'Dispatched', count: 1 },
  { name: 'Delivered', count: 3 },
]

const monthlyChart = [
  { month: 'Aug', orders: 4 },
  { month: 'Sep', orders: 6 },
  { month: 'Oct', orders: 5 },
  { month: 'Nov', orders: 8 },
  { month: 'Dec', orders: 7 },
  { month: 'Jan', orders: 3 },
]

export default function Dashboard({ onNav }) {
  const { getLowStockItems, getUpcomingShipments, getPendingPayments, jobWork, orders } = useApp()
  const lowStock = getLowStockItems()
  const shipments = getUpcomingShipments()
  const pendingPay = getPendingPayments()
  const activeJW = jobWork.filter(j => j.status !== 'Completed')
  const totalPending = pendingPay.reduce((s, p) => s + p.pending, 0)

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Dashboard</h2>
          <p style={{ color: 'var(--text3)', fontSize: 13, marginTop: 3 }}>Balaji Overseas — Order Processing & Production</p>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text3)', background: 'var(--surface2)', padding: '6px 12px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 22 }}>
        {[
          { label: 'Active Orders', value: orders.filter(o => o.status !== 'Dispatched' && o.status !== 'Delivered').length, icon: Package, color: 'var(--blue)', dim: 'var(--blue-dim)', nav: 'orders' },
          { label: 'Low Stock Alerts', value: lowStock.length, icon: AlertTriangle, color: 'var(--red)', dim: 'var(--red-dim)', nav: 'inventory' },
          { label: 'Upcoming Shipments', value: shipments.length, icon: Truck, color: 'var(--orange)', dim: 'var(--orange-dim)', nav: 'orders' },
          { label: 'Payments Pending', value: `₹${totalPending.toLocaleString()}`, icon: DollarSign, color: 'var(--gold)', dim: 'var(--gold-dim)', nav: 'payments' },
        ].map((s, i) => {
          const Icon = s.icon
          return (
            <div key={i} className="stat-card" style={{ cursor: 'pointer' }} onClick={() => onNav(s.nav)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8, fontWeight: 600 }}>{s.label}</div>
                  <div style={{ fontSize: 28, fontFamily: 'Playfair Display, serif', fontWeight: 700, color: s.color }}>{s.value}</div>
                </div>
                <div style={{ background: s.dim, borderRadius: 10, padding: 10 }}>
                  <Icon size={20} color={s.color} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Alerts */}
      {(lowStock.length > 0 || shipments.length > 0) && (
        <div style={{ marginBottom: 22 }}>
          <div className="section-title">⚡ Active Alerts</div>
          {lowStock.slice(0, 3).map(item => (
            <div key={item.id} className="alert-banner alert-banner-red">
              <AlertTriangle size={14} />
              <strong>Low Stock:</strong> {item.material} — {item.qty} {item.unit} remaining (min: {item.minStock} {item.unit})
            </div>
          ))}
          {shipments.map(o => {
            const days = Math.ceil((new Date(o.shipmentDate) - new Date()) / (1000 * 60 * 60 * 24))
            return (
              <div key={o.id} className="alert-banner alert-banner-orange">
                <Clock size={14} />
                <strong>Shipment Due in {days} days:</strong> {o.poNumber} — {o.client} — {new Date(o.shipmentDate).toLocaleDateString('en-IN')}
              </div>
            )
          })}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
        {/* Order status chart */}
        <div className="card">
          <div className="section-title">Order Status Overview</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={orderStatusChart} barSize={28}>
              <XAxis dataKey="name" tick={{ fill: '#7a7468', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#7a7468', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#1a1814', border: '1px solid #3a3630', borderRadius: 8 }} labelStyle={{ color: '#f0ece3' }} itemStyle={{ color: '#c9a84c' }} />
              <Bar dataKey="count" fill="#c9a84c" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly trend */}
        <div className="card">
          <div className="section-title">Monthly Orders Trend</div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={monthlyChart}>
              <CartesianGrid stroke="#2e2b24" strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fill: '#7a7468', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#7a7468', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#1a1814', border: '1px solid #3a3630', borderRadius: 8 }} labelStyle={{ color: '#f0ece3' }} itemStyle={{ color: '#c9a84c' }} />
              <Line type="monotone" dataKey="orders" stroke="#c9a84c" strokeWidth={2.5} dot={{ fill: '#c9a84c', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Active Job Work */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div className="section-title" style={{ margin: 0 }}>Active Job Work</div>
            <button className="btn btn-ghost btn-sm" onClick={() => onNav('jobwork')} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>View All <ChevronRight size={12} /></button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {activeJW.slice(0, 4).map(jw => (
              <div key={jw.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 12px', background: 'var(--surface2)', borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{jw.process}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{jw.vendor} · {jw.qty} pcs · Due {new Date(jw.dueDate).toLocaleDateString('en-IN')}</div>
                </div>
                <span className={`badge badge-${jw.status === 'In Progress' ? 'blue' : 'orange'}`}>{jw.status}</span>
              </div>
            ))}
            {activeJW.length === 0 && <p style={{ color: 'var(--text3)', fontSize: 13 }}>No active job work</p>}
          </div>
        </div>

        {/* Pending Payments */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div className="section-title" style={{ margin: 0 }}>Pending Payments</div>
            <button className="btn btn-ghost btn-sm" onClick={() => onNav('payments')} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>View All <ChevronRight size={12} /></button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {pendingPay.map(p => (
              <div key={p.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 12px', background: 'var(--surface2)', borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{p.vendor}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>Total: ₹{p.totalAmount.toLocaleString()} · Paid: ₹{p.paid.toLocaleString()}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--red)' }}>₹{p.pending.toLocaleString()}</div>
                  <div style={{ fontSize: 10, color: 'var(--text3)' }}>pending</div>
                </div>
              </div>
            ))}
            {pendingPay.length === 0 && <p style={{ color: 'var(--text3)', fontSize: 13 }}>All payments cleared</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
