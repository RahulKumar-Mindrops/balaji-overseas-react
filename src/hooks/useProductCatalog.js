import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { fetchProducts } from '../api/products.js'

/** Maps API list rows to legacy `{ id, itemCode, name }` for Orders / Job Work. */
function toLegacy(p) {
  return {
    id: p.id,
    itemCode: p.item_code,
    name: p.product_name,
  }
}

export function useProductCatalog() {
  const { products: fallback } = useApp()
  const [products, setProducts] = useState(() => fallback.map(toLegacyShape))

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetchProducts({ limit: 500, page: 1 })
        const rows = res.data || []
        if (!cancelled) setProducts(rows.map(toLegacyShape))
      } catch {
        if (!cancelled) setProducts(fallback.map(toLegacyShape))
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return products
}

function toLegacyShape(p) {
  if (p.item_code != null) return toLegacy(p)
  return { id: p.id, itemCode: p.itemCode, name: p.name }
}
