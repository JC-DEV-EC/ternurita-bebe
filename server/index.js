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
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        'https://cdn.tailwindcss.com',
      ],
      connectSrc: [
        "'self'",
        'https://fssandkzjzplyuluwrbq.supabase.co',
        'https://*.supabase.co',
      ],
      imgSrc: ["'self'", 'data:', 'https://*.supabase.co'],
      fontSrc: ["'self'", 'https://cdn.tailwindcss.com'],
    },
  },
}));
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
app.use('/api/admin', apiLimiter, adminRoutes);

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client', 'index.html'));
});

app.use(errorHandler);

if (require.main === module) {
  app.listen(PORT, () => {
    logger.info(`Servidor corriendo en puerto ${PORT}`);
  });
}

module.exports = app;
