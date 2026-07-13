export function openModal(titulo, contenidoHTML) {
  const overlay = document.createElement('div')
  overlay.className = 'modal-overlay'
  overlay.id = 'modal-overlay'

  overlay.innerHTML = `
    <div class="modal-content p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-bold text-gray-800">${titulo}</h2>
        <button class="btn-cerrar-modal text-gray-400 hover:text-gray-600 transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
      <div id="modal-body">${contenidoHTML}</div>
    </div>
  `

  document.body.appendChild(overlay)

  overlay.querySelector('.btn-cerrar-modal')?.addEventListener('click', cerrarModal)
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) cerrarModal()
  })
}

export function cerrarModal() {
  const overlay = document.getElementById('modal-overlay')
  if (overlay) overlay.remove()
}

export function setModalContent(html) {
  const body = document.getElementById('modal-body')
  if (body) body.innerHTML = html
}
