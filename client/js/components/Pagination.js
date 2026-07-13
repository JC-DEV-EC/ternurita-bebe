export function renderPagination(container, { pagina, paginas, onChange }) {
  if (paginas <= 1) {
    container.innerHTML = ''
    return
  }

  const botones = []

  if (pagina > 1) {
    botones.push({ label: '&laquo;', value: pagina - 1, active: false })
  }

  for (let i = 1; i <= paginas; i++) {
    botones.push({ label: i, value: i, active: i === pagina })
  }

  if (pagina < paginas) {
    botones.push({ label: '&raquo;', value: pagina + 1, active: false })
  }

  container.innerHTML = `
    <div class="flex items-center justify-center gap-2">
      ${botones.map(b => `
        <button class="btn-page px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
          ${b.active
            ? 'bg-pink-500 text-white'
            : 'bg-white text-gray-600 hover:bg-pink-50 border border-gray-200'
          }"
          data-page="${b.value}">
          ${b.label}
        </button>
      `).join('')}
    </div>
  `

  container.querySelectorAll('.btn-page').forEach(btn => {
    btn.addEventListener('click', () => {
      onChange(parseInt(btn.dataset.page))
    })
  })
}
