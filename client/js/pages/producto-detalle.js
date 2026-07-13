import { obtenerPorSlug } from '../services/productos.service.js'
import { formatPrecio, showToast } from '../utils.js'
import store from '../store.js'
import { agregar } from '../services/carrito.service.js'

export default function render(params) {
  return `
    <div class="max-w-7xl mx-auto px-4 py-8 fade-in">
      <a href="#/productos" class="text-pink-500 hover:text-pink-600 mb-4 inline-block">&larr; Todos los productos</a>
      <div class="bg-white rounded-xl shadow-md overflow-hidden">
        <div class="md:flex">
          <div class="md:w-1/2">
            <div id="imagen-container" class="bg-gray-100 h-80 md:h-full flex items-center justify-center">
              <div class="spinner"></div>
            </div>
          </div>
          <div class="md:w-1/2 p-8">
            <div id="info-container">
              <div class="spinner"></div>
            </div>
          </div>
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
    document.getElementById('info-container').innerHTML = '<p class="text-gray-400">Producto no encontrado</p>'
    return
  }

  renderImagen(data)
  renderInfo(data)
  configurarAgregar(data)
}

function renderImagen(producto) {
  const container = document.getElementById('imagen-container')
  if (!container) return

  const imagenes = producto.imagenes || []
  const url = imagenes[0]?.url || 'https://placehold.co/600x600/f3f4f6/9ca3af?text=Sin+imagen'

  container.innerHTML = `
    <div class="w-full h-full">
      <img src="${url}" alt="${producto.nombre}" class="w-full h-full object-cover">
    </div>
  `

  if (imagenes.length > 1) {
    const thumbnails = document.createElement('div')
    thumbnails.className = 'flex gap-2 p-4'
    thumbnails.innerHTML = imagenes.map(img => `
      <button class="w-16 h-16 rounded-lg overflow-hidden border-2 border-transparent hover:border-pink-500 transition-colors">
        <img src="${img.url}" class="w-full h-full object-cover">
      </button>
    `).join('')

    container.parentElement.appendChild(thumbnails)
  }
}

function renderInfo(producto) {
  const container = document.getElementById('info-container')
  if (!container) return

  const tieneOferta = producto.precio_oferta && producto.precio_oferta < producto.precio

  container.innerHTML = `
    <h1 class="text-3xl font-bold text-gray-800 mb-2">${producto.nombre}</h1>
    ${producto.categorias ? `<p class="text-sm text-pink-500 font-medium mb-4">${producto.categorias.nombre}</p>` : ''}
    <div class="flex items-baseline gap-3 mb-4">
      ${tieneOferta
        ? `<span class="text-3xl font-bold text-pink-500">${formatPrecio(producto.precio_oferta)}</span>
           <span class="text-lg text-gray-400 line-through">${formatPrecio(producto.precio)}</span>`
        : `<span class="text-3xl font-bold text-gray-800">${formatPrecio(producto.precio)}</span>`
      }
    </div>
    ${producto.descripcion ? `<p class="text-gray-600 mb-6 leading-relaxed">${producto.descripcion}</p>` : ''}
    <div class="flex items-center gap-3 mb-6">
      <label class="text-sm font-medium text-gray-700">Cantidad:</label>
      <div class="flex items-center border border-gray-200 rounded-lg">
        <button id="btn-decrementar" class="px-3 py-2 text-gray-600 hover:text-pink-500 transition-colors">-</button>
        <span id="cantidad-selector" class="px-4 py-2 font-medium text-gray-800 min-w-[3rem] text-center">1</span>
        <button id="btn-incrementar" class="px-3 py-2 text-gray-600 hover:text-pink-500 transition-colors">+</button>
      </div>
      <span class="text-sm text-gray-400">Stock: ${producto.stock_total || 0}</span>
    </div>
    <button id="btn-agregar-carrito" class="btn-primary w-full text-lg py-3" ${producto.stock_total < 1 ? 'disabled' : ''}>
      ${producto.stock_total < 1 ? 'Agotado' : 'Agregar al carrito'}
    </button>
  `
}

function configurarAgregar(producto) {
  let cantidad = 1

  const btnAgregar = document.getElementById('btn-agregar-carrito')
  const btnDec = document.getElementById('btn-decrementar')
  const btnInc = document.getElementById('btn-incrementar')
  const spanCantidad = document.getElementById('cantidad-selector')

  btnDec?.addEventListener('click', () => {
    if (cantidad > 1) {
      cantidad--
      spanCantidad.textContent = cantidad
    }
  })

  btnInc?.addEventListener('click', () => {
    if (cantidad < (producto.stock_total || 99)) {
      cantidad++
      spanCantidad.textContent = cantidad
    }
  })

  btnAgregar?.addEventListener('click', async () => {
    if (!store.sesion) {
      showToast('Debes iniciar sesión', 'warning')
      window.location.hash = '#/login'
      return
    }

    btnAgregar.disabled = true
    btnAgregar.textContent = 'Agregando...'

    const { error } = await agregar(store.usuario.id, producto.id, cantidad)
    if (error) {
      showToast('Error al agregar al carrito', 'error')
    } else {
      showToast(`${cantidad} x ${producto.nombre} agregado al carrito`, 'success')
      const { obtener } = await import('../services/carrito.service.js')
      const { data } = await obtener(store.usuario.id)
      store.carrito = data || []
      store.carritoCount = (data || []).reduce((sum, item) => sum + item.cantidad, 0)
    }

    btnAgregar.disabled = false
    btnAgregar.textContent = 'Agregar al carrito'
  })
}
