import { renderAdminSidebar, setupAdminToggle } from '../../components/AdminSidebar.js'
import { productos, pedidos, estadisticas } from '../../services/admin.service.js'

export default function render() {
  const collapsed = localStorage.getItem('admin-sidebar-collapsed') === 'true'
  const today = new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  return `
    <div class="admin-layout">
      <div id="admin-sidebar"></div>
      <div class="admin-main ${collapsed ? 'admin-main--expanded' : ''}">
        <button class="admin-sidebar-toggle ${collapsed ? 'admin-sidebar-toggle--collapsed' : ''}" id="admin-toggle" aria-label="Alternar menú lateral"><i data-lucide="panel-left"></i></button>

        <div class="dash-header">
          <div>
            <div class="dash-header__badge">Panel de control</div>
            <h1 class="dash-header__title">Dashboard</h1>
            <p class="dash-header__desc">Resumen general de tu tienda</p>
          </div>
          <div class="dash-header__meta">
            <div class="dash-header__date">${today}</div>
            <div class="dash-header__updated" id="last-updated"></div>
          </div>
        </div>

        <div class="dash-grid" id="stats-grid">
          <div class="dash-card dash-card--stat is-loading" data-stat="pedidos-hoy">
            <div class="dash-card__icon-shape dash-card__icon-shape--orders">
              <i data-lucide="shopping-bag"></i>
            </div>
            <div class="dash-card__body">
              <div class="dash-card__label">Pedidos hoy</div>
              <div class="dash-card__value" id="stats-pedidos-hoy">-</div>
              <div class="dash-card__trend">Órdenes del día</div>
            </div>
          </div>
          <div class="dash-card dash-card--stat is-loading" data-stat="productos">
            <div class="dash-card__icon-shape dash-card__icon-shape--products">
              <i data-lucide="package"></i>
            </div>
            <div class="dash-card__body">
              <div class="dash-card__label">Productos</div>
              <div class="dash-card__value" id="stats-productos">-</div>
              <div class="dash-card__trend">Total activos</div>
            </div>
          </div>
          <div class="dash-card dash-card--stat is-loading" data-stat="usuarios">
            <div class="dash-card__icon-shape dash-card__icon-shape--users">
              <i data-lucide="users"></i>
            </div>
            <div class="dash-card__body">
              <div class="dash-card__label">Clientes</div>
              <div class="dash-card__value" id="stats-usuarios">-</div>
              <div class="dash-card__trend">Registrados</div>
            </div>
          </div>
          <div class="dash-card dash-card--stat is-loading" data-stat="ingresos">
            <div class="dash-card__icon-shape dash-card__icon-shape--revenue">
              <i data-lucide="trending-up"></i>
            </div>
            <div class="dash-card__body">
              <div class="dash-card__label">Ingresos totales</div>
              <div class="dash-card__value" id="stats-ingresos">-</div>
              <div class="dash-card__trend">Histórico</div>
            </div>
          </div>
        </div>

        <div class="dash-grid-2">
          <div class="dash-card">
            <div class="dash-card__header">
              <svg class="dash-card__header-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              <h3 class="dash-card__header-title">Acciones rápidas</h3>
            </div>
            <div class="dash-card__body">
              <div class="dash-actions">
                <a href="#/admin/productos" class="dash-action">
                  <span class="dash-action__icon"><i data-lucide="plus"></i></span>
                  <span class="dash-action__label">Nuevo producto</span>
                </a>
                <a href="#/admin/pedidos" class="dash-action">
                  <span class="dash-action__icon"><i data-lucide="eye"></i></span>
                  <span class="dash-action__label">Ver pedidos</span>
                </a>
                <a href="#/admin/usuarios" class="dash-action">
                  <span class="dash-action__icon"><i data-lucide="users"></i></span>
                  <span class="dash-action__label">Gestionar usuarios</span>
                </a>
                <a href="#/" class="dash-action">
                  <span class="dash-action__icon"><i data-lucide="arrow-up-right"></i></span>
                  <span class="dash-action__label">Ir a la tienda</span>
                </a>
              </div>
            </div>
          </div>

          <div class="dash-card">
            <div class="dash-card__header">
              <svg class="dash-card__header-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
              <h3 class="dash-card__header-title">Resumen</h3>
            </div>
            <div class="dash-card__body">
              <div class="dash-summary" id="dash-summary">
                <div class="dash-summary__row">
                  <span class="dash-summary__label">Productos activos</span>
                  <span class="dash-summary__value" id="summary-productos">-</span>
                </div>
                <div class="dash-summary__row">
                  <span class="dash-summary__label">Pedidos totales</span>
                  <span class="dash-summary__value" id="summary-pedidos">-</span>
                </div>
                <div class="dash-summary__row">
                  <span class="dash-summary__label">Pedidos hoy</span>
                  <span class="dash-summary__value dash-summary__value--accent" id="summary-pedidos-hoy">-</span>
                </div>
                <div class="dash-summary__row">
                  <span class="dash-summary__label">Clientes activos</span>
                  <span class="dash-summary__value" id="summary-usuarios">-</span>
                </div>
                <div class="dash-summary__row dash-summary__row--total">
                  <span class="dash-summary__label">Ingresos totales</span>
                  <span class="dash-summary__value dash-summary__value--accent" id="summary-ingresos">-</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
}

export async function afterRender() {
  const sidebar = document.getElementById('admin-sidebar')
  if (sidebar) renderAdminSidebar(sidebar)
  setupAdminToggle()

  await cargarStats()

  const cards = document.querySelectorAll('.dash-card--stat')
  cards.forEach((el, i) => {
    el.classList.remove('is-loading')
    setTimeout(() => el.classList.add('is-visible'), i * 100)
  })

  animarContadores()
  actualizarTimestamp()
}

async function cargarStats() {
  let raw

  try {
    raw = await estadisticas.obtener()
  } catch (_) {
    try {
      const [prods, ords] = await Promise.all([productos.listar(), pedidos.listar()])
      const hoy = (ords || []).filter(p => {
        if (!p.created_at) return false
        return new Date(p.created_at).toDateString() === new Date().toDateString()
      })
      raw = {
        pedidos_hoy: hoy.length,
        productos: (prods || []).length,
        clientes: new Set((ords || []).map(p => p.cliente_id).filter(Boolean)).size,
        ingresos_totales: (ords || []).reduce((s, p) => s + (p.total_pedido || 0), 0),
        pedidos_totales: (ords || []).length,
      }
    } catch (e) {
      mostrarError(e)
      return
    }
  }

  const data = normalizar(raw)
  renderizar(data)
}

function normalizar(raw) {
  if (!raw || typeof raw !== 'object') raw = {}
  return {
    pedidos_hoy: raw.pedidos_hoy ?? raw.pedidosDelDia ?? raw.ordenes_hoy ?? 0,
    productos: raw.productos ?? raw.totalProductos ?? raw.productos_activos ?? 0,
    clientes: raw.clientes ?? raw.usuarios ?? raw.totalClientes ?? 0,
    ingresos_totales: raw.ingresos_totales ?? raw.totalIngresos ?? raw.ingresos ?? 0,
    pedidos_totales: raw.pedidos_totales ?? raw.totalPedidos ?? raw.ordenes_totales ?? 0,
  }
}

function renderizar(data) {
  const set = (id, val) => {
    const el = document.getElementById(id)
    if (!el) return
    el.textContent = val
  }

  set('stats-pedidos-hoy', data.pedidos_hoy)
  set('stats-productos', data.productos)
  set('stats-usuarios', data.clientes)
  set('stats-ingresos', `$${(data.ingresos_totales || 0).toFixed(2)}`)
  set('summary-productos', data.productos)
  set('summary-pedidos', data.pedidos_totales)
  set('summary-pedidos-hoy', data.pedidos_hoy)
  set('summary-usuarios', data.clientes)
  set('summary-ingresos', `$${(data.ingresos_totales || 0).toFixed(2)}`)
}

function mostrarError(e) {
  const el = document.getElementById('last-updated')
  if (el) el.textContent = 'Error: ' + (e.message || 'desconocido')
  document.querySelectorAll('.dash-card--stat.is-loading').forEach(c => {
    c.classList.remove('is-loading')
    c.querySelector('.dash-card__value') && (c.querySelector('.dash-card__value').textContent = '—')
  })
}

function animarContadores() {
  import('https://cdn.jsdelivr.net/npm/animejs@4/lib/anime.esm.js').then(({ animate }) => {
    document.querySelectorAll('.dash-card__value').forEach(el => {
      const raw = el.textContent
      const num = parseFloat(raw.replace(/[$,]/g, ''))
      if (isNaN(num) || num === 0) return
      const isCurrency = /^\$/.test(raw)
      el.textContent = isCurrency ? '$0' : '0'
      animate({
        targets: { val: 0 },
        val: num,
        duration: 800,
        ease: 'outQuart',
        onUpdate: anim => {
          const v = anim.currentValue
          el.textContent = isCurrency ? `$${v.toFixed(2)}` : Math.round(v).toString()
        }
      })
    })
  }).catch(() => {})
}

function actualizarTimestamp() {
  const el = document.getElementById('last-updated')
  if (!el || el.textContent) return
  const ahora = new Date()
  const h = ahora.getHours().toString().padStart(2, '0')
  const m = ahora.getMinutes().toString().padStart(2, '0')
  el.textContent = `Actualizado ${h}:${m}`
}
