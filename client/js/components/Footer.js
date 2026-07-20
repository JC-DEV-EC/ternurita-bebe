export function renderFooter(container) {
  container.innerHTML = `
    <footer class="footer" id="footer-main">
      <div class="container">
        <div class="footer__card">
          <div class="footer__card-bg"></div>
          <div class="footer__inner">
            <div class="footer__col footer__col--brand">
              <div class="footer__logo">
                <img src="assets/images/img-logo/img-logo.jpeg" alt="Ternurita Bebé" class="footer__logo-img" />
                <span class="footer__logo-text">Ternurita Bebé</span>
              </div>
              <p class="footer__desc">Ropa y accesorios suaves como el amor de mamá. Cada prenda está pensada para cuidar la piel de tu bebé.</p>
              <div class="footer__copyright">
                &copy; ${new Date().getFullYear()}, <span class="text-accent">Ternurita Bebé</span>. Todos los derechos reservados.
              </div>
            </div>

            <div class="footer__col footer__col--links">
              <h4 class="footer__col-title">Enlaces</h4>
              <div class="footer__links">
                <a href="#/" class="footer__link">Inicio</a>
                <a href="#/productos" class="footer__link">Productos</a>
                <a href="#/nosotros" class="footer__link">Nosotros</a>
                <a href="#/contacto" class="footer__link">Contacto</a>
                <a href="#/carrito" class="footer__link">Carrito</a>
              </div>
            </div>

            <div class="footer__col footer__col--contact">
              <h4 class="footer__col-title">Contacto</h4>
              <div class="footer__contact-list">
                <span class="footer__contact-item">
                  <i data-lucide="map-pin"></i>
                  Av. Maldonado s31-161 y pasaje llive, Quito
                </span>
                <a href="mailto:elsaquillupangui6@gmail.com" class="footer__contact-item">
                  <i data-lucide="mail"></i>
                  elsaquillupangui6@gmail.com
                </a>
                <a href="https://wa.me/593978714033" class="footer__contact-item" target="_blank" rel="noopener">
                  <i data-lucide="phone"></i>
                  +593 97 871 4033
                </a>
              </div>
              <div class="footer__social">
                <a href="https://wa.me/593978714033" class="footer__social-link" target="_blank" rel="noopener" aria-label="WhatsApp"><i data-lucide="message-circle"></i></a>
                <a href="mailto:elsaquillupangui6@gmail.com" class="footer__social-link" aria-label="Email"><i data-lucide="mail"></i></a>
              </div>
            </div>
          </div>
          <button class="footer__back-top" id="btn-back-top" aria-label="Volver arriba">
            <i data-lucide="arrow-up"></i>
          </button>
        </div>
      </div>
    </footer>
  `

  if (window.lucide?.createIcons) {
    window.lucide.createIcons()
  }

  const backBtn = document.getElementById('btn-back-top')
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    })
  }
}
