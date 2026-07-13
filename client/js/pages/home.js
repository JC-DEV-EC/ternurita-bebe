export default function render() {
  return `
    <div class="fade-in">
      <section class="bg-gradient-to-r from-pink-100 to-sky-100 py-20">
        <div class="max-w-7xl mx-auto px-4 text-center">
          <h1 class="text-5xl font-bold text-gray-800 mb-4">Ternurita Bebé</h1>
          <p class="text-xl text-gray-600 mb-8">Ropa y accesorios suaves como el amor de mamá</p>
          <a href="#/productos" class="btn-primary text-lg px-8 py-3">Ver productos</a>
        </div>
      </section>
      <section class="max-w-7xl mx-auto px-4 py-12">
        <h2 class="text-2xl font-bold text-gray-800 mb-6">Categorías</h2>
        <div id="categorias-container" class="grid grid-cols-2 md:grid-cols-4 gap-4"></div>
      </section>
      <section class="max-w-7xl mx-auto px-4 py-12">
        <h2 class="text-2xl font-bold text-gray-800 mb-6">Productos destacados</h2>
        <div id="destacados-container" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"></div>
      </section>
    </div>
  `
}
