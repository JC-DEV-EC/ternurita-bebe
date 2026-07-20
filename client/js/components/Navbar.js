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
        <div></div>
        <div class="navbar__left">
          <a href="#/" class="navbar__brand">
            <img src="assets/images/img-logo/logo-page.png" alt="Ternurita Bebé">
            <span class="navbar__brand-text">Ternurita Bebé</span>
          </a>
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
        <div class="navbar__right">
          <a href="#/carrito" class="navbar__cart" id="cart-link">
            <i data-lucide="shopping-bag" style="width:18px;height:18px"></i>
            <span class="navbar__cart-count" id="cart-count" style="${store.carritoCount > 0 ? '' : 'display:none'}">${store.carritoCount}</span>
          </a>
          <button class="navbar__menu-btn" id="menu-btn" aria-label="Menú">
            <i data-lucide="menu" style="width:20px;height:20px"></i>
          </button>
        </div>
      </div>
    </nav>
  `

  navbarEl = container.querySelector('#navbar-main')

  if (window.lucide?.createIcons) {
    window.lucide.createIcons()
  }

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
