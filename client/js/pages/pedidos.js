import store from '../store.js'
import { misPedidos } from '../services/pedidos.service.js'
import { formatPrecio, formatDate } from '../utils.js'

const badges = {
  pendiente: 'badge badge-warning',
  enviado: 'badge badge-primary',
  entregado: 'badge badge-success',
  cancelado: 'badge badge-error',
}

export default function render() {
  return `
    <div class="max-w-4xl mx-auto px-4 py-8 fade-in">
      <h1 class="text-3xl font-bold text-gray-800 mb-6">Mis pedidos</h1>
      <div id="pedidos-lista">
        <div class="text-center py-8"><div class="spinner mx-auto"></div></div>
      </div>
    </div>
  `
}

export async function afterRender() {
  if (!store.sesion) {
    window.location.hash = '#/login'
    return
  }
  await cargarPedidos()
}

async function cargarPedidos() {
  const container = document.getElementById('pedidos-lista')
  if (!container) return

  const { data, error } = await misPedidos(store.usuario.id)

  if (error) {
    container.innerHTML = '<p class="text-center text-gray-400 py-8">Error al cargar pedidos</p>'
    return
  }

  if (!data || data.length === 0) {
    container.innerHTML = `
      <div class="text-center py-12">
        <p class="text-gray-400 text-lg mb-4">No tienes pedidos aún</p>
        <a href="#/productos" class="btn-primary">Ir a comprar</a>
      </div>
    `
    return
  }

  container.innerHTML = `
    <div class="space-y-4">
      ${data.map(pedido => `
        <a href="#/pedidos/${pedido.id}" class="block bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
          <div class="flex items-center justify-between mb-3">
            <span class="font-bold text-gray-800">Pedido #${pedido.id}</span>
            <span class="${badges[pedido.estado] || 'badge'}">${pedido.estado}</span>
          </div>
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-500">${formatDate(pedido.created_at)}</span>
            <span class="font-bold text-gray-800">${formatPrecio(pedido.total_pedido)}</span>
          </div>
          <div class="mt-2 text-xs text-gray-400">
            ${pedido.detalles_pedido?.length || 0} producto(s)
          </div>
        </a>
      `).join('')}
    </div>
  `
}
