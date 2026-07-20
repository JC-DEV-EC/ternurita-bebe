import store from './store.js'
import { getParamsFromPath } from './utils.js'

const pages = {
  home:       () => import('./pages/home.js'),
  productos:       () => import('./pages/productos.js'),
  'producto-detalle': () => import('./pages/producto-detalle.js'),
  carrito:         () => import('./pages/carrito.js'),
  checkout:        () => import('./pages/checkout.js'),
  login:           () => import('./pages/login.js'),
  registro:        () => import('./pages/registro.js'),
  perfil:          () => import('./pages/perfil.js'),
  pedidos:         () => import('./pages/pedidos.js'),
  'pedido-detalle': () => import('./pages/pedido-detalle.js'),
  admin:           () => import('./pages/admin/dashboard.js'),
  'admin/productos': () => import('./pages/admin/productos.js'),
  'admin/pedidos':   () => import('./pages/admin/pedidos.js'),
  'admin/usuarios':  () => import('./pages/admin/usuarios.js'),
}

const routes = [
  { pattern: '/',              page: 'home',           auth: false },
  { pattern: '/productos',     page: 'productos',       auth: false },
  { pattern: '/productos/:slug', page: 'producto-detalle', auth: false },
  { pattern: '/carrito',       page: 'carrito',        auth: true },
  { pattern: '/checkout',      page: 'checkout',       auth: true },
  { pattern: '/login',         page: 'login',          auth: false },
  { pattern: '/registro',      page: 'registro',       auth: false },
  { pattern: '/perfil',        page: 'perfil',         auth: true },
  { pattern: '/pedidos',       page: 'pedidos',        auth: true },
  { pattern: '/pedidos/:id',   page: 'pedido-detalle',  auth: true },
  { pattern: '/admin',         page: 'admin',          auth: 'admin' },
  { pattern: '/admin/productos', page: 'admin/productos', auth: 'admin' },
  { pattern: '/admin/pedidos',   page: 'admin/pedidos',   auth: 'admin' },
  { pattern: '/admin/usuarios',  page: 'admin/usuarios',  auth: 'admin' },
]

function checkAuth(requirement) {
  if (!requirement) return true
  if (requirement === true) {
    return !!store.sesion
  }
  if (requirement === 'admin') {
    return store.usuario?.rol === 'admin' && !!store.sesion
  }
  return false
}

function redirect(hash) {
  window.location.hash = hash
}

function render404() {
  const app = document.getElementById('app')
  app.innerHTML = `<div class="text-center py-20 fade-in">
    <h1 class="text-6xl font-bold text-gray-300 mb-4">404</h1>
    <p class="text-gray-500 mb-6">Página no encontrada</p>
    <a href="#/" class="btn-primary">Volver al inicio</a>
  </div>`
}

function matchRoute(hash) {
  const cleanHash = hash.replace(/^#/, '') || '/'

  for (const route of routes) {
    const params = getParamsFromPath(route.pattern, cleanHash)
    if (params !== null) {
      return { ...route, params }
    }
  }
  return null
}

export function initRouter() {
  async function resolve() {
    const hash = window.location.hash
    const matched = matchRoute(hash)

    const app = document.getElementById('app')

    if (!matched) {
      render404()
      return
    }

    if (!checkAuth(matched.auth)) {
      if (matched.auth === 'admin' || matched.auth === true) {
        redirect('/login')
      }
      return
    }

    app.innerHTML = ''
    const mod = await pages[matched.page]()
    const result = mod.default(matched.params)
    if (typeof result === 'string') {
      app.innerHTML = result
    } else if (result instanceof HTMLElement) {
      app.appendChild(result)
    }
    if (mod.afterRender) {
      mod.afterRender(matched.params)
    }
  }

  window.addEventListener('hashchange', resolve)

  if (!window.location.hash) {
    window.location.hash = '#/'
  } else {
    resolve()
  }

  setTimeout(() => {
    const splash = document.getElementById('splash')
    if (splash) splash.classList.add('is-hidden')
  }, 1800)
}
