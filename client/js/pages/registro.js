import { register } from '../auth.js'

export default function render() {
  return `
    <div class="min-h-[70vh] flex items-center justify-center px-4 py-12 fade-in" style="padding-top:calc(var(--nav-height) + var(--space-lg))">
      <div class="bg-white rounded-xl shadow-md p-8 w-full max-w-md">
        <h1 class="text-2xl font-bold text-gray-800 mb-6 text-center">Crear cuenta</h1>
        <form id="registro-form">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input type="text" id="reg-nombre" class="input-field" placeholder="Tu nombre" required autocomplete="name">
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" id="reg-email" class="input-field" placeholder="tu@email.com" required autocomplete="email">
          </div>
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input type="password" id="reg-password" class="input-field" placeholder="Mínimo 6 caracteres" required minlength="6" autocomplete="new-password">
          </div>
          <button type="submit" class="btn-primary w-full" id="registro-submit">Crear cuenta</button>
        </form>
        <p class="text-center text-sm text-gray-500 mt-4">
          ¿Ya tienes cuenta? <a href="#/login" class="text-pink-500 hover:text-pink-600 font-medium">Inicia sesión</a>
        </p>
      </div>
    </div>
  `
}

export function afterRender() {
  const form = document.getElementById('registro-form')
  const submitBtn = document.getElementById('registro-submit')

  form?.addEventListener('submit', async (e) => {
    e.preventDefault()
    const nombre = document.getElementById('reg-nombre').value.trim()
    const email = document.getElementById('reg-email').value.trim()
    const password = document.getElementById('reg-password').value

    if (!nombre || !email || !password) {
      return
    }

    if (password.length < 6) {
      return
    }

    submitBtn.disabled = true
    submitBtn.textContent = 'Creando cuenta...'

    try {
      await register(nombre, email, password)
    } catch (err) {
      console.error('Register error:', err)
    }

    submitBtn.disabled = false
    submitBtn.textContent = 'Crear cuenta'
  })
}
