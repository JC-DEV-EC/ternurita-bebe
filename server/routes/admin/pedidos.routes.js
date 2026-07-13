const { Router } = require('express');
const { authMiddleware } = require('../../middleware/auth.middleware');
const { adminMiddleware } = require('../../middleware/admin.middleware');
const { listar, cambiarEstado } = require('../../controllers/admin/pedidos.controller');

const router = Router();

router.use(authMiddleware, adminMiddleware);

router.get('/', listar);
router.put('/:id/estado', cambiarEstado);

module.exports = router;
