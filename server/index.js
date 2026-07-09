require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const { rateLimiter } = require('./middleware/rateLimiter.middleware');
const { errorHandler } = require('./middleware/errorHandler.middleware');
const logger = require('./utils/logger');

const checkoutRoutes = require('./routes/checkout.routes');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;
const { supabase, isConfigured } = require('./config/supabase');

app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:8080',
  credentials: true,
}));
app.use(morgan('combined', { stream: { write: msg => logger.info(msg.trim()) } }));
app.use(express.json({ limit: '10mb' }));
app.use(rateLimiter);

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

app.use('/api/checkout', checkoutRoutes);
app.use('/api/admin', adminRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Servidor corriendo en puerto ${PORT}`);
});

module.exports = app;
