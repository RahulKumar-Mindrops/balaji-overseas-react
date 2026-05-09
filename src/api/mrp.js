import { apiFetch } from './client.js'

export async function calculateMrp(items) {
  return apiFetch('/api/v1/mrp/calculate', {
    method: 'POST',
    body: JSON.stringify({ items }),
  })
}

export async function calculateMrpForOrder(orderId) {
  return apiFetch(`/api/v1/mrp/orders/${orderId}/calculate`)
}
