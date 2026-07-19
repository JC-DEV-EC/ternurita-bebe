import { listar as listarProductos } from '../services/productos.service.js'
import { listar as listarCategorias } from '../services/categorias.service.js'
import { renderProductCard } from '../components/ProductCard.js'
import { renderPagination } from '../components/Pagination.js'
import { showToast, debounce, initFadeAnimations } from '../utils.js'
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
    <div class="section" style="padding-top:calc(var(--nav-height) + var(--space-lg))">
      <div class="container">
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:var(--space-md);margin-bottom:var(--space-xl)">
          <div>
            <span class="badge">Tienda</span>
            <h1 class="headline-display">Productos</h1>
          </div>
          <div style="position:relative;width:100%;max-width:320px">
            <svg style="position:absolute;left:1rem;top:50%;transform:translateY(-50%);width:16px;height:16px;color:var(--text-tertiary);pointer-events:none" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="7" cy="7" r="5.5"/>
              <path d="M11.5 11.5L15 15"/>
            </svg>
            <input type="text" id="input-busqueda" class="input" style="padding-left:2.75rem" placeholder="Buscar productos..." value="${estado.busqueda}">
          </div>
        </div>

        <div style="display:grid;grid-template-columns:220px 1fr;gap:var(--space-xl)">
          <aside style="position:sticky;top:calc(var(--nav-height) + var(--space-md));align-self:start">
            <div style="background:var(--bg-secondary);border-radius:18px;padding:var(--space-lg)">
              <h3 style="font-size:var(--text-caption);font-weight:var(--weight-semibold);text-transform:uppercase;letter-spacing:var(--tracking-wide);color:var(--text-tertiary);margin-bottom:var(--space-md)">Categorías</h3>
              <div id="categorias-filtro"></div>
            </div>
          </aside>

          <div>
            <div id="productos-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:var(--space-md)"></div>
            <div id="paginacion" style="margin-top:var(--space-xl)"></div>
          </div>
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

  if (estado.busqueda) {
    const input = document.getElementById('input-busqueda')
    if (input) input.value = estado.busqueda
  }

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
  initFadeAnimations()

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
    const originalText = btn.textContent
    btn.textContent = '...'

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
    btn.textContent = originalText
  })
}

async function cargarCategoriasFiltro() {
  const container = document.getElementById('categorias-filtro')
  if (!container) return

  const { data, error } = await listarCategorias()
  if (error || !data) return

  container.innerHTML = `
    <button class="btn-filtro-cat" data-categoria=""
      style="display:block;width:100%;text-align:left;padding:var(--space-xs) var(--space-sm);border-radius:8px;font-size:var(--text-caption);margin-bottom:2px;transition:all var(--duration-fast) var(--ease-smooth);${!estado.categoria ? 'background:var(--accent-light);color:var(--accent);font-weight:var(--weight-medium)' : 'color:var(--text-secondary);background:transparent'}">
      Todas
    </button>
    ${data.map(cat => `
      <button class="btn-filtro-cat" data-categoria="${cat.slug}"
        style="display:block;width:100%;text-align:left;padding:var(--space-xs) var(--space-sm);border-radius:8px;font-size:var(--text-caption);margin-bottom:2px;transition:all var(--duration-fast) var(--ease-smooth);${estado.categoria === cat.slug ? 'background:var(--accent-light);color:var(--accent);font-weight:var(--weight-medium)' : 'color:var(--text-secondary);background:transparent'}">
        ${cat.nombre}
      </button>
    `).join('')}
  `

  container.querySelectorAll('.btn-filtro-cat').forEach(btn => {
    btn.addEventListener('mouseenter', () => {
      if (!btn.dataset.categoria !== estado.categoria) {
        btn.style.background = 'var(--overlay)'
      }
    })
    btn.addEventListener('mouseleave', () => {
      const isActive = btn.dataset.categoria === estado.categoria
      btn.style.background = isActive ? 'var(--accent-light)' : 'transparent'
    })
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

  grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:var(--space-2xl) 0"><div class="spinner" style="margin:0 auto"></div></div>'

  const { data, error, count, paginas } = await listarProductos({
    categoria: estado.categoria || undefined,
    busqueda: estado.busqueda || undefined,
    pagina: estado.pagina,
    porPagina: estado.porPagina,
  })

  if (error) {
    grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--text-secondary);padding:var(--space-2xl) 0">Error al cargar productos</p>'
    return
  }

  if (!data || data.length === 0) {
    grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--text-secondary);padding:var(--space-2xl) 0">No se encontraron productos</p>'
    return
  }

  grid.innerHTML = data.map(p => renderProductCard(p)).join('')
  initFadeAnimations()

  if (pagContainer) {
    renderPagination(pagContainer, {
      pagina: estado.pagina,
      paginas,
      onChange: (nuevaPagina) => {
        estado.pagina = nuevaPagina
        window.scrollTo({ top: 0, behavior: 'smooth' })
        cargarProductos()
      },
    })
  }
}
