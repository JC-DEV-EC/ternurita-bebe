const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const { globalLimiter, authLimiter, apiLimiter } = require('./middleware/rateLimiter.middleware');
const { errorHandler } = require('./middleware/errorHandler.middleware');
const logger = require('./utils/logger');

const checkoutRoutes = require('./routes/checkout.routes');
const authRoutes = require('./routes/auth.routes');
const searchRoutes = require('./routes/search.routes');
const perfilRoutes = require('./routes/perfil.routes');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;
const { supabase, isConfigured } = require('./config/supabase');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        'https://cdn.tailwindcss.com',
        'https://esm.sh',
        'https://cdnjs.cloudflare.com',
        'https://cdn.jsdelivr.net',
      ],
      scriptSrcAttr: ["'unsafe-inline'"],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        'https://cdn.tailwindcss.com',
      ],
      connectSrc: [
        "'self'",
        'https://fssandkzjzplyuluwrbq.supabase.co',
        'https://*.supabase.co',
        'https://cdn.jsdelivr.net',
      ],
      imgSrc: ["'self'", 'data:', 'https://*.supabase.co', 'https://placehold.co', 'https://placehold.co:443'],
      frameSrc: ["'self'", 'https://www.openstreetmap.org', 'https://openstreetmap.org', 'https://*.tile.openstreetmap.org'],
      fontSrc: ["'self'", 'https://cdn.tailwindcss.com'],
    },
  },
  crossOriginOpenerPolicy: false,
  crossOriginResourcePolicy: false,
  crossOriginEmbedderPolicy: false,
}));

app.use((_req, res, next) => {
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), accelerometer=(), gyroscope=(), display-capture=(), document-domain=()');
  next();
});
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:8080',
  credentials: true,
}));
app.use(morgan('combined', { stream: { write: msg => logger.info(msg.trim()) } }));
app.use(express.json({ limit: '10mb' }));
app.use(globalLimiter);

app.use(express.static(path.join(__dirname, '..', 'client'), {
  setHeaders: (res, path) => {
    if (process.env.NODE_ENV === 'development') {
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    }
  },
}));

app.get('/api/health', async (_req, res) => {
  let dbStatus = false;
  if (isConfigured) {
    const { error } = await supabase.from('auth.users').select('count', { count: 'exact', head: true });
    dbStatus = !error;
  }
  res.json({
    status: 'ok',
    supabase_connected: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/checkout', authLimiter, checkoutRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/perfil', perfilRoutes);
app.use('/api/admin', apiLimiter, adminRoutes);

app.get('/.well-known/security.txt', (_req, res) => {
  res.type('text/plain').send([
    'Contact: mailto:seguridad@ternuritabebe.com',
    'Contact: https://ternuritabebe.com/contacto',
    'Preferred-Languages: es, en',
    'Canonical: https://ternuritabebe.com/.well-known/security.txt',
    'Policy: https://ternuritabebe.com/security-policy',
    'Encryption: https://ternuritabebe.com/pgp-key.txt',
    `Expires: ${new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}`,
    '',
    '# Ternurita Bebe - Security Disclosure',
    '# Please report vulnerabilities to the contacts above.',
  ].join('\n'));
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client', 'index.html'));
});

app.use(errorHandler);

async function checkMigrations() {
  try {
    const { error } = await supabase.from('perfiles').select('avatar_url').limit(1)
    if (!error || !error.message || !error.message.includes('column')) return
    logger.warn('Columna avatar_url no existe en perfiles. Ejecuta en Supabase SQL Editor:')
    logger.warn('  ALTER TABLE public.perfiles ADD COLUMN IF NOT EXISTS avatar_url text;')
    logger.warn('Creando bucket avatars si no existe...')
    const { data: buckets } = await supabase.storage.listBuckets()
    if (!buckets?.find(b => b.name === 'avatars')) {
      await supabase.storage.createBucket('avatars', { public: true })
      logger.info('Bucket avatars creado')
    }
  } catch (e) {
    if (e.message?.includes('column')) {
      logger.warn('Ejecuta en Supabase SQL Editor: ALTER TABLE public.perfiles ADD COLUMN IF NOT EXISTS avatar_url text;')
    }
  }
}

if (require.main === module) {
  app.listen(PORT, () => {
    logger.info(`Servidor corriendo en puerto ${PORT}`);
    checkMigrations()
  });
}

module.exports = app;
