export function renderAdminSidebar(container) {
  const links = [
    { href: '#/admin', label: 'Dashboard', icon: 'layout-dashboard' },
    { href: '#/admin/productos', label: 'Productos', icon: 'package' },
    { href: '#/admin/pedidos', label: 'Pedidos', icon: 'clipboard-list' },
    { href: '#/admin/usuarios', label: 'Usuarios', icon: 'users' },
  ]

  const hashActual = window.location.hash
  const collapsed = localStorage.getItem('admin-sidebar-collapsed') === 'true'

  container.innerHTML = `
    <nav class="admin-sidebar ${collapsed ? 'admin-sidebar--collapsed' : ''}">
      ${links.map(link => `
        <a href="${link.href}"
           class="admin-sidebar__link ${hashActual === link.href ? 'admin-sidebar__link--active' : ''}">
          <i data-lucide="${link.icon}" class="admin-sidebar__icon"></i>
          <span class="admin-sidebar__label">${link.label}</span>
        </a>
      `).join('')}
    </nav>
  `

  const toggle = document.createElement('button')
  toggle.className = 'admin-sidebar-toggle'
  toggle.setAttribute('aria-label', 'Alternar menú lateral')
  toggle.innerHTML = `
    <i data-lucide="menu" style="width:20px;height:20px"></i>
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
