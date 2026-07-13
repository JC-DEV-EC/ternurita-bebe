import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import CONFIG from '../config.js'

const supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY)

export default supabase
