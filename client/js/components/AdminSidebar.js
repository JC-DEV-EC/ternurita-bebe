export function renderAdminSidebar(container) {
  const links = [
    { href: '#/admin', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { href: '#/admin/productos', label: 'Productos', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
    { href: '#/admin/pedidos', label: 'Pedidos', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { href: '#/admin/usuarios', label: 'Usuarios', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
  ]

  const hashActual = window.location.hash

  container.innerHTML = `
    <aside class="bg-white rounded-xl shadow-md p-4 shrink-0 w-full md:w-56">
      <nav class="space-y-1">
        ${links.map(link => `
          <a href="${link.href}"
             class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
             ${hashActual === link.href
               ? 'bg-pink-100 text-pink-700'
               : 'text-gray-600 hover:bg-gray-100'
             }">
            <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${link.icon}"/>
            </svg>
            ${link.label}
          </a>
        `).join('')}
      </nav>
    </aside>
  `
}
