const { supabase } = require('../config/supabase');
const logger = require('../utils/logger');

async function searchProductos(req, res) {
  try {
    const { q, page = 1, limit = 20 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({ error: 'Término de búsqueda requerido (mín. 2 caracteres)' });
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const term = `%${q.trim()}%`;

    const { data, error, count } = await supabase
      .from('productos')
      .select('*, imagenes(url), categorias(nombre, slug)', { count: 'exact' })
      .is('deleted_at', null)
      .or(`nombre.ilike.${term},descripcion.ilike.${term},marca.ilike.${term},sku.ilike.${term}`)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    res.json({
      data,
      query: q,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count,
        total_pages: Math.ceil(count / limit),
      },
    });
  } catch (err) {
    logger.error({ error: err.message }, 'Error buscando productos');
    res.status(500).json({ error: 'Error en la búsqueda' });
  }
}

module.exports = { searchProductos };
