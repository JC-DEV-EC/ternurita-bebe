const { Router } = require('express');
const { authMiddleware } = require('../middleware/auth.middleware');
const { obtenerDatosBancarios, reportarPago, cancelarPedido } = require('../controllers/pagos.controller');

const router = Router();

router.use(authMiddleware);

router.get('/datos', obtenerDatosBancarios);
router.post('/pedidos/:pedidoId/reportar', reportarPago);
router.post('/pedidos/:pedidoId/cancelar', cancelarPedido);

module.exports = router;