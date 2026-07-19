import { renderAdminSidebar } from '../../components/AdminSidebar.js'
import { openModal, cerrarModal } from '../../components/Modal.js'
import { productos } from '../../services/admin.service.js'
import { listar as listarCategorias } from '../../services/categorias.service.js'
import { showToast } from '../../utils.js'

export default function render() {
  return `
    <div class="admin-layout">
      <div id="admin-sidebar"></div>
      <div class="admin-main">
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:var(--space-md);margin-bottom:var(--space-xl)">
          <div>
            <span class="badge">Admin</span>
            <h1 class="headline-display">Productos</h1>
          </div>
          <button id="btn-crear-producto" class="btn btn--primary">+ Nuevo producto</button>
        </div>
        <p style="font-size:var(--text-caption);color:var(--text-secondary);margin-bottom:var(--space-md)" id="productos-count">Cargando...</p>
        <div id="productos-table-wrap" style="background:var(--bg-primary);border:1px solid var(--border-light);border-radius:18px;overflow:hidden">
          <div style="overflow-x:auto">
            <table style="width:100%;border-collapse:collapse" id="productos-table">
              <thead>
                <tr style="border-bottom:1px solid var(--border-light)">
                  <th style="text-align:left;padding:var(--space-sm) var(--space-md);font-size:var(--text-small);font-weight:var(--weight-semibold);text-transform:uppercase;letter-spacing:var(--tracking-wide);color:var(--text-tertiary);width:48px">Imagen</th>
                  <th style="text-align:left;padding:var(--space-sm) var(--space-md);font-size:var(--text-small);font-weight:var(--weight-semibold);text-transform:uppercase;letter-spacing:var(--tracking-wide);color:var(--text-tertiary)">Nombre</th>
                  <th style="text-align:left;padding:var(--space-sm) var(--space-md);font-size:var(--text-small);font-weight:var(--weight-semibold);text-transform:uppercase;letter-spacing:var(--tracking-wide);color:var(--text-tertiary)">Precio</th>
                  <th style="text-align:left;padding:var(--space-sm) var(--space-md);font-size:var(--text-small);font-weight:var(--weight-semibold);text-transform:uppercase;letter-spacing:var(--tracking-wide);color:var(--text-tertiary)">Stock</th>
                  <th style="text-align:left;padding:var(--space-sm) var(--space-md);font-size:var(--text-small);font-weight:var(--weight-semibold);text-transform:uppercase;letter-spacing:var(--tracking-wide);color:var(--text-tertiary)">Categoría</th>
                  <th style="text-align:right;padding:var(--space-sm) var(--space-md);font-size:var(--text-small);font-weight:var(--weight-semibold);text-transform:uppercase;letter-spacing:var(--tracking-wide);color:var(--text-tertiary)">Acciones</th>
                </tr>
              </thead>
              <tbody id="productos-table-body">
                <tr><td colspan="6" style="text-align:center;padding:var(--space-2xl) 0;color:var(--text-tertiary)">Cargando...</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `
}

export async function afterRender() {
  const sidebar = document.getElementById('admin-sidebar')
  if (sidebar) renderAdminSidebar(sidebar)

  await cargarProductos()

  document.getElementById('btn-crear-producto')?.addEventListener('click', () => {
    abrirModalProducto(null)
  })
}

async function cargarProductos() {
  const tbody = document.getElementById('productos-table-body')
  if (!tbody) return

  try {
    const data = await productos.listar()
    const count = document.getElementById('productos-count')
    if (count) count.textContent = `${data.length} producto(s)`

    if (!data || data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:var(--space-2xl) 0;color:var(--text-tertiary)">No hay productos</td></tr>'
      return
    }

    tbody.innerHTML = data.map(p => {
      const imgUrl = p.imagenes?.[0]?.url
      return `
      <tr style="border-bottom:1px solid var(--border-light);transition:background var(--duration-fast) var(--ease-smooth)">
        <td style="padding:var(--space-sm) var(--space-md)">
          <div style="width:40px;height:40px;border-radius:8px;overflow:hidden;background:var(--bg-secondary)">
            ${imgUrl ? `<img src="${imgUrl}" alt="" style="width:100%;height:100%;object-fit:cover">` : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:1rem;color:var(--text-tertiary)">📦</div>`}
          </div>
        </td>
        <td style="padding:var(--space-sm) var(--space-md)">
          <span style="font-weight:var(--weight-medium)">${p.nombre}</span>
        </td>
        <td style="padding:var(--space-sm) var(--space-md)">
          <span style="font-weight:var(--weight-semibold)">$${(p.precio_oferta || p.precio).toFixed(2)}</span>
          ${p.precio_oferta ? `<span style="font-size:var(--text-small);color:var(--text-tertiary);text-decoration:line-through;margin-left:4px">$${p.precio.toFixed(2)}</span>` : ''}
        </td>
        <td style="padding:var(--space-sm) var(--space-md)">
          <span style="${p.stock_total > 0 ? '' : 'color:#DC2626;font-weight:var(--weight-medium)'}">${p.stock_total || 0}</span>
        </td>
        <td style="padding:var(--space-sm) var(--space-md);color:var(--text-secondary)">${p.categorias?.nombre || '-'}</td>
        <td style="padding:var(--space-sm) var(--space-md);text-align:right">
          <button class="btn-editar" style="font-size:var(--text-caption);color:var(--accent);margin-right:var(--space-md);transition:color var(--duration-fast) var(--ease-smooth)" data-id="${p.id}">Editar</button>
          <button class="btn-eliminar" style="font-size:var(--text-caption);color:#DC2626;transition:color var(--duration-fast) var(--ease-smooth)" data-id="${p.id}">Eliminar</button>
        </td>
      </tr>
    `}
  ).join('')

    tbody.querySelectorAll('.btn-editar').forEach(btn => {
      btn.addEventListener('mouseenter', () => { btn.style.opacity = '0.7' })
      btn.addEventListener('mouseleave', () => { btn.style.opacity = '1' })
      btn.addEventListener('click', async () => {
        const id = parseInt(btn.dataset.id)
        try {
          const all = await productos.listar()
          const prod = all.find(p => p.id === id)
          if (prod) abrirModalProducto(prod)
        } catch {}
      })
    })

    tbody.querySelectorAll('.btn-eliminar').forEach(btn => {
      btn.addEventListener('mouseenter', () => { btn.style.opacity = '0.7' })
      btn.addEventListener('mouseleave', () => { btn.style.opacity = '1' })
      btn.addEventListener('click', async () => {
        if (!confirm('¿Eliminar este producto?')) return
        try {
          await productos.eliminar(parseInt(btn.dataset.id))
          showToast('Producto eliminado', 'success')
          await cargarProductos()
        } catch (err) {
          showToast(err.message, 'error')
        }
      })
    })
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:var(--space-2xl) 0;color:#DC2626">Error: ${err.message}</td></tr>`
  }
}

async function abrirModalProducto(producto) {
  const { data: categorias } = await listarCategorias()
  const esEdicion = !!producto
  const imagenes = producto?.imagenes || []
  const imagenesHtml = esEdicion ? `
    <div style="margin-bottom:var(--space-md)" id="imagenes-section">
      <label style="display:block;font-size:var(--text-caption);font-weight:var(--weight-medium);color:var(--text-secondary);margin-bottom:var(--space-xs)">Imágenes</label>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(80px,1fr));gap:var(--space-sm);margin-bottom:var(--space-sm)" id="imagenes-grid">
        ${imagenes.map(img => `
          <div style="position:relative;width:100%;aspect-ratio:1;border-radius:8px;overflow:hidden;background:var(--bg-secondary);border:1px solid var(--border-light)" data-img-id="${img.id}">
            <img src="${img.url}" alt="" style="width:100%;height:100%;object-fit:cover;display:block;cursor:pointer" class="admin-img-preview">
            <button type="button" class="btn-del-img" data-img-id="${img.id}" style="position:absolute;top:2px;right:2px;width:20px;height:20px;border-radius:50%;background:rgba(0,0,0,0.5);color:white;font-size:12px;display:flex;align-items:center;justify-content:center;border:none;cursor:pointer;opacity:0;transition:opacity var(--duration-fast)">✕</button>
          </div>
        `).join('')}
      </div>
      <label style="display:inline-flex;align-items:center;gap:var(--space-xs);font-size:var(--text-caption);color:var(--accent);cursor:pointer">
        <input type="file" id="fp-imagen-subir" accept="image/*" style="display:none">
        + Agregar imagen
      </label>
    </div>
  ` : `
    <div style="margin-bottom:var(--space-md)">
      <label style="display:block;font-size:var(--text-caption);font-weight:var(--weight-medium);color:var(--text-secondary);margin-bottom:var(--space-xs)">Imagen</label>
      <div id="preview-nueva" style="display:none;width:120px;height:120px;border-radius:8px;overflow:hidden;background:var(--bg-secondary);margin-bottom:var(--space-sm);border:1px solid var(--border-light)"></div>
      <label style="display:inline-flex;align-items:center;gap:var(--space-xs);font-size:var(--text-caption);color:var(--accent);cursor:pointer">
        <input type="file" id="fp-imagen-subir" accept="image/*" style="display:none">
        + Agregar imagen
      </label>
    </div>
  `

  const html = `
    <form id="form-producto">
      <div style="margin-bottom:var(--space-md)">
        <label style="display:block;font-size:var(--text-caption);font-weight:var(--weight-medium);color:var(--text-secondary);margin-bottom:var(--space-xs)">Nombre</label>
        <input type="text" id="fp-nombre" class="input" value="${producto?.nombre || ''}" required>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-md);margin-bottom:var(--space-md)">
        <div>
          <label style="display:block;font-size:var(--text-caption);font-weight:var(--weight-medium);color:var(--text-secondary);margin-bottom:var(--space-xs)">Precio</label>
          <input type="number" step="0.01" id="fp-precio" class="input" value="${producto?.precio || ''}" required>
        </div>
        <div>
          <label style="display:block;font-size:var(--text-caption);font-weight:var(--weight-medium);color:var(--text-secondary);margin-bottom:var(--space-xs)">Precio oferta</label>
          <input type="number" step="0.01" id="fp-precio-oferta" class="input" value="${producto?.precio_oferta || ''}">
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-md);margin-bottom:var(--space-md)">
        <div>
          <label style="display:block;font-size:var(--text-caption);font-weight:var(--weight-medium);color:var(--text-secondary);margin-bottom:var(--space-xs)">Stock</label>
          <input type="number" id="fp-stock" class="input" value="${producto?.stock_total || 0}" required>
        </div>
        <div>
          <label style="display:block;font-size:var(--text-caption);font-weight:var(--weight-medium);color:var(--text-secondary);margin-bottom:var(--space-xs)">SKU</label>
          <input type="text" id="fp-sku" class="input" value="${producto?.sku || ''}">
        </div>
      </div>
      <div style="margin-bottom:var(--space-md)">
        <label style="display:block;font-size:var(--text-caption);font-weight:var(--weight-medium);color:var(--text-secondary);margin-bottom:var(--space-xs)">Slug</label>
        <input type="text" id="fp-slug" class="input" value="${producto?.slug || ''}" required>
      </div>
      <div style="margin-bottom:var(--space-md)">
        <label style="display:block;font-size:var(--text-caption);font-weight:var(--weight-medium);color:var(--text-secondary);margin-bottom:var(--space-xs)">Categoría</label>
        <select id="fp-categoria" class="input">
          <option value="">Sin categoría</option>
          ${(categorias || []).map(c => `
            <option value="${c.id}" ${producto?.categoria_id === c.id ? 'selected' : ''}>${c.nombre}</option>
          `).join('')}
        </select>
      </div>
      <div style="margin-bottom:var(--space-md)">
        <label style="display:block;font-size:var(--text-caption);font-weight:var(--weight-medium);color:var(--text-secondary);margin-bottom:var(--space-xs)">Descripción</label>
        <textarea id="fp-descripcion" class="input" rows="3" style="resize:none">${producto?.descripcion || ''}</textarea>
      </div>
      <div style="display:flex;align-items:center;gap:var(--space-sm);margin-bottom:var(--space-lg)">
        <input type="checkbox" id="fp-destacado" ${producto?.destacado ? 'checked' : ''} style="width:16px;height:16px;accent-color:var(--accent)">
        <label for="fp-destacado" style="font-size:var(--text-caption);color:var(--text-secondary)">Producto destacado</label>
      </div>
      ${imagenesHtml}
      <button type="submit" class="btn btn--primary" style="width:100%">${esEdicion ? 'Guardar cambios' : 'Crear producto'}</button>
    </form>
  `

  openModal(esEdicion ? 'Editar producto' : 'Nuevo producto', html)

  const subirInput = document.getElementById('fp-imagen-subir')
  subirInput?.addEventListener('change', async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (esEdicion) {
      try {
        await productos.subirImagen(producto.id, file)
        showToast('Imagen subida', 'success')
        const all = await productos.listar()
        const prod = all.find(p => p.id === producto.id)
        if (prod) abrirModalProducto(prod)
      } catch (err) {
        showToast(err.message, 'error')
      }
    } else {
      const reader = new FileReader()
      reader.onload = (ev) => {
        const preview = document.getElementById('preview-nueva')
        if (preview) {
          preview.innerHTML = `<img src="${ev.target.result}" alt="" style="width:100%;height:100%;object-fit:cover;display:block">`
          preview.style.display = 'block'
        }
      }
      reader.readAsDataURL(file)
    }
    e.target.value = ''
  })

  document.querySelectorAll('.admin-img-preview').forEach(img => {
    img.addEventListener('click', () => {
      window.open(img.src, '_blank')
    })
  })

  document.querySelectorAll('.btn-del-img').forEach(btn => {
    const parent = btn.closest('[data-img-id]')
    parent?.addEventListener('mouseenter', () => { btn.style.opacity = '1' })
    parent?.addEventListener('mouseleave', () => { btn.style.opacity = '0' })
    btn.addEventListener('click', async (e) => {
      e.stopPropagation()
      if (!confirm('¿Eliminar esta imagen?')) return
      try {
        await productos.eliminarImagen(producto.id, parseInt(btn.dataset.imgId))
        showToast('Imagen eliminada', 'success')
        const all = await productos.listar()
        const prod = all.find(p => p.id === producto.id)
        if (prod) abrirModalProducto(prod)
      } catch (err) {
        showToast(err.message, 'error')
      }
    })
  })

  document.getElementById('form-producto')?.addEventListener('submit', async (e) => {
    e.preventDefault()
    const data = {
      nombre: document.getElementById('fp-nombre').value.trim(),
      precio: parseFloat(document.getElementById('fp-precio').value),
      precio_oferta: parseFloat(document.getElementById('fp-precio-oferta').value) || null,
      stock_total: parseInt(document.getElementById('fp-stock').value),
      sku: document.getElementById('fp-sku').value.trim() || null,
      slug: document.getElementById('fp-slug').value.trim(),
      categoria_id: parseInt(document.getElementById('fp-categoria').value) || null,
      descripcion: document.getElementById('fp-descripcion').value.trim() || null,
      destacado: document.getElementById('fp-destacado').checked,
    }

    const btn = e.target.querySelector('button[type="submit"]')
    btn.disabled = true
    btn.textContent = 'Guardando...'

    try {
      if (esEdicion) {
        await productos.actualizar(producto.id, data)
        showToast('Producto actualizado', 'success')
      } else {
        await productos.crear(data)
        showToast('Producto creado', 'success')
      }
      cerrarModal()
      await cargarProductos()
    } catch (err) {
      showToast(err.message, 'error')
      btn.disabled = false
      btn.textContent = esEdicion ? 'Guardar cambios' : 'Crear producto'
    }
  })
}
