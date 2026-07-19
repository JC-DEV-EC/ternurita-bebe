import store from '../store.js'
import { detallePedido } from '../services/pedidos.service.js'
import { formatDate } from '../utils.js'

const statusClass = {
  pendiente: 'status-badge--pendiente',
  enviado: 'status-badge--enviado',
  entregado: 'status-badge--entregado',
  cancelado: 'status-badge--cancelado',
}

export default function render(params) {
  return `
    <div style="padding-top:calc(var(--nav-height) + var(--space-lg))">
      <div class="container" style="max-width:720px">
        <a href="#/pedidos" style="display:inline-flex;align-items:center;gap:var(--space-xs);font-size:var(--text-caption);color:var(--text-secondary);margin-bottom:var(--space-lg);transition:color var(--duration-fast) var(--ease-smooth)">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M10 3L5 8l5 5"/></svg>
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
          <span class="status-badge ${statusClass[pedido.estado] || ''}">${pedido.estado}</span>
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
                  ${imgUrl ? `<img src="${imgUrl}" alt="" style="width:100%;height:100%;object-fit:contain;padding:3px" />` : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:1rem;color:var(--text-tertiary)">📦</div>`}
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
