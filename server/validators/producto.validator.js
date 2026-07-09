const { z } = require('zod');

const createProductoSchema = z.object({
  categoria_id: z.number().int().positive().optional(),
  subcategoria: z.string().default(''),
  nombre: z.string().min(2, 'Nombre requerido'),
  slug: z.string().min(2).optional(),
  descripcion: z.string().optional(),
  precio: z.number().positive('Precio debe ser mayor a 0'),
  precio_oferta: z.number().positive().optional(),
  stock_total: z.number().int().min(0).default(0),
  colores: z.string().optional(),
  talla: z.string().default('0-3 meses'),
  marca: z.string().default('Ternurita Bebe'),
  imagen_url: z.string().url().optional(),
  activo: z.boolean().default(true),
  destacado: z.boolean().default(false),
  sku: z.string().optional(),
});

const updateProductoSchema = createProductoSchema.partial();

module.exports = { createProductoSchema, updateProductoSchema };
