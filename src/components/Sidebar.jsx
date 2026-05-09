import React from 'react'
import {
  LayoutDashboard, Package, ClipboardList, BarChart3,
  Warehouse, ShoppingCart, Wrench, CreditCard, Users, ChevronRight
} from 'lucide-react'

const nav = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'products', label: 'Product Profiles', icon: Package },
  { id: 'orders', label: 'Orders', icon: ClipboardList },
  { id: 'mrp', label: 'Material Planning', icon: BarChart3 },
  { id: 'inventory', label: 'Inventory', icon: Warehouse },
  { id: 'purchase', label: 'Purchase Orders', icon: ShoppingCart },
  { id: 'jobwork', label: 'Job Work', icon: Wrench },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'vendors', label: 'Vendors', icon: Users },
]

export default function Sidebar({ active, onNav, alerts }) {
  return (
    <aside style={{
      width: 220, minHeight: '100vh',
      background: 'var(--surface)',
      borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      flexShrink: 0,
      position: 'sticky', top: 0,
    }}>
      {/* Logo */}
      <div style={{
        padding: '22px 20px 18px',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, fontWeight: 700, color: 'var(--gold)', letterSpacing: '0.02em', lineHeight: 1.2 }}>
          Balaji
        </div>
        <div style={{ fontSize: 11, color: 'var(--text3)', letterSpacing: '0.14em', textTransform: 'uppercase', marginTop: 2 }}>
          Overseas
        </div>
        <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 5, fontWeight: 400 }}>
          Production & Export System
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
        {nav.map(item => {
          const Icon = item.icon
          const isActive = active === item.id
          let badge = null
          if (item.id === 'inventory' && alerts?.lowStock > 0) badge = alerts.lowStock
          if (item.id === 'orders' && alerts?.shipments > 0) badge = alerts.shipments
          if (item.id === 'payments' && alerts?.payments > 0) badge = alerts.payments

          return (
            <button
              key={item.id}
              onClick={() => onNav(item.id)}
              style={{
                width: '100%',
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px',
                borderRadius: 'var(--radius)',
                background: isActive ? 'var(--gold-dim)' : 'transparent',
                color: isActive ? 'var(--gold)' : 'var(--text2)',
                border: isActive ? '1px solid rgba(201,168,76,0.3)' : '1px solid transparent',
                marginBottom: 2,
                textAlign: 'left',
                fontSize: 13,
                fontWeight: isActive ? 600 : 400,
                transition: 'all 0.15s',
                justifyContent: 'space-between',
              }}
              onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'var(--surface2)'; e.currentTarget.style.color = 'var(--text)' }}}
              onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text2)' }}}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Icon size={15} />
                {item.label}
              </span>
              {badge && (
                <span style={{
                  background: 'var(--red)', color: 'white',
                  borderRadius: '50px', fontSize: 10, fontWeight: 700,
                  padding: '1px 6px', minWidth: 18, textAlign: 'center',
                }}>
                  {badge}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)', fontSize: 11, color: 'var(--text3)' }}>
        <div style={{ marginBottom: 2, fontWeight: 600 }}>Admin User</div>
        <div>Full Access</div>
      </div>
    </aside>
  )
}
