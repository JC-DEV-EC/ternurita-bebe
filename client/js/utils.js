export function formatPrecio(precio) {
  return new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD',
  }).format(precio)
}

export function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString('es-EC', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export { showToast } from './components/Toast.js'

export function debounce(fn, delay = 300) {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

export function getParamsFromPath(pattern, hash) {
  const patternParts = pattern.split('/')
  const hashParts = hash.split('/')

  if (patternParts.length !== hashParts.length) return null

  const params = {}
  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(':')) {
      params[patternParts[i].slice(1)] = hashParts[i]
    } else if (patternParts[i] !== hashParts[i]) {
      return null
    }
  }
  return params
}

export function initFadeAnimations(container) {
  const root = container || document

  if (typeof IntersectionObserver === 'undefined') {
    root.querySelectorAll('.fade-up, .stagger-children').forEach(el => el.classList.add('is-visible'))
    return () => {}
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible')
        observer.unobserve(entry.target)
      }
    })
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' })

  root.querySelectorAll('.fade-up, .stagger-children').forEach(el => observer.observe(el))

  return () => observer.disconnect()
}
