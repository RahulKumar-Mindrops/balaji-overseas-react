import { apiFetch } from './client.js'

export async function fetchMaterials(params = {}) {
  const q = new URLSearchParams()
  if (params.include_inactive) q.set('include_inactive', 'true')
  const qs = q.toString()
  return apiFetch(`/api/v1/materials${qs ? `?${qs}` : ''}`)
}
