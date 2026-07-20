export default function render() {
  return `
    <section class="page-hero">
      <div class="container" style="text-align:center">
        <span class="badge">Contacto</span>
        <h1 class="headline-hero" style="margin-bottom:var(--space-sm)">Estamos aquí para ti</h1>
        <p class="text-body" style="max-width:480px;margin:0 auto">Resolvemos tus dudas, recibimos sugerencias y te acompañamos en cada compra.</p>
      </div>
    </section>

    <section class="section" style="padding-top:0">
      <div class="container">
        <div class="contact-grid">
          <div class="contact-card">
            <div class="contact-card__icon"><i data-lucide="map-pin"></i></div>
            <h3 class="contact-card__title">Dirección</h3>
            <p class="contact-card__text">Av. Maldonado s31-161 y pasaje llive</p>
            <p class="contact-card__text" style="color:var(--text-tertiary);margin-top:2px">Quito, Ecuador</p>
          </div>
          <div class="contact-card">
            <div class="contact-card__icon"><i data-lucide="phone"></i></div>
            <h3 class="contact-card__title">Soporte</h3>
            <p class="contact-card__text">0978714033</p>
            <p class="contact-card__text" style="color:var(--text-tertiary);margin-top:2px">Lun–Sáb, 9:00 – 18:00</p>
          </div>
          <div class="contact-card">
            <div class="contact-card__icon"><i data-lucide="mail"></i></div>
            <h3 class="contact-card__title">Correo electrónico</h3>
            <p class="contact-card__text">elsaquillupangui6@gmail.com</p>
            <p class="contact-card__text" style="color:var(--text-tertiary);margin-top:2px">Respuesta en 24 h</p>
          </div>
        </div>
      </div>
    </section>

    <section class="section" style="padding-top:0">
      <div class="container">
        <div class="contact-map-card">
          <iframe
            class="contact-map"
            src="https://www.openstreetmap.org/export/embed.html?bbox=-78.5006%2C-0.2376%2C-78.4706%2C-0.2076&layer=mapnik&marker=-0.2226%2C-78.4856"
            allowfullscreen
            loading="lazy"
            title="Mapa de Ternurita Bebé en Quito"
          ></iframe>
        </div>
      </div>
    </section>

    <section class="contact-cta">
      <div class="container">
        <h2 class="contact-cta__title">¿Prefieres escribirnos?</h2>
        <p class="contact-cta__desc">También puedes contactarnos a través de nuestras redes sociales.</p>
        <div class="contact-cta__actions">
          <a href="https://wa.me/593978714033" class="btn btn--primary" target="_blank" rel="noopener">
            <i data-lucide="message-circle" style="width:18px;height:18px"></i>
            WhatsApp
          </a>
          <a href="mailto:elsaquillupangui6@gmail.com" class="btn btn--secondary">
            <i data-lucide="mail" style="width:18px;height:18px"></i>
            Enviar correo
          </a>
        </div>
      </div>
    </section>
  `
}
