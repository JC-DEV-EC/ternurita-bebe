const { supabase } = require('../../config/supabase');
const logger = require('../../utils/logger');

async function listar(req, res) {
  try {
    const { page = 1, limit = 20, incluir_inactivos } = req.query;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase.from('categorias').select('*', { count: 'exact' });

    if (incluir_inactivos !== 'true') {
      query = query.eq('activo', true);
    }

    const { data, error, count } = await query
      .order('nombre')
      .range(from, to);

    if (error) throw error;

    res.json({
      data,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count,
        total_pages: Math.ceil(count / limit),
      },
    });
  } catch (err) {
    logger.error({ error: err.message }, 'Error listando categorías');
    res.status(500).json({ error: 'Error al listar categorías' });
  }
}

async function crear(req, res) {
  try {
    const { nombre, slug, descripcion, imagen_url } = req.body;

    if (!nombre || nombre.trim().length < 2) {
      return res.status(400).json({ error: 'Nombre requerido (mín. 2 caracteres)' });
    }

    const categoriaSlug = slug || nombre.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    const { data, error } = await supabase
      .from('categorias')
      .insert({ nombre: nombre.trim(), slug: categoriaSlug, descripcion, imagen_url })
      .select()
      .single();

    if (error) throw error;

    logger.info({ categoria_id: data.id, nombre: data.nombre }, 'Categoría creada');
    res.status(201).json({ message: 'Categoría creada', categoria: data });
  } catch (err) {
    logger.error({ error: err.message }, 'Error creando categoría');
    res.status(500).json({ error: 'Error al crear categoría' });
  }
}

async function actualizar(req, res) {
  try {
    const { id } = req.params;
    const { nombre, slug, descripcion, imagen_url, activo } = req.body;

    const updateData = {};
    if (nombre !== undefined) updateData.nombre = nombre.trim();
    if (slug !== undefined) updateData.slug = slug;
    if (descripcion !== undefined) updateData.descripcion = descripcion;
    if (imagen_url !== undefined) updateData.imagen_url = imagen_url;
    if (activo !== undefined) updateData.activo = activo;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No hay datos para actualizar' });
    }

    const { data, error } = await supabase
      .from('categorias')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Categoría no encontrada' });

    logger.info({ categoria_id: id }, 'Categoría actualizada');
    res.json({ message: 'Categoría actualizada', categoria: data });
  } catch (err) {
    logger.error({ error: err.message }, 'Error actualizando categoría');
    res.status(500).json({ error: 'Error al actualizar categoría' });
  }
}

async function eliminar(req, res) {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('categorias')
      .update({ activo: false })
      .eq('id', id);

    if (error) throw error;

    logger.info({ categoria_id: id }, 'Categoría desactivada');
    res.json({ message: 'Categoría desactivada' });
  } catch (err) {
    logger.error({ error: err.message }, 'Error eliminando categoría');
    res.status(500).json({ error: 'Error al eliminar categoría' });
  }
}

module.exports = { listar, crear, actualizar, eliminar };
