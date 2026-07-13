export default function render() {
  return `
    <div class="fade-in">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-3xl font-bold text-gray-800">Productos</h1>
        <button id="btn-crear-producto" class="btn-primary">+ Nuevo producto</button>
      </div>
      <div class="bg-white rounded-xl shadow-md overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="text-left px-4 py-3 text-sm font-medium text-gray-500">Nombre</th>
                <th class="text-left px-4 py-3 text-sm font-medium text-gray-500">Precio</th>
                <th class="text-left px-4 py-3 text-sm font-medium text-gray-500">Stock</th>
                <th class="text-left px-4 py-3 text-sm font-medium text-gray-500">Categoría</th>
                <th class="text-right px-4 py-3 text-sm font-medium text-gray-500">Acciones</th>
              </tr>
            </thead>
            <tbody id="productos-table-body">
              <tr><td colspan="5" class="text-center py-8 text-gray-400">Cargando...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
}
