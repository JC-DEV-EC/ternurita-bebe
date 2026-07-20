import { renderAdminSidebar, setupAdminToggle } from '../../components/AdminSidebar.js'
import { usuarios } from '../../services/admin.service.js'
import { formatDate, showToast } from '../../utils.js'

export default function render() {
  const collapsed = localStorage.getItem('admin-sidebar-collapsed') === 'true'
  return `
    <div class="admin-layout">
      <div id="admin-sidebar"></div>
      <div class="admin-main ${collapsed ? 'admin-main--expanded' : ''}">
        <button class="admin-sidebar-toggle ${collapsed ? 'admin-sidebar-toggle--collapsed' : ''}" id="admin-toggle" aria-label="Alternar menú lateral"><i data-lucide="panel-left"></i></button>
        <div style="margin-bottom:var(--space-xl)">
          <span class="badge">Admin</span>
          <h1 class="headline-display">Usuarios</h1>
        </div>
        <p style="font-size:var(--text-caption);color:var(--text-secondary);margin-bottom:var(--space-md)" id="usuarios-count">Cargando...</p>
        <div style="background:var(--bg-primary);border:1px solid var(--border-light);border-radius:18px;overflow:hidden">
          <div style="overflow-x:auto">
            <table style="width:100%;border-collapse:collapse">
              <thead>
                <tr style="border-bottom:1px solid var(--border-light)">
                  <th style="text-align:left;padding:var(--space-sm) var(--space-md);font-size:var(--text-small);font-weight:var(--weight-semibold);text-transform:uppercase;letter-spacing:var(--tracking-wide);color:var(--text-tertiary)">Nombre</th>
                  <th style="text-align:left;padding:var(--space-sm) var(--space-md);font-size:var(--text-small);font-weight:var(--weight-semibold);text-transform:uppercase;letter-spacing:var(--tracking-wide);color:var(--text-tertiary)">Email</th>
                  <th style="text-align:left;padding:var(--space-sm) var(--space-md);font-size:var(--text-small);font-weight:var(--weight-semibold);text-transform:uppercase;letter-spacing:var(--tracking-wide);color:var(--text-tertiary)">Rol</th>
                  <th style="text-align:left;padding:var(--space-sm) var(--space-md);font-size:var(--text-small);font-weight:var(--weight-semibold);text-transform:uppercase;letter-spacing:var(--tracking-wide);color:var(--text-tertiary)">Registro</th>
                  <th style="text-align:right;padding:var(--space-sm) var(--space-md);font-size:var(--text-small);font-weight:var(--weight-semibold);text-transform:uppercase;letter-spacing:var(--tracking-wide);color:var(--text-tertiary)">Acciones</th>
                </tr>
              </thead>
              <tbody id="usuarios-table-body">
                <tr><td colspan="5" style="text-align:center;padding:var(--space-2xl) 0;color:var(--text-tertiary)">Cargando...</td></tr>
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

  await cargarUsuarios()
}

async function cargarUsuarios() {
  const tbody = document.getElementById('usuarios-table-body')
  if (!tbody) return

  tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:var(--space-2xl) 0;color:var(--text-tertiary)"><div class="spinner" style="margin:0 auto"></div></td></tr>'

  try {
    const data = await usuarios.listar()
    const count = document.getElementById('usuarios-count')
    if (count) count.textContent = `${data.length} usuario(s)`

    if (!data || data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:var(--space-2xl) 0;color:var(--text-tertiary)">No hay usuarios</td></tr>'
      return
    }

    tbody.innerHTML = data.map(u => `
      <tr style="border-bottom:1px solid var(--border-light);transition:background var(--duration-fast) var(--ease-smooth)">
        <td style="padding:var(--space-sm) var(--space-md);color:var(--text-primary);font-size:var(--text-caption);font-weight:var(--weight-semibold)">${u.nombre_completo || u.email || '-'}</td>
        <td style="padding:var(--space-sm) var(--space-md);color:var(--text-secondary);font-size:var(--text-caption)">${u.email || '-'}</td>
        <td style="padding:var(--space-sm) var(--space-md);font-size:var(--text-caption)">
          <span class="badge ${u.rol === 'admin' ? 'badge-primary' : 'badge-warning'}">${u.rol || 'cliente'}</span>
        </td>
        <td style="padding:var(--space-sm) var(--space-md);color:var(--text-secondary);font-size:var(--text-small)">${u.created_at ? formatDate(u.created_at) : '-'}</td>
        <td style="padding:var(--space-sm) var(--space-md);text-align:right;font-size:var(--text-caption)">
          <select class="select-rol" style="font-size:var(--text-small);border:1px solid var(--border-light);border-radius:8px;padding:4px 8px;color:var(--text-primary);background:var(--bg-primary);cursor:pointer" data-usuario-id="${u.id}">
            <option value="cliente" ${u.rol === 'cliente' ? 'selected' : ''}>Cliente</option>
            <option value="admin" ${u.rol === 'admin' ? 'selected' : ''}>Admin</option>
          </select>
        </td>
      </tr>
    `).join('')

    tbody.querySelectorAll('.select-rol').forEach(sel => {
      sel.addEventListener('change', async () => {
        const id = sel.dataset.usuarioId
        const rol = sel.value
        try {
          await usuarios.cambiarRol(id, rol)
          showToast('Rol actualizado', 'success')
        } catch (err) {
          showToast(err.message, 'error')
          await cargarUsuarios()
        }
      })
    })
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:var(--space-2xl) 0;color:var(--color-error)">Error: ${err.message}</td></tr>`
  }
}
