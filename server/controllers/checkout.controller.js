const { supabase, isConfigured } = require('../config/supabase');
const { checkoutSchema } = require('../validators/checkout.validator');
const logger = require('../utils/logger');

async function crearPedido(req, res) {
  try {
    if (!isConfigured) {
      return res.status(503).json({ error: 'Base de datos no configurada' });
    }

    const validation = checkoutSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Datos inválidos',
        detalle: validation.error.issues.map(i => ({ campo: i.path.join('.'), mensaje: i.message })),
      });
    }

    const { direccion_envio, notas } = validation.data;
    const clienteId = req.user.id;

    const { data, error } = await supabase.rpc('crear_pedido', {
      p_cliente_id: clienteId,
      p_direccion_envio: direccion_envio,
      p_notas: notas || null,
    });

    if (error) {
      if (error.code === 'CARTE') {
        return res.status(400).json({ error: error.message });
      }
      if (error.code === 'STKIN') {
        return res.status(409).json({ error: error.message });
      }
      throw error;
    }

    logger.info({ pedido_id: data.pedido_id, total: data.total }, 'Pedido creado');

    res.status(201).json({
      message: 'Pedido creado exitosamente',
      pedido: data,
    });
  } catch (err) {
    logger.error({ error: err.message, stack: err.stack }, 'Error al crear pedido');
    res.status(500).json({ error: 'Error al crear el pedido' });
  }
}

module.exports = { crearPedido };
