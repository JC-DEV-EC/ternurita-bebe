const { supabase, isConfigured } = require('../config/supabase');
const { datosBancarios } = require('../config/pagos');
const logger = require('../utils/logger');

function obtenerDatosBancarios(_req, res) {
  res.json({ datos_bancarios: datosBancarios });
}

async function reportarPago(req, res) {
  try {
    if (!isConfigured) return res.status(503).json({ error: 'Base de datos no configurada' });

    const pedidoId = parseInt(req.params.pedidoId);
    if (!pedidoId) return res.status(400).json({ error: 'Pedido inválido' });

    const referencia = (req.body?.referencia || '').toString().trim();
    if (referencia.length < 6) {
      return res.status(400).json({ error: 'Ingresa el número de comprobante (mín. 6 caracteres)' });
    }

    const { data: pedido, error: fetchError } = await supabase
      .from('pedidos')
      .select('id, estado, estado_pago')
      .eq('id', pedidoId)
      .eq('cliente_id', req.user.id)
      .single();

    if (fetchError) {
      if (fetchError.message?.includes('column')) {
        return res.status(503).json({
          error: 'Configuración incompleta: ejecuta la migración supabase/migrations/003_pagos_banca_movil.sql en Supabase',
        });
      }
      throw fetchError;
    }
    if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' });
    if (pedido.estado !== 'pendiente') {
      return res.status(400).json({ error: 'Este pedido no acepta pagos en este estado' });
    }
    if (pedido.estado_pago === 'pagado') {
      return res.status(400).json({ error: 'Este pedido ya fue pagado' });
    }

    const { data, error } = await supabase
      .from('pedidos')
      .update({
        metodo_pago: 'banca_movil',
        estado_pago: 'en_revision',
        pago_referencia: referencia,
        updated_at: new Date().toISOString(),
      })
      .eq('id', pedidoId)
      .select('id, estado, estado_pago, pago_referencia')
      .single();

    if (error) throw error;

    logger.info({ pedido_id: pedidoId, referencia }, 'Pago reportado por transferencia');
    res.json({
      message: 'Pago reportado. Lo verificaremos y te confirmaremos.',
      pedido: data,
    });
  } catch (err) {
    logger.error({ error: err.message, pedido_id: req.params.pedidoId }, 'Error reportando pago');
    res.status(500).json({ error: 'Error al reportar el pago' });
  }
}

async function cancelarPedido(req, res) {
  try {
    if (!isConfigured) return res.status(503).json({ error: 'Base de datos no configurada' });

    const pedidoId = parseInt(req.params.pedidoId);
    if (!pedidoId) return res.status(400).json({ error: 'Pedido inválido' });

    const { data, error } = await supabase.rpc('cancelar_pedido', {
      p_pedido_id: pedidoId,
      p_cliente_id: req.user.id,
    });

    if (error) {
      if (error.code === 'NOPED') return res.status(404).json({ error: 'Pedido no encontrado' });
      if (error.code === 'NOCAN') {
        return res.status(400).json({ error: 'Solo se pueden cancelar pedidos pendientes' });
      }
      throw error;
    }

    logger.info({ pedido_id: pedidoId }, 'Pedido cancelado por el cliente (stock restaurado)');
    res.json({ message: 'Pedido cancelado correctamente', pedido: data });
  } catch (err) {
    logger.error({ error: err.message, pedido_id: req.params.pedidoId }, 'Error cancelando pedido');
    res.status(500).json({ error: 'Error al cancelar el pedido' });
  }
}

module.exports = { obtenerDatosBancarios, reportarPago, cancelarPedido };