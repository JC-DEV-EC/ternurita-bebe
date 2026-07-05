const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  const token = header.split(' ')[1];

  try {
    const secret = process.env.SUPABASE_JWT_SECRET;
    if (!secret) {
      throw new Error('SUPABASE_JWT_SECRET no configurado');
    }

    const payload = jwt.verify(token, secret, {
      algorithms: ['HS256'],
    });

    req.user = {
      id: payload.sub,
      email: payload.email,
      rol: payload.app_metadata?.rol || payload.user_metadata?.rol || 'cliente',
      metadata: payload.app_metadata || {},
    };

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado' });
    }
    return res.status(401).json({ error: 'Token inválido' });
  }
}

module.exports = { authMiddleware };
