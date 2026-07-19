import { destacados } from '../services/productos.service.js'
import { renderProductCard } from '../components/ProductCard.js'
import { renderHero, initHeroParallax } from '../components/Hero.js'
import { renderStickyScroll, initStickyScroll } from '../components/StickyScroll.js'
import { showToast, initFadeAnimations, placeholderImg } from '../utils.js'
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
        <div class="gallery-grid stagger-children" id="gallery-grid"></div>
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
        <div style="position:relative">
          <button class="scroll-arrow scroll-arrow--left" id="scroll-left" aria-label="Anterior">‹</button>
          <div class="destacados-scroll" id="destacados-container"></div>
          <button class="scroll-arrow scroll-arrow--right" id="scroll-right" aria-label="Siguiente">›</button>
        </div>
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
    cargarGaleria(),
  ])

  initScroll()

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


const galeriaItems = [
  { nombre: 'Mamelucos', slug: 'mamelucos', wide: true, bg: '#F5E6E6', fg: '#E8A0A0' },
  { nombre: 'Accesorios', slug: 'accesorios', wide: false, bg: '#E8F4F0', fg: '#7EC8A0' },
  { nombre: 'Prendas inferiores', slug: 'prendas-inferiores', wide: false, bg: '#FFF0E6', fg: '#E8A080' },
  { nombre: 'Juguetes', slug: 'juguetes', wide: false, bg: '#F0E8FF', fg: '#A080E8' },
  { nombre: 'Higiene', slug: 'higiene', wide: false, bg: '#FFF8E6', fg: '#E8C880' },
]

function cargarGaleria() {
  const grid = document.getElementById('gallery-grid')
  if (!grid) return

  grid.innerHTML = galeriaItems.map((item, i) => {
    const wide = item.wide ? 'gallery-grid__item--wide' : ''
    return `
      <a href="#/productos?categoria=${item.slug}" class="gallery-grid__item ${wide}">
        <img src="${item.imagen || placeholderImg(wide ? 800 : 400, wide ? 400 : 400, item.nombre, item.bg, item.fg)}" alt="${item.nombre}" loading="lazy" />
      </a>
    `
  }).join('')

  setTimeout(() => { initFadeAnimations() }, 50)
}

function initScroll() {
  const container = document.getElementById('destacados-container')
  const leftBtn = document.getElementById('scroll-left')
  const rightBtn = document.getElementById('scroll-right')
  if (!container) return

  const checkArrows = () => {
    const atStart = container.scrollLeft <= 10
    const atEnd = container.scrollLeft >= container.scrollWidth - container.clientWidth - 10
    leftBtn?.classList.toggle('scroll-arrow--visible', !atStart)
    rightBtn?.classList.toggle('scroll-arrow--visible', !atEnd)
  }

  leftBtn?.addEventListener('click', () => {
    container.scrollBy({ left: -300, behavior: 'smooth' })
  })

  rightBtn?.addEventListener('click', () => {
    container.scrollBy({ left: 300, behavior: 'smooth' })
  })

  container.addEventListener('scroll', checkArrows)
  setTimeout(checkArrows, 100)

  // Click-and-drag scrolling
  let isDown = false, startX, scrollLeft

  container.addEventListener('mousedown', (e) => {
    isDown = true
    container.style.cursor = 'grabbing'
    startX = e.pageX - container.offsetLeft
    scrollLeft = container.scrollLeft
  })

  container.addEventListener('mouseleave', () => {
    isDown = false
    container.style.cursor = 'grab'
  })

  container.addEventListener('mouseup', () => {
    isDown = false
    container.style.cursor = 'grab'
  })

  container.addEventListener('mousemove', (e) => {
    if (!isDown) return
    e.preventDefault()
    const x = e.pageX - container.offsetLeft
    const walk = (x - startX) * 1.5
    container.scrollLeft = scrollLeft - walk
  })

  container.style.cursor = 'grab'
}

async function cargarCategorias() {
  const { data } = await listarCategorias()
  return data
}

function initFadeUpObserver() {
  initFadeAnimations()
}
