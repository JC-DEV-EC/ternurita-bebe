const { Router } = require('express');
const { searchProductos } = require('../controllers/search.controller');

const router = Router();

router.get('/productos', searchProductos);

module.exports = router;
