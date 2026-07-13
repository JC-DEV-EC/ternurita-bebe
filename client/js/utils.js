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
