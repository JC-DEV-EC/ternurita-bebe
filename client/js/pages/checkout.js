import store from '../store.js'
import { showToast } from '../utils.js'
import { crearPedido } from '../services/pedidos.service.js'

export default function render() {
  return `
    <div class="checkout-page">
      <div class="container">
        <div style="margin-bottom:var(--space-xl)">
          <span class="badge">Checkout</span>
          <h1 class="headline-display">Finalizar compra</h1>
        </div>
        <div id="checkout-resumen" style="margin-bottom:var(--space-lg)"></div>
        <div class="checkout-layout">
          <form class="checkout-form" id="checkout-form">
            <h2 class="checkout-form__title">Dirección de envío</h2>
            <div class="checkout-form__grid">
              <div class="checkout-form__full">
                <label class="checkout-form__label">Nombre completo</label>
                <input type="text" id="checkout-nombre" class="input" placeholder="Tu nombre" value="${store.usuario?.nombre_completo || ''}" required>
              </div>
              <div class="checkout-form__full">
                <label class="checkout-form__label">Teléfono</label>
                <input type="tel" id="checkout-telefono" class="input" placeholder="Teléfono" value="${store.usuario?.telefono || ''}" required>
              </div>
              <div class="checkout-form__full">
                <label class="checkout-form__label">Dirección</label>
                <input type="text" id="checkout-direccion" class="input" placeholder="Calle y número" value="${store.usuario?.direccion || ''}" required>
              </div>
              <div class="checkout-form__full">
                <label class="checkout-form__label">Ciudad</label>
                <input type="text" id="checkout-ciudad" class="input" placeholder="Ciudad" required>
              </div>
              <div class="checkout-form__full">
                <label class="checkout-form__label">Notas (opcional)</label>
                <textarea id="checkout-notas" class="input" rows="2" placeholder="Instrucciones especiales..." style="resize:none"></textarea>
              </div>
            </div>
            <button type="submit" class="btn btn--primary btn--large" style="width:100%;margin-top:var(--space-lg)" id="btn-confirmar-pedido">
              Confirmar pedido
            </button>
          </form>

          <div class="cart-summary" id="checkout-summary-sidebar">
            <h2 class="cart-summary__title">Resumen</h2>
            <div id="checkout-summary-items"></div>
          </div>
        </div>
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
    const resumen = document.getElementById('checkout-resumen')
    if (resumen) {
      resumen.innerHTML = `
        <div style="background:var(--bg-secondary);border-radius:18px;padding:var(--space-lg);text-align:center">
          <p style="color:var(--text-secondary);margin-bottom:var(--space-md)">Tu carrito está vacío.</p>
          <a href="#/productos" class="btn btn--primary">Ver productos</a>
        </div>
      `
    }
    return
  }

  renderSummary()

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

function renderSummary() {
  const items = store.carrito
  const subtotal = items.reduce((sum, item) => {
    const precio = item.productos?.precio_oferta || item.productos?.precio || 0
    return sum + precio * item.cantidad
  }, 0)

  const container = document.getElementById('checkout-summary-items')
  if (!container) return

  container.innerHTML = `
    ${items.slice(0, 4).map(item => `
      <div class="cart-summary__row">
        <span>${item.productos?.nombre || 'Producto'} ×${item.cantidad}</span>
        <span>$${((item.productos?.precio_oferta || item.productos?.precio || 0) * item.cantidad).toFixed(2)}</span>
      </div>
    `).join('')}
    ${items.length > 4 ? `<div class="cart-summary__row"><span style="color:var(--text-tertiary)">y ${items.length - 4} más...</span></div>` : ''}
    <div class="cart-summary__row cart-summary__row--total">
      <span>Total</span>
      <span>$${subtotal.toFixed(2)}</span>
    </div>
  `
}
