import { renderAdminSidebar, setupAdminToggle } from '../../components/AdminSidebar.js'
import { pedidos } from '../../services/admin.service.js'
import { formatPrecio, formatDate, showToast } from '../../utils.js'

const estadoBadge = {
  pendiente: 'badge badge-warning',
  confirmado: 'badge badge-primary',
  enviado: 'badge badge-primary',
  entregado: 'badge badge-success',
  cancelado: 'badge badge-error',
}

const pagoBadge = {
  pendiente: 'badge badge-warning',
  en_revision: 'badge badge-warning',
  pagado: 'badge badge-success',
  fallido: 'badge badge-error',
}

export default function render(params) {
  const collapsed = localStorage.getItem('admin-sidebar-collapsed') === 'true'
  return `
    <div class="admin-layout">
      <div id="admin-sidebar"></div>
      <div class="admin-main ${collapsed ? 'admin-main--expanded' : ''}">
        <button class="admin-sidebar-toggle ${collapsed ? 'admin-sidebar-toggle--collapsed' : ''}" id="admin-toggle" aria-label="Alternar menú lateral"><i data-lucide="panel-left"></i></button>
        <div style="margin-bottom:var(--space-xl)">
          <span class="badge">Admin</span>
          <a href="#/admin/pedidos" style="display:inline-flex;align-items:center;gap:var(--space-xs);font-size:var(--text-caption);color:var(--text-secondary);margin-bottom:var(--space-sm);text-decoration:none">
            <i data-lucide="arrow-left" style="width:16px;height:16px"></i> Pedidos
          </a>
          <h1 class="headline-display">Pedido #${params?.id || ''}</h1>
        </div>
        <div id="pedido-detalle-admin">
          <div style="text-align:center;padding:var(--space-2xl) 0"><div class="spinner" style="margin:0 auto"></div></div>
        </div>
      </div>
    </div>
  `
}

export async function afterRender(params) {
  const sidebar = document.getElementById('admin-sidebar')
  if (sidebar) renderAdminSidebar(sidebar)
  setupAdminToggle()

  const id = parseInt(params?.id)
  const container = document.getElementById('pedido-detalle-admin')
  if (!container) return

  if (!id) {
    container.innerHTML = '<p style="text-align:center;color:var(--text-secondary);padding:var(--space-2xl) 0">Pedido no válido</p>'
    return
  }

  try {
    const res = await pedidos.detalle(id)
    renderDetalle(res.data)
  } catch (err) {
    container.innerHTML = `<p style="text-align:center;color:var(--text-secondary);padding:var(--space-2xl) 0">${err.message}</p>`
  }
}

function renderDetalle(pedido) {
  const container = document.getElementById('pedido-detalle-admin')
  if (!container) return

  const cliente = pedido.perfiles || {}
  const direccion = pedido.direccion_envio || {}

  container.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:var(--space-md)">
      <div style="display:flex;gap:var(--space-xs);align-items:center;flex-wrap:wrap;margin-bottom:var(--space-sm)">
        <span class="badge ${estadoBadge[pedido.estado] || 'badge'}">${pedido.estado}</span>
        <span class="badge ${pagoBadge[pedido.estado_pago] || 'badge'}">${pagoTexto(pedido.estado_pago)}</span>
        <span style="font-size:var(--text-caption);color:var(--text-tertiary)">${formatDate(pedido.created_at)}</span>
      </div>

      <div style="background:var(--bg-primary);border:1px solid var(--border-light);border-radius:18px;padding:var(--space-lg);display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:var(--space-lg)">
        <div>
          <p style="font-size:var(--text-caption);color:var(--text-tertiary);margin-bottom:4px">Cliente</p>
          <p style="font-weight:var(--weight-medium)">${cliente.nombre_completo || '-'}</p>
          ${cliente.telefono ? `<p style="font-size:var(--text-small);color:var(--text-secondary)">${cliente.telefono}</p>` : ''}
          ${cliente.ciudad ? `<p style="font-size:var(--text-small);color:var(--text-secondary)">${cliente.ciudad}</p>` : ''}
          <p style="font-size:var(--text-small);color:var(--text-tertiary)">ID: ${pedido.cliente_id?.slice(0, 8) || '-'}...</p>
        </div>
        <div>
          <p style="font-size:var(--text-caption);color:var(--text-tertiary);margin-bottom:4px">Dirección de envío</p>
          <p style="font-size:var(--text-small);color:var(--text-secondary);line-height:1.6">
            ${[direccion.nombre || direccion.calle, direccion.direccion, direccion.ciudad, direccion.telefono].filter(Boolean).join('<br>') || '-'}
          </p>
        </div>
        <div>
          <p style="font-size:var(--text-caption);color:var(--text-tertiary);margin-bottom:4px">Pago</p>
          ${pedido.estado_pago === 'pagado'
            ? `<p style="font-size:var(--text-small);color:var(--text-secondary)">${formatPrecio(pedido.total_pedido)} recibidos ${pedido.pagado_at ? 'el ' + formatDate(pedido.pagado_at) : ''}</p>`
            : `<p style="font-size:var(--text-small);color:var(--text-secondary)"><strong>Total: ${formatPrecio(pedido.total_pedido)}</strong></p>`}
          ${pedido.pago_referencia ? `<p style="font-size:var(--text-small);color:var(--text-secondary)">Comprobante: ${pedido.pago_referencia}</p>` : ''}
          <p style="font-size:var(--text-small);color:var(--text-tertiary)">Método: ${pedido.metodo_pago === 'banca_movil' ? 'Banca Móvil' : pedido.metodo_pago || 'n/a'}</p>
        </div>
      </div>

      <div style="background:var(--bg-primary);border:1px solid var(--border-light);border-radius:18px;overflow:hidden">
        <div style="padding:var(--space-md) var(--space-lg);border-bottom:1px solid var(--border-light)">
          <h2 style="font-weight:var(--weight-semibold);font-size:var(--text-title)">Productos</h2>
        </div>
        ${(pedido.detalles_pedido || []).map(det => {
          const producto = det.productos || {}
          const imgUrl = producto.imagenes?.[0]?.url
          return `
            <div style="display:flex;align-items:center;gap:var(--space-md);padding:var(--space-sm) var(--space-lg);border-bottom:1px solid var(--border-light)">
              <div style="width:44px;height:44px;border-radius:8px;overflow:hidden;background:var(--bg-secondary);flex-shrink:0">
                ${imgUrl ? `<img src="${imgUrl}" alt="" style="width:100%;height:100%;object-fit:contain;padding:3px" onerror="this.onerror=null;this.parentElement.innerHTML='📦'" />` : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:var(--text-tertiary)">📦</div>`}
              </div>
              <div style="flex:1;min-width:0">
                <p style="font-weight:var(--weight-medium);font-size:var(--text-small)">${producto.nombre || `Producto #${det.producto_id}`}</p>
                <p style="font-size:var(--text-caption);color:var(--text-secondary)">×${det.cantidad} a ${formatPrecio(det.precio_unitario)}</p>
              </div>
              <p style="font-weight:var(--weight-semibold);font-size:var(--text-small)">${formatPrecio(parseFloat(det.precio_unitario) * det.cantidad)}</p>
            </div>
          `
        }).join('')}
        <div style="display:flex;justify-content:space-between;align-items:center;padding:var(--space-md) var(--space-lg);font-weight:var(--weight-semibold)">
          <span>Total</span>
          <span>${formatPrecio(pedido.total_pedido)}</span>
        </div>
      </div>

      ${pedido.notas ? `
        <div style="background:var(--bg-primary);border:1px solid var(--border-light);border-radius:18px;padding:var(--space-md) var(--space-lg)">
          <p style="font-size:var(--text-caption);color:var(--text-tertiary);margin-bottom:4px">Notas del cliente</p>
          <p style="font-size:var(--text-small);color:var(--text-secondary)">${pedido.notas}</p>
        </div>
      ` : ''}

      ${pedido.estado_pago === 'en_revision' ? `
        <div style="display:flex;gap:var(--space-xs);flex-wrap:wrap;margin-top:var(--space-sm)">
          <button class="btn btn--primary" id="btn-confirmar-pago">Confirmar pago (${formatPrecio(pedido.total_pedido)})</button>
          <button class="btn btn--ghost" id="btn-rechazar-pago">Rechazar pago</button>
        </div>
      ` : ''}
    </div>
  `

  const confirmarBtn = document.getElementById('btn-confirmar-pago')
  if (confirmarBtn) {
    confirmarBtn.addEventListener('click', async () => {
      if (!confirm(`¿Confirmar el pago del pedido #${pedido.id}?`)) return
      confirmarBtn.disabled = true
      try {
        await pedidos.confirmarPago(pedido.id)
        showToast('Pago confirmado. Pedido listo para despacho.', 'success')
        afterRender({ id: pedido.id })
      } catch (err) {
        showToast(err.message, 'error')
        confirmarBtn.disabled = false
      }
    })
  }

  const rechazarBtn = document.getElementById('btn-rechazar-pago')
  if (rechazarBtn) {
    rechazarBtn.addEventListener('click', async () => {
      if (!confirm(`¿Rechazar el pago del pedido #${pedido.id}? El cliente podrá reintentar.`)) return
      rechazarBtn.disabled = true
      try {
        await pedidos.rechazarPago(pedido.id)
        showToast('Pago rechazado', 'success')
        afterRender({ id: pedido.id })
      } catch (err) {
        showToast(err.message, 'error')
        rechazarBtn.disabled = false
      }
    })
  }
}

function pagoTexto(estadoPago) {
  switch (estadoPago) {
    case 'pagado': return 'Pagado'
    case 'en_revision': return 'Pago en revisión'
    case 'fallido': return 'Pago no realizado'
    default: return 'Pago pendiente'
  }
}