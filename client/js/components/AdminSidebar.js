export function renderAdminSidebar(container) {
  const links = [
    { href: '#/admin', label: 'Dashboard', icon: 'layout-dashboard' },
    { href: '#/admin/productos', label: 'Productos', icon: 'package' },
    { href: '#/admin/pedidos', label: 'Pedidos', icon: 'shopping-cart' },
    { href: '#/admin/usuarios', label: 'Usuarios', icon: 'users' },
  ]

  const hashActual = window.location.hash
  const collapsed = localStorage.getItem('admin-sidebar-collapsed') === 'true'

  container.innerHTML = `
    <nav class="admin-sidebar ${collapsed ? 'admin-sidebar--collapsed' : ''}">
      <div class="admin-sidebar__nav">
        ${links.map(link => `
          <a href="${link.href}"
             class="admin-sidebar__link ${hashActual === link.href ? 'admin-sidebar__link--active' : ''}">
            <i data-lucide="${link.icon}" class="admin-sidebar__icon"></i>
            <span class="admin-sidebar__label">${link.label}</span>
          </a>
        `).join('')}
      </div>
    </nav>
  `

  if (window.lucide?.createIcons) {
    window.lucide.createIcons()
  }
}

export function setupAdminToggle() {
  const toggle = document.getElementById('admin-toggle')
  if (!toggle) return
  const sidebar = document.querySelector('.admin-sidebar')
  const main = document.querySelector('.admin-main')
  if (!sidebar) return

  toggle.addEventListener('click', () => {
    const isNowCollapsed = !sidebar.classList.contains('admin-sidebar--collapsed')
    sidebar.classList.toggle('admin-sidebar--collapsed', isNowCollapsed)
    main?.classList.toggle('admin-main--expanded', isNowCollapsed)
    toggle.classList.toggle('admin-sidebar-toggle--collapsed', isNowCollapsed)
    localStorage.setItem('admin-sidebar-collapsed', isNowCollapsed)
  })
}
