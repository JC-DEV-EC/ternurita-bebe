-- 003: Pagos por transferencia (banca móvil) — MVP sin pasarela
-- Agrega estado de pago a pedidos y funciones de cancelación con devolución de stock.

alter table public.pedidos
  add column if not exists metodo_pago text,
  add column if not exists estado_pago text not null default 'pendiente',
  add column if not exists pago_referencia text,
  add column if not exists pagado_at timestamptz,
  add column if not exists pago_confirmado_por uuid;

comment on column public.pedidos.estado_pago is 'pendiente | en_revision | pagado | fallido';
comment on column public.pedidos.metodo_pago is 'banca_movil (pago manual por transferencia)';

create index if not exists idx_pedidos_estado_pago on public.pedidos(estado_pago);
create index if not exists idx_pedidos_metodo_pago on public.pedidos(metodo_pago);

-- Devuelve el stock de los productos de un pedido cancelado.
create or replace function public.restaurar_stock_pedido(p_pedido_id integer)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.productos p
    set stock_total = p.stock_total + d.cantidad,
        updated_at = now()
    from public.detalles_pedido d
    where d.pedido_id = p_pedido_id
      and p.id = d.producto_id;

  if not found then
    raise notice 'Sin productos que restaurar para pedido %', p_pedido_id;
  end if;
end;
$$;

-- La RPC crear_pedido (migración 001) descuenta stock al crear el pedido;
-- por eso la cancelación debe devolverlo (admin o cliente).

-- Cancelación por parte del cliente: valida propiedad y estado, restaura stock.
create or replace function public.cancelar_pedido(p_pedido_id integer, p_cliente_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_pedido public.pedidos;
begin
  select *
    into v_pedido
    from public.pedidos
    where id = p_pedido_id
    limit 1;

  if v_pedido is null then
    raise exception 'Pedido no encontrado' using errcode = 'NOPED';
  end if;

  if v_pedido.cliente_id <> p_cliente_id then
    raise exception 'Pedido no encontrado' using errcode = 'NOPED';
  end if;

  if v_pedido.estado <> 'pendiente' then
    raise exception 'Solo se pueden cancelar pedidos pendientes' using errcode = 'NOCAN';
  end if;

  perform public.restaurar_stock_pedido(p_pedido_id);

  update public.pedidos
    set estado = 'cancelado',
        estado_pago = 'fallido',
        updated_at = now()
    where id = p_pedido_id;

  return jsonb_build_object('pedido_id', p_pedido_id, 'estado', 'cancelado', 'estado_pago', 'fallido');
end;
$$;

revoke all on function public.cancelar_pedido(integer, uuid) from public;
revoke all on function public.restaurar_stock_pedido(integer) from public;

grant execute on function public.cancelar_pedido(integer, uuid) to authenticated;
grant execute on function public.restaurar_stock_pedido(integer) to service_role;