export default function render() {
  return `
    <div class="fade-in">
      <h1 class="text-3xl font-bold text-gray-800 mb-6">Usuarios</h1>
      <div class="bg-white rounded-xl shadow-md overflow-hidden">
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
  `
}
