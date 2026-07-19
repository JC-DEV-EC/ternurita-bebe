export function renderAdminSidebar(container) {
  const links = [
    { href: '#/admin', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { href: '#/admin/productos', label: 'Productos', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
    { href: '#/admin/pedidos', label: 'Pedidos', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { href: '#/admin/usuarios', label: 'Usuarios', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
  ]

  const hashActual = window.location.hash
  const collapsed = localStorage.getItem('admin-sidebar-collapsed') === 'true'

  container.innerHTML = `
    <nav class="admin-sidebar ${collapsed ? 'admin-sidebar--collapsed' : ''}">
      ${links.map(link => `
        <a href="${link.href}"
           class="admin-sidebar__link ${hashActual === link.href ? 'admin-sidebar__link--active' : ''}">
          <svg class="admin-sidebar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="${link.icon}"/>
          </svg>
          <span class="admin-sidebar__label">${link.label}</span>
        </a>
      `).join('')}
    </nav>
  `

  const toggle = document.createElement('button')
  toggle.className = 'admin-sidebar-toggle'
  toggle.setAttribute('aria-label', 'Alternar menú lateral')
  toggle.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="3" y1="6" x2="21" y2="6"/>
      <line x1="3" y1="12" x2="21" y2="12"/>
      <line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  `

  const main = container.closest('.admin-layout')?.querySelector('.admin-main')
  if (main && !main.querySelector('.admin-sidebar-toggle')) {
    main.prepend(toggle)
  }

  toggle.addEventListener('click', () => {
    const sidebar = container.querySelector('.admin-sidebar')
    const layout = container.closest('.admin-layout')
    const isNowCollapsed = !sidebar.classList.contains('admin-sidebar--collapsed')
    sidebar.classList.toggle('admin-sidebar--collapsed', isNowCollapsed)
    main?.classList.toggle('admin-main--expanded', isNowCollapsed)
    toggle.classList.toggle('admin-sidebar-toggle--collapsed', isNowCollapsed)
    localStorage.setItem('admin-sidebar-collapsed', isNowCollapsed)
  })

  if (collapsed) {
    main?.classList.add('admin-main--expanded')
    toggle.classList.add('admin-sidebar-toggle--collapsed')
  }
}
