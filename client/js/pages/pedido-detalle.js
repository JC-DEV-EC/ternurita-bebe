export default function render(params) {
  return `
    <div class="max-w-3xl mx-auto px-4 py-8 fade-in">
      <a href="#/pedidos" class="text-pink-500 hover:text-pink-600 mb-4 inline-block">&larr; Mis pedidos</a>
      <h1 class="text-3xl font-bold text-gray-800 mb-6">Pedido #${params?.id || ''}</h1>
      <div id="pedido-detalle-contenido">
        <p class="text-gray-400">Cargando detalle...</p>
      </div>
    </div>
  `
}
