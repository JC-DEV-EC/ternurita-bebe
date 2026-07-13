import CONFIG from '../config.js'

let supabase
try {
  supabase = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY)
} catch (e) {
  console.error('Supabase init error:', e)
}

export default supabase
