const { z } = require('zod');

const checkoutSchema = z.object({
  direccion_envio: z.object({
    direccion: z.string().min(5, 'Dirección debe tener al menos 5 caracteres'),
    ciudad: z.string().min(2, 'Ciudad requerida'),
    telefono: z.string().min(7, 'Teléfono requerido'),
    nombre: z.string().min(2, 'Nombre requerido'),
  }),
  notas: z.string().max(500).optional(),
});

module.exports = { checkoutSchema };
