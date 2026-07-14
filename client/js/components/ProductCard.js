export function renderProductCard(producto) {
  const imagen = producto.imagenes?.[0]?.url || 'https://placehold.co/600x600/F5F5F7/D2D2D7?text=Sin+imagen'
  const precioOferta = producto.precio_oferta
  const tieneOferta = precioOferta && precioOferta < producto.precio

  return `
    <div class="product-card fade-up">
      <a href="#/productos/${producto.slug}" class="product-card__image-wrap">
        <img src="${imagen}" alt="${producto.nombre}" class="product-card__image" loading="lazy" />
      </a>
      <div class="product-card__body">
        <h3 class="product-card__name">
          <a href="#/productos/${producto.slug}">${producto.nombre}</a>
        </h3>
        <div class="product-card__footer">
          <div>
            ${tieneOferta
              ? `<span class="product-card__price">$${precioOferta.toFixed(2)}</span>
                 <span class="product-card__price--old">$${producto.precio.toFixed(2)}</span>`
              : `<span class="product-card__price">$${producto.precio.toFixed(2)}</span>`
            }
          </div>
          <button data-producto-id="${producto.id}" class="btn btn--small btn--primary btn-add-cart">
            Agregar
          </button>
        </div>
      </div>
    </div>
  `
}
