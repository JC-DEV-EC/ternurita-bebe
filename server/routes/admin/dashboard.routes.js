const { Router } = require('express');
const { authMiddleware } = require('../../middleware/auth.middleware');
const { adminMiddleware } = require('../../middleware/admin.middleware');
const { supabase } = require('../../config/supabase');
const logger = require('../../utils/logger');

const router = Router();

router.use(authMiddleware, adminMiddleware);

router.get('/', async (_req, res) => {
  try {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

    const [productos, pedidos, usuarios, pedidosHoy, ingresos, clientes] = await Promise.all([
      supabase.from('productos').select('count', { count: 'exact', head: true }).is('deleted_at', null),
      supabase.from('pedidos').select('count', { count: 'exact', head: true }),
      supabase.from('perfiles').select('count', { count: 'exact', head: true }),
      supabase.from('pedidos').select('count', { count: 'exact', head: true }).gte('fecha_pedido', today.toISOString()).lt('fecha_pedido', tomorrow.toISOString()),
      supabase.from('pedidos').select('total_pedido'),
      supabase.from('pedidos').select('cliente_id'),
    ]);

    const ingresosTotales = (ingresos.data || []).reduce((sum, p) => sum + (p.total_pedido || 0), 0);
    const clientesUnicos = new Set((clientes.data || []).map(p => p.cliente_id).filter(Boolean));

    res.json({
      productos: productos.count || 0,
      pedidos_totales: pedidos.count || 0,
      pedidos_hoy: pedidosHoy.count || 0,
      usuarios: usuarios.count || 0,
      clientes: clientesUnicos.size,
      ingresos_totales: ingresosTotales,
    });
  } catch (err) {
    logger.error({ error: err.message }, 'Error obteniendo dashboard stats');
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

module.exports = router;
