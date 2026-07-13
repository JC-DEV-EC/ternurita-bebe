export function renderFooter(container) {
  container.innerHTML = `
    <footer class="bg-gray-800 text-gray-300 mt-auto">
      <div class="max-w-7xl mx-auto px-4 py-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 class="text-lg font-bold text-white mb-3">Ternurita Bebé</h3>
            <p class="text-sm">Ropa y accesorios para bebés, hechos con amor.</p>
          </div>
          <div>
            <h4 class="font-semibold text-white mb-3">Enlaces</h4>
            <ul class="space-y-2 text-sm">
              <li><a href="#/" class="hover:text-pink-400 transition-colors">Inicio</a></li>
              <li><a href="#/productos" class="hover:text-pink-400 transition-colors">Productos</a></li>
              <li><a href="#/carrito" class="hover:text-pink-400 transition-colors">Carrito</a></li>
            </ul>
          </div>
          <div>
            <h4 class="font-semibold text-white mb-3">Contacto</h4>
            <ul class="space-y-2 text-sm">
              <li>contacto@ternuritabebe.com</li>
              <li>Quito, Ecuador</li>
            </ul>
          </div>
        </div>
        <div class="border-t border-gray-700 mt-6 pt-6 text-center text-sm">
          &copy; ${new Date().getFullYear()} Ternurita Bebé. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  `
}
