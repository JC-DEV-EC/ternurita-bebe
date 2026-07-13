export default function render() {
  return `
    <div class="fade-in">
      <h1 class="text-3xl font-bold text-gray-800 mb-6">Pedidos</h1>
      <div class="mb-4 flex gap-2" id="filtros-pedidos">
        <button data-estado="" class="btn-outline text-sm px-3 py-1.5">Todos</button>
        <button data-estado="pendiente" class="btn-outline text-sm px-3 py-1.5">Pendientes</button>
        <button data-estado="enviado" class="btn-outline text-sm px-3 py-1.5">Enviados</button>
        <button data-estado="entregado" class="btn-outline text-sm px-3 py-1.5">Entregados</button>
      </div>
      <div class="bg-white rounded-xl shadow-md overflow-hidden">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="text-left px-4 py-3 text-sm font-medium text-gray-500">#</th>
              <th class="text-left px-4 py-3 text-sm font-medium text-gray-500">Usuario</th>
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
  `
}
