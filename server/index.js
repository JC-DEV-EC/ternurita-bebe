require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const { rateLimiter } = require('./middleware/rateLimiter.middleware');
const { errorHandler } = require('./middleware/errorHandler.middleware');
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:8080',
  credentials: true,
}));
app.use(morgan('combined', { stream: { write: msg => logger.info(msg.trim()) } }));
app.use(express.json({ limit: '10mb' }));
app.use(rateLimiter);

app.get('/api/health', (_req, res) => {
  const supabaseReady = Boolean(require('./config/supabase'));
  res.json({
    status: 'ok',
    supabase_connected: supabaseReady,
    timestamp: new Date().toISOString(),
  });
});

app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Servidor corriendo en puerto ${PORT}`);
});

module.exports = app;
