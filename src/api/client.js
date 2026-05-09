const base = () =>
  (import.meta.env.VITE_API_URL || '').replace(/\/$/, '') || ''

export async function apiFetch(path, options = {}) {
  const url = `${base()}${path.startsWith('/') ? path : `/${path}`}`
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }
  const res = await fetch(url, { ...options, headers })
  const text = await res.text()
  let body = null
  try {
    body = text ? JSON.parse(text) : null
  } catch {
    body = { success: false, error: text || 'Invalid JSON' }
  }
  if (!res.ok) {
    const msg = body?.error || body?.message || res.statusText || `HTTP ${res.status}`
    const err = new Error(msg)
    err.status = res.status
    err.body = body
    throw err
  }
  return body
}
