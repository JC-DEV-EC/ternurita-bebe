import store from '../store.js'
import { detallePedido, obtenerDatosPago, reportarPago, cancelarPedido } from '../services/pedidos.service.js'
import { formatDate, showToast } from '../utils.js'

const statusClass = {
  pendiente: 'status-badge--pendiente',
  enviado: 'status-badge--enviado',
  entregado: 'status-badge--entregado',
  cancelado: 'status-badge--cancelado',
}

const pagoTexto = {
  pendiente: 'Pago pendiente',
  en_revision: 'Pago en revisión',
  pagado: 'Pagado',
  fallido: 'Pago no realizado',
}

export default function render(params) {
  return `
    <div style="padding-top:calc(var(--nav-height) + var(--space-lg))">
      <div class="container" style="max-width:720px">
        <a href="#/pedidos" style="display:inline-flex;align-items:center;gap:var(--space-xs);font-size:var(--text-caption);color:var(--text-secondary);margin-bottom:var(--space-lg);transition:color var(--duration-fast) var(--ease-smooth)">
          <i data-lucide="arrow-left" style="width:16px;height:16px"></i>
          Mis pedidos
        </a>
        <h1 class="headline-display" style="margin-bottom:var(--space-xl)">Pedido #${params?.id || ''}</h1>
        <div id="pedido-detalle-contenido">
          <div style="text-align:center;padding:var(--space-2xl) 0"><div class="spinner" style="margin:0 auto"></div></div>
        </div>
      </div>
    </div>
  `
}

export async function afterRender(params) {
  if (!store.sesion) {
    window.location.hash = '#/login'
    return
  }

  const id = parseInt(params?.id)
  if (!id) {
    document.getElementById('pedido-detalle-contenido').innerHTML = '<p style="text-align:center;color:var(--text-secondary);padding:var(--space-2xl) 0">Pedido no válido</p>'
    return
  }

  const { data, error } = await detallePedido(id, store.usuario.id)
  if (error || !data) {
    document.getElementById('pedido-detalle-contenido').innerHTML = '<p style="text-align:center;color:var(--text-secondary);padding:var(--space-2xl) 0">Pedido no encontrado</p>'
    return
  }

  renderDetalle(data)
  renderPagoSection(data)
}

async function renderPagoSection(pedido) {
  const container = document.getElementById('pedido-detalle-contenido')
  if (!container) return

  const estadoPago = pedido.estado_pago || 'pendiente'

  const estáPagado = estadoPago === 'pagado'
  const puedeCancelar = pedido.estado === 'pendiente' && pedido.estado_pago !== 'pagado'

  let seccionPago = ''
  if (pedido.estado === 'cancelado') {
    seccionPago = `
      <div class="pedido-section" style="border:1px solid var(--border-light)">
        <h2 class="pedido-section__title">Pago</h2>
        <p style="color:var(--text-secondary)">Este pedido fue cancelado. No se necesitan más acciones de pago.</p>
      </div>
    `
  } else if (estáPagado) {
    seccionPago = `
      <div class="pedido-section" style="border:1px solid var(--border-light)">
        <h2 class="pedido-section__title">Pago</h2>
        <span class="status-badge status-badge--entregado">Pagado</span>
        ${pedido.pago_referencia ? `<p style="color:var(--text-secondary);margin-top:var(--space-sm)">Comprobante: ${pedido.pago_referencia}</p>` : ''}
      </div>
    `
  } else if (estadoPago === 'en_revision') {
    seccionPago = `
      <div class="pedido-section" style="border:1px solid var(--border-light)">
        <h2 class="pedido-section__title">Pago</h2>
        <span class="status-badge status-badge--pendiente">Pago en revisión</span>
        <p style="color:var(--text-secondary);margin-top:var(--space-sm)">Recibimos tu comprobante <strong>${pedido.pago_referencia || ''}</strong>. Estamos verificando la transferencia y confirmaremos tu pedido pronto.</p>
      </div>
    `
  } else {
    seccionPago = `
      <div class="pedido-section" style="border:1px solid var(--border-light)">
        <h2 class="pedido-section__title">Pago por Banca Móvil</h2>
        <p style="color:var(--text-secondary);margin-bottom:var(--space-sm)">Transfiere el total del pedido y reporta tu comprobante. Verificaremos tu pago y confirmaremos el pedido.</p>
        <div id="pago-datos-bancarios" style="margin-bottom:var(--space-md)"><div class="spinner" style="width:20px;height:20px;border-width:2px"></div></div>
        <form id="pago-form" style="display:flex;flex-direction:column;gap:var(--space-sm)">
          <label class="checkout-form__label">Número de comprobante</label>
          <input type="text" id="pago-referencia" class="input" placeholder="Ej: 1234567890123456" required minlength="6">
          <div id="pago-error" style="display:none;color:var(--danger-color, #dc2626);font-size:var(--text-small)"></div>
          <button type="submit" class="btn btn--primary" style="align-self:flex-start" id="pago-reportar-btn">Ya transferí — verificar pago</button>
        </form>
      </div>
    `
  }

  container.insertAdjacentHTML('beforeend', `
    ${seccionPago}
    ${puedeCancelar ? `
      <div class="pedido-section" style="border:1px solid var(--border-light)">
        <h2 class="pedido-section__title">Cancelar pedido</h2>
        <p style="color:var(--text-secondary);margin-bottom:var(--space-sm)">Si ya no quieres este pedido, puedes cancelarlo. Los productos volverán a estar disponibles.</p>
        <button class="btn btn--ghost" id="pedido-cancelar-btn">Cancelar pedido</button>
      </div>
    ` : ''}
  `)

  const datosBancarios = document.getElementById('pago-datos-bancarios')
  if (datosBancarios) {
    const { data, error } = await obtenerDatosPago()
    if (error || !data?.datos_bancarios) {
      datosBancarios.innerHTML = '<p style="color:var(--danger-color, #dc2626);font-size:var(--text-small)">No se pudieron cargar los datos de pago. Intenta luego.</p>'
    } else {
      const d = data.datos_bancarios
      datosBancarios.innerHTML = `
        <div style="background:var(--bg-secondary);border-radius:12px;padding:var(--space-md);line-height:1.9">
          <p><strong>Banco:</strong> ${d.banco} (${d.tipo})</p>
          <p><strong>Titular:</strong> ${d.titular}</p>
          ${d.cedula ? `<p><strong>Cédula/RUC:</strong> ${d.cedula}</p>` : ''}
          ${d.cuenta ? `<p><strong>Cuenta:</strong> ${d.cuenta}</p>` : ''}
          ${d.telefono ? `<p><strong>Teléfono (Banca Móvil):</strong> ${d.telefono}</p>` : ''}
        </div>
      `
    }
  }

  const form = document.getElementById('pago-form')
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault()
      const btn = document.getElementById('pago-reportar-btn')
      const input = document.getElementById('pago-referencia')
      const errorEl = document.getElementById('pago-error')
      const referencia = input.value.trim()
      if (referencia.length < 6) {
        errorEl.textContent = 'Ingresa el número de comprobante (mín. 6 caracteres)'
        errorEl.style.display = 'block'
        return
      }
      btn.disabled = true
      btn.textContent = 'Verificando...'
      const { data, error } = await reportarPago(pedido.id, referencia)
      if (error) {
        errorEl.textContent = error.error || 'Error al reportar el pago'
        errorEl.style.display = 'block'
        btn.disabled = false
        btn.textContent = 'Ya transferí — verificar pago'
        return
      }
      showToast('¡Pago reportado! Verificaremos tu transferencia', 'success')
      renderPagoSection({ ...pedido, estado_pago: 'en_revision' })
    })
  }

  const cancelarBtn = document.getElementById('pedido-cancelar-btn')
  if (cancelarBtn) {
    cancelarBtn.addEventListener('click', async () => {
      if (!confirm('¿Seguro que quieres cancelar este pedido?')) return
      cancelarBtn.disabled = true
      cancelarBtn.textContent = 'Cancelando...'
      const { data, error } = await cancelarPedido(pedido.id)
      if (error) {
        showToast(error.error || 'No se pudo cancelar el pedido', 'error')
        cancelarBtn.disabled = false
        cancelarBtn.textContent = 'Cancelar pedido'
        return
      }
      showToast('Pedido cancelado', 'success')
      window.location.reload()
    })
  }
}

function renderDetalle(pedido) {
  const container = document.getElementById('pedido-detalle-contenido')
  if (!container) return

  const direccion = pedido.direccion_envio || {}

  container.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:var(--space-md)">
      <div class="pedido-section">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div>
            <p style="font-size:var(--text-caption);color:var(--text-secondary);margin-bottom:2px">Fecha</p>
            <p style="font-weight:var(--weight-medium)">${formatDate(pedido.created_at)}</p>
          </div>
          <div style="display:flex;gap:var(--space-xs);align-items:center">
            <span class="status-badge ${statusClass[pedido.estado] || ''}">${pedido.estado}</span>
            ${pedido.estado_pago !== 'pagado' ? `<span class="status-badge ${pedido.estado_pago === 'fallido' ? statusClass.cancelado : statusClass.pendiente}">${pagoTexto[pedido.estado_pago] || pagoTexto.pendiente}</span>` : ''}
          </div>
        </div>
      </div>

      <div class="pedido-section">
        <h2 class="pedido-section__title">Productos</h2>
        ${(pedido.detalles_pedido || []).map(det => {
          const producto = det.productos || {}
          const imgUrl = producto.imagenes?.[0]?.url
          return `
            <div class="pedido-detail-row">
              <div style="display:flex;align-items:center;gap:var(--space-md)">
                <div style="width:48px;height:48px;border-radius:8px;overflow:hidden;background:var(--bg-secondary);flex-shrink:0">
                  ${imgUrl ? `<img src="${imgUrl}" alt="" style="width:100%;height:100%;object-fit:contain;padding:3px" onerror="this.onerror=null;this.parentElement.innerHTML='📦'" />` : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:1rem;color:var(--text-tertiary)">📦</div>`}
                </div>
                <div>
                  <p style="font-weight:var(--weight-medium)">${producto.nombre || 'Producto'}</p>
                  <p style="font-size:var(--text-caption);color:var(--text-secondary)">×${det.cantidad} a $${parseFloat(det.precio_unitario).toFixed(2)}</p>
                </div>
              </div>
              <p style="font-weight:var(--weight-semibold)">$${(parseFloat(det.precio_unitario) * det.cantidad).toFixed(2)}</p>
            </div>
          `
        }).join('')}
        <div class="pedido-total-row">
          <span>Total</span>
          <span>$${parseFloat(pedido.total_pedido).toFixed(2)}</span>
        </div>
      </div>

      <div class="pedido-section">
        <h2 class="pedido-section__title">Dirección de envío</h2>
        <p style="color:var(--text-secondary);line-height:1.6">
          ${[
            direccion.nombre || direccion.calle,
            direccion.direccion,
            direccion.ciudad,
            direccion.telefono,
          ].filter(Boolean).join('<br>')}
        </p>
      </div>

      ${pedido.notas ? `
        <div class="pedido-section">
          <h2 class="pedido-section__title">Notas</h2>
          <p style="color:var(--text-secondary)">${pedido.notas}</p>
        </div>
      ` : ''}
    </div>
  `
}
