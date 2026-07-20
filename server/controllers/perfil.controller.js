const { supabase } = require('../config/supabase');
const logger = require('../utils/logger');

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

async function subirAvatar(req, res) {
  try {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ error: 'No autorizado' })

    if (!req.file) return res.status(400).json({ error: 'Archivo de imagen requerido' })

    if (!isValidImageMagicBytes(req.file.buffer)) {
      return res.status(400).json({ error: 'El archivo no es una imagen válida (JPEG/PNG/GIF/WebP)' })
    }

    const ext = req.file.originalname.split('.').pop()
    const fileName = `avatars/${userId}/${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: true,
      })

    if (uploadError) {
      logger.error({ error: uploadError }, 'Error en storage upload')
      return res.status(500).json({ error: 'Error al subir archivo' })
    }

    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName)

    const { error: dbError } = await supabase
      .from('perfiles')
      .update({ avatar_url: urlData.publicUrl })
      .eq('id', userId)

    if (dbError) {
      logger.error({ error: dbError }, 'Error en db update')
      return res.status(500).json({ error: 'Error al guardar avatar' })
    }

    logger.info({ userId, avatar_url: urlData.publicUrl }, 'Avatar actualizado')
    res.json({ avatar_url: urlData.publicUrl })
  } catch (err) {
    logger.error({ error: err.message }, 'Error subiendo avatar')
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

module.exports = { subirAvatar }
