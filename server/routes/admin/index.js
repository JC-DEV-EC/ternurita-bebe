const { Router } = require('express');
const productosRouter = require('./productos.routes');
const pedidosRouter = require('./pedidos.routes');
const usuariosRouter = require('./usuarios.routes');

const router = Router();

router.use('/productos', productosRouter);
router.use('/pedidos', pedidosRouter);
router.use('/usuarios', usuariosRouter);

module.exports = router;
