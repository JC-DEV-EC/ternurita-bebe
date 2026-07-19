import supabase from './supabase.service.js'

export async function listar({ categoria, busqueda, pagina = 1, porPagina = 12 } = {}) {
  let query = supabase
    .from('productos')
    .select('*, categorias!inner(nombre, slug), imagenes(*)', { count: 'exact' })
    .eq('activo', true)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (categoria) {
    query = query.eq('categorias.slug', categoria)
  }

  if (busqueda) {
    query = query.ilike('nombre', `%${busqueda}%`)
  }

  const inicio = (pagina - 1) * porPagina
  query = query.range(inicio, inicio + porPagina - 1)

  const { data, error, count } = await query
  return { data, error, count, paginas: count ? Math.ceil(count / porPagina) : 0 }
}

export async function obtenerPorSlug(slug) {
  let query = supabase
    .from('productos')
    .select('*, categorias(nombre, slug), imagenes(*)')
    .eq('activo', true)
    .is('deleted_at', null)

  if (/^\d+$/.test(slug)) {
    query = query.eq('id', parseInt(slug))
  } else {
    query = query.eq('slug', slug)
  }

  const { data, error } = await query.maybeSingle()
  return { data, error }
}

export async function destacados(limite = 8) {
  const { data, error } = await supabase
    .from('productos')
    .select('*, categorias(nombre, slug), imagenes(*)')
    .eq('destacado', true)
    .eq('activo', true)
    .is('deleted_at', null)
    .limit(limite)

  return { data, error }
}
