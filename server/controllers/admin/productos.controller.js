const { supabase, isConfigured } = require('../../config/supabase');
const { createProductoSchema, updateProductoSchema } = require('../../validators/producto.validator');
const logger = require('../../utils/logger');
const multer = require('multer');

const IMAGE_SIGNATURES = [
  [0xFF, 0xD8, 0xFF],
  [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A],
  [0x47, 0x49, 0x46, 0x38],
  [0x52, 0x49, 0x46, 0x46],
];

function isValidImageMagicBytes(buffer) {
  if (!buffer || buffer.length < 12) return false;
  const header = new Uint8Array(buffer.slice(0, 12));
  return IMAGE_SIGNATURES.some(sig =>
    sig.every((byte, i) => header[i] === byte)
  );
}

function generarSlug(texto) {
  return texto
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .trim();
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo imágenes permitidas'), false);
    }
  },
});

async function listar(req, res) {
  try {
    const { page = 1, limit = 20, incluir_inactivos } = req.query;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('productos')
      .select('*, imagenes(*), categorias(nombre, slug)', { count: 'exact' });

    if (incluir_inactivos !== 'true') {
      query = query.is('deleted_at', null);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    res.json({
      data,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count,
        total_pages: Math.ceil(count / limit),
      },
    });
  } catch (err) {
    logger.error({ error: err.message }, 'Error listando productos');
    res.status(500).json({ error: 'Error al listar productos' });
  }
}

async function crear(req, res) {
  try {
    const validation = createProductoSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Datos inválidos',
        detalle: validation.error.issues.map(i => ({ campo: i.path.join('.'), mensaje: i.message })),
      });
    }

    validation.data.slug = generarSlug(validation.data.slug || validation.data.nombre);

    const { data, error } = await supabase
      .from('productos')
      .insert(validation.data)
      .select()
      .single();

    if (error) throw error;

    logger.info({ producto_id: data.id, nombre: data.nombre }, 'Producto creado');
    res.status(201).json({ message: 'Producto creado', producto: data });
  } catch (err) {
    logger.error({ error: err.message }, 'Error creando producto');
    res.status(500).json({ error: 'Error al crear producto' });
  }
}

async function actualizar(req, res) {
  try {
    const { id } = req.params;
    const validation = updateProductoSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Datos inválidos',
        detalle: validation.error.issues.map(i => ({ campo: i.path.join('.'), mensaje: i.message })),
      });
    }

    const updateData = { ...validation.data, updated_at: new Date().toISOString() };
    if (updateData.nombre || updateData.slug) {
      updateData.slug = generarSlug(updateData.slug || updateData.nombre);
    }

    const { data, error } = await supabase
      .from('productos')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Producto no encontrado' });

    logger.info({ producto_id: id }, 'Producto actualizado');
    res.json({ message: 'Producto actualizado', producto: data });
  } catch (err) {
    logger.error({ error: err.message }, 'Error actualizando producto');
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
}

async function eliminar(req, res) {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('productos')
      .update({ activo: false, deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Producto no encontrado' });

    logger.info({ producto_id: id }, 'Producto eliminado (lógico)');
    res.json({ message: 'Producto eliminado' });
  } catch (err) {
    logger.error({ error: err.message }, 'Error eliminando producto');
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
}

async function subirImagen(req, res) {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({ error: 'Archivo de imagen requerido' });
    }

    if (!isValidImageMagicBytes(req.file.buffer)) {
      return res.status(400).json({ error: 'El archivo no es una imagen válida (JPEG/PNG/GIF/WebP)' })
    }

    const ext = req.file.originalname.split('.').pop();
    const fileName = `${id}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('productos')
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from('productos')
      .getPublicUrl(fileName);

    const { data: imgRecord, error: dbError } = await supabase
      .from('imagenes')
      .insert({ producto_id: id, url: urlData.publicUrl })
      .select()
      .single();

    if (dbError) throw dbError;

    logger.info({ producto_id: id, imagen_url: urlData.publicUrl }, 'Imagen subida');
    res.status(201).json({ message: 'Imagen subida', imagen: imgRecord });
  } catch (err) {
    logger.error({ error: err.message }, 'Error subiendo imagen');
    res.status(500).json({ error: 'Error al subir imagen' });
  }
}

async function eliminarImagen(req, res) {
  try {
    const { id, imagenId } = req.params;
    const { data: img, error: fetchError } = await supabase
      .from('imagenes')
      .select('*')
      .eq('id', imagenId)
      .eq('producto_id', id)
      .single();
    if (fetchError || !img) {
      return res.status(404).json({ error: 'Imagen no encontrada' });
    }
    const urlPath = new URL(img.url).pathname;
    const storagePath = urlPath.replace(/^\/storage\/v1\/object\/public\/productos\//, '');
    if (storagePath) {
      await supabase.storage.from('productos').remove([storagePath]);
    }
    const { error: deleteError } = await supabase
      .from('imagenes')
      .delete()
      .eq('id', imagenId);
    if (deleteError) throw deleteError;
    logger.info({ producto_id: id, imagen_id: imagenId }, 'Imagen eliminada');
    res.json({ message: 'Imagen eliminada' });
  } catch (err) {
    logger.error({ error: err.message }, 'Error eliminando imagen');
    res.status(500).json({ error: 'Error al eliminar imagen' });
  }
}

module.exports = { listar, crear, actualizar, eliminar, subirImagen, eliminarImagen, upload };
