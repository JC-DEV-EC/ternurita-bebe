const { Router } = require('express');
const { authMiddleware } = require('../../middleware/auth.middleware');
const { adminMiddleware } = require('../../middleware/admin.middleware');
const { listar, cambiarRol } = require('../../controllers/admin/usuarios.controller');

const router = Router();

router.use(authMiddleware, adminMiddleware);

router.get('/', listar);
router.put('/:id/rol', cambiarRol);

module.exports = router;
