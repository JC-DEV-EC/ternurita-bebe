export default function render() {
  return `
    <div class="fade-in">
      <h1 class="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>
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
          <p class="text-sm text-gray-500">Ingresos hoy</p>
          <p class="text-3xl font-bold text-gray-800" id="stats-ingresos">-</p>
        </div>
      </div>
    </div>
  `
}
