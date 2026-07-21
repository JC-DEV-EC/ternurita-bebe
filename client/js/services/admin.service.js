import CONFIG from '../config.js'
import store from '../store.js'

const BASE = CONFIG.API_BASE_URL

function getToken() {
  return store.sesion?.access_token
}

async function request(method, path, body = null) {
  const token = getToken()
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const opts = { method, headers }
  if (body) opts.body = JSON.stringify(body)

  const response = await fetch(`${BASE}${path}`, opts)
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || `Error ${response.status}`)
  return data
}

async function listarWrapper(url) {
  const res = await request('GET', url)
  return res.data || []
}

export const productos = {
  listar: () => listarWrapper('/api/admin/productos'),
  crear: (data) => request('POST', '/api/admin/productos', data),
  actualizar: (id, data) => request('PUT', `/api/admin/productos/${id}`, data),
  eliminar: (id) => request('DELETE', `/api/admin/productos/${id}`),
  subirImagen: async (id, file) => {
    const token = getToken()
    const formData = new FormData()
    formData.append('imagen', file)
    const response = await fetch(`${BASE}/api/admin/productos/${id}/imagenes`, {
      method: 'POST',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      body: formData,
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Error al subir imagen')
    return data
  },
  eliminarImagen: (id, imagenId) => request('DELETE', `/api/admin/productos/${id}/imagenes/${imagenId}`),
}

export const pedidos = {
  listar: (filtros = {}) => {
    const params = new URLSearchParams(filtros).toString()
    return listarWrapper(`/api/admin/pedidos${params ? '?' + params : ''}`)
  },
  cambiarEstado: (id, estado) => request('PUT', `/api/admin/pedidos/${id}/estado`, { estado }),
}

export const usuarios = {
  listar: () => listarWrapper('/api/admin/usuarios'),
  cambiarRol: (id, rol) => request('PUT', `/api/admin/usuarios/${id}/rol`, { rol }),
}

export const estadisticas = {
  obtener: () => request('GET', '/api/admin/'),
}
