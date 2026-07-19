import { placeholderImg } from '../utils.js'

const stickScrollImages = [
  'assets/images/img-stikScroll/img1.png',
  'assets/images/img-stikScroll/img2.png',
  'assets/images/img-stikScroll/img3.png',
]

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
        <img src="${placeholderImg(480, 640, 'Producto', '#F5E6E6', '#E8A0A0')}"
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

function cambiarImagen(index) {
  const img = document.getElementById('sticky-img')
  if (!img) return
  const src = stickScrollImages[index]
  if (src) img.src = src
}

export function initStickyScroll() {
  const img = document.getElementById('sticky-img')

  if (typeof window.gsap === 'undefined' || typeof window.ScrollTrigger === 'undefined') {
    document.querySelectorAll('.sticky-scroll__panel').forEach((el, i) => {
      el.classList.add('is-visible')
    })
    if (img) img.src = stickScrollImages[0] || img.src
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
            cambiarImagen(i)
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
            cambiarImagen(i)
          },
          onLeaveBack: () => {
            if (i > 0) {
              panels[i - 1].classList.add('is-visible')
              cambiarImagen(i - 1)
            }
            panel.classList.remove('is-visible')
          },
        })
      })
    },
    '(max-width: 768px)': () => {
      panels.forEach((p, i) => {
        p.classList.add('is-visible')
        if (i === 0 && img) img.src = stickScrollImages[0] || img.src
      })
    },
  })
}
