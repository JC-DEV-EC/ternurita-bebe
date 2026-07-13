const { Router } = require('express');
const { authMiddleware } = require('../../middleware/auth.middleware');
const { adminMiddleware } = require('../../middleware/admin.middleware');
const { supabase } = require('../../config/supabase');
const logger = require('../../utils/logger');

const router = Router();

router.use(authMiddleware, adminMiddleware);

router.get('/', async (_req, res) => {
  try {
    const [productos, pedidos, usuarios, categorias] = await Promise.all([
      supabase.from('productos').select('count', { count: 'exact', head: true }).is('deleted_at', null),
      supabase.from('pedidos').select('count', { count: 'exact', head: true }),
      supabase.from('perfiles').select('count', { count: 'exact', head: true }),
      supabase.from('categorias').select('count', { count: 'exact', head: true }).eq('activo', true),
    ]);

    res.json({
      productos: productos.count || 0,
      pedidos: pedidos.count || 0,
      usuarios: usuarios.count || 0,
      categorias: categorias.count || 0,
    });
  } catch (err) {
    logger.error({ error: err.message }, 'Error obteniendo dashboard stats');
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

module.exports = router;
