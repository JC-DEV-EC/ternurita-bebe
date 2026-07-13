import { login } from '../auth.js'

export default function render() {
  return `
    <div class="min-h-[70vh] flex items-center justify-center px-4 py-12 fade-in">
      <div class="bg-white rounded-xl shadow-md p-8 w-full max-w-md">
        <h1 class="text-2xl font-bold text-gray-800 mb-6 text-center">Iniciar sesión</h1>
        <form id="login-form">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" id="login-email" class="input-field" placeholder="tu@email.com" required autocomplete="email">
          </div>
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input type="password" id="login-password" class="input-field" placeholder="••••••••" required autocomplete="current-password">
          </div>
          <button type="submit" class="btn-primary w-full" id="login-submit">Entrar</button>
        </form>
        <p class="text-center text-sm text-gray-500 mt-4">
          ¿No tienes cuenta? <a href="#/registro" class="text-pink-500 hover:text-pink-600 font-medium">Regístrate</a>
        </p>
      </div>
    </div>
  `
}

export function afterRender() {
  console.log('login afterRender called')
  const form = document.getElementById('login-form')
  const submitBtn = document.getElementById('login-submit')

  console.log('form:', !!form, 'btn:', !!submitBtn)

  form?.addEventListener('submit', async (e) => {
    e.preventDefault()
    console.log('form submit event')
    const email = document.getElementById('login-email').value.trim()
    const password = document.getElementById('login-password').value
    console.log('email:', email, 'pw length:', password?.length)

    if (!email || !password) {
      console.log('validation failed')
      return
    }

    submitBtn.disabled = true
    submitBtn.textContent = '1: login starting'

    try {
      await login(email, password)
    } catch (err) {
      console.error('Login error:', err)
    }

    submitBtn.disabled = false
    submitBtn.textContent = 'Entrar'
  })
}
