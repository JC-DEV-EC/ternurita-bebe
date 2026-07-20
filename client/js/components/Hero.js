export function renderHero({ title, subtitle, badge, ctaText, ctaLink }) {
  return `
    <section class="hero" id="hero">
      <div class="hero__bg" id="hero-bg"></div>
      <div class="hero__overlay"></div>
      <div class="hero__content">
        ${badge ? `<span class="hero__badge">${"Ropa de bebé"}</span>` : ''}
        <h1 class="hero__title">${title || 'Suavidad que abraza'}</h1>
        <p class="hero__subtitle">${'Desde sus primeros días hasta sus primeros pasos, te acompañamos con estilo y amor.'}</p>
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
