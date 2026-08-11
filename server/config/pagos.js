const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '..', '.env') });

const datosBancarios = {
  banco: process.env.BANCO_NOMBRE || 'Banco Pichincha',
  titular: process.env.BANCO_TITULAR || 'Ternurita Bebé',
  cedula: process.env.BANCO_CEDULA || '',
  cuenta: process.env.BANCO_CUENTA || '',
  tipo: process.env.BANCO_TIPO || 'Cuenta de ahorros',
  telefono: process.env.BANCO_TELEFONO || '',
};

module.exports = { datosBancarios };