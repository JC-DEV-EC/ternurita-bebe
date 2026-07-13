import store, { onStoreChange } from './store.js'
import {
  signUp as authSignUp,
  signIn as authSignIn,
  signOut as authSignOut,
  getSession,
  onAuthChange,
} from './services/auth.service.js'
import supabase from './services/supabase.service.js'
import { showToast } from './utils.js'

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
  const { data, error } = await authSignUp(email, password, nombre)
  if (error) {
    showToast(error.message, 'error')
    return { error }
  }

  if (data?.user) {
    const { error: insertError } = await supabase.from('perfiles').insert({
      id: data.user.id,
      nombre_completo: nombre,
      email,
      rol: 'cliente',
    })

    if (insertError) {
      showToast('Error al crear perfil', 'error')
      return { error: insertError }
    }

    store.sesion = data.session
    if (data.user) await cargarUsuario(data.user.id)
  }

  showToast('Cuenta creada correctamente', 'success')
  window.location.hash = '#/'
  return { data }
}

export async function logout() {
  await authSignOut()
  store.sesion = null
  store.usuario = null
  store.carrito = []
  store.carritoCount = 0
  showToast('Sesión cerrada', 'info')
  window.location.hash = '#/'
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
