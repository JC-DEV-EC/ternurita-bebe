const logger = require('../utils/logger');

function errorHandler(err, _req, res, _next) {
  logger.error({ message: err.message, stack: err.stack });

  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : 'Error interno del servidor';

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { detail: err.stack }),
  });
}

module.exports = { errorHandler };
