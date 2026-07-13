import { renderAdminSidebar } from '../../components/AdminSidebar.js'
import { pedidos } from '../../services/admin.service.js'
import { formatPrecio, formatDate, showToast } from '../../utils.js'

const badges = {
  pendiente: 'badge badge-warning',
  enviado: 'badge badge-primary',
  entregado: 'badge badge-success',
  cancelado: 'badge badge-error',
}

let filtroActual = ''

export default function render() {
  return `
    <div class="max-w-7xl mx-auto px-4 py-8 fade-in">
      <h1 class="text-3xl font-bold text-gray-800 mb-6">Pedidos</h1>
      <div class="flex flex-col md:flex-row gap-6">
        <div id="admin-sidebar"></div>
        <div class="flex-1">
          <div class="mb-4 flex gap-2 flex-wrap" id="filtros-pedidos">
            <button data-estado="" class="btn-filtro-estado btn-outline text-sm px-3 py-1.5 ${!filtroActual ? 'bg-pink-100 text-pink-700 border-pink-200' : ''}">Todos</button>
            <button data-estado="pendiente" class="btn-filtro-estado btn-outline text-sm px-3 py-1.5 ${filtroActual === 'pendiente' ? 'bg-pink-100 text-pink-700 border-pink-200' : ''}">Pendientes</button>
            <button data-estado="enviado" class="btn-filtro-estado btn-outline text-sm px-3 py-1.5 ${filtroActual === 'enviado' ? 'bg-pink-100 text-pink-700 border-pink-200' : ''}">Enviados</button>
            <button data-estado="entregado" class="btn-filtro-estado btn-outline text-sm px-3 py-1.5 ${filtroActual === 'entregado' ? 'bg-pink-100 text-pink-700 border-pink-200' : ''}">Entregados</button>
            <button data-estado="cancelado" class="btn-filtro-estado btn-outline text-sm px-3 py-1.5 ${filtroActual === 'cancelado' ? 'bg-pink-100 text-pink-700 border-pink-200' : ''}">Cancelados</button>
          </div>
          <div class="bg-white rounded-xl shadow-md overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="text-left px-4 py-3 text-sm font-medium text-gray-500">#</th>
                    <th class="text-left px-4 py-3 text-sm font-medium text-gray-500">Cliente</th>
                    <th class="text-left px-4 py-3 text-sm font-medium text-gray-500">Total</th>
                    <th class="text-left px-4 py-3 text-sm font-medium text-gray-500">Estado</th>
                    <th class="text-left px-4 py-3 text-sm font-medium text-gray-500">Fecha</th>
                    <th class="text-right px-4 py-3 text-sm font-medium text-gray-500">Acciones</th>
                  </tr>
                </thead>
                <tbody id="pedidos-table-body">
                  <tr><td colspan="6" class="text-center py-8 text-gray-400">Cargando...</td></tr>
                </tbody>
              </table>
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

  await cargarPedidos()

  document.querySelectorAll('.btn-filtro-estado').forEach(btn => {
    btn.addEventListener('click', () => {
      filtroActual = btn.dataset.estado
      document.querySelectorAll('.btn-filtro-estado').forEach(b => {
        b.classList.remove('bg-pink-100', 'text-pink-700', 'border-pink-200')
      })
      btn.classList.add('bg-pink-100', 'text-pink-700', 'border-pink-200')
      cargarPedidos()
    })
  })
}

async function cargarPedidos() {
  const tbody = document.getElementById('pedidos-table-body')
  if (!tbody) return

  tbody.innerHTML = '<tr><td colspan="6" class="text-center py-8"><div class="spinner mx-auto"></div></td></tr>'

  try {
    const data = await pedidos.listar(filtroActual ? { estado: filtroActual } : {})

    if (!data || data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center py-8 text-gray-400">No hay pedidos</td></tr>'
      return
    }

    tbody.innerHTML = data.map(p => `
      <tr class="border-t border-gray-100 hover:bg-gray-50">
        <td class="px-4 py-3 font-medium text-gray-800">#${p.id}</td>
        <td class="px-4 py-3 text-gray-600">${p.cliente_id?.slice(0, 8) || '-'}...</td>
        <td class="px-4 py-3 font-semibold">${formatPrecio(p.total_pedido)}</td>
        <td class="px-4 py-3">
          <select class="select-estado text-sm border border-gray-200 rounded-lg px-2 py-1" data-pedido-id="${p.id}">
            <option value="pendiente" ${p.estado === 'pendiente' ? 'selected' : ''}>Pendiente</option>
            <option value="enviado" ${p.estado === 'enviado' ? 'selected' : ''}>Enviado</option>
            <option value="entregado" ${p.estado === 'entregado' ? 'selected' : ''}>Entregado</option>
            <option value="cancelado" ${p.estado === 'cancelado' ? 'selected' : ''}>Cancelado</option>
          </select>
        </td>
        <td class="px-4 py-3 text-sm text-gray-500">${formatDate(p.created_at)}</td>
        <td class="px-4 py-3 text-right">
          <a href="#/pedidos/${p.id}" class="text-pink-500 hover:text-pink-600 text-sm font-medium">Ver</a>
        </td>
      </tr>
    `).join('')

    tbody.querySelectorAll('.select-estado').forEach(sel => {
      sel.addEventListener('change', async () => {
        const id = parseInt(sel.dataset.pedidoId)
        const estado = sel.value
        try {
          await pedidos.cambiarEstado(id, estado)
          showToast(`Pedido #${id} actualizado a "${estado}"`, 'success')
        } catch (err) {
          showToast(err.message, 'error')
          await cargarPedidos()
        }
      })
    })
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center py-8 text-red-400">Error: ${err.message}</td></tr>`
  }
}
