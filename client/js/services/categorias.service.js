import supabase from './supabase.service.js'

export async function listar() {
  const { data, error } = await supabase
    .from('categorias')
    .select('*')
    .eq('activo', true)
    .order('nombre')

  return { data, error }
}
