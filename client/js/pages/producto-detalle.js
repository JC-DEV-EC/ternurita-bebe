export default function render(params) {
  return `
    <div class="max-w-7xl mx-auto px-4 py-8 fade-in">
      <div class="bg-white rounded-xl shadow-md overflow-hidden">
        <div class="md:flex">
          <div class="md:w-1/2">
            <div id="imagen-container" class="bg-gray-100 h-80 md:h-full flex items-center justify-center">
              <span class="text-gray-400">Cargando imagen...</span>
            </div>
          </div>
          <div class="md:w-1/2 p-8">
            <div id="info-container">
              <p class="text-gray-400">Cargando producto...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
}
