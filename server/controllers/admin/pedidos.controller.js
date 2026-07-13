const { supabase, isConfigured } = require('../../config/supabase');
const logger = require('../../utils/logger');

const TRANSICIONES_VALIDAS = {
  pendiente: ['confirmado', 'cancelado'],
  confirmado: ['enviado', 'cancelado'],
  enviado: ['entregado', 'cancelado'],
  entregado: [],
  cancelado: [],
};

async function listar(req, res) {
  try {
    const { page = 1, limit = 20, estado, fecha_desde, fecha_hasta } = req.query;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('pedidos')
      .select('*, detalles_pedido(*), perfiles!inner(nombre_completo, telefono, ciudad)', { count: 'exact' });

    if (estado) {
      query = query.eq('estado', estado);
    }
    if (fecha_desde) {
      query = query.gte('fecha_pedido', fecha_desde);
    }
    if (fecha_hasta) {
      query = query.lte('fecha_pedido', fecha_hasta);
    }

    const { data, error, count } = await query
      .order('fecha_pedido', { ascending: false })
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
    logger.error({ error: err.message }, 'Error listando pedidos');
    res.status(500).json({ error: 'Error al listar pedidos' });
  }
}

async function cambiarEstado(req, res) {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    if (!estado) {
      return res.status(400).json({ error: 'Estado requerido' });
    }

    const { data: pedido, error: fetchError } = await supabase
      .from('pedidos')
      .select('id, estado')
      .eq('id', id)
      .single();

    if (fetchError || !pedido) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    const estadoActual = pedido.estado;
    const transicionesPermitidas = TRANSICIONES_VALIDAS[estadoActual];

    if (!transicionesPermitidas || !transicionesPermitidas.includes(estado)) {
      return res.status(400).json({
        error: `Transición inválida: de "${estadoActual}" a "${estado}". Permitidas: ${(transicionesPermitidas || []).join(', ') || 'ninguna'}`,
      });
    }

    const { data, error } = await supabase
      .from('pedidos')
      .update({ estado, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    logger.info({ pedido_id: id, estado_anterior: estadoActual, estado_nuevo: estado }, 'Estado de pedido cambiado');
    res.json({ message: 'Estado actualizado', pedido: data });
  } catch (err) {
    logger.error({ error: err.message }, 'Error cambiando estado');
    res.status(500).json({ error: 'Error al cambiar estado' });
  }
}

module.exports = { listar, cambiarEstado };
