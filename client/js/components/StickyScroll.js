export function renderStickyScroll(panels) {
  const defaultPanels = [
    {
      step: '01',
      title: 'Algodón orgánico',
      desc: 'Tejido certificado GOTS, libre de químicos. Suave como una caricia en la piel de tu bebé.',
    },
    {
      step: '02',
      title: 'Sin etiquetas',
      desc: 'Cada costura está pensada para no rozar la piel sensible. Etiquetas térmicas, no cosidas.',
    },
    {
      step: '03',
      title: 'Hecho con ternura',
      desc: 'Producido en talleres familiares. Cada prenda cuenta una historia de dedicación y amor.',
    },
  ]

  const items = panels || defaultPanels

  return `
    <section class="sticky-scroll" id="sticky-scroll">
      <div class="sticky-scroll__media">
        <img src="https://placehold.co/480x640/F5E6E6/E8A0A0?text=Producto"
             alt="Producto destacado"
             class="sticky-scroll__img"
             id="sticky-img"
             loading="lazy" />
      </div>
      <div class="sticky-scroll__content" id="sticky-panels">
        ${items.map((p, i) => `
          <div class="sticky-scroll__panel" data-panel="${i}">
            <span class="sticky-scroll__step">${p.step || String(i + 1).padStart(2, '0')}</span>
            <h2 class="sticky-scroll__title">${p.title}</h2>
            <p class="sticky-scroll__desc">${p.desc}</p>
          </div>
        `).join('')}
      </div>
    </section>
  `
}

export function initStickyScroll() {
  if (typeof window.gsap === 'undefined' || typeof window.ScrollTrigger === 'undefined') {
    document.querySelectorAll('.sticky-scroll__panel').forEach(el => {
      el.classList.add('is-visible')
    })
    return
  }

  const { gsap, ScrollTrigger } = window
  gsap.registerPlugin(ScrollTrigger)

  const panels = gsap.utils.toArray('.sticky-scroll__panel')

  if (!panels.length) return

  ScrollTrigger.matchMedia({
    '(min-width: 769px)': () => {
      panels.forEach((panel, i) => {
        const isLast = i === panels.length - 1
        ScrollTrigger.create({
          trigger: panel,
          start: 'top center',
          end: isLast ? 'bottom top' : 'bottom center',
          onEnter: () => {
            panels.forEach(p => {
              p.classList.remove('is-visible', 'is-exiting')
            })
            panel.classList.add('is-visible')
            if (i > 0) panels[i - 1].classList.add('is-exiting')
          },
          onLeave: () => {
            panel.classList.remove('is-visible')
            panel.classList.add('is-exiting')
          },
          onEnterBack: () => {
            panels.forEach(p => {
              p.classList.remove('is-visible', 'is-exiting')
            })
            panel.classList.add('is-visible')
          },
          onLeaveBack: () => {
            if (i > 0) {
              panels[i - 1].classList.add('is-visible')
            }
            panel.classList.remove('is-visible')
          },
        })
      })
    },
    '(max-width: 768px)': () => {
      panels.forEach(p => p.classList.add('is-visible'))
    },
  })
}
