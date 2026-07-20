import { initRouter } from './router.js'
import { renderNavbar } from './components/Navbar.js'
import { renderFooter } from './components/Footer.js?v=1'
import { initAuth } from './auth.js'

document.addEventListener('DOMContentLoaded', () => {
  const navbarContainer = document.getElementById('navbar')
  const footerContainer = document.getElementById('footer')

  if (navbarContainer) renderNavbar(navbarContainer)
  if (footerContainer) renderFooter(footerContainer)

  initAuth()
  initRouter()
})

export function hideSplash() {
  const splash = document.getElementById('splash')
  if (splash) splash.classList.add('is-hidden')
}
