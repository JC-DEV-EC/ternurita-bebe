const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const isConfigured = Boolean(supabaseUrl && supabaseServiceKey);

if (!isConfigured) {
  console.warn(
    '⚠ SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY no configurados en .env. ' +
    'Las operaciones con base de datos fallarán hasta que se configuren.'
  );
}

const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

module.exports = supabase;
