export function renderHero({ title, subtitle, badge, ctaText, ctaLink }) {
  return `
    <section class="hero" id="hero">
      <div class="hero__bg" id="hero-bg"></div>
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
  const bg = document.getElementById('hero-bg')
  if (!bg) return

  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY
    const vh = window.innerHeight
    const progress = Math.min(scrolled / (vh * 0.8), 1)
    bg.style.transform = `translateY(${scrolled * 0.15}px) scale(1.05)`
    bg.style.opacity = 1 - progress
  }, { passive: true })
}
