import store from '../store.js'
import { detallePedido } from '../services/pedidos.service.js'
import { formatPrecio, formatDate, showToast } from '../utils.js'

const badges = {
  pendiente: 'badge badge-warning',
  enviado: 'badge badge-primary',
  entregado: 'badge badge-success',
  cancelado: 'badge badge-error',
}

export default function render(params) {
  return `
    <div class="max-w-3xl mx-auto px-4 py-8 fade-in">
      <a href="#/pedidos" class="text-pink-500 hover:text-pink-600 mb-4 inline-block">&larr; Mis pedidos</a>
      <h1 class="text-3xl font-bold text-gray-800 mb-6">Pedido #${params?.id || ''}</h1>
      <div id="pedido-detalle-contenido">
        <div class="text-center py-8"><div class="spinner mx-auto"></div></div>
      </div>
    </div>
  `
}

export async function afterRender(params) {
  if (!store.sesion) {
    window.location.hash = '#/login'
    return
  }

  const id = parseInt(params?.id)
  if (!id) {
    document.getElementById('pedido-detalle-contenido').innerHTML = '<p class="text-center text-gray-400">Pedido no válido</p>'
    return
  }

  const { data, error } = await detallePedido(id, store.usuario.id)
  if (error || !data) {
    document.getElementById('pedido-detalle-contenido').innerHTML = '<p class="text-center text-gray-400 py-8">Pedido no encontrado</p>'
    return
  }

  renderDetalle(data)
}

function renderDetalle(pedido) {
  const container = document.getElementById('pedido-detalle-contenido')
  if (!container) return

  const direccion = pedido.direccion_envio || {}

  container.innerHTML = `
    <div class="space-y-6">
      <div class="bg-white rounded-xl shadow-md p-6">
        <div class="flex items-center justify-between mb-4">
          <div>
            <p class="text-sm text-gray-500">Fecha</p>
            <p class="font-semibold">${formatDate(pedido.created_at)}</p>
          </div>
          <span class="${badges[pedido.estado] || 'badge'} text-sm">${pedido.estado}</span>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-md p-6">
        <h2 class="text-lg font-bold text-gray-800 mb-4">Productos</h2>
        <div class="space-y-3">
          ${(pedido.detalles_pedido || []).map(det => {
            const producto = det.productos || {}
            return `
              <div class="flex items-center justify-between">
                <div>
                  <p class="font-semibold text-gray-800">${producto.nombre || 'Producto'}</p>
                  <p class="text-sm text-gray-500">x${det.cantidad} a ${formatPrecio(det.precio_unitario)}</p>
                </div>
                <p class="font-bold text-gray-800">${formatPrecio(det.precio_unitario * det.cantidad)}</p>
              </div>
            `
          }).join('')}
        </div>
        <div class="border-t mt-4 pt-4 flex justify-between text-lg font-bold">
          <span>Total</span>
          <span class="text-pink-500">${formatPrecio(pedido.total_pedido)}</span>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-md p-6">
        <h2 class="text-lg font-bold text-gray-800 mb-4">Dirección de envío</h2>
        <p class="text-gray-600">${direccion.calle || ''}</p>
        <p class="text-gray-600">${direccion.ciudad || ''}</p>
        <p class="text-gray-600">${direccion.telefono || ''}</p>
      </div>

      ${pedido.notas ? `
        <div class="bg-white rounded-xl shadow-md p-6">
          <h2 class="text-lg font-bold text-gray-800 mb-2">Notas</h2>
          <p class="text-gray-600">${pedido.notas}</p>
        </div>
      ` : ''}
    </div>
  `
}
