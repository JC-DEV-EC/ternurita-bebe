const { Router } = require('express');
const { authMiddleware } = require('../../middleware/auth.middleware');
const { adminMiddleware } = require('../../middleware/admin.middleware');
const { listar, obtenerDetalle, cambiarEstado, confirmarPago, rechazarPago } = require('../../controllers/admin/pedidos.controller');

const router = Router();

router.use(authMiddleware, adminMiddleware);

router.get('/', listar);
router.get('/:id', obtenerDetalle);
router.put('/:id/estado', cambiarEstado);
router.post('/:id/pago/confirmar', confirmarPago);
router.post('/:id/pago/rechazar', rechazarPago);

module.exports = router;
