const { supabase } = require('../config/supabase');
const logger = require('../utils/logger');

const ALLOWED_REDIRECT_DOMAINS = [
  'localhost',
  'ternuritabebe.com',
  process.env.PUBLIC_URL && new URL(process.env.PUBLIC_URL).hostname,
].filter(Boolean);

function isSafeRedirect(url) {
  try {
    const parsed = new URL(url);
    return ALLOWED_REDIRECT_DOMAINS.some(d => parsed.hostname === d || parsed.hostname.endsWith('.' + d));
  } catch {
    return false;
  }
}

async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Email válido requerido' });
    }

    const defaultRedirect = `${process.env.PUBLIC_URL || 'http://localhost:3000'}/#/reset-password`;
    const redirectTo = req.body.redirectTo && isSafeRedirect(req.body.redirectTo)
      ? req.body.redirectTo
      : defaultRedirect;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    if (error) throw error;

    logger.info({ email }, 'Reset password email enviado');
    res.json({ message: 'Correo de recuperación enviado. Revisa tu email.' });
  } catch (err) {
    logger.error({ error: err.message }, 'Error enviando reset password email');
    res.status(500).json({ error: 'Error al enviar correo de recuperación' });
  }
}

const { z } = require('zod');

const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
});

async function register(req, res) {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors[0].message });
    }

    const { email, password, nombre } = parsed.data;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nombre_completo: nombre } },
    });

    if (error) {
      logger.error({ error: error.message }, 'Error en registro');
      return res.status(400).json({ error: error.message });
    }

    if (data?.user) {
      const { error: perfilError } = await supabase
        .from('perfiles')
        .upsert({
          id: data.user.id,
          nombre_completo: nombre,
          rol: 'cliente',
        }, { onConflict: 'id' });

      if (perfilError) {
        logger.error({ error: perfilError }, 'Error creando perfil en registro');
      }
    }

    logger.info({ email }, 'Usuario registrado');
    res.status(201).json({
      user: data.user,
      session: data.session,
    });
  } catch (err) {
    logger.error({ error: err.message }, 'Error en registro');
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function resetPassword(req, res) {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token de recuperación requerido' });
    }

    const token = authHeader.split(' ')[1];

    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: 'recovery',
    });

    if (error) throw error;

    const { error: updateError } = await supabase.auth.admin.updateUserById(
      data.user.id,
      { password: newPassword }
    );

    if (updateError) throw updateError;

    logger.info({ user_id: data.user.id }, 'Contraseña actualizada');
    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (err) {
    logger.error({ error: err.message }, 'Error reseteando contraseña');
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

module.exports = { forgotPassword, resetPassword, register };
