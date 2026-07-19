import { renderAdminSidebar } from '../../components/AdminSidebar.js'
import { usuarios } from '../../services/admin.service.js'
import { formatDate, showToast } from '../../utils.js'

export default function render() {
  return `
    <div class="max-w-7xl mx-auto px-4 py-8 fade-in">
      <h1 class="text-3xl font-bold text-gray-800 mb-6">Usuarios</h1>
      <div class="flex flex-col md:flex-row gap-6">
        <div id="admin-sidebar"></div>
        <div class="flex-1">
          <p class="text-gray-500 mb-4" id="usuarios-count">Cargando...</p>
          <div class="bg-white rounded-xl shadow-md overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="text-left px-4 py-3 text-sm font-medium text-gray-500">Nombre</th>
                    <th class="text-left px-4 py-3 text-sm font-medium text-gray-500">Email</th>
                    <th class="text-left px-4 py-3 text-sm font-medium text-gray-500">Rol</th>
                    <th class="text-left px-4 py-3 text-sm font-medium text-gray-500">Registro</th>
                    <th class="text-right px-4 py-3 text-sm font-medium text-gray-500">Acciones</th>
                  </tr>
                </thead>
                <tbody id="usuarios-table-body">
                  <tr><td colspan="5" class="text-center py-8 text-gray-400">Cargando...</td></tr>
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

  await cargarUsuarios()
}

async function cargarUsuarios() {
  const tbody = document.getElementById('usuarios-table-body')
  if (!tbody) return

  tbody.innerHTML = '<tr><td colspan="5" class="text-center py-8"><div class="spinner mx-auto"></div></td></tr>'

  try {
    const data = await usuarios.listar()
    const count = document.getElementById('usuarios-count')
    if (count) count.textContent = `${data.length} usuario(s)`

    if (!data || data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center py-8 text-gray-400">No hay usuarios</td></tr>'
      return
    }

    tbody.innerHTML = data.map(u => `
      <tr class="border-t border-gray-100 hover:bg-gray-50">
        <td class="px-4 py-3 font-medium text-gray-800">${u.nombre_completo || u.email || '-'}</td>
        <td class="px-4 py-3 text-gray-600">${u.email || '-'}</td>
        <td class="px-4 py-3">
          <span class="badge ${u.rol === 'admin' ? 'badge-primary' : 'badge-warning'}">${u.rol || 'cliente'}</span>
        </td>
        <td class="px-4 py-3 text-sm text-gray-500">${u.created_at ? formatDate(u.created_at) : '-'}</td>
        <td class="px-4 py-3 text-right">
          <select class="select-rol text-sm border border-gray-200 rounded-lg px-2 py-1" data-usuario-id="${u.id}">
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
    tbody.innerHTML = `<tr><td colspan="5" class="text-center py-8 text-red-400">Error: ${err.message}</td></tr>`
  }
}
