export function openModal(titulo, contenidoHTML) {
  const overlay = document.createElement('div')
  overlay.className = 'modal-backdrop'
  overlay.id = 'modal-overlay'

  overlay.innerHTML = `
    <div class="modal">
      <div class="modal__header">
        <h2 class="modal__title">${titulo}</h2>
        <button class="modal__close btn-cerrar-modal">
          <i data-lucide="x" style="width:18px;height:18px"></i>
        </button>
      </div>
      <div id="modal-body">${contenidoHTML}</div>
    </div>
  `

  document.body.appendChild(overlay)

  if (window.lucide?.createIcons) {
    window.lucide.createIcons()
  }

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
