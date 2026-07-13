import { formatPrecio } from '../utils.js'

export function renderProductCard(producto) {
  const imagen = producto.imagenes?.[0]?.url || 'https://placehold.co/400x300/f3f4f6/9ca3af?text=Sin+imagen'
  const precioOferta = producto.precio_oferta
  const tieneOferta = precioOferta && precioOferta < producto.precio

  return `
    <div class="card group">
      <a href="#/productos/${producto.slug}" class="block">
        <div class="aspect-[4/3] overflow-hidden bg-gray-100">
          <img src="${imagen}" alt="${producto.nombre}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy">
        </div>
        <div class="p-4">
          <h3 class="font-semibold text-gray-800 mb-1 truncate">${producto.nombre}</h3>
          <div class="flex items-center gap-2">
            ${tieneOferta
              ? `<span class="text-lg font-bold text-pink-500">${formatPrecio(precioOferta)}</span>
                 <span class="text-sm text-gray-400 line-through">${formatPrecio(producto.precio)}</span>`
              : `<span class="text-lg font-bold text-gray-800">${formatPrecio(producto.precio)}</span>`
            }
          </div>
        </div>
      </a>
      <div class="px-4 pb-4">
        <button data-producto-id="${producto.id}" class="btn-add-cart btn-primary w-full text-sm">
          Agregar al carrito
        </button>
      </div>
    </div>
  `
}
