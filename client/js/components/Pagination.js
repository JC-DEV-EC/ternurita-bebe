export function renderPagination(container, { pagina, paginas, onChange }) {
  if (paginas <= 1) {
    container.innerHTML = ''
    return
  }

  const botones = []

  if (pagina > 1) {
    botones.push({ label: '&laquo;', value: pagina - 1, active: false })
  }

  const maxVisibles = 7
  let inicio = Math.max(1, pagina - Math.floor(maxVisibles / 2))
  let fin = Math.min(paginas, inicio + maxVisibles - 1)
  if (fin - inicio + 1 < maxVisibles) {
    inicio = Math.max(1, fin - maxVisibles + 1)
  }

  if (inicio > 1) {
    botones.push({ label: '1', value: 1, active: false })
    if (inicio > 2) botones.push({ label: '...', value: null, active: false, disabled: true })
  }

  for (let i = inicio; i <= fin; i++) {
    botones.push({ label: i, value: i, active: i === pagina })
  }

  if (fin < paginas) {
    if (fin < paginas - 1) botones.push({ label: '...', value: null, active: false, disabled: true })
    botones.push({ label: paginas, value: paginas, active: false })
  }

  if (pagina < paginas) {
    botones.push({ label: '&raquo;', value: pagina + 1, active: false })
  }

  container.innerHTML = `
    <div class="pagination">
      ${botones.map(b => `
        <button class="pagination__btn ${b.active ? 'pagination__btn--active' : ''}"
                data-page="${b.value}"
                ${b.disabled ? 'disabled' : ''}>
          ${b.label}
        </button>
      `).join('')}
    </div>
  `

  container.querySelectorAll('.pagination__btn:not([disabled])').forEach(btn => {
    btn.addEventListener('click', () => {
      onChange(parseInt(btn.dataset.page))
    })
  })
}
