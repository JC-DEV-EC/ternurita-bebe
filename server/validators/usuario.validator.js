const { z } = require('zod');

const cambiarRolSchema = z.object({
  rol: z.enum(['admin', 'cliente'], { message: 'Rol debe ser admin o cliente' }),
});

module.exports = { cambiarRolSchema };
