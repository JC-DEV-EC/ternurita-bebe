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
    const { page = 1, limit = 20, estado, estado_pago, fecha_desde, fecha_hasta } = req.query;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('pedidos')
      .select('*, detalles_pedido(*), perfiles!inner(nombre_completo, telefono, ciudad)', { count: 'exact' });

    if (estado) {
      query = query.eq('estado', estado);
    }
    if (estado_pago) {
      query = query.eq('estado_pago', estado_pago);
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

    let update = {
      estado,
      updated_at: new Date().toISOString(),
    };

    if (estado === 'cancelado') {
      const { error: stockError } = await supabase.rpc('restaurar_stock_pedido', { p_pedido_id: id });
      if (stockError) {
        logger.error({ error: stockError.message, pedido_id: id }, 'Error restaurando stock al cancelar');
      }
    }

    const { data, error } = await supabase
      .from('pedidos')
      .update(update)
      .eq('id', id)
      .select()
      .single();

    const { data: cancelado } = await supabase
      .from('pedidos')
      .update({ estado_pago: 'fallido' })
      .eq('id', id)
      .eq('estado_pago', 'en_revision')
      .select('id')
      .single();

    if (cancelado) {
      logger.info({ pedido_id: id }, 'Pago marcado como fallido por cancelación');
    }

    if (error) throw error;

    logger.info({ pedido_id: id, estado_anterior: estadoActual, estado_nuevo: estado }, 'Estado de pedido cambiado');
    res.json({ message: 'Estado actualizado', pedido: data });
  } catch (err) {
    logger.error({ error: err.message }, 'Error cambiando estado');
    res.status(500).json({ error: 'Error al cambiar estado' });
  }
}

async function obtenerDetalle(req, res) {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('pedidos')
      .select('*, detalles_pedido(*, productos(nombre, slug, precio, imagenes(*))), perfiles!inner(nombre_completo, telefono, ciudad)')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Pedido no encontrado' });

    res.json({ data });
  } catch (err) {
    logger.error({ error: err.message, pedido_id: req.params.id }, 'Error obteniendo detalle de pedido');
    res.status(500).json({ error: 'Error al obtener el pedido' });
  }
}

async function confirmarPago(req, res) {
  try {
    const { id } = req.params;

    const { data: pedido, error: fetchError } = await supabase
      .from('pedidos')
      .select('id, estado, estado_pago')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.message?.includes('column')) {
        return res.status(503).json({
          error: 'Configuración incompleta: ejecuta la migración supabase/migrations/003_pagos_banca_movil.sql en Supabase',
        });
      }
      throw fetchError;
    }
    if (!pedido) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }
    if (pedido.estado_pago !== 'en_revision') {
      return res.status(400).json({ error: 'Solo se puede confirmar un pago en revisión' });
    }

    const { data, error } = await supabase
      .from('pedidos')
      .update({
        estado_pago: 'pagado',
        pagado_at: new Date().toISOString(),
        pago_confirmado_por: req.user.id,
        updated_at: new Date().toISOString(),
        ...(pedido.estado === 'pendiente' ? { estado: 'confirmado' } : {}),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    logger.info({ pedido_id: id, referencia: data.pago_referencia }, 'Pago confirmado por administrador');
    res.json({ message: 'Pago confirmado. Pedido confirmado para despacho.', pedido: data });
  } catch (err) {
    logger.error({ error: err.message, pedido_id: req.params.id }, 'Error confirmando pago');
    res.status(500).json({ error: 'Error al confirmar el pago' });
  }
}

async function rechazarPago(req, res) {
  try {
    const { id } = req.params;

    const { data: pedido, error: fetchError } = await supabase
      .from('pedidos')
      .select('id, estado_pago')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.message?.includes('column')) {
        return res.status(503).json({
          error: 'Configuración incompleta: ejecuta la migración supabase/migrations/003_pagos_banca_movil.sql en Supabase',
        });
      }
      throw fetchError;
    }
    if (!pedido) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }
    if (pedido.estado_pago !== 'en_revision') {
      return res.status(400).json({ error: 'Solo se puede rechazar un pago en revisión' });
    }

    const { data, error } = await supabase
      .from('pedidos')
      .update({
        estado_pago: 'fallido',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    logger.info({ pedido_id: id }, 'Pago rechazado por administrador');
    res.json({ message: 'Pago rechazado. El cliente podrá reintentar.', pedido: data });
  } catch (err) {
    logger.error({ error: err.message, pedido_id: req.params.id }, 'Error rechazando pago');
    res.status(500).json({ error: 'Error al rechazar el pago' });
  }
}

module.exports = { listar, obtenerDetalle, cambiarEstado, confirmarPago, rechazarPago };
