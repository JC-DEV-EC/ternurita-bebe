import { initRouter } from './router.js?v=4'
import { renderNavbar } from './components/Navbar.js?v=2'
import { renderFooter } from './components/Footer.js?v=2'
import { initAuth } from './auth.js?v=2'

document.addEventListener('DOMContentLoaded', async () => {
  const navbarContainer = document.getElementById('navbar')
  const footerContainer = document.getElementById('footer')

  if (navbarContainer) renderNavbar(navbarContainer)
  if (footerContainer) renderFooter(footerContainer)

  await initAuth()
  initRouter()
})

export function hideSplash() {
  const splash = document.getElementById('splash')
  if (splash) splash.classList.add('is-hidden')
}
