import React, { useState } from 'react'
import { AppProvider, useApp } from './context/AppContext'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Orders from './pages/Orders'
import { Inventory, MRP, PurchaseOrders, JobWork, Payments, Vendors } from './pages/OtherPages'

function AppInner() {
  const [page, setPage] = useState('dashboard')
  const { getLowStockItems, getUpcomingShipments, getPendingPayments } = useApp()

  const alerts = {
    lowStock: getLowStockItems().length,
    shipments: getUpcomingShipments().length,
    payments: getPendingPayments().length,
  }

  const pages = {
    dashboard: <Dashboard onNav={setPage} />,
    products: <Products />,
    orders: <Orders />,
    mrp: <MRP />,
    inventory: <Inventory />,
    purchase: <PurchaseOrders />,
    jobwork: <JobWork />,
    payments: <Payments />,
    vendors: <Vendors />,
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar active={page} onNav={setPage} alerts={alerts} />
      <main style={{ flex: 1, padding: '28px 32px', overflowY: 'auto', maxHeight: '100vh' }}>
        {pages[page] || <div>Page not found</div>}
      </main>
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  )
}
