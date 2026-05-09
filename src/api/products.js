import { apiFetch } from './client.js'

export async function fetchProducts(params = {}) {
  const q = new URLSearchParams()
  if (params.page) q.set('page', String(params.page))
  if (params.limit) q.set('limit', String(params.limit))
  if (params.category) q.set('category', params.category)
  if (params.q) q.set('q', params.q)
  if (params.include_inactive === true || params.include_inactive === 'true') {
    q.set('include_inactive', 'true')
  }
  const qs = q.toString()
  return apiFetch(`/api/v1/products${qs ? `?${qs}` : ''}`)
}

export async function searchProducts(q, params = {}) {
  const sp = new URLSearchParams({ q, ...params })
  return apiFetch(`/api/v1/products/search?${sp.toString()}`)
}

export async function fetchProduct(id) {
  return apiFetch(`/api/v1/products/${id}`)
}

export async function suggestItemCode(category, materialKey) {
  const q = new URLSearchParams({
    category: category || '',
    material_key: materialKey || '',
  })
  return apiFetch(`/api/v1/products/suggest-item-code?${q.toString()}`)
}

export async function createProduct(payload) {
  return apiFetch('/api/v1/products', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function updateProduct(id, payload) {
  return apiFetch(`/api/v1/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export async function deleteProduct(id) {
  return apiFetch(`/api/v1/products/${id}`, { method: 'DELETE' })
}

export async function fetchBom(productId) {
  return apiFetch(`/api/v1/products/${productId}/bom`)
}

export async function addBomLine(productId, line) {
  return apiFetch(`/api/v1/products/${productId}/bom`, {
    method: 'POST',
    body: JSON.stringify(line),
  })
}

export async function updateBomLine(productId, bomId, line) {
  return apiFetch(`/api/v1/products/${productId}/bom/${bomId}`, {
    method: 'PUT',
    body: JSON.stringify(line),
  })
}

export async function deleteBomLine(productId, bomId) {
  return apiFetch(`/api/v1/products/${productId}/bom/${bomId}`, {
    method: 'DELETE',
  })
}

export async function bulkReplaceBom(productId, bom) {
  return apiFetch(`/api/v1/products/${productId}/bom/bulk`, {
    method: 'POST',
    body: JSON.stringify({ bom }),
  })
}
