import store from './store.js'
import { getParamsFromPath } from './utils.js'

import homePage from './pages/home.js'
import productosPage from './pages/productos.js'
import productoDetallePage from './pages/producto-detalle.js'
import carritoPage from './pages/carrito.js'
import checkoutPage from './pages/checkout.js'
import loginPage from './pages/login.js'
import registroPage from './pages/registro.js'
import perfilPage from './pages/perfil.js'
import pedidosPage from './pages/pedidos.js'
import pedidoDetallePage from './pages/pedido-detalle.js'
import adminDashboardPage from './pages/admin/dashboard.js'
import adminProductosPage from './pages/admin/productos.js'
import adminPedidosPage from './pages/admin/pedidos.js'
import adminUsuariosPage from './pages/admin/usuarios.js'

const routes = [
  { pattern: '/',              render: homePage,           auth: false },
  { pattern: '/productos',     render: productosPage,      auth: false },
  { pattern: '/productos/:slug', render: productoDetallePage, auth: false },
  { pattern: '/carrito',       render: carritoPage,        auth: true },
  { pattern: '/checkout',      render: checkoutPage,       auth: true },
  { pattern: '/login',         render: loginPage,          auth: false },
  { pattern: '/registro',      render: registroPage,       auth: false },
  { pattern: '/perfil',        render: perfilPage,         auth: true },
  { pattern: '/pedidos',       render: pedidosPage,        auth: true },
  { pattern: '/pedidos/:id',   render: pedidoDetallePage,  auth: true },
  { pattern: '/admin',         render: adminDashboardPage, auth: 'admin' },
  { pattern: '/admin/productos', render: adminProductosPage, auth: 'admin' },
  { pattern: '/admin/pedidos',   render: adminPedidosPage, auth: 'admin' },
  { pattern: '/admin/usuarios',  render: adminUsuariosPage, auth: 'admin' },
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
  function resolve() {
    const hash = window.location.hash
    const matched = matchRoute(hash)

    const app = document.getElementById('app')

    if (!matched) {
      render404()
      return
    }

    if (!checkAuth(matched.auth)) {
      if (matched.auth === 'admin') {
        redirect('/login')
      } else if (matched.auth === true) {
        redirect('/login')
      }
      return
    }

    app.innerHTML = ''
    const module = matched.render
    const result = module(matched.params)
    if (typeof result === 'string') {
      app.innerHTML = result
    } else if (result instanceof HTMLElement) {
      app.appendChild(result)
    }
    if (module.afterRender) {
      module.afterRender(matched.params)
    }
  }

  window.addEventListener('hashchange', resolve)

  if (!window.location.hash) {
    window.location.hash = '#/'
  } else {
    resolve()
  }
}
