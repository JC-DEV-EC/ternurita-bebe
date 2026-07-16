const { Router } = require('express');
const { authLimiter } = require('../middleware/rateLimiter.middleware');
const { forgotPassword, resetPassword } = require('../controllers/auth.controller');

const router = Router();

router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', authLimiter, resetPassword);

module.exports = router;
