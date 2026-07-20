import { renderAdminSidebar, setupAdminToggle } from '../../components/AdminSidebar.js'
import { productos, pedidos } from '../../services/admin.service.js'

export default function render() {
  const collapsed = localStorage.getItem('admin-sidebar-collapsed') === 'true'
  return `
    <div class="admin-layout">
      <div id="admin-sidebar"></div>
      <div class="admin-main ${collapsed ? 'admin-main--expanded' : ''}">
        <button class="admin-sidebar-toggle ${collapsed ? 'admin-sidebar-toggle--collapsed' : ''}" id="admin-toggle" aria-label="Alternar menú lateral"><i data-lucide="panel-left"></i></button>
        <div style="margin-bottom:var(--space-xl)">
          <span class="badge">Admin</span>
          <h1 class="headline-display">Dashboard</h1>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:var(--space-md)" id="stats-grid">
          <div class="stat-card">
            <p class="stat-card__label">Pedidos hoy</p>
            <p class="stat-card__value" id="stats-pedidos-hoy">-</p>
          </div>
          <div class="stat-card">
            <p class="stat-card__label">Productos</p>
            <p class="stat-card__value" id="stats-productos">-</p>
          </div>
          <div class="stat-card">
            <p class="stat-card__label">Usuarios</p>
            <p class="stat-card__value" id="stats-usuarios">-</p>
          </div>
          <div class="stat-card">
            <p class="stat-card__label">Ingresos totales</p>
            <p class="stat-card__value" id="stats-ingresos">-</p>
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

  await Promise.all([
    cargarStatsProductos(),
    cargarStatsPedidos(),
  ])
}

async function cargarStatsProductos() {
  try {
    const data = await productos.listar()
    const el = document.getElementById('stats-productos')
    if (el) el.textContent = data?.length || 0
  } catch {}
}

async function cargarStatsPedidos() {
  try {
    const data = await pedidos.listar()
    const total = data?.length || 0
    const hoy = data?.filter(p => {
      if (!p.created_at) return false
      return new Date(p.created_at).toDateString() === new Date().toDateString()
    }).length || 0
    const ingresos = data?.reduce((sum, p) => sum + (p.total_pedido || 0), 0) || 0

    const elHoy = document.getElementById('stats-pedidos-hoy')
    if (elHoy) elHoy.textContent = hoy

    const elIngresos = document.getElementById('stats-ingresos')
    if (elIngresos) elIngresos.textContent = `$${ingresos.toFixed(2)}`

    const elUsuarios = document.getElementById('stats-usuarios')
    const usuariosUnicos = new Set(data?.map(p => p.cliente_id) || [])
    if (elUsuarios) elUsuarios.textContent = usuariosUnicos.size
  } catch {}
}
