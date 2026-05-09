import React, { createContext, useContext, useState } from 'react'

const AppContext = createContext(null)

export const sampleData = {
  products: [
    {
      id: 'P001', itemCode: 'MBL-TBL-001', name: 'Marble Top Dining Table', category: 'Furniture',
      marbleType: 'Carrara White', color: 'White/Grey Veins', thickness: '18mm', size: '72"x36"',
      wood: 'Teak', mdf: null, metal: 'SS Legs', glass: null, fabric: null, customElements: 'Brass inlay trim',
      bom: [
        { material: 'Carrara Marble Slab', unit: 'SqFt', qty: 18 },
        { material: 'Teak Wood Planks', unit: 'SqFt', qty: 12 },
        { material: 'SS Pipes (40mm)', unit: 'Pcs', qty: 4 },
        { material: 'Brass Inlay Strip', unit: 'Mtr', qty: 6 },
        { material: 'Epoxy Adhesive', unit: 'Kg', qty: 0.5 },
      ],
      packing: { carton: 1, inner: 2, bubble: 'Full wrap', thermocol: '4 corners' }
    },
    {
      id: 'P002', itemCode: 'MBL-VNT-002', name: 'Black Marble Vanity Unit', category: 'Bathroom',
      marbleType: 'Nero Marquina', color: 'Black/Gold', thickness: '20mm', size: '48"x22"',
      wood: 'MDF base', mdf: '18mm MDF', metal: null, glass: null, fabric: null, customElements: 'Undermount sink cutout',
      bom: [
        { material: 'Nero Marquina Marble', unit: 'SqFt', qty: 8 },
        { material: '18mm MDF Board', unit: 'SqFt', qty: 16 },
        { material: 'Gold PVD Fittings', unit: 'Set', qty: 1 },
        { material: 'Silicone Sealant', unit: 'Tube', qty: 2 },
      ],
      packing: { carton: 1, inner: 1, bubble: 'Full wrap', thermocol: 'All edges' }
    },
    {
      id: 'P003', itemCode: 'ONX-LMP-003', name: 'Onyx Backlit Panel', category: 'Decor',
      marbleType: 'Honey Onyx', color: 'Amber/Cream', thickness: '15mm', size: '24"x48"',
      wood: null, mdf: null, metal: 'Aluminium frame', glass: null, fabric: null, customElements: 'LED backlight integrated',
      bom: [
        { material: 'Honey Onyx Slab', unit: 'SqFt', qty: 8 },
        { material: 'Aluminium Profile', unit: 'Mtr', qty: 4 },
        { material: 'LED Strip 24V', unit: 'Mtr', qty: 5 },
        { material: 'Acrylic Diffuser', unit: 'SqFt', qty: 7 },
        { material: 'Power Adapter', unit: 'Pcs', qty: 1 },
      ],
      packing: { carton: 1, inner: 1, bubble: 'Full wrap', thermocol: '6 sides' }
    },
  ],
  orders: [
    {
      id: 'ORD-001', poNumber: 'PO-US-2024-0183', client: 'Stone Luxury USA LLC',
      orderDate: '2024-12-01', shipmentDate: '2025-01-15', status: 'In Production',
      items: [
        { itemCode: 'MBL-TBL-001', productName: 'Marble Top Dining Table', qty: 20 },
        { itemCode: 'MBL-VNT-002', productName: 'Black Marble Vanity Unit', qty: 15 },
      ]
    },
    {
      id: 'ORD-002', poNumber: 'PO-UK-2024-0092', client: 'Heritage Interiors UK',
      orderDate: '2024-12-05', shipmentDate: '2025-01-20', status: 'Material Planning',
      items: [
        { itemCode: 'ONX-LMP-003', productName: 'Onyx Backlit Panel', qty: 30 },
      ]
    },
    {
      id: 'ORD-003', poNumber: 'PO-UAE-2024-0041', client: 'Al Fakhir Trading LLC',
      orderDate: '2024-11-20', shipmentDate: '2024-12-28', status: 'Dispatched',
      items: [
        { itemCode: 'MBL-TBL-001', productName: 'Marble Top Dining Table', qty: 10 },
      ]
    },
  ],
  inventory: [
    { id: 'INV-001', material: 'Carrara Marble Slab', category: 'Marble', qty: 150, unit: 'SqFt', minStock: 200 },
    { id: 'INV-002', material: 'Nero Marquina Marble', category: 'Marble', qty: 80, unit: 'SqFt', minStock: 50 },
    { id: 'INV-003', material: 'Honey Onyx Slab', category: 'Marble', qty: 240, unit: 'SqFt', minStock: 100 },
    { id: 'INV-004', material: 'Teak Wood Planks', category: 'Wood', qty: 90, unit: 'SqFt', minStock: 80 },
    { id: 'INV-005', material: '18mm MDF Board', category: 'MDF', qty: 300, unit: 'SqFt', minStock: 150 },
    { id: 'INV-006', material: 'SS Pipes (40mm)', category: 'Metal', qty: 60, unit: 'Pcs', minStock: 50 },
    { id: 'INV-007', material: 'Brass Inlay Strip', category: 'Metal', qty: 30, unit: 'Mtr', minStock: 50 },
    { id: 'INV-008', material: 'Gold PVD Fittings', category: 'Fittings', qty: 12, unit: 'Set', minStock: 10 },
    { id: 'INV-009', material: 'LED Strip 24V', category: 'Electrical', qty: 40, unit: 'Mtr', minStock: 60 },
    { id: 'INV-010', material: 'Epoxy Adhesive', category: 'Consumable', qty: 25, unit: 'Kg', minStock: 10 },
    { id: 'INV-011', material: 'Aluminium Profile', category: 'Metal', qty: 80, unit: 'Mtr', minStock: 40 },
  ],
  purchaseOrders: [
    { id: 'PO-001', supplier: 'Rajasthan Marble Depot', material: 'Carrara Marble Slab', qty: 500, unit: 'SqFt', rate: 85, total: 42500, deliveryDate: '2025-01-05', status: 'Pending' },
    { id: 'PO-002', supplier: 'India Wood Traders', material: 'Teak Wood Planks', qty: 200, unit: 'SqFt', rate: 120, total: 24000, deliveryDate: '2025-01-08', status: 'Confirmed' },
    { id: 'PO-003', supplier: 'Metalcraft Supplies', material: 'Brass Inlay Strip', qty: 100, unit: 'Mtr', rate: 45, total: 4500, deliveryDate: '2024-12-31', status: 'Delivered' },
  ],
  jobWork: [
    { id: 'JW-001', orderId: 'ORD-001', itemCode: 'MBL-TBL-001', process: 'Marble Cutting & Polishing', vendor: 'Marble Masters Workshop', qty: 20, rate: 350, total: 7000, status: 'In Progress', dueDate: '2025-01-10' },
    { id: 'JW-002', orderId: 'ORD-001', itemCode: 'MBL-TBL-001', process: 'Wood Framework Assembly', vendor: 'Teak Craft Studio', qty: 20, rate: 280, total: 5600, status: 'Pending', dueDate: '2025-01-12' },
    { id: 'JW-003', orderId: 'ORD-002', itemCode: 'ONX-LMP-003', process: 'LED Integration & Wiring', vendor: 'LightTech Solutions', qty: 30, rate: 150, total: 4500, status: 'Pending', dueDate: '2025-01-15' },
    { id: 'JW-004', orderId: 'ORD-001', itemCode: 'MBL-VNT-002', process: 'MDF Cabinet Work', vendor: 'Woodcraft Interiors', qty: 15, rate: 220, total: 3300, status: 'Completed', dueDate: '2024-12-20' },
  ],
  vendors: [
    { id: 'V001', name: 'Marble Masters Workshop', category: 'Job Work', contact: '+91-9876543210', gstin: '08AADCM1234F1Z5' },
    { id: 'V002', name: 'Teak Craft Studio', category: 'Job Work', contact: '+91-9876543211', gstin: '08AADCT5678G2Z6' },
    { id: 'V003', name: 'LightTech Solutions', category: 'Job Work', contact: '+91-9845612378', gstin: '27AADCL9012H3Z7' },
    { id: 'V004', name: 'Woodcraft Interiors', category: 'Job Work', contact: '+91-9123456789', gstin: '08AADCW3456I4Z8' },
    { id: 'V005', name: 'Rajasthan Marble Depot', category: 'Supplier', contact: '+91-9001234567', gstin: '08AAACR7890J5Z9' },
    { id: 'V006', name: 'India Wood Traders', category: 'Supplier', contact: '+91-9887654321', gstin: '06AAACI2345K6Z0' },
  ],
  payments: [
    { id: 'PAY-001', vendor: 'Marble Masters Workshop', jobWorkId: 'JW-004', totalAmount: 3300, paid: 2000, pending: 1300, lastPayment: '2024-12-22' },
    { id: 'PAY-002', vendor: 'Woodcraft Interiors', jobWorkId: 'JW-004', totalAmount: 3300, paid: 3300, pending: 0, lastPayment: '2024-12-25' },
  ]
}

export function AppProvider({ children }) {
  const [products, setProducts] = useState(sampleData.products)
  const [orders, setOrders] = useState(sampleData.orders)
  const [inventory, setInventory] = useState(sampleData.inventory)
  const [purchaseOrders, setPurchaseOrders] = useState(sampleData.purchaseOrders)
  const [jobWork, setJobWork] = useState(sampleData.jobWork)
  const [vendors, setVendors] = useState(sampleData.vendors)
  const [payments, setPayments] = useState(sampleData.payments)

  const addProduct = (p) => setProducts(prev => [...prev, { ...p, id: 'P' + Date.now() }])
  const updateProduct = (id, p) => setProducts(prev => prev.map(x => x.id === id ? { ...x, ...p } : x))
  const deleteProduct = (id) => setProducts(prev => prev.filter(x => x.id !== id))

  const addOrder = (o) => setOrders(prev => [...prev, { ...o, id: 'ORD-' + Date.now() }])
  const updateOrder = (id, o) => setOrders(prev => prev.map(x => x.id === id ? { ...x, ...o } : x))

  const addInventory = (i) => setInventory(prev => [...prev, { ...i, id: 'INV-' + Date.now() }])
  const updateInventory = (id, i) => setInventory(prev => prev.map(x => x.id === id ? { ...x, ...i } : x))

  const addPO = (po) => setPurchaseOrders(prev => [...prev, { ...po, id: 'PO-' + Date.now() }])
  const updatePO = (id, po) => setPurchaseOrders(prev => prev.map(x => x.id === id ? { ...x, ...po } : x))

  const addJobWork = (jw) => setJobWork(prev => [...prev, { ...jw, id: 'JW-' + Date.now() }])
  const updateJobWork = (id, jw) => setJobWork(prev => prev.map(x => x.id === id ? { ...x, ...jw } : x))

  const addPayment = (p) => setPayments(prev => [...prev, { ...p, id: 'PAY-' + Date.now() }])
  const updatePayment = (id, p) => setPayments(prev => prev.map(x => x.id === id ? { ...x, ...p } : x))

  // MRP Calculation
  const calculateMRP = (orderId) => {
    const order = orders.find(o => o.id === orderId)
    if (!order) return []
    const requirements = {}
    order.items.forEach(item => {
      const product = products.find(p => p.itemCode === item.itemCode)
      if (!product) return
      product.bom.forEach(bom => {
        const key = bom.material
        if (!requirements[key]) requirements[key] = { material: bom.material, unit: bom.unit, total: 0 }
        requirements[key].total += bom.qty * item.qty
      })
    })
    return Object.values(requirements).map(r => {
      const invItem = inventory.find(i => i.material === r.material)
      const available = invItem ? invItem.qty : 0
      return { ...r, available, pending: Math.max(0, r.total - available) }
    })
  }

  const getLowStockItems = () => inventory.filter(i => i.qty < i.minStock)
  const getUpcomingShipments = () => orders.filter(o => {
    const days = (new Date(o.shipmentDate) - new Date()) / (1000 * 60 * 60 * 24)
    return days >= 0 && days <= 15 && o.status !== 'Dispatched'
  })
  const getPendingPayments = () => payments.filter(p => p.pending > 0)

  return (
    <AppContext.Provider value={{
      products, orders, inventory, purchaseOrders, jobWork, vendors, payments,
      addProduct, updateProduct, deleteProduct,
      addOrder, updateOrder,
      addInventory, updateInventory,
      addPO, updatePO,
      addJobWork, updateJobWork,
      addPayment, updatePayment,
      calculateMRP,
      getLowStockItems, getUpcomingShipments, getPendingPayments
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
