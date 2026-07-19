import store from '../store.js'
import { logout } from '../auth.js'

let lastScroll = 0
let navbarEl = null

export function renderNavbar(container) {
  const isLoggedIn = !!store.sesion
  const isAdmin = store.usuario?.rol === 'admin'

  container.innerHTML = `
    <nav class="navbar" id="navbar-main">
      <div class="navbar__inner">
        <a href="#" class="navbar__logo">Ternurita Bebé</a>
        <div class="navbar__links" id="navbar-links">
          <a href="#/" class="navbar__link" data-route="/">Inicio</a>
          <a href="#/productos" class="navbar__link" data-route="/productos">Productos</a>
          ${isLoggedIn
            ? `<a href="#/pedidos" class="navbar__link" data-route="/pedidos">Mis pedidos</a>
               <a href="#/perfil" class="navbar__link" data-route="/perfil">Perfil</a>`
            : `<a href="#/login" class="navbar__link" data-route="/login">Entrar</a>`
          }
          ${isAdmin
            ? `<a href="#/admin" class="navbar__link" data-route="/admin">Admin</a>`
            : ''
          }
          ${isLoggedIn
            ? `<button class="navbar__link" id="btn-logout">Salir</button>`
            : ''
          }
        </div>
        <div style="display:flex;align-items:center;gap:var(--space-sm)">
          <a href="#/carrito" class="navbar__cart" id="cart-link">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 5V4a3 3 0 0 1 6 0v1"/>
              <path d="M2.5 5h13l-1 10H3.5L2.5 5z"/>
            </svg>
            <span class="navbar__cart-count" id="cart-count" style="${store.carritoCount > 0 ? '' : 'display:none'}">${store.carritoCount}</span>
          </a>
          <button class="navbar__menu-btn" id="menu-btn" aria-label="Menú">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
              <path d="M3 5h14M3 10h14M3 15h14"/>
            </svg>
          </button>
        </div>
      </div>
    </nav>
  `

  navbarEl = container.querySelector('#navbar-main')

  container.querySelector('#menu-btn')?.addEventListener('click', () => {
    document.getElementById('navbar-links')?.classList.toggle('is-open')
  })

  container.querySelector('#btn-logout')?.addEventListener('click', async () => {
    await logout()
  })

  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })

  storeListeners()
}

function onScroll() {
  if (!navbarEl) return
  const current = window.scrollY
  if (current > lastScroll && current > 80) {
    navbarEl.classList.add('navbar--hidden')
  } else {
    navbarEl.classList.remove('navbar--hidden')
  }
  lastScroll = current
}

function storeListeners() {
  let prevCart = store.carritoCount
  let prevSession = !!store.sesion

  setInterval(() => {
    if (store.carritoCount !== prevCart) {
      prevCart = store.carritoCount
      const el = document.getElementById('cart-count')
      if (el) {
        el.textContent = prevCart
        el.style.display = prevCart > 0 ? '' : 'none'
        el.style.animation = 'none'
        el.offsetHeight
        el.style.animation = 'scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
      }
    }

    if (!!store.sesion !== prevSession) {
      prevSession = !!store.sesion
      const container = document.getElementById('navbar')
      if (container) renderNavbar(container)
    }
  }, 500)
}
