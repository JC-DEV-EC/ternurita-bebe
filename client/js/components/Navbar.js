import store, { onStoreChange } from '../store.js'

let container

function navbarHTML() {
  const sesion = store.sesion
  const usuario = store.usuario
  const carritoCount = store.carritoCount
  const isAdmin = usuario?.rol === 'admin'

  const userMenu = sesion
    ? `
      <div class="relative group">
        <button class="flex items-center gap-2 text-gray-600 hover:text-pink-500 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
          </svg>
          <span class="hidden md:inline text-sm">${usuario?.nombre || 'Usuario'}</span>
        </button>
        <div class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 hidden group-hover:block z-50">
          <a href="#/perfil" class="block px-4 py-2 text-sm text-gray-700 hover:bg-pink-50">Mi perfil</a>
          <a href="#/pedidos" class="block px-4 py-2 text-sm text-gray-700 hover:bg-pink-50">Mis pedidos</a>
          ${isAdmin ? '<a href="#/admin" class="block px-4 py-2 text-sm text-gray-700 hover:bg-pink-50">Panel admin</a>' : ''}
          <hr class="my-1">
          <button id="btn-logout" class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Cerrar sesión</button>
        </div>
      </div>
    `
    : `
      <a href="#/login" class="text-gray-600 hover:text-pink-500 transition-colors text-sm font-medium">Ingresar</a>
    `

  return `
    <nav class="bg-white shadow-sm sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex items-center justify-between h-16">
          <a href="#/" class="text-2xl font-bold text-pink-500">Ternurita Bebé</a>

          <div class="hidden md:flex items-center gap-6">
            <a href="#/" class="text-gray-600 hover:text-pink-500 transition-colors text-sm font-medium">Inicio</a>
            <a href="#/productos" class="text-gray-600 hover:text-pink-500 transition-colors text-sm font-medium">Productos</a>
          </div>

          <div class="flex items-center gap-4">
            <a href="#/carrito" class="relative text-gray-600 hover:text-pink-500 transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"/>
              </svg>
              ${carritoCount > 0 ? `<span class="absolute -top-2 -right-2 bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">${carritoCount}</span>` : ''}
            </a>
            ${userMenu}
          </div>

          <button id="btn-mobile-menu" class="md:hidden text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
        </div>
      </div>

      <div id="mobile-menu" class="hidden md:hidden bg-white border-t px-4 py-3">
        <a href="#/" class="block py-2 text-gray-600 hover:text-pink-500">Inicio</a>
        <a href="#/productos" class="block py-2 text-gray-600 hover:text-pink-500">Productos</a>
        <a href="#/carrito" class="block py-2 text-gray-600 hover:text-pink-500">Carrito</a>
        ${!sesion ? '<a href="#/login" class="block py-2 text-gray-600 hover:text-pink-500">Ingresar</a>' : ''}
        ${sesion ? '<a href="#/perfil" class="block py-2 text-gray-600 hover:text-pink-500">Mi perfil</a>' : ''}
        ${sesion ? '<a href="#/pedidos" class="block py-2 text-gray-600 hover:text-pink-500">Mis pedidos</a>' : ''}
        ${isAdmin ? '<a href="#/admin" class="block py-2 text-gray-600 hover:text-pink-500">Panel admin</a>' : ''}
        ${sesion ? '<button id="btn-logout-mobile" class="block w-full text-left py-2 text-red-600">Cerrar sesión</button>' : ''}
      </div>
    </nav>
  `
}

function setupEvents() {
  const mobileBtn = document.getElementById('btn-mobile-menu')
  const mobileMenu = document.getElementById('mobile-menu')
  if (mobileBtn && mobileMenu) {
    mobileBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden')
    })
  }

  document.querySelectorAll('[id^="btn-logout"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const { default: auth } = await_import_auth()
      auth.logout()
    })
  })
}

async function await_import_auth() {
  return await import('../auth.js')
}

function attachEvents() {
  setTimeout(setupEvents, 0)
}

export function renderNavbar(cont) {
  container = cont
  container.innerHTML = navbarHTML()
  attachEvents()

  onStoreChange('sesion', () => {
    container.innerHTML = navbarHTML()
    attachEvents()
  })

  onStoreChange('carritoCount', () => {
    container.innerHTML = navbarHTML()
    attachEvents()
  })

  onStoreChange('usuario', () => {
    container.innerHTML = navbarHTML()
    attachEvents()
  })
}
