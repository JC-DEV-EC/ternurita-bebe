const { Router } = require('express');
const dashboardRouter = require('./dashboard.routes');
const productosRouter = require('./productos.routes');
const pedidosRouter = require('./pedidos.routes');
const usuariosRouter = require('./usuarios.routes');
const categoriasRouter = require('./categorias.routes');

const router = Router();

router.use('/', dashboardRouter);
router.use('/productos', productosRouter);
router.use('/pedidos', pedidosRouter);
router.use('/usuarios', usuariosRouter);
router.use('/categorias', categoriasRouter);

module.exports = router;
