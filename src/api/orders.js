import { apiFetch } from './client.js'

export async function fetchOrders(params = {}) {
  const q = new URLSearchParams()
  if (params.page) q.set('page', String(params.page))
  if (params.limit) q.set('limit', String(params.limit))
  if (params.q) q.set('q', params.q)
  const qs = q.toString()
  return apiFetch(`/api/v1/orders${qs ? `?${qs}` : ''}`)
}

export async function fetchOrder(id) {
  return apiFetch(`/api/v1/orders/${id}`)
}

export async function createOrder(payload) {
  return apiFetch('/api/v1/orders', { method: 'POST', body: JSON.stringify(payload) })
}

export async function updateOrder(id, payload) {
  return apiFetch(`/api/v1/orders/${id}`, { method: 'PUT', body: JSON.stringify(payload) })
}

export async function deleteOrder(id) {
  return apiFetch(`/api/v1/orders/${id}`, { method: 'DELETE' })
}

export async function fetchOrderItemOverrides(orderItemId) {
  return apiFetch(`/api/v1/orders/items/${orderItemId}/bom-overrides`)
}

export async function upsertOrderItemOverride(orderItemId, payload) {
  return apiFetch(`/api/v1/orders/items/${orderItemId}/bom-overrides`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function deleteOrderItemOverride(orderItemId, bomId) {
  return apiFetch(`/api/v1/orders/items/${orderItemId}/bom-overrides/${bomId}`, { method: 'DELETE' })
}

