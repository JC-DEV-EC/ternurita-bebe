const { Router } = require('express');
const { authLimiter } = require('../middleware/rateLimiter.middleware');
const { forgotPassword, resetPassword, register } = require('../controllers/auth.controller');

const router = Router();

router.post('/register', authLimiter, register);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', authLimiter, resetPassword);

module.exports = router;
