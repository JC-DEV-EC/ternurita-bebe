const { expressJwtSecret } = require('jwks-rsa');

const jwksUrl = process.env.SUPABASE_JWKS_URL ||
  `${process.env.SUPABASE_URL}/auth/v1/.well-known/jwks.json`;

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  const token = header.split(' ')[1];

  const getSigningKey = expressJwtSecret({
    jwksUri: jwksUrl,
    cache: true,
    rateLimit: true,
  });

  const verifyJwt = () => {
    return new Promise((resolve, reject) => {
      getSigningKey({ kid: null }, (err, key) => {
        if (err || !key) return reject(new Error('Error obteniendo clave de verificación'));

        const jwt = require('jsonwebtoken');
        jwt.verify(token, key.getPublicKey(), { algorithms: ['RS256'] }, (err, decoded) => {
          if (err) return reject(err);
          resolve(decoded);
        });
      });
    });
  };

  verifyJwt()
    .then((payload) => {
      req.user = {
        id: payload.sub,
        email: payload.email,
        rol: payload.app_metadata?.rol || payload.user_metadata?.rol || 'cliente',
        metadata: payload.app_metadata || {},
      };
      next();
    })
    .catch((err) => {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expirado' });
      }
      return res.status(401).json({ error: 'Token inválido' });
    });
}

module.exports = { authMiddleware };
