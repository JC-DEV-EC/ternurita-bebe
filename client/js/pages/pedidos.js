import store from '../store.js'
import { misPedidos } from '../services/pedidos.service.js'
import { formatDate, initIcons } from '../utils.js'

const statusClass = {
  pendiente: 'status-badge--pendiente',
  enviado: 'status-badge--enviado',
  entregado: 'status-badge--entregado',
  cancelado: 'status-badge--cancelado',
}

export default function render() {
  return `
    <div style="padding-top:calc(var(--nav-height) + var(--space-lg))">
      <div class="container" style="max-width:720px">
        <div style="margin-bottom:var(--space-xl)">
          <span class="badge">Pedidos</span>
          <h1 class="headline-display">Mis pedidos</h1>
        </div>
        <div id="pedidos-lista">
          <div style="text-align:center;padding:var(--space-2xl) 0"><div class="spinner" style="margin:0 auto"></div></div>
        </div>
      </div>
    </div>
  `
}

export async function afterRender() {
  if (!store.sesion) {
    window.location.hash = '#/login'
    return
  }
  await cargarPedidos()
}

async function cargarPedidos() {
  const container = document.getElementById('pedidos-lista')
  if (!container) return

  const { data, error } = await misPedidos(store.usuario.id)

  if (error) {
    container.innerHTML = '<p style="text-align:center;color:var(--text-secondary);padding:var(--space-2xl) 0">Error al cargar pedidos</p>'
    return
  }

  if (!data || data.length === 0) {
    container.innerHTML = `
      <div style="text-align:center;padding:var(--space-3xl) 0">
        <p style="font-size:var(--text-title);font-weight:var(--weight-semibold);margin-bottom:var(--space-sm)">No tienes pedidos aún</p>
        <p style="color:var(--text-secondary);margin-bottom:var(--space-lg)">Explora nuestra colección y haz tu primer pedido.</p>
        <a href="#/productos" class="btn btn--primary">Ir a comprar</a>
      </div>
    `
    return
  }

  container.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:var(--space-sm)">
      ${data.map(pedido => {
        const primerProd = pedido.detalles_pedido?.[0]?.productos
        const imgUrl = primerProd?.imagenes?.[0]?.url
        return `
        <a href="#/pedidos/${pedido.id}" class="pedido-card" style="display:flex;align-items:center;gap:var(--space-md)">
          <div style="width:56px;height:56px;border-radius:10px;overflow:hidden;background:var(--bg-secondary);flex-shrink:0">
            ${imgUrl ? `<img src="${imgUrl}" alt="" style="width:100%;height:100%;object-fit:contain;padding:4px" />` : `<i data-lucide="package" style="width:20px;height:20px;color:var(--text-tertiary)"></i>`}
          </div>
          <div style="flex:1;min-width:0">
            <div class="pedido-card__header" style="margin-bottom:4px">
              <span class="pedido-card__id">Pedido #${pedido.id}</span>
              <span class="status-badge ${statusClass[pedido.estado] || ''}">${pedido.estado}</span>
            </div>
            <div class="pedido-card__info">
              <span>${formatDate(pedido.created_at)}</span>
              <span style="font-weight:var(--weight-semibold)">$${parseFloat(pedido.total_pedido).toFixed(2)}</span>
            </div>
            <div class="pedido-card__meta">${pedido.detalles_pedido?.length || 0} producto(s)</div>
          </div>
        </a>
      `}).join('')}
    </div>
  `
  initIcons()
}
