const { supabase, isConfigured } = require('../../config/supabase');
const { cambiarRolSchema } = require('../../validators/usuario.validator');
const logger = require('../../utils/logger');

async function listar(req, res) {
  try {
    const { page = 1, limit = 20 } = req.query;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: perfiles, error, count } = await supabase
      .from('perfiles')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) throw authError;

    const authMap = {};
    if (authUsers?.users) {
      authUsers.users.forEach(u => {
        authMap[u.id] = {
          email: u.email,
          rol: u.app_metadata?.rol || u.user_metadata?.rol || 'cliente',
        };
      });
    }

    const data = perfiles.map(p => ({
      ...p,
      email: authMap[p.id]?.email || null,
      rol: authMap[p.id]?.rol || 'cliente',
    }));

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
    logger.error({ error: err.message }, 'Error listando usuarios');
    res.status(500).json({ error: 'Error al listar usuarios' });
  }
}

async function cambiarRol(req, res) {
  try {
    const { id } = req.params;

    const validation = cambiarRolSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Datos inválidos',
        detalle: validation.error.issues.map(i => ({ campo: i.path.join('.'), mensaje: i.message })),
      });
    }

    const { rol } = validation.data;

    const { error: authError } = await supabase.auth.admin.updateUserById(id, {
      app_metadata: { rol },
    });

    if (authError) throw authError;

    logger.info({ usuario_id: id, rol_nuevo: rol }, 'Rol de usuario cambiado');
    res.json({ message: 'Rol actualizado', usuario: { id, rol } });
  } catch (err) {
    logger.error({ error: err.message }, 'Error cambiando rol');
    res.status(500).json({ error: 'Error al cambiar rol' });
  }
}

module.exports = { listar, cambiarRol };
