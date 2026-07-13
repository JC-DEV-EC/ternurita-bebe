const colores = {
  success: 'bg-green-500',
  error: 'bg-red-500',
  info: 'bg-blue-500',
  warning: 'bg-yellow-500 text-gray-900',
}

export function showToast(mensaje, tipo = 'info', duracion = 3000) {
  const container = document.getElementById('toast-container')
  if (!container) return

  const toast = document.createElement('div')
  toast.className = `${colores[tipo] || colores.info} text-white px-4 py-3 rounded-lg shadow-lg mb-2 transition-all duration-300 opacity-0 translate-x-4 max-w-sm`
  toast.textContent = mensaje
  container.appendChild(toast)

  requestAnimationFrame(() => {
    toast.classList.remove('opacity-0', 'translate-x-4')
  })

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-x-4')
    setTimeout(() => toast.remove(), 300)
  }, duracion)
}
