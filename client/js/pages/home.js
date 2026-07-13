import { listar as listarCategorias } from '../services/categorias.service.js'
import { destacados } from '../services/productos.service.js'
import { renderProductCard } from '../components/ProductCard.js'
import { showToast } from '../utils.js'
import store from '../store.js'
import { agregar } from '../services/carrito.service.js'

export default function render() {
  return `
    <div class="fade-in">
      <section class="bg-gradient-to-r from-pink-100 to-sky-100 py-20">
        <div class="max-w-7xl mx-auto px-4 text-center">
          <h1 class="text-5xl font-bold text-gray-800 mb-4">Ternurita Bebé</h1>
          <p class="text-xl text-gray-600 mb-8">Ropa y accesorios suaves como el amor de mamá</p>
          <a href="#/productos" class="btn-primary text-lg px-8 py-3">Ver productos</a>
        </div>
      </section>
      <section class="max-w-7xl mx-auto px-4 py-12">
        <h2 class="text-2xl font-bold text-gray-800 mb-6">Categorías</h2>
        <div id="categorias-container" class="grid grid-cols-2 md:grid-cols-4 gap-4"></div>
      </section>
      <section class="max-w-7xl mx-auto px-4 py-12">
        <h2 class="text-2xl font-bold text-gray-800 mb-6">Productos destacados</h2>
        <div id="destacados-container" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"></div>
      </section>
    </div>
  `
}

export async function afterRender() {
  await Promise.all([cargarCategorias(), cargarDestacados()])

  const container = document.getElementById('destacados-container')
  container?.addEventListener('click', async (e) => {
    const btn = e.target.closest('.btn-add-cart')
    if (!btn) return

    const productoId = btn.dataset.productoId
    if (!store.sesion) {
      showToast('Debes iniciar sesión para agregar productos', 'warning')
      window.location.hash = '#/login'
      return
    }

    btn.disabled = true
    btn.textContent = 'Agregando...'

    const { error } = await agregar(store.usuario.id, parseInt(productoId))
    if (error) {
      showToast('Error al agregar al carrito', 'error')
    } else {
      showToast('Producto agregado al carrito', 'success')
      const { obtener } = await import('../services/carrito.service.js')
      const { data } = await obtener(store.usuario.id)
      store.carrito = data || []
      store.carritoCount = (data || []).reduce((sum, item) => sum + item.cantidad, 0)
    }

    btn.disabled = false
    btn.textContent = 'Agregar al carrito'
  })
}

async function cargarCategorias() {
  const container = document.getElementById('categorias-container')
  if (!container) return

  const { data, error } = await listarCategorias()
  if (error) {
    container.innerHTML = '<p class="text-gray-400 col-span-full">Error al cargar categorías</p>'
    return
  }

  if (!data || data.length === 0) {
    container.innerHTML = '<p class="text-gray-400 col-span-full">No hay categorías disponibles</p>'
    return
  }

  container.innerHTML = data.map(cat => `
    <a href="#/productos?categoria=${cat.slug}" class="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-shadow group">
      <div class="w-16 h-16 mx-auto mb-3 rounded-full bg-pink-100 flex items-center justify-center group-hover:bg-pink-200 transition-colors">
        <span class="text-2xl">${cat.icono || '📁'}</span>
      </div>
      <h3 class="font-semibold text-gray-800">${cat.nombre}</h3>
    </a>
  `).join('')
}

async function cargarDestacados() {
  const container = document.getElementById('destacados-container')
  if (!container) return

  const { data, error } = await destacados(8)
  if (error) {
    container.innerHTML = '<p class="text-gray-400 col-span-full">Error al cargar productos</p>'
    return
  }

  if (!data || data.length === 0) {
    container.innerHTML = '<p class="text-gray-400 col-span-full">No hay productos destacados</p>'
    return
  }

  container.innerHTML = data.map(p => renderProductCard(p)).join('')
}
