import { renderAdminSidebar, setupAdminToggle } from '../../components/AdminSidebar.js'
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
  const collapsed = localStorage.getItem('admin-sidebar-collapsed') === 'true'
  return `
    <div class="admin-layout">
      <div id="admin-sidebar"></div>
      <div class="admin-main ${collapsed ? 'admin-main--expanded' : ''}">
        <button class="admin-sidebar-toggle ${collapsed ? 'admin-sidebar-toggle--collapsed' : ''}" id="admin-toggle" aria-label="Alternar menú lateral"><i data-lucide="panel-left"></i></button>
        <div style="margin-bottom:var(--space-xl)">
          <span class="badge">Admin</span>
          <h1 class="headline-display">Pedidos</h1>
        </div>
        <div style="display:flex;gap:var(--space-xs);flex-wrap:wrap;margin-bottom:var(--space-lg)" id="filtros-pedidos">
          <button data-estado="" class="btn btn--ghost btn--sm ${!filtroActual ? 'btn--active' : ''}">Todos</button>
          <button data-estado="pendiente" class="btn btn--ghost btn--sm ${filtroActual === 'pendiente' ? 'btn--active' : ''}">Pendientes</button>
          <button data-estado="enviado" class="btn btn--ghost btn--sm ${filtroActual === 'enviado' ? 'btn--active' : ''}">Enviados</button>
          <button data-estado="entregado" class="btn btn--ghost btn--sm ${filtroActual === 'entregado' ? 'btn--active' : ''}">Entregados</button>
          <button data-estado="cancelado" class="btn btn--ghost btn--sm ${filtroActual === 'cancelado' ? 'btn--active' : ''}">Cancelados</button>
        </div>
        <div style="background:var(--bg-primary);border:1px solid var(--border-light);border-radius:18px;overflow:hidden">
          <div style="overflow-x:auto">
            <table style="width:100%;border-collapse:collapse">
              <thead>
                <tr style="border-bottom:1px solid var(--border-light)">
                  <th style="text-align:left;padding:var(--space-sm) var(--space-md);font-size:var(--text-small);font-weight:var(--weight-semibold);text-transform:uppercase;letter-spacing:var(--tracking-wide);color:var(--text-tertiary)">#</th>
                  <th style="text-align:left;padding:var(--space-sm) var(--space-md);font-size:var(--text-small);font-weight:var(--weight-semibold);text-transform:uppercase;letter-spacing:var(--tracking-wide);color:var(--text-tertiary)">Cliente</th>
                  <th style="text-align:left;padding:var(--space-sm) var(--space-md);font-size:var(--text-small);font-weight:var(--weight-semibold);text-transform:uppercase;letter-spacing:var(--tracking-wide);color:var(--text-tertiary)">Total</th>
                  <th style="text-align:left;padding:var(--space-sm) var(--space-md);font-size:var(--text-small);font-weight:var(--weight-semibold);text-transform:uppercase;letter-spacing:var(--tracking-wide);color:var(--text-tertiary)">Estado</th>
                  <th style="text-align:left;padding:var(--space-sm) var(--space-md);font-size:var(--text-small);font-weight:var(--weight-semibold);text-transform:uppercase;letter-spacing:var(--tracking-wide);color:var(--text-tertiary)">Fecha</th>
                  <th style="text-align:right;padding:var(--space-sm) var(--space-md);font-size:var(--text-small);font-weight:var(--weight-semibold);text-transform:uppercase;letter-spacing:var(--tracking-wide);color:var(--text-tertiary)">Acciones</th>
                </tr>
              </thead>
              <tbody id="pedidos-table-body">
                <tr><td colspan="6" style="text-align:center;padding:var(--space-2xl) 0;color:var(--text-tertiary)">Cargando...</td></tr>
              </tbody>
            </table>
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

  await cargarPedidos()

  document.querySelectorAll('.btn-filtro-estado').forEach(btn => {
    btn.addEventListener('click', () => {
      filtroActual = btn.dataset.estado
      document.querySelectorAll('.btn-filtro-estado').forEach(b => {
        b.classList.remove('btn--active')
      })
      btn.classList.add('btn--active')
      cargarPedidos()
    })
  })
}

async function cargarPedidos() {
  const tbody = document.getElementById('pedidos-table-body')
  if (!tbody) return

    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:var(--space-2xl) 0;color:var(--text-tertiary)"><div class="spinner" style="margin:0 auto"></div></td></tr>'

  try {
    const data = await pedidos.listar(filtroActual ? { estado: filtroActual } : {})

    if (!data || data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:var(--space-2xl) 0;color:var(--text-tertiary)">No hay pedidos</td></tr>'
      return
    }

    tbody.innerHTML = data.map(p => `
      <tr style="border-bottom:1px solid var(--border-light);transition:background var(--duration-fast) var(--ease-smooth)">
        <td style="padding:var(--space-sm) var(--space-md);color:var(--text-primary);font-size:var(--text-caption);font-weight:var(--weight-semibold)">#${p.id}</td>
        <td style="padding:var(--space-sm) var(--space-md);color:var(--text-secondary);font-size:var(--text-caption)">${p.cliente_id?.slice(0, 8) || '-'}...</td>
        <td style="padding:var(--space-sm) var(--space-md);color:var(--text-primary);font-size:var(--text-caption);font-weight:var(--weight-semibold)">${formatPrecio(p.total_pedido)}</td>
        <td style="padding:var(--space-sm) var(--space-md);font-size:var(--text-caption)">
          <select class="select-estado" style="font-size:var(--text-small);border:1px solid var(--border-light);border-radius:8px;padding:4px 8px;color:var(--text-primary);background:var(--bg-primary);cursor:pointer" data-pedido-id="${p.id}">
            <option value="pendiente" ${p.estado === 'pendiente' ? 'selected' : ''}>Pendiente</option>
            <option value="enviado" ${p.estado === 'enviado' ? 'selected' : ''}>Enviado</option>
            <option value="entregado" ${p.estado === 'entregado' ? 'selected' : ''}>Entregado</option>
            <option value="cancelado" ${p.estado === 'cancelado' ? 'selected' : ''}>Cancelado</option>
          </select>
        </td>
        <td style="padding:var(--space-sm) var(--space-md);color:var(--text-secondary);font-size:var(--text-small)">${formatDate(p.created_at)}</td>
        <td style="padding:var(--space-sm) var(--space-md);text-align:right;font-size:var(--text-caption)">
          <a href="#/pedidos/${p.id}" class="btn btn--ghost btn--sm" style="font-size:var(--text-small)">Ver</a>
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
