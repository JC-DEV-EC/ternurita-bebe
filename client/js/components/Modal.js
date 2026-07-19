export function openModal(titulo, contenidoHTML) {
  const overlay = document.createElement('div')
  overlay.className = 'modal-backdrop'
  overlay.id = 'modal-overlay'

  overlay.innerHTML = `
    <div class="modal">
      <div class="modal__header">
        <h2 class="modal__title">${titulo}</h2>
        <button class="modal__close btn-cerrar-modal">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="M4 4l8 8M12 4l-8 8"/>
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
