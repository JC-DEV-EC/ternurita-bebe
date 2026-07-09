const { Router } = require('express');
const productosRouter = require('./productos.routes');

const router = Router();

router.use('/productos', productosRouter);

module.exports = router;
