import { renderAdminSidebar } from '../../components/AdminSidebar.js'
import { productos, pedidos } from '../../services/admin.service.js'
import { formatPrecio } from '../../utils.js'

export default function render() {
  return `
    <div class="max-w-7xl mx-auto px-4 py-8 fade-in">
      <h1 class="text-3xl font-bold text-gray-800 mb-6">Panel de Administración</h1>
      <div class="flex flex-col md:flex-row gap-6">
        <div id="admin-sidebar"></div>
        <div class="flex-1">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div class="card p-6">
              <p class="text-sm text-gray-500">Pedidos hoy</p>
              <p class="text-3xl font-bold text-gray-800" id="stats-pedidos-hoy">-</p>
            </div>
            <div class="card p-6">
              <p class="text-sm text-gray-500">Productos</p>
              <p class="text-3xl font-bold text-gray-800" id="stats-productos">-</p>
            </div>
            <div class="card p-6">
              <p class="text-sm text-gray-500">Usuarios</p>
              <p class="text-3xl font-bold text-gray-800" id="stats-usuarios">-</p>
            </div>
            <div class="card p-6">
              <p class="text-sm text-gray-500">Ingresos totales</p>
              <p class="text-3xl font-bold text-gray-800" id="stats-ingresos">-</p>
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
  } catch {
    // ignore
  }
}

async function cargarStatsPedidos() {
  try {
    const data = await pedidos.listar()
    const total = data?.length || 0
    const hoy = data?.filter(p => {
      if (!p.created_at) return false
      const fecha = new Date(p.created_at).toDateString()
      return fecha === new Date().toDateString()
    }).length || 0
    const ingresos = data?.reduce((sum, p) => sum + (p.total_pedido || 0), 0) || 0

    const elHoy = document.getElementById('stats-pedidos-hoy')
    if (elHoy) elHoy.textContent = hoy

    const elIngresos = document.getElementById('stats-ingresos')
    if (elIngresos) elIngresos.textContent = formatPrecio(ingresos)

    const elUsuarios = document.getElementById('stats-usuarios')
    const usuariosUnicos = new Set(data?.map(p => p.cliente_id) || [])
    if (elUsuarios) elUsuarios.textContent = usuariosUnicos.size
  } catch {
    // ignore
  }
}
