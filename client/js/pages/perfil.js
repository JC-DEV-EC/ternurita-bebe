import store from '../store.js'
import supabase from '../services/supabase.service.js'
import { showToast } from '../utils.js'

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
    <div class="max-w-2xl mx-auto px-4 py-8 fade-in">
      <h1 class="text-3xl font-bold text-gray-800 mb-6">Mi perfil</h1>
      <div class="bg-white rounded-xl shadow-md p-6">
        <form id="perfil-form">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input type="text" id="perfil-nombre" class="input-field" value="${usuario.nombre_completo || ''}" required>
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" id="perfil-email" class="input-field bg-gray-100" value="${usuario.email || ''}" readonly disabled>
            <p class="text-xs text-gray-400 mt-1">El email no se puede cambiar</p>
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
            <input type="tel" id="perfil-telefono" class="input-field" value="${usuario.telefono || ''}" placeholder="Opcional">
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
            <textarea id="perfil-direccion" class="input-field" rows="3" placeholder="Opcional">${usuario.direccion || ''}</textarea>
          </div>
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-1">Rol</label>
            <input type="text" class="input-field bg-gray-100" value="${usuario.rol || 'cliente'}" readonly disabled>
          </div>
          <button type="submit" class="btn-primary w-full" id="perfil-submit">Guardar cambios</button>
        </form>
      </div>
    </div>
  `
}

export async function afterRender() {
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
