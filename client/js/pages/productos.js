import { listar as listarProductos } from '../services/productos.service.js'
import { listar as listarCategorias } from '../services/categorias.service.js'
import { renderProductCard } from '../components/ProductCard.js'
import { renderPagination } from '../components/Pagination.js'
import { showToast, debounce } from '../utils.js'
import store from '../store.js'
import { agregar } from '../services/carrito.service.js'

const estado = {
  pagina: 1,
  categoria: '',
  busqueda: '',
  porPagina: 12,
}

export default function render() {
  return `
    <div class="max-w-7xl mx-auto px-4 py-8 fade-in">
      <h1 class="text-3xl font-bold text-gray-800 mb-6">Productos</h1>
      <div class="flex flex-col md:flex-row gap-6">
        <aside class="w-full md:w-64 shrink-0">
          <div class="bg-white rounded-xl shadow-md p-4">
            <h2 class="font-semibold text-gray-700 mb-3">Filtros</h2>
            <div id="filtros-container">
              <div class="mb-4">
                <input type="text" id="input-busqueda" class="input-field" placeholder="Buscar productos..." value="${estado.busqueda}">
              </div>
              <div id="categorias-filtro"></div>
            </div>
          </div>
        </aside>
        <div class="flex-1">
          <div id="productos-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"></div>
          <div id="paginacion" class="mt-8"></div>
        </div>
      </div>
    </div>
  `
}

export async function afterRender() {
  const params = new URLSearchParams(window.location.hash.split('?')[1] || '')
  estado.categoria = params.get('categoria') || ''
  estado.busqueda = params.get('busqueda') || ''
  estado.pagina = parseInt(params.get('pagina')) || 1

  await cargarCategoriasFiltro()

  const inputBusqueda = document.getElementById('input-busqueda')
  if (inputBusqueda) {
    inputBusqueda.addEventListener('input', debounce(() => {
      estado.busqueda = inputBusqueda.value.trim()
      estado.pagina = 1
      cargarProductos()
    }, 400))
  }

  await cargarProductos()

  const grid = document.getElementById('productos-grid')
  grid?.addEventListener('click', async (e) => {
    const btn = e.target.closest('.btn-add-cart')
    if (!btn) return

    const productoId = btn.dataset.productoId
    if (!store.sesion) {
      showToast('Debes iniciar sesión', 'warning')
      window.location.hash = '#/login'
      return
    }

    btn.disabled = true
    btn.textContent = 'Agregando...'

    const { error } = await agregar(store.usuario.id, parseInt(productoId))
    if (error) {
      showToast('Error al agregar', 'error')
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

async function cargarCategoriasFiltro() {
  const container = document.getElementById('categorias-filtro')
  if (!container) return

  const { data, error } = await listarCategorias()
  if (error || !data) return

  container.innerHTML = `
    <button class="btn-filtro-cat block w-full text-left px-3 py-2 rounded-lg text-sm mb-1 transition-colors ${!estado.categoria ? 'bg-pink-100 text-pink-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}" data-categoria="">Todas</button>
    ${data.map(cat => `
      <button class="btn-filtro-cat block w-full text-left px-3 py-2 rounded-lg text-sm mb-1 transition-colors ${estado.categoria === cat.slug ? 'bg-pink-100 text-pink-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}" data-categoria="${cat.slug}">${cat.nombre}</button>
    `).join('')}
  `

  container.querySelectorAll('.btn-filtro-cat').forEach(btn => {
    btn.addEventListener('click', () => {
      estado.categoria = btn.dataset.categoria
      estado.pagina = 1
      cargarProductos()
      cargarCategoriasFiltro()
    })
  })
}

async function cargarProductos() {
  const grid = document.getElementById('productos-grid')
  const pagContainer = document.getElementById('paginacion')
  if (!grid) return

  grid.innerHTML = '<div class="col-span-full text-center py-8"><div class="spinner mx-auto"></div></div>'

  const { data, error, count, paginas } = await listarProductos({
    categoria: estado.categoria || undefined,
    busqueda: estado.busqueda || undefined,
    pagina: estado.pagina,
    porPagina: estado.porPagina,
  })

  if (error) {
    grid.innerHTML = '<p class="col-span-full text-center text-gray-400 py-8">Error al cargar productos</p>'
    return
  }

  if (!data || data.length === 0) {
    grid.innerHTML = '<p class="col-span-full text-center text-gray-400 py-8">No se encontraron productos</p>'
    return
  }

  grid.innerHTML = data.map(p => renderProductCard(p)).join('')

  if (pagContainer) {
    renderPagination(pagContainer, {
      pagina: estado.pagina,
      paginas,
      onChange: (nuevaPagina) => {
        estado.pagina = nuevaPagina
        cargarProductos()
      },
    })
  }
}
