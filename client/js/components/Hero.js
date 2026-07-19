import { placeholderImg } from '../utils.js'

export function renderHero({ title, subtitle, badge, ctaText, ctaLink, imageUrl, imageAlt }) {
  return `
    <section class="hero" id="hero">
      <div class="hero__bg">
        <img src="${imageUrl || placeholderImg(1400, 900, 'Ternurita Bebé')}"
             alt="${imageAlt || ''}"
             id="hero-img" />
      </div>
      <div class="hero__overlay"></div>
      <div class="hero__content">
        ${badge ? `<span class="hero__badge">${badge}</span>` : ''}
        <h1 class="hero__title">${title || 'Suavidad que abraza'}</h1>
        <p class="hero__subtitle">${subtitle || 'Ropa y accesorios para bebés, hechos con amor y los mejores materiales.'}</p>
        <div class="hero__cta">
          <a href="${ctaLink || '#/productos'}" class="btn btn--primary btn--large">${ctaText || 'Ver colección'}</a>
        </div>
      </div>
    </section>
  `
}

export function initHeroParallax() {
  const img = document.getElementById('hero-img')
  if (!img) return

  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY
    const parallax = scrolled * 0.15
    img.style.transform = `translateY(${parallax}px) scale(1.05)`
  }, { passive: true })
}
