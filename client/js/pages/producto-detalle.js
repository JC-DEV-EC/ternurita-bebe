import { obtenerPorSlug } from '../services/productos.service.js'
import { showToast, placeholderImg } from '../utils.js'
import store from '../store.js'
import { agregar } from '../services/carrito.service.js'

export default function render(params) {
  return `
    <div style="padding-top:var(--nav-height)">
      <div class="product-detail" id="product-detail">
        <div class="product-detail__gallery" id="gallery-container">
          <div class="spinner" style="margin:auto"></div>
        </div>
        <div class="product-detail__info" id="info-container">
          <div class="spinner"></div>
        </div>
      </div>
    </div>
  `
}

export async function afterRender(params) {
  const { slug } = params
  if (!slug) return

  const { data, error } = await obtenerPorSlug(slug)
  if (error || !data) {
    document.getElementById('info-container').innerHTML = '<p style="color:var(--text-secondary);padding:2rem">Producto no encontrado</p>'
    return
  }

  renderGallery(data)
  renderInfo(data)
  setupActions(data)
}

function renderGallery(producto) {
  const container = document.getElementById('gallery-container')
  if (!container) return

  const imagenes = producto.imagenes || []
  const mainUrl = imagenes[0]?.url || placeholderImg(600, 800, 'Sin imagen')
  const fallback = placeholderImg(600, 800, 'Sin imagen')

  let html = `<div class="product-detail__main-img"><img src="${mainUrl}" alt="${producto.nombre}" id="main-image" onerror="this.onerror=null;this.src='${fallback.replace(/'/g, '&#39;')}'" /></div>`

  if (imagenes.length > 1) {
    html += `<div class="product-detail__thumbs">`
    imagenes.forEach((img, i) => {
      html += `<button class="product-detail__thumb ${i === 0 ? 'is-active' : ''}" data-src="${img.url}">
        <img src="${img.url}" alt="" onerror="this.onerror=null;this.src='${fallback.replace(/'/g, '&#39;')}'" />
      </button>`
    })
    html += `</div>`
  }

  container.innerHTML = html

  container.querySelectorAll('.product-detail__thumb').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('main-image').src = btn.dataset.src
      container.querySelectorAll('.product-detail__thumb').forEach(t => t.classList.remove('is-active'))
      btn.classList.add('is-active')
    })
  })
}

function renderInfo(producto) {
  const container = document.getElementById('info-container')
  if (!container) return

  const tieneOferta = producto.precio_oferta && producto.precio_oferta < producto.precio

  container.innerHTML = `
    <div class="product-detail__breadcrumb">
      <a href="#/productos">Productos</a>
      ${producto.categorias ? `<span class="product-detail__sep">/</span><a href="#/productos?categoria=${producto.categorias.slug}">${producto.categorias.nombre}</a>` : ''}
    </div>

    <h1 class="product-detail__title">${producto.nombre}</h1>

    <div class="product-detail__price-row">
      ${tieneOferta
        ? `<span class="product-detail__price">$${producto.precio_oferta.toFixed(2)}</span>
           <span class="product-detail__price--old">$${producto.precio.toFixed(2)}</span>`
        : `<span class="product-detail__price">$${producto.precio.toFixed(2)}</span>`
      }
    </div>

    ${producto.descripcion ? `<p class="product-detail__desc">${producto.descripcion}</p>` : ''}

    <div class="product-detail__divider"></div>

    <div class="product-detail__qty">
      <span class="product-detail__qty-label">Cantidad</span>
      <div class="product-detail__qty-controls">
        <button id="btn-dec" class="product-detail__qty-btn">−</button>
        <span id="qty-display" class="product-detail__qty-value">1</span>
        <button id="btn-inc" class="product-detail__qty-btn">+</button>
      </div>
    </div>

    <button id="btn-add-cart" class="btn btn--primary btn--large" style="width:100%;margin-top:var(--space-lg)" ${producto.stock_total < 1 ? 'disabled' : ''}>
      ${producto.stock_total < 1 ? 'Agotado' : 'Agregar al carrito'}
    </button>

    <div class="product-detail__meta">
      <span>Stock: ${producto.stock_total || 0} unidades</span>
    </div>
  `
}

function setupActions(producto) {
  let cantidad = 1
  const btnAdd = document.getElementById('btn-add-cart')
  const btnDec = document.getElementById('btn-dec')
  const btnInc = document.getElementById('btn-inc')
  const qtyDisplay = document.getElementById('qty-display')

  btnDec?.addEventListener('click', () => {
    if (cantidad > 1) {
      cantidad--
      qtyDisplay.textContent = cantidad
    }
  })

  btnInc?.addEventListener('click', () => {
    if (cantidad < (producto.stock_total || 99)) {
      cantidad++
      qtyDisplay.textContent = cantidad
    }
  })

  btnAdd?.addEventListener('click', async () => {
    if (!store.sesion) {
      showToast('Debes iniciar sesión', 'warning')
      window.location.hash = '#/login'
      return
    }

    btnAdd.disabled = true
    btnAdd.textContent = 'Agregando...'

    const { error } = await agregar(store.usuario.id, producto.id, cantidad)
    if (error) {
      showToast('Error al agregar al carrito', 'error')
    } else {
      showToast(`${cantidad} x ${producto.nombre} agregado`, 'success')
      const { obtener } = await import('../services/carrito.service.js')
      const { data } = await obtener(store.usuario.id)
      store.carrito = data || []
      store.carritoCount = (data || []).reduce((sum, item) => sum + item.cantidad, 0)
    }

    btnAdd.disabled = false
    btnAdd.textContent = 'Agregar al carrito'
  })
}
