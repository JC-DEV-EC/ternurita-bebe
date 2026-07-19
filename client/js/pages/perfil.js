import store from '../store.js'
import supabase from '../services/supabase.service.js'
import { showToast, formatDate } from '../utils.js'
import { misPedidos } from '../services/pedidos.service.js'

function initials(name) {
  return (name || 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

export default function render() {
  const usuario = store.usuario || {}
  const sesion = store.sesion

  if (!sesion) {
    return `
      <div class="min-h-[70vh] flex items-center justify-center fade-in">
        <p class="text-gray-500">Debes iniciar sesión para ver tu perfil.</p>
      </div>
    `
  }

  return `
    <div class="section" style="padding-top:calc(var(--nav-height) + var(--space-lg))">
      <div class="container" style="max-width:800px">
        <div class="profile-header" style="display:flex;align-items:center;gap:var(--space-lg);margin-bottom:var(--space-2xl);flex-wrap:wrap">
          <div style="width:72px;height:72px;border-radius:50%;background:var(--accent);display:flex;align-items:center;justify-content:center;flex-shrink:0">
            <span style="font-size:var(--text-subhead);font-weight:var(--weight-semibold);color:#fff">${initials(usuario.nombre_completo)}</span>
          </div>
          <div style="flex:1">
            <h1 class="headline-display" style="margin:0">${usuario.nombre_completo || 'Usuario'}</h1>
            <p style="font-size:var(--text-caption);color:var(--text-secondary);margin-top:2px">${usuario.email || ''}</p>
          </div>
          <span class="badge" style="text-transform:capitalize">${usuario.rol || 'cliente'}</span>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:var(--space-md);margin-bottom:var(--space-2xl)" id="profile-stats">
          <div class="stat-card">
            <p class="stat-card__label">Pedidos</p>
            <p class="stat-card__value" id="stats-pedidos-count">-</p>
          </div>
          <div class="stat-card">
            <p class="stat-card__label">Miembro desde</p>
            <p class="stat-card__value" style="font-size:var(--text-body)" id="stats-member-since">-</p>
          </div>
          <div class="stat-card">
            <p class="stat-card__label">Total gastado</p>
            <p class="stat-card__value" id="stats-total-gastado">-</p>
          </div>
        </div>

        <div style="background:var(--bg-primary);border:1px solid var(--border-light);border-radius:18px;padding:var(--space-xl);margin-bottom:var(--space-2xl)">
          <h2 style="font-size:var(--text-subhead);font-weight:var(--weight-semibold);margin-bottom:var(--space-lg)">Información personal</h2>
          <form id="perfil-form" style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-md)">
            <div style="grid-column:1/-1">
              <label style="display:block;font-size:var(--text-caption);font-weight:var(--weight-medium);color:var(--text-secondary);margin-bottom:var(--space-xs)">Nombre completo</label>
              <input type="text" id="perfil-nombre" class="input" value="${usuario.nombre_completo || ''}" required>
            </div>
            <div>
              <label style="display:block;font-size:var(--text-caption);font-weight:var(--weight-medium);color:var(--text-secondary);margin-bottom:var(--space-xs)">Email</label>
              <input type="email" class="input" value="${usuario.email || ''}" readonly disabled style="background:var(--bg-secondary);color:var(--text-tertiary)">
            </div>
            <div>
              <label style="display:block;font-size:var(--text-caption);font-weight:var(--weight-medium);color:var(--text-secondary);margin-bottom:var(--space-xs)">Teléfono</label>
              <input type="tel" id="perfil-telefono" class="input" value="${usuario.telefono || ''}" placeholder="Opcional">
            </div>
            <div style="grid-column:1/-1">
              <label style="display:block;font-size:var(--text-caption);font-weight:var(--weight-medium);color:var(--text-secondary);margin-bottom:var(--space-xs)">Dirección</label>
              <textarea id="perfil-direccion" class="input" rows="2" style="resize:none" placeholder="Opcional">${usuario.direccion || ''}</textarea>
            </div>
            <div style="grid-column:1/-1;margin-top:var(--space-sm)">
              <button type="submit" class="btn btn--primary" style="width:100%" id="perfil-submit">Guardar cambios</button>
            </div>
          </form>
        </div>

        <div style="background:var(--bg-primary);border:1px solid var(--border-light);border-radius:18px;padding:var(--space-xl)">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-lg)">
            <h2 style="font-size:var(--text-subhead);font-weight:var(--weight-semibold)">Pedidos recientes</h2>
            <a href="#/pedidos" style="font-size:var(--text-caption);color:var(--accent);transition:color var(--duration-fast) var(--ease-smooth)">Ver todos</a>
          </div>
          <div id="profile-pedidos-list">
            <p style="font-size:var(--text-caption);color:var(--text-tertiary)">Cargando...</p>
          </div>
        </div>
      </div>
    </div>
  `
}

export async function afterRender() {
  const elMember = document.getElementById('stats-member-since')
  if (elMember && store.usuario?.created_at) {
    elMember.textContent = formatDate(store.usuario.created_at)
  }

  await Promise.all([
    cargarStatsPedidos(),
    cargarPedidos(),
  ])

  const form = document.getElementById('perfil-form')
  const submitBtn = document.getElementById('perfil-submit')

  form?.addEventListener('submit', async (e) => {
    e.preventDefault()

    const nombre = document.getElementById('perfil-nombre').value.trim()
    const telefono = document.getElementById('perfil-telefono').value.trim()
    const direccion = document.getElementById('perfil-direccion').value.trim()

    if (!nombre) return

    submitBtn.disabled = true
    submitBtn.textContent = 'Guardando...'

    const { error } = await supabase
      .from('perfiles')
      .update({ nombre_completo: nombre, telefono, direccion })
      .eq('id', store.usuario?.id)

    if (error) {
      showToast('Error al guardar: ' + error.message, 'error')
    } else {
      store.usuario = { ...store.usuario, nombre_completo: nombre, telefono, direccion }
      showToast('Perfil actualizado correctamente', 'success')
    }

    submitBtn.disabled = false
    submitBtn.textContent = 'Guardar cambios'
  })
}

async function cargarStatsPedidos() {
  try {
    const { data } = await misPedidos(store.usuario?.id)
    if (!data) return

    const total = data.length
    const gastado = data.reduce((s, p) => s + (p.total_pedido || 0), 0)

    const elCount = document.getElementById('stats-pedidos-count')
    if (elCount) elCount.textContent = total

    const elGastado = document.getElementById('stats-total-gastado')
    if (elGastado) elGastado.textContent = `$${gastado.toFixed(2)}`
  } catch {}
}

async function cargarPedidos() {
  const container = document.getElementById('profile-pedidos-list')
  if (!container) return

  try {
    const { data } = await misPedidos(store.usuario?.id)
    if (!data || data.length === 0) {
      container.innerHTML = '<p style="font-size:var(--text-caption);color:var(--text-tertiary)">Aún no has realizado ningún pedido.</p>'
      return
    }

    container.innerHTML = data.slice(0, 5).map(p => {
      const estado = p.estado || 'pendiente'
      const color = estado === 'entregado' ? '#34C759' : estado === 'enviado' ? '#007AFF' : estado === 'cancelado' ? '#DC2626' : '#FF9F0A'
      return `
        <a href="#/pedidos/${p.id}" style="display:flex;align-items:center;justify-content:space-between;padding:var(--space-sm) 0;border-bottom:1px solid var(--border-light);transition:background var(--duration-fast) var(--ease-smooth);text-decoration:none;color:inherit">
          <div>
            <p style="font-size:var(--text-body);font-weight:var(--weight-medium)">Pedido #${p.id}</p>
            <p style="font-size:var(--text-caption);color:var(--text-tertiary)">${p.created_at ? formatDate(p.created_at) : ''}</p>
          </div>
          <div style="text-align:right">
            <p style="font-weight:var(--weight-semibold)">$${(p.total_pedido || 0).toFixed(2)}</p>
            <span style="display:inline-block;font-size:11px;font-weight:var(--weight-medium);color:${color}">${estado}</span>
          </div>
        </a>
      `
    }).join('')
  } catch {
    container.innerHTML = '<p style="font-size:var(--text-caption);color:var(--text-tertiary)">Error al cargar pedidos.</p>'
  }
}
