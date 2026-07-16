const { supabase } = require('../config/supabase');
const logger = require('../utils/logger');

async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Email válido requerido' });
    }

    const redirectTo = req.body.redirectTo || `${process.env.PUBLIC_URL || 'http://localhost:3000'}/#/reset-password`;

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

module.exports = { forgotPassword, resetPassword };
