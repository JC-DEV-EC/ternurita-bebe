import supabase from './supabase.service.js'

export async function obtener(perfilId) {
  const { data, error } = await supabase
    .from('carrito_items')
    .select('*, productos(*, imagenes(*))')
    .eq('perfil_id', perfilId)

  return { data, error }
}

export async function agregar(perfilId, productoId, cantidad = 1) {
  const { data: existente } = await supabase
    .from('carrito_items')
    .select('id, cantidad')
    .eq('perfil_id', perfilId)
    .eq('producto_id', productoId)
    .maybeSingle()

  if (existente) {
    return actualizarCantidad(existente.id, perfilId, existente.cantidad + cantidad)
  }

  const { data, error } = await supabase
    .from('carrito_items')
    .insert({ perfil_id: perfilId, producto_id: productoId, cantidad })
    .select()
    .single()

  return { data, error }
}

export async function actualizarCantidad(id, perfilId, cantidad) {
  if (cantidad < 1) return eliminarItem(id, perfilId)

  const { data, error } = await supabase
    .from('carrito_items')
    .update({ cantidad })
    .eq('id', id)
    .eq('perfil_id', perfilId)
    .select()
    .single()

  return { data, error }
}

export async function eliminarItem(id, perfilId) {
  const { error } = await supabase
    .from('carrito_items')
    .delete()
    .eq('id', id)
    .eq('perfil_id', perfilId)

  return { error }
}

export async function vaciar(perfilId) {
  const { error } = await supabase
    .from('carrito_items')
    .delete()
    .eq('perfil_id', perfilId)

  return { error }
}
