import store from '../store.js'
import { obtener, actualizarCantidad, eliminarItem } from '../services/carrito.service.js'
import { showToast, placeholderImg } from '../utils.js'

export default function render() {
  return `
    <div class="cart-page">
      <div class="container">
        <div class="cart-page__header">
          <div>
            <span class="badge">Carrito</span>
            <h1 class="headline-display">Tu carrito</h1>
          </div>
        </div>
        <div id="cart-content"></div>
      </div>
    </div>
  `
}

export async function afterRender() {
  await loadCart()
}

async function loadCart() {
  const container = document.getElementById('cart-content')
  if (!container) return

  if (!store.sesion || !store.usuario) {
    container.innerHTML = '<p style="text-align:center;color:var(--text-secondary);padding:var(--space-2xl) 0">Debes iniciar sesión para ver tu carrito.</p>'
    return
  }

  const { data, error } = await obtener(store.usuario.id)
  if (error) {
    container.innerHTML = '<p style="text-align:center;color:var(--text-secondary);padding:var(--space-2xl) 0">Error al cargar el carrito</p>'
    return
  }

  if (!data || data.length === 0) {
    container.innerHTML = `
      <div class="cart-page__empty">
        <div class="cart-page__empty-icon">🛍️</div>
        <h2 style="font-size:var(--text-title);font-weight:var(--weight-semibold);margin-bottom:var(--space-sm)">Tu carrito está vacío</h2>
        <p style="color:var(--text-secondary);margin-bottom:var(--space-lg)">Explora nuestra colección y agrega productos.</p>
        <a href="#/productos" class="btn btn--primary">Ver productos</a>
      </div>
    `
    return
  }

  store.carrito = data
  store.carritoCount = data.reduce((sum, item) => sum + item.cantidad, 0)

  const subtotal = data.reduce((sum, item) => {
    const precio = item.productos?.precio_oferta || item.productos?.precio || 0
    return sum + precio * item.cantidad
  }, 0)

  container.innerHTML = `
    <div class="cart-page__layout">
      <div class="cart-page__items" id="cart-items">
        ${data.map(item => renderItemRow(item)).join('')}
      </div>
      <div class="cart-summary">
        <h2 class="cart-summary__title">Resumen</h2>
        <div class="cart-summary__row">
          <span>Subtotal</span>
          <span>$${subtotal.toFixed(2)}</span>
        </div>
        <div class="cart-summary__row">
          <span>Productos</span>
          <span>${data.length}</span>
        </div>
        <div class="cart-summary__row cart-summary__row--total">
          <span>Total</span>
          <span>$${subtotal.toFixed(2)}</span>
        </div>
        <div class="cart-summary__actions">
          <a href="#/checkout" class="btn btn--primary" style="width:100%;text-align:center">Ir a pagar</a>
          <button id="btn-clear-cart" class="btn btn--ghost btn--small" style="width:100%">Vaciar carrito</button>
        </div>
      </div>
    </div>
  `

  setupEvents()
}

function renderItemRow(item) {
  const producto = item.productos
  if (!producto) return ''

  const precioUnitario = producto.precio_oferta || producto.precio
  const imagen = producto.imagenes?.[0]?.url || placeholderImg(160, 160, 'No')
  const fallback = placeholderImg(160, 160, 'No')

  return `
    <div class="cart-item-row" data-item-id="${item.id}">
      <img src="${imagen}" alt="${producto.nombre}" class="cart-item-row__img" loading="lazy" onerror="this.onerror=null;this.src='${fallback.replace(/'/g, '&#39;')}'" />
      <div class="cart-item-row__info">
        <a href="#/productos/${producto.slug}" class="cart-item-row__name">${producto.nombre}</a>
        <div class="cart-item-row__price">$${precioUnitario.toFixed(2)} c/u</div>
      </div>
      <div class="cart-item-row__qty">
        <button class="btn-qty" data-action="dec">−</button>
        <span>${item.cantidad}</span>
        <button class="btn-qty" data-action="inc">+</button>
      </div>
      <div class="cart-item-row__total">$${(precioUnitario * item.cantidad).toFixed(2)}</div>
      <button class="cart-item-row__remove btn-remove-item" title="Eliminar">
        <i data-lucide="trash-2" style="width:16px;height:16px"></i>
      </button>
    </div>
  `
}

function setupEvents() {
  document.querySelectorAll('.btn-qty').forEach(btn => {
    btn.addEventListener('click', async () => {
      const row = btn.closest('.cart-item-row')
      const itemId = parseInt(row.dataset.itemId)
      const span = row.querySelector('.cart-item-row__qty span')
      let cantidad = parseInt(span.textContent)

      btn.dataset.action === 'inc' ? cantidad++ : cantidad--
      if (cantidad < 1) return

      span.textContent = cantidad

      const { error } = await actualizarCantidad(itemId, store.usuario.id, cantidad)
      if (error) {
        showToast('Error al actualizar cantidad', 'error')
      } else {
        await loadCart()
      }
    })
  })

  document.querySelectorAll('.btn-remove-item').forEach(btn => {
    btn.addEventListener('click', async () => {
      const itemId = parseInt(btn.closest('.cart-item-row').dataset.itemId)
      const { error } = await eliminarItem(itemId, store.usuario.id)
      if (error) {
        showToast('Error al eliminar', 'error')
      } else {
        showToast('Producto eliminado', 'info')
        await loadCart()
      }
    })
  })

  document.getElementById('btn-clear-cart')?.addEventListener('click', async () => {
    const { vaciar } = await import('../services/carrito.service.js')
    const { error } = await vaciar(store.usuario.id)
    if (error) {
      showToast('Error al vaciar carrito', 'error')
    } else {
      showToast('Carrito vaciado', 'info')
      await loadCart()
    }
  })
}
