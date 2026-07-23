export function renderAdminSidebar(container) {
  const links = [
    { href: '#/admin', label: 'Dashboard', icon: 'layout-dashboard' },
    { href: '#/admin/productos', label: 'Productos', icon: 'package' },
    { href: '#/admin/pedidos', label: 'Pedidos', icon: 'shopping-cart' },
    { href: '#/admin/usuarios', label: 'Usuarios', icon: 'users' },
  ]

  const hashActual = window.location.hash
  const ls = localStorage.getItem('admin-sidebar-collapsed')
  const collapsed = ls !== null ? ls === 'true' : window.innerWidth <= 768

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
      <div class="admin-sidebar__footer">
        <button class="admin-sidebar__link" id="btn-admin-logout" style="width:100%;border:none;background:none;cursor:pointer;font-family:inherit;font-size:inherit;text-align:left">
          <i data-lucide="log-out" class="admin-sidebar__icon"></i>
          <span class="admin-sidebar__label">Salir</span>
        </button>
      </div>
    </nav>
  `

  if (window.lucide?.createIcons) {
    window.lucide.createIcons()
  }

  container.querySelector('#btn-admin-logout')?.addEventListener('click', async () => {
    const { logout } = await import('../auth.js')
    await logout()
  })

  container.querySelector('#btn-admin-logout-mobile')?.addEventListener('click', async () => {
    const { logout } = await import('../auth.js')
    await logout()
  })
}

export function setupAdminToggle() {
  const toggle = document.getElementById('admin-toggle')
  if (!toggle) return
  const sidebar = document.querySelector('.admin-sidebar')
  const main = document.querySelector('.admin-main')
  if (!sidebar) return

  const close = () => {
    sidebar.classList.add('admin-sidebar--collapsed')
    main?.classList.remove('admin-main--expanded')
    toggle?.classList.remove('admin-sidebar-toggle--collapsed')
    localStorage.setItem('admin-sidebar-collapsed', 'true')
  }

  toggle.addEventListener('click', () => {
    if (!sidebar.classList.contains('admin-sidebar--collapsed')) {
      close()
      return
    }
    sidebar.classList.remove('admin-sidebar--collapsed')
    main?.classList.add('admin-main--expanded')
    toggle.classList.add('admin-sidebar-toggle--collapsed')
    localStorage.setItem('admin-sidebar-collapsed', 'false')
  })

  document.getElementById('admin-sidebar-close')?.addEventListener('click', close)

  document.querySelectorAll('.admin-sidebar__link').forEach(link => {
    link.addEventListener('click', (e) => {
      if (link.getAttribute('href') && window.innerWidth <= 768) {
        close()
      }
    })
  })
}
