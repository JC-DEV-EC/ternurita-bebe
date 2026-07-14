export function renderFooter(container) {
  container.innerHTML = `
    <footer class="footer">
      <div class="container">
        <div class="footer__grid">
          <div>
            <div class="footer__brand">Ternurita Bebé</div>
            <p class="footer__desc">
              Ropa y accesorios suaves como el amor de mamá.
              Cada prenda está pensada para cuidar la piel de tu bebé.
            </p>
          </div>
          <div>
            <div class="footer__heading">Tienda</div>
            <div class="footer__links">
              <a href="#/productos" class="footer__link">Productos</a>
              <a href="#/productos?categoria=ropa" class="footer__link">Ropa</a>
              <a href="#/productos?categoria=accesorios" class="footer__link">Accesorios</a>
            </div>
          </div>
          <div>
            <div class="footer__heading">Ayuda</div>
            <div class="footer__links">
              <a href="#/contacto" class="footer__link">Contacto</a>
              <a href="#/envios" class="footer__link">Envíos</a>
              <a href="#/devoluciones" class="footer__link">Devoluciones</a>
            </div>
          </div>
          <div>
            <div class="footer__heading">Cuenta</div>
            <div class="footer__links">
              <a href="#/perfil" class="footer__link">Mi cuenta</a>
              <a href="#/pedidos" class="footer__link">Mis pedidos</a>
            </div>
          </div>
        </div>
        <div class="footer__bottom">
          <span>&copy; ${new Date().getFullYear()} Ternurita Bebé. Todos los derechos reservados.</span>
          <span>Hecho con ternura</span>
        </div>
      </div>
    </footer>
  `
}
