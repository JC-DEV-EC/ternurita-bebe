import { initRouter } from './router.js'
import { renderNavbar } from './components/Navbar.js'
import { renderFooter } from './components/Footer.js'
import { initAuth } from './auth.js'
import { initIcons } from './utils.js'

document.addEventListener('DOMContentLoaded', () => {
  const navbarContainer = document.getElementById('navbar')
  const footerContainer = document.getElementById('footer')

  if (navbarContainer) renderNavbar(navbarContainer)
  if (footerContainer) renderFooter(footerContainer)

  initIcons()

  initAuth()
  initRouter()
})
