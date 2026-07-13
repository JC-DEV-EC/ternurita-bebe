import store from '../store.js'
import { obtener, actualizarCantidad, eliminarItem } from '../services/carrito.service.js'
import { formatPrecio, showToast } from '../utils.js'

export default function render() {
  return `
    <div class="max-w-7xl mx-auto px-4 py-8 fade-in">
      <h1 class="text-3xl font-bold text-gray-800 mb-6">Carrito de compras</h1>
      <div id="carrito-contenido">
        <div class="text-center py-8"><div class="spinner mx-auto"></div></div>
      </div>
    </div>
  `
}

export async function afterRender() {
  await cargarCarrito()
}

async function cargarCarrito() {
  const container = document.getElementById('carrito-contenido')
  if (!container) return

  if (!store.sesion || !store.usuario) {
    container.innerHTML = '<p class="text-center text-gray-500 py-8">Debes iniciar sesión para ver tu carrito.</p>'
    return
  }

  const { data, error } = await obtener(store.usuario.id)
  if (error) {
    container.innerHTML = '<p class="text-center text-gray-400 py-8">Error al cargar el carrito</p>'
    return
  }

  if (!data || data.length === 0) {
    container.innerHTML = `
      <div class="text-center py-12">
        <p class="text-gray-400 text-lg mb-4">Tu carrito está vacío</p>
        <a href="#/productos" class="btn-primary">Ver productos</a>
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
    <div class="flex flex-col lg:flex-row gap-8">
      <div class="flex-1 space-y-4" id="items-lista">
        ${data.map(item => renderItem(item)).join('')}
      </div>
      <div class="lg:w-80 shrink-0">
        <div class="bg-white rounded-xl shadow-md p-6 sticky top-24">
          <h2 class="text-lg font-bold text-gray-800 mb-4">Resumen</h2>
          <div class="flex justify-between mb-2">
            <span class="text-gray-600">Subtotal</span>
            <span class="font-semibold" id="carrito-subtotal">${formatPrecio(subtotal)}</span>
          </div>
          <div class="flex justify-between mb-4">
            <span class="text-gray-600">Productos</span>
            <span class="font-semibold">${data.length}</span>
          </div>
          <a href="#/checkout" class="btn-primary w-full text-center block">Ir a pagar</a>
          <button id="btn-vaciar-carrito" class="btn-outline w-full mt-2 text-sm">Vaciar carrito</button>
        </div>
      </div>
    </div>
  `

  configurarEventos()
}

function renderItem(item) {
  const producto = item.productos
  if (!producto) return ''

  const precio = producto.precio_oferta || producto.precio
  const imagen = producto.imagenes?.[0]?.url || 'https://placehold.co/100x100/f3f4f6/9ca3af?text=No'

  return `
    <div class="bg-white rounded-xl shadow-md p-4 flex items-center gap-4 carrito-item" data-item-id="${item.id}">
      <img src="${imagen}" alt="${producto.nombre}" class="w-20 h-20 rounded-lg object-cover bg-gray-100">
      <div class="flex-1 min-w-0">
        <a href="#/productos/${producto.slug}" class="font-semibold text-gray-800 hover:text-pink-500 truncate block">${producto.nombre}</a>
        <p class="text-pink-500 font-bold mt-1">${formatPrecio(precio)}</p>
      </div>
      <div class="flex items-center border border-gray-200 rounded-lg">
        <button class="btn-cantidad px-3 py-1.5 text-gray-600 hover:text-pink-500" data-action="decrementar">-</button>
        <span class="px-3 py-1.5 font-medium text-gray-800">${item.cantidad}</span>
        <button class="btn-cantidad px-3 py-1.5 text-gray-600 hover:text-pink-500" data-action="incrementar">+</button>
      </div>
      <p class="font-bold text-gray-800 w-24 text-right">${formatPrecio(precio * item.cantidad)}</p>
      <button class="btn-eliminar-item text-gray-400 hover:text-red-500 transition-colors" title="Eliminar">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
        </svg>
      </button>
    </div>
  `
}

function configurarEventos() {
  document.querySelectorAll('.btn-cantidad').forEach(btn => {
    btn.addEventListener('click', async () => {
      const item = btn.closest('.carrito-item')
      const itemId = parseInt(item.dataset.itemId)
      const span = item.querySelector('.font-medium')

      const accion = btn.dataset.action
      let cantidad = parseInt(span.textContent)

      if (accion === 'incrementar') cantidad++
      else cantidad--

      if (cantidad < 1) return

      span.textContent = cantidad

      const { error } = await actualizarCantidad(itemId, store.usuario.id, cantidad)
      if (error) {
        showToast('Error al actualizar cantidad', 'error')
      } else {
        await cargarCarrito()
      }
    })
  })

  document.querySelectorAll('.btn-eliminar-item').forEach(btn => {
    btn.addEventListener('click', async () => {
      const item = btn.closest('.carrito-item')
      const itemId = parseInt(item.dataset.itemId)

      const { error } = await eliminarItem(itemId, store.usuario.id)
      if (error) {
        showToast('Error al eliminar item', 'error')
      } else {
        showToast('Producto eliminado del carrito', 'info')
        await cargarCarrito()
      }
    })
  })

  const btnVaciar = document.getElementById('btn-vaciar-carrito')
  btnVaciar?.addEventListener('click', async () => {
    const { vaciar } = await import('../services/carrito.service.js')
    const { error } = await vaciar(store.usuario.id)
    if (error) {
      showToast('Error al vaciar carrito', 'error')
    } else {
      showToast('Carrito vaciado', 'info')
      await cargarCarrito()
    }
  })
}
