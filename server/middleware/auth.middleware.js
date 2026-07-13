const { createRemoteJWKSet, jwtVerify } = require('jose');

let JWKS = null;

function getJWKS() {
  if (!JWKS) {
    const url = process.env.SUPABASE_JWKS_URL ||
      `${process.env.SUPABASE_URL}/auth/v1/.well-known/jwks.json`;
    JWKS = createRemoteJWKSet(new URL(url));
  }
  return JWKS;
}

async function authMiddleware(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  const token = header.split(' ')[1];

  try {
    const { payload } = await jwtVerify(token, getJWKS());

    req.user = {
      id: payload.sub,
      email: payload.email,
      rol: payload.app_metadata?.rol || payload.user_metadata?.rol || 'cliente',
      metadata: payload.app_metadata || {},
    };

    next();
  } catch (err) {
    const message = err.code === 'ERR_JWT_EXPIRED' ? 'Token expirado' : 'Token inválido';
    return res.status(401).json({ error: message });
  }
}

module.exports = { authMiddleware };
