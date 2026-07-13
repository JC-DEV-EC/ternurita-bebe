export default function render() {
  return `
    <div class="max-w-7xl mx-auto px-4 py-8 fade-in">
      <h1 class="text-3xl font-bold text-gray-800 mb-6">Productos</h1>
      <div class="flex flex-col md:flex-row gap-6">
        <aside class="w-full md:w-64 shrink-0">
          <div class="bg-white rounded-xl shadow-md p-4">
            <h2 class="font-semibold text-gray-700 mb-3">Filtros</h2>
            <div id="filtros-container"></div>
          </div>
        </aside>
        <div class="flex-1">
          <div id="productos-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"></div>
          <div id="paginacion" class="mt-8"></div>
        </div>
      </div>
    </div>
  `
}
