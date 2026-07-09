const { Router } = require('express');
const { authMiddleware } = require('../middleware/auth.middleware');
const { crearPedido } = require('../controllers/checkout.controller');

const router = Router();

router.post('/', authMiddleware, crearPedido);

module.exports = router;
