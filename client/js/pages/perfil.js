import store from '../store.js'
import supabase from '../services/supabase.service.js'
import CONFIG from '../config.js'
import { showToast, formatDate } from '../utils.js'
import { misPedidos } from '../services/pedidos.service.js'

function initials(name) {
  return (name || 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

export default function render() {
  const usuario = store.usuario || {}
  const sesion = store.sesion
  const avatarUrl = usuario.avatar_url || ''
  const tieneAvatar = !!avatarUrl

  if (!sesion) {
    return `
      <div class="min-h-[70vh] flex items-center justify-center fade-in">
        <p class="text-gray-500">Debes iniciar sesión para ver tu perfil.</p>
      </div>
    `
  }

  return `
    <div class="profile-page">
      <div class="container" style="max-width:800px">

        <div class="profile-header">
          <div class="profile-avatar">
            <div class="profile-avatar__img ${tieneAvatar ? 'profile-avatar__img--has-image' : ''}" id="avatar-display">
              ${tieneAvatar
                ? `<img src="${avatarUrl}" alt="Avatar" style="width:100%;height:100%;object-fit:cover" />`
                : `<span class="profile-avatar__initials">${initials(usuario.nombre_completo)}</span>`
              }
            </div>
            <label class="profile-avatar__edit" for="avatar-input" id="avatar-edit-btn">
              <i data-lucide="pen"></i>
            </label>
            <input type="file" id="avatar-input" accept="image/*" hidden />
          </div>
          <div class="profile-info">
            <h1 class="profile-info__name">${usuario.nombre_completo || 'Usuario'}</h1>
            <p class="profile-info__email">${usuario.email || ''}</p>
            <div class="profile-info__role">
              <span class="badge" style="text-transform:capitalize">${usuario.rol || 'cliente'}</span>
            </div>
          </div>
        </div>

        <div class="profile-stats" id="profile-stats">
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

        <div class="profile-section">
          <div class="profile-section__header">
            <h2 class="profile-section__title">Informaci&oacute;n personal</h2>
          </div>
          <form id="perfil-form" class="profile-form">
            <div class="profile-form__full profile-form__group">
              <label class="profile-form__label" for="perfil-nombre">Nombre completo</label>
              <input type="text" id="perfil-nombre" class="input" value="${usuario.nombre_completo || ''}" required>
            </div>
            <div class="profile-form__group">
              <label class="profile-form__label" for="perfil-email">Email</label>
              <input type="email" id="perfil-email" class="input" value="${usuario.email || ''}" readonly disabled style="background:var(--bg-secondary);color:var(--text-tertiary)">
            </div>
            <div class="profile-form__group">
              <label class="profile-form__label" for="perfil-telefono">Tel&eacute;fono</label>
              <input type="tel" id="perfil-telefono" class="input" value="${usuario.telefono || ''}" placeholder="Opcional">
            </div>
            <div class="profile-form__full profile-form__group">
              <label class="profile-form__label" for="perfil-direccion">Direcci&oacute;n</label>
              <textarea id="perfil-direccion" class="input" rows="2" style="resize:none" placeholder="Opcional">${usuario.direccion || ''}</textarea>
            </div>
            <div class="profile-form__actions">
              <button type="submit" class="btn btn--primary profile-form__submit" id="perfil-submit">Guardar cambios</button>
            </div>
          </form>
        </div>

        <div class="profile-section">
          <div class="profile-section__header">
            <h2 class="profile-section__title">Pedidos recientes</h2>
            <a href="#/pedidos" class="profile-section__link">Ver todos</a>
          </div>
          <div class="profile-pedidos-list" id="profile-pedidos-list">
            <div class="profile-loading">
              <span class="profile-loading__dot"></span>
              <span class="profile-loading__dot"></span>
              <span class="profile-loading__dot"></span>
            </div>
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

  const avatarInput = document.getElementById('avatar-input')
  avatarInput?.addEventListener('change', async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('avatar', file)

    const token = store.sesion?.access_token
    if (!token) return

    const editBtn = document.getElementById('avatar-edit-btn')
    if (editBtn) editBtn.style.opacity = '0.5'

    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}/api/perfil/avatar`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al subir avatar')

      store.usuario = { ...store.usuario, avatar_url: data.avatar_url }

      const display = document.getElementById('avatar-display')
      if (display) {
        display.classList.add('profile-avatar__img--has-image')
        display.innerHTML = `<img src="${data.avatar_url}" alt="Avatar" style="width:100%;height:100%;object-fit:cover" />`
      }

      showToast('Avatar actualizado', 'success')
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      if (editBtn) editBtn.style.opacity = ''
      avatarInput.value = ''
    }
  })

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
      container.innerHTML = `
        <div class="profile-empty">
          <p class="profile-empty__text">A&uacute;n no has realizado ning&uacute;n pedido.</p>
          <a href="#/" class="btn btn--primary btn--sm">Ir a la tienda</a>
        </div>
      `
      return
    }

    container.innerHTML = data.slice(0, 5).map(p => {
      const estado = p.estado || 'pendiente'
      const color = estado === 'entregado' ? '#34C759' : estado === 'enviado' ? '#007AFF' : estado === 'cancelado' ? '#DC2626' : '#FF9F0A'
      return `
        <a href="#/pedidos/${p.id}" class="profile-pedido-item">
          <div class="profile-pedido-item__left">
            <p class="profile-pedido-item__id">Pedido #${p.id}</p>
            <p class="profile-pedido-item__date">${p.created_at ? formatDate(p.created_at) : ''}</p>
          </div>
          <div class="profile-pedido-item__right">
            <p class="profile-pedido-item__price">$${(p.total_pedido || 0).toFixed(2)}</p>
            <span class="profile-pedido-item__status" style="color:${color};font-size:var(--text-small);font-weight:var(--weight-medium)">${estado}</span>
          </div>
        </a>
      `
    }).join('')
  } catch {
    container.innerHTML = `
      <div class="profile-empty">
        <p class="profile-empty__text">Error al cargar pedidos.</p>
      </div>
    `
  }
}
