const { Router } = require('express');
const multer = require('multer');
const { authMiddleware } = require('../middleware/auth.middleware');
const { subirAvatar } = require('../controllers/perfil.controller');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Solo imágenes permitidas'), false)
    }
  },
})

const router = Router()

router.use(authMiddleware)

router.post('/avatar', upload.single('avatar'), subirAvatar)

module.exports = router
