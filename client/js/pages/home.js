import { destacados } from '../services/productos.service.js'
import { listar as listarCategorias } from '../services/categorias.service.js'
import { renderProductCard } from '../components/ProductCard.js'
import { renderHero, initHeroParallax } from '../components/Hero.js'
import { renderStickyScroll, initStickyScroll } from '../components/StickyScroll.js'
import { showToast, initFadeAnimations } from '../utils.js'
import store from '../store.js'
import { agregar } from '../services/carrito.service.js'

export default function render() {
  return `
    ${renderHero({
      badge: 'Colección Primavera 2026',
      title: 'Suavidad que abraza',
      subtitle: 'Ropa y accesorios para bebés, hechos con amor y los mejores materiales.',
      ctaText: 'Ver colección',
      ctaLink: '#/productos',
    })}

    ${renderStickyScroll()}

    <section class="section" id="gallery-section">
      <div class="container">
        <span class="badge">Galería</span>
        <h2 class="headline-display" style="margin-bottom:var(--space-lg)">Explora nuestra colección</h2>
        <div class="gallery-grid stagger-children" id="gallery-grid">
          <div class="gallery-grid__item gallery-grid__item--wide">
            <img src="https://placehold.co/800x400/F5E6E6/E8A0A0?text=Body+de+algodón" alt="Body de algodón" loading="lazy" />
          </div>
          <div class="gallery-grid__item">
            <img src="https://placehold.co/400x400/E8F4F0/7EC8A0?text=Gorrito" alt="Gorrito" loading="lazy" />
          </div>
          <div class="gallery-grid__item">
            <img src="https://placehold.co/400x400/FFF0E6/E8A080?text=Calcetines" alt="Calcetines" loading="lazy" />
          </div>
          <div class="gallery-grid__item">
            <img src="https://placehold.co/400x400/F0E8FF/A080E8?text=Set+regalo" alt="Set de regalo" loading="lazy" />
          </div>
          <div class="gallery-grid__item">
            <img src="https://placehold.co/400x400/FFF8E6/E8C880?text=Toalla" alt="Toalla" loading="lazy" />
          </div>
        </div>
      </div>
    </section>

    <section class="section" id="features-section">
      <div class="container">
        <div class="features-grid stagger-children" id="features-grid">
          <div>
            <div class="features-grid__icon">🌿</div>
            <h3 class="features-grid__title">Materiales naturales</h3>
            <p class="features-grid__desc">Algodón orgánico certificado, libre de químicos y pesticidas.</p>
          </div>
          <div>
            <div class="features-grid__icon">🤲</div>
            <h3 class="features-grid__title">Hecho a mano</h3>
            <p class="features-grid__desc">Cada prenda es elaborada por artesanos locales con dedicación.</p>
          </div>
          <div>
            <div class="features-grid__icon">📦</div>
            <h3 class="features-grid__title">Envío seguro</h3>
            <p class="features-grid__desc">Empaquetado cuidadosamente para que llegue perfecto a tu hogar.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="section" id="destacados-section">
      <div class="container">
        <span class="badge">Destacados</span>
        <h2 class="headline-display" style="margin-bottom:var(--space-lg)">Los más queridos</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" id="destacados-container"></div>
      </div>
    </section>

    <section class="cta-section" id="cta-section">
      <h2 class="cta-section__title fade-up">Listo para consentir a tu bebé?</h2>
      <p class="cta-section__desc fade-up">Descubre nuestra colección completa de ropa y accesorios.</p>
      <div class="fade-up">
        <a href="#/productos" class="btn btn--primary btn--large">Ir a la tienda</a>
      </div>
    </section>
  `
}

export async function afterRender() {
  initHeroParallax()
  initStickyScroll()
  initFadeUpObserver()

  await Promise.all([
    cargarDestacados(),
    cargarCategorias(),
  ])

  const container = document.getElementById('destacados-container')
  container?.addEventListener('click', async (e) => {
    const btn = e.target.closest('.btn-add-cart')
    if (!btn) return

    const productoId = btn.dataset.productoId
    if (!store.sesion) {
      showToast('Debes iniciar sesión para agregar productos', 'warning')
      window.location.hash = '#/login'
      return
    }

    btn.disabled = true
    const originalText = btn.textContent
    btn.textContent = '...'

    const { error } = await agregar(store.usuario.id, parseInt(productoId))
    if (error) {
      showToast('Error al agregar al carrito', 'error')
    } else {
      showToast('Producto agregado al carrito', 'success')
      const { obtener } = await import('../services/carrito.service.js')
      const { data } = await obtener(store.usuario.id)
      store.carrito = data || []
      store.carritoCount = (data || []).reduce((sum, item) => sum + item.cantidad, 0)
    }

    btn.disabled = false
    btn.textContent = originalText
  })
}

async function cargarDestacados() {
  const container = document.getElementById('destacados-container')
  if (!container) return

  const { data, error } = await destacados(8)
  if (error) {
    container.innerHTML = '<p class="text-secondary" style="grid-column:1/-1;text-align:center">Error al cargar productos</p>'
    return
  }

  if (!data || data.length === 0) {
    container.innerHTML = '<p class="text-secondary" style="grid-column:1/-1;text-align:center">No hay productos destacados aún</p>'
    return
  }

  container.innerHTML = data.map(p => renderProductCard(p)).join('')

  await new Promise(r => setTimeout(r, 50))
  initFadeUpObserver()
}

async function cargarCategorias() {
  const { data } = await listarCategorias()
  return data
}

function initFadeUpObserver() {
  initFadeAnimations()
}
