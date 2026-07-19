import supabase from './supabase.service.js'
import CONFIG from '../config.js'
import store from '../store.js'

export async function misPedidos(clienteId) {
  const { data, error } = await supabase
    .from('pedidos')
    .select('*, detalles_pedido(*, productos(nombre, slug, imagenes(*)))')
    .eq('cliente_id', clienteId)
    .order('created_at', { ascending: false })

  return { data, error }
}

export async function detallePedido(id, clienteId) {
  const { data, error } = await supabase
    .from('pedidos')
    .select('*, detalles_pedido(*, productos(nombre, slug, precio, imagenes(*)))')
    .eq('id', id)
    .eq('cliente_id', clienteId)
    .single()

  return { data, error }
}

export async function crearPedido(payload) {
  const token = store.sesion?.access_token
  if (!token) return { error: { message: 'No hay sesión activa' }, data: null }

  try {
    const response = await fetch(`${CONFIG.API_BASE_URL}/api/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })
    const data = await response.json()
    if (!response.ok) return { error: data, data: null }
    return { data, error: null }
  } catch (err) {
    return { error: { message: err.message }, data: null }
  }
}
