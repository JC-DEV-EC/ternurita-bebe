import store from '../store.js'
import { showToast } from '../utils.js'
import { crearPedido } from '../services/pedidos.service.js'

export default function render() {
  return `
    <div class="max-w-3xl mx-auto px-4 py-8 fade-in">
      <h1 class="text-3xl font-bold text-gray-800 mb-6">Checkout</h1>
      <div id="checkout-resumen" class="mb-6"></div>
      <div class="bg-white rounded-xl shadow-md p-6">
        <form id="checkout-form">
          <h2 class="text-lg font-bold text-gray-800 mb-4">Dirección de envío</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
              <input type="text" id="checkout-nombre" class="input-field" placeholder="Tu nombre" value="${store.usuario?.nombre_completo || ''}" required>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <input type="tel" id="checkout-telefono" class="input-field" placeholder="Teléfono" value="${store.usuario?.telefono || ''}" required>
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
              <input type="text" id="checkout-direccion" class="input-field" placeholder="Calle y número" value="${store.usuario?.direccion || ''}" required>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
              <input type="text" id="checkout-ciudad" class="input-field" placeholder="Ciudad" required>
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Notas (opcional)</label>
              <textarea id="checkout-notas" class="input-field" rows="2" placeholder="Instrucciones especiales..."></textarea>
            </div>
          </div>
          <button type="submit" class="btn-primary w-full mt-6" id="btn-confirmar-pedido">Confirmar pedido</button>
        </form>
      </div>
    </div>
  `
}

export async function afterRender() {
  if (!store.sesion) {
    window.location.hash = '#/login'
    return
  }

  if (store.carrito.length === 0) {
    const { obtener } = await import('../services/carrito.service.js')
    const { data } = await obtener(store.usuario.id)
    store.carrito = data || []
    store.carritoCount = (data || []).reduce((sum, item) => sum + item.cantidad, 0)
  }

  if (store.carrito.length === 0) {
    document.getElementById('checkout-resumen').innerHTML = `
      <div class="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-yellow-800 text-sm">
        Tu carrito está vacío. <a href="#/productos" class="font-medium underline">Ver productos</a>
      </div>
    `
    return
  }

  renderResumen()

  const form = document.getElementById('checkout-form')
  form?.addEventListener('submit', async (e) => {
    e.preventDefault()

    const nombre = document.getElementById('checkout-nombre').value.trim()
    const telefono = document.getElementById('checkout-telefono').value.trim()
    const direccion = document.getElementById('checkout-direccion').value.trim()
    const ciudad = document.getElementById('checkout-ciudad').value.trim()
    const notas = document.getElementById('checkout-notas').value.trim()

    if (!nombre || !direccion || !ciudad || !telefono) {
      showToast('Completa todos los campos requeridos', 'error')
      return
    }

    const btn = document.getElementById('btn-confirmar-pedido')
    btn.disabled = true
    btn.textContent = 'Procesando...'

    const { data, error } = await crearPedido({
      direccion_envio: { nombre, direccion, ciudad, telefono },
      notas: notas || undefined,
    })

    if (error) {
      showToast(error.message || 'Error al crear el pedido', 'error')
      btn.disabled = false
      btn.textContent = 'Confirmar pedido'
      return
    }

    showToast('Pedido creado correctamente', 'success')
    store.carrito = []
    store.carritoCount = 0
    window.location.hash = `#/pedidos/${data.pedido?.pedido_id}`
  })
}

function renderResumen() {
  const container = document.getElementById('checkout-resumen')
  if (!container) return

  const items = store.carrito
  const subtotal = items.reduce((sum, item) => {
    const precio = item.productos?.precio_oferta || item.productos?.precio || 0
    return sum + precio * item.cantidad
  }, 0)

  container.innerHTML = `
    <div class="bg-white rounded-xl shadow-md p-6">
      <h2 class="text-lg font-bold text-gray-800 mb-3">Resumen del pedido (${items.length} productos)</h2>
      <div class="space-y-2 mb-4">
        ${items.slice(0, 3).map(item => `
          <div class="flex justify-between text-sm">
            <span class="text-gray-600 truncate">${item.productos?.nombre || 'Producto'} x${item.cantidad}</span>
            <span class="font-medium">$${((item.productos?.precio_oferta || item.productos?.precio || 0) * item.cantidad).toFixed(2)}</span>
          </div>
        `).join('')}
        ${items.length > 3 ? `<p class="text-xs text-gray-400">y ${items.length - 3} más...</p>` : ''}
      </div>
      <div class="border-t pt-3 flex justify-between text-lg font-bold">
        <span>Total</span>
        <span class="text-pink-500">$${subtotal.toFixed(2)}</span>
      </div>
    </div>
  `
}
