export default function render() {
  return `
    <section class="page-hero">
      <div class="container" style="text-align:center">
        <span class="badge">Nosotros</span>
        <h1 class="headline-hero" style="margin-bottom:var(--space-sm)">Ternurita Bebé</h1>
        <p class="text-body" style="max-width:500px;margin:0 auto">Prendas suaves, seguras y modernas para cuidar la piel más delicada desde el primer día.</p>
      </div>
    </section>

    <section class="section" style="padding-top:0">
      <div class="container">
        <div class="mv-grid">
          <article class="mv-card">
            <div class="mv-card__accent"></div>
            <div class="mv-card__body">
              <div class="mv-card__icon"><i data-lucide="target"></i></div>
              <span class="badge" style="margin-bottom:var(--space-sm)">Misión</span>
              <h2 class="headline-title" style="margin-bottom:var(--space-md)">
                Nuestro propósito
              </h2>
              <p class="mv-card__text">
                Ofrecer a los padres de familia prendas de vestir y accesorios para bebés que combinen la máxima suavidad, seguridad textil y diseños modernos. Nos comprometemos a brindar productos duraderos, accesibles y elaborados bajo estándares estrictos para cuidar la delicada piel de los más pequeños, facilitando el día a día del entorno familiar.
              </p>
            </div>
          </article>

          <article class="mv-card">
            <div class="mv-card__accent" style="background:linear-gradient(135deg,var(--accent),#C084FC)"></div>
            <div class="mv-card__body">
              <div class="mv-card__icon"><i data-lucide="eye"></i></div>
              <span class="badge" style="margin-bottom:var(--space-sm)">Visión</span>
              <h2 class="headline-title" style="margin-bottom:var(--space-md)">
                Hacia dónde vamos
              </h2>
              <p class="mv-card__text">
                Consolidarnos como la plataforma digital líder en el mercado de moda infantil y artículos de bebé a nivel local y nacional, siendo reconocidos por la excelencia de nuestros materiales (especialmente el algodón hipoalergénico), la innovación en nuestro catálogo y un servicio al cliente transparente, eficiente y de alta confianza.
              </p>
            </div>
          </article>
        </div>
      </div>
    </section>

    <section class="section" style="background:var(--bg-secondary)">
      <div class="container" style="text-align:center">
        <span class="badge">Valores</span>
        <h2 class="headline-display" style="margin-bottom:var(--space-xl)">Lo que nos define</h2>
        <div class="values-grid">
          <div class="value-item">
            <div class="value-item__icon"><i data-lucide="heart"></i></div>
            <h3 class="value-item__title">Amor</h3>
            <p class="value-item__desc">Cada producto está pensado con el mismo cuidado que una mamá.</p>
          </div>
          <div class="value-item">
            <div class="value-item__icon"><i data-lucide="shield"></i></div>
            <h3 class="value-item__title">Seguridad</h3>
            <p class="value-item__desc">Materiales hipoalergénicos certificados para la piel del bebé.</p>
          </div>
          <div class="value-item">
            <div class="value-item__icon"><i data-lucide="sparkles"></i></div>
            <h3 class="value-item__title">Calidad</h3>
            <p class="value-item__desc">Estándares rigurosos que garantizan durabilidad y confort.</p>
          </div>
          <div class="value-item">
            <div class="value-item__icon"><i data-lucide="handshake"></i></div>
            <h3 class="value-item__title">Confianza</h3>
            <p class="value-item__desc">Atención transparente y cercana en cada compra.</p>
          </div>
        </div>
      </div>
    </section>
  `
}
