import store from './store.js'
import {
  signIn as authSignIn,
  signOut as authSignOut,
  getSession,
  onAuthChange,
} from './services/auth.service.js'
import supabase from './services/supabase.service.js'
import { showToast } from './utils.js'
import CONFIG from './config.js'

async function cargarUsuario(userId) {
  const { data, error } = await supabase
    .from('perfiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (!error && data) {
    store.usuario = { ...data, email: store.sesion?.user?.email || data.email }
  }
  return { data, error }
}

export async function login(email, password) {
  const { data, error } = await authSignIn(email, password)

  if (error) {
    showToast(error.message, 'error')
    return { error }
  }

  store.sesion = data.session
  await cargarUsuario(data.user.id)

  const esAdmin = store.usuario?.rol === 'admin'
  window.location.hash = esAdmin ? '#/admin' : '#/'
  showToast('Sesión iniciada correctamente', 'success')
  return { data }
}

export async function register(nombre, email, password) {
  try {
    const res = await fetch(`${CONFIG.API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, nombre }),
    })

    const data = await res.json()

    if (!res.ok) {
      showToast(data.error || 'Error al registrarse', 'error')
      return { error: data }
    }

    if (data.session) {
      store.sesion = data.session
    }

    if (data.user) {
      await cargarUsuario(data.user.id)
    }

    showToast('Cuenta creada correctamente', 'success')
    window.location.hash = '#/'
    return { data }
  } catch (err) {
    showToast('Error de conexión al servidor', 'error')
    return { error: err }
  }
}

export async function logout() {
  const confirmed = await confirmLogout()
  if (!confirmed) return
  await authSignOut()
  store.sesion = null
  store.usuario = null
  store.carrito = []
  store.carritoCount = 0
  showToast('Sesión cerrada', 'info')
  window.location.hash = '#/'
}

function confirmLogout() {
  return new Promise(resolve => {
    const overlay = document.createElement('div')
    overlay.className = 'modal-backdrop'
    overlay.innerHTML = `
      <div class="modal" style="max-width:400px;text-align:center">
        <div class="modal__header" style="border:none;padding-bottom:0">
          <h2 class="modal__title">Cerrar sesión</h2>
        </div>
        <p style="color:var(--text-secondary);margin:var(--space-md) 0 var(--space-lg)">
          ¿Estás seguro de que quieres cerrar sesión?
        </p>
        <div style="display:flex;gap:var(--space-xs);justify-content:center">
          <button class="btn btn--secondary" id="btn-cancel-logout">Cancelar</button>
          <button class="btn btn--primary" id="btn-confirm-logout">Cerrar sesión</button>
        </div>
      </div>
    `
    document.body.appendChild(overlay)

    const cleanup = () => { overlay.remove(); resolve(false) }
    overlay.querySelector('#btn-cancel-logout')?.addEventListener('click', cleanup)
    overlay.querySelector('#btn-confirm-logout')?.addEventListener('click', () => {
      overlay.remove(); resolve(true)
    })
    overlay.addEventListener('click', e => { if (e.target === overlay) cleanup() })
  })
}

export function isAdmin() {
  return store.usuario?.rol === 'admin'
}

export async function initAuth() {
  const { data } = await getSession()

  if (data?.session) {
    store.sesion = data.session
    await cargarUsuario(data.session.user.id)
  }

  onAuthChange(async (event, session) => {
    if (event === 'SIGNED_IN' && session) {
      store.sesion = session
      await cargarUsuario(session.user.id)
    } else if (event === 'SIGNED_OUT') {
      store.sesion = null
      store.usuario = null
      store.carrito = []
      store.carritoCount = 0
    }
  })
}
