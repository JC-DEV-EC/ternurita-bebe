const { supabase } = require('../config/supabase');
const logger = require('../utils/logger');

async function subirAvatar(req, res) {
  try {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ error: 'No autorizado' })

    if (!req.file) return res.status(400).json({ error: 'Archivo de imagen requerido' })

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
      return res.status(500).json({ error: 'Error al subir archivo: ' + uploadError.message })
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
      return res.status(500).json({ error: 'Error al guardar avatar: ' + dbError.message })
    }

    logger.info({ userId, avatar_url: urlData.publicUrl }, 'Avatar actualizado')
    res.json({ avatar_url: urlData.publicUrl })
  } catch (err) {
    logger.error({ error: err.message }, 'Error subiendo avatar')
    res.status(500).json({ error: 'Error interno: ' + err.message })
  }
}

module.exports = { subirAvatar }
