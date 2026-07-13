import { renderAdminSidebar } from '../../components/AdminSidebar.js'
import { openModal, cerrarModal, setModalContent } from '../../components/Modal.js'
import { productos } from '../../services/admin.service.js'
import { listar as listarCategorias } from '../../services/categorias.service.js'
import { formatPrecio, showToast } from '../../utils.js'

export default function render() {
  return `
    <div class="max-w-7xl mx-auto px-4 py-8 fade-in">
      <h1 class="text-3xl font-bold text-gray-800 mb-6">Productos</h1>
      <div class="flex flex-col md:flex-row gap-6">
        <div id="admin-sidebar"></div>
        <div class="flex-1">
          <div class="flex items-center justify-between mb-4">
            <p class="text-gray-500" id="productos-count">Cargando...</p>
            <button id="btn-crear-producto" class="btn-primary text-sm">+ Nuevo producto</button>
          </div>
          <div class="bg-white rounded-xl shadow-md overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="text-left px-4 py-3 text-sm font-medium text-gray-500">Nombre</th>
                    <th class="text-left px-4 py-3 text-sm font-medium text-gray-500">Precio</th>
                    <th class="text-left px-4 py-3 text-sm font-medium text-gray-500">Stock</th>
                    <th class="text-left px-4 py-3 text-sm font-medium text-gray-500">Categoría</th>
                    <th class="text-right px-4 py-3 text-sm font-medium text-gray-500">Acciones</th>
                  </tr>
                </thead>
                <tbody id="productos-table-body">
                  <tr><td colspan="5" class="text-center py-8 text-gray-400">Cargando...</td></tr>
                </tbody>
              </table>
            </div>
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
      tbody.innerHTML = '<tr><td colspan="5" class="text-center py-8 text-gray-400">No hay productos</td></tr>'
      return
    }

    tbody.innerHTML = data.map(p => `
      <tr class="border-t border-gray-100 hover:bg-gray-50">
        <td class="px-4 py-3">
          <span class="font-medium text-gray-800">${p.nombre}</span>
        </td>
        <td class="px-4 py-3">
          <span class="font-semibold">${formatPrecio(p.precio_oferta || p.precio)}</span>
          ${p.precio_oferta ? `<span class="text-xs text-gray-400 line-through ml-1">${formatPrecio(p.precio)}</span>` : ''}
        </td>
        <td class="px-4 py-3">
          <span class="${p.stock_total > 0 ? 'text-gray-800' : 'text-red-500 font-medium'}">${p.stock_total || 0}</span>
        </td>
        <td class="px-4 py-3 text-gray-600">${p.categoria_id || '-'}</td>
        <td class="px-4 py-3 text-right">
          <button class="btn-editar text-pink-500 hover:text-pink-600 text-sm font-medium mr-3" data-id="${p.id}">Editar</button>
          <button class="btn-eliminar text-red-500 hover:text-red-600 text-sm font-medium" data-id="${p.id}">Eliminar</button>
        </td>
      </tr>
    `).join('')

    tbody.querySelectorAll('.btn-editar').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = parseInt(btn.dataset.id)
        try {
          const data = await productos.listar()
          const producto = data.find(p => p.id === id)
          if (producto) abrirModalProducto(producto)
        } catch { /* ignore */ }
      })
    })

    tbody.querySelectorAll('.btn-eliminar').forEach(btn => {
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
    tbody.innerHTML = `<tr><td colspan="5" class="text-center py-8 text-red-400">Error: ${err.message}</td></tr>`
  }
}

async function abrirModalProducto(producto) {
  const { data: categorias } = await listarCategorias()
  const esEdicion = !!producto

  const html = `
    <form id="form-producto">
      <div class="mb-3">
        <label class="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
        <input type="text" id="fp-nombre" class="input-field" value="${producto?.nombre || ''}" required>
      </div>
      <div class="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Precio</label>
          <input type="number" step="0.01" id="fp-precio" class="input-field" value="${producto?.precio || ''}" required>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Precio oferta</label>
          <input type="number" step="0.01" id="fp-precio-oferta" class="input-field" value="${producto?.precio_oferta || ''}">
        </div>
      </div>
      <div class="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Stock</label>
          <input type="number" id="fp-stock" class="input-field" value="${producto?.stock_total || 0}" required>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">SKU</label>
          <input type="text" id="fp-sku" class="input-field" value="${producto?.sku || ''}">
        </div>
      </div>
      <div class="mb-3">
        <label class="block text-sm font-medium text-gray-700 mb-1">Slug</label>
        <input type="text" id="fp-slug" class="input-field" value="${producto?.slug || ''}" required>
      </div>
      <div class="mb-3">
        <label class="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
        <select id="fp-categoria" class="input-field">
          <option value="">Sin categoría</option>
          ${(categorias || []).map(c => `
            <option value="${c.id}" ${producto?.categoria_id === c.id ? 'selected' : ''}>${c.nombre}</option>
          `).join('')}
        </select>
      </div>
      <div class="mb-3">
        <label class="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
        <textarea id="fp-descripcion" class="input-field" rows="3">${producto?.descripcion || ''}</textarea>
      </div>
      <div class="flex items-center gap-2 mb-4">
        <input type="checkbox" id="fp-destacado" class="rounded" ${producto?.destacado ? 'checked' : ''}>
        <label for="fp-destacado" class="text-sm text-gray-700">Producto destacado</label>
      </div>
      ${esEdicion ? `
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">Imagen</label>
          <input type="file" id="fp-imagen" class="input-field" accept="image/*">
        </div>
      ` : ''}
      <button type="submit" class="btn-primary w-full">${esEdicion ? 'Guardar cambios' : 'Crear producto'}</button>
    </form>
  `

  openModal(esEdicion ? 'Editar producto' : 'Nuevo producto', html)

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
