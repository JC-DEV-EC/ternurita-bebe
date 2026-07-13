const { Router } = require('express');
const { authMiddleware } = require('../../middleware/auth.middleware');
const { adminMiddleware } = require('../../middleware/admin.middleware');
const { listar, crear, actualizar, eliminar } = require('../../controllers/admin/categorias.controller');

const router = Router();

router.use(authMiddleware, adminMiddleware);

router.get('/', listar);
router.post('/', crear);
router.put('/:id', actualizar);
router.delete('/:id', eliminar);

module.exports = router;
