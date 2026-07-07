-- ============================================================
-- MIGRACIÓN 001: TERNURITA BEBÉ - Schema + RLS + Funciones
-- Compatible con tablas existentes (usa ALTER TABLE ADD COLUMN IF NOT EXISTS)
-- ============================================================

-- 1. EXTENSIONES
create extension if not exists "uuid-ossp";

-- ============================================================
-- 2. TABLAS EXISTENTES: AÑADIR COLUMNAS FALTANTES
-- ============================================================

-- 2.1 CATEGORIAS
alter table public.categorias
  add column if not exists slug        text unique,
  add column if not exists descripcion text,
  add column if not exists imagen_url  text,
  add column if not exists activo      boolean default true,
  add column if not exists created_at  timestamptz default now();

-- 2.2 PRODUCTOS
alter table public.productos
  add column if not exists slug          text unique,
  add column if not exists precio_oferta numeric(10,2),
  add column if not exists activo        boolean default true,
  add column if not exists destacado     boolean default false,
  add column if not exists sku           text unique,
  add column if not exists created_at    timestamptz default now(),
  add column if not exists updated_at    timestamptz default now(),
  add column if not exists deleted_at    timestamptz;

-- 2.3 PERFILES
alter table public.perfiles
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

-- 2.4 PEDIDOS
alter table public.pedidos
  add column if not exists subtotal        numeric(10,2) default 0,
  add column if not exists impuesto        numeric(10,2) default 0,
  add column if not exists envio           numeric(10,2) default 0,
  add column if not exists direccion_envio jsonb,
  add column if not exists notas           text,
  add column if not exists created_at      timestamptz default now(),
  add column if not exists updated_at      timestamptz default now();

alter table public.pedidos
  alter column fecha_pedido set default now();

-- 2.5 DETALLES PEDIDO
alter table public.detalles_pedido
  add column if not exists created_at timestamptz default now();

alter table public.detalles_pedido
  alter column precio_unitario type numeric(10,2);

-- ============================================================
-- 3. TABLAS NUEVAS (no existen aún)
-- ============================================================

-- 3.1 IMAGENES
create table if not exists public.imagenes (
  id          serial primary key,
  producto_id integer not null references public.productos(id) on delete cascade,
  url         text not null,
  orden       integer default 0,
  created_at  timestamptz default now()
);

-- 3.2 CARRITO ITEMS
create table if not exists public.carrito_items (
  id          serial primary key,
  perfil_id   uuid not null references public.perfiles(id) on delete cascade,
  producto_id integer not null references public.productos(id) on delete cascade,
  cantidad    integer not null default 1 check (cantidad > 0),
  created_at  timestamptz default now(),
  unique(perfil_id, producto_id)
);

-- ============================================================
-- 4. TRIGGER: crear perfil automaticamente al registrarse
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.perfiles (id, nombre_completo)
  values (new.id, new.raw_user_meta_data ->> 'nombre_completo');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- 5. ROW LEVEL SECURITY
-- ============================================================

-- Helper: obtener rol del JWT
create or replace function public.get_user_role()
returns text
language sql stable
as $$
  select coalesce(
    nullif(current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'rol', ''),
    nullif(current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'rol', ''),
    'cliente'
  );
$$;

-- 5.1 CATEGORIAS
alter table public.categorias enable row level security;

drop policy if exists "Categorias lectura publica" on public.categorias;
create policy "Categorias lectura publica"
  on public.categorias for select
  using (activo = true);

drop policy if exists "Categorias admin todo" on public.categorias;
create policy "Categorias admin todo"
  on public.categorias for all
  using (public.get_user_role() = 'admin')
  with check (public.get_user_role() = 'admin');

-- 5.2 PRODUCTOS
alter table public.productos enable row level security;

drop policy if exists "Productos lectura publica" on public.productos;
create policy "Productos lectura publica"
  on public.productos for select
  using (activo = true and deleted_at is null);

drop policy if exists "Productos admin todo" on public.productos;
create policy "Productos admin todo"
  on public.productos for all
  using (public.get_user_role() = 'admin')
  with check (public.get_user_role() = 'admin');

-- 5.3 IMAGENES
alter table public.imagenes enable row level security;

drop policy if exists "Imagenes lectura publica" on public.imagenes;
create policy "Imagenes lectura publica"
  on public.imagenes for select
  using (true);

drop policy if exists "Imagenes admin todo" on public.imagenes;
create policy "Imagenes admin todo"
  on public.imagenes for all
  using (public.get_user_role() = 'admin')
  with check (public.get_user_role() = 'admin');

-- 5.4 PERFILES
alter table public.perfiles enable row level security;

drop policy if exists "Perfil propio lectura" on public.perfiles;
create policy "Perfil propio lectura"
  on public.perfiles for select
  using (auth.uid() = id);

drop policy if exists "Perfil propio update" on public.perfiles;
create policy "Perfil propio update"
  on public.perfiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "Perfil admin todo" on public.perfiles;
create policy "Perfil admin todo"
  on public.perfiles for all
  using (public.get_user_role() = 'admin')
  with check (public.get_user_role() = 'admin');

-- 5.5 CARRITO ITEMS
alter table public.carrito_items enable row level security;

drop policy if exists "Carrito propio" on public.carrito_items;
create policy "Carrito propio"
  on public.carrito_items for all
  using (auth.uid() = perfil_id)
  with check (auth.uid() = perfil_id);

-- 5.6 PEDIDOS
alter table public.pedidos enable row level security;

drop policy if exists "Pedidos propios lectura" on public.pedidos;
create policy "Pedidos propios lectura"
  on public.pedidos for select
  using (auth.uid() = cliente_id);

drop policy if exists "Pedidos admin todo" on public.pedidos;
create policy "Pedidos admin todo"
  on public.pedidos for all
  using (public.get_user_role() = 'admin')
  with check (public.get_user_role() = 'admin');

-- 5.7 DETALLES PEDIDO
alter table public.detalles_pedido enable row level security;

drop policy if exists "Detalles lectura propios pedidos" on public.detalles_pedido;
create policy "Detalles lectura propios pedidos"
  on public.detalles_pedido for select
  using (
    exists (
      select 1 from public.pedidos
      where pedidos.id = detalles_pedido.pedido_id
        and pedidos.cliente_id = auth.uid()
    )
  );

drop policy if exists "Detalles admin todo" on public.detalles_pedido;
create policy "Detalles admin todo"
  on public.detalles_pedido for all
  using (public.get_user_role() = 'admin')
  with check (public.get_user_role() = 'admin');

-- ============================================================
-- 6. STORED PROCEDURE: crear pedido (checkout)
-- ============================================================
create or replace function public.crear_pedido(
  p_cliente_id uuid,
  p_direccion_envio jsonb,
  p_notas text default null
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_pedido_id integer;
  v_total numeric(10,2) := 0;
  v_subtotal numeric(10,2) := 0;
  v_item record;
begin
  -- Validar carrito no vacio
  if not exists (select 1 from public.carrito_items where perfil_id = p_cliente_id) then
    raise exception 'El carrito esta vacio' using errcode = 'CARTE';
  end if;

  -- Validar stock y calcular total
  for v_item in
    select ci.producto_id, ci.cantidad, p.precio, p.stock_total, p.nombre
    from public.carrito_items ci
    join public.productos p on p.id = ci.producto_id
    where ci.perfil_id = p_cliente_id
  loop
    if v_item.cantidad > v_item.stock_total then
      raise exception 'Stock insuficiente para % (disponible: %, solicitado: %)',
        v_item.nombre, v_item.stock_total, v_item.cantidad
        using errcode = 'STKIN';
    end if;
    v_subtotal := v_subtotal + (v_item.precio * v_item.cantidad);
  end loop;

  v_total := v_subtotal;

  -- Crear pedido
  insert into public.pedidos (cliente_id, total_pedido, subtotal, direccion_envio, notas, estado)
  values (p_cliente_id, v_total, v_subtotal, p_direccion_envio, p_notas, 'pendiente')
  returning id into v_pedido_id;

  -- Insertar detalles del pedido
  insert into public.detalles_pedido (pedido_id, producto_id, cantidad, precio_unitario)
  select v_pedido_id, ci.producto_id, ci.cantidad, p.precio
  from public.carrito_items ci
  join public.productos p on p.id = ci.producto_id
  where ci.perfil_id = p_cliente_id;

  -- Descontar stock
  update public.productos p
  set stock_total = p.stock_total - ci.cantidad,
      updated_at = now()
  from public.carrito_items ci
  where ci.perfil_id = p_cliente_id and p.id = ci.producto_id;

  -- Limpiar carrito
  delete from public.carrito_items where perfil_id = p_cliente_id;

  return jsonb_build_object(
    'pedido_id', v_pedido_id,
    'total', v_total,
    'estado', 'pendiente'
  );
end;
$$;

-- ============================================================
-- 7. INDICES
-- ============================================================
create index if not exists idx_productos_categoria   on public.productos(categoria_id);
create index if not exists idx_productos_slug        on public.productos(slug);
create index if not exists idx_productos_activo      on public.productos(activo) where activo = true;
create index if not exists idx_productos_destacado   on public.productos(destacado) where destacado = true;
create index if not exists idx_categorias_slug       on public.categorias(slug);
create index if not exists idx_pedidos_cliente       on public.pedidos(cliente_id);
create index if not exists idx_pedidos_estado        on public.pedidos(estado);
create index if not exists idx_carrito_perfil        on public.carrito_items(perfil_id);
create index if not exists idx_detalles_pedido       on public.detalles_pedido(pedido_id);
create index if not exists idx_imagenes_producto     on public.imagenes(producto_id);

-- ============================================================
-- 8. SEED DATA (solo si las tablas estan vacias)
-- ============================================================
insert into public.categorias (nombre, slug, descripcion)
select 'Ropa', 'ropa', 'Ropa y accesorios para bebe'
where not exists (select 1 from public.categorias limit 1);

insert into public.categorias (nombre, slug, descripcion)
select 'Accesorios', 'accesorios', 'Accesorios infantiles'
where not exists (select 1 from public.categorias where slug = 'accesorios');

insert into public.categorias (nombre, slug, descripcion)
select 'Juguetes', 'juguetes', 'Juguetes educativos y didacticos'
where not exists (select 1 from public.categorias where slug = 'juguetes');

insert into public.categorias (nombre, slug, descripcion)
select 'Cuidado', 'cuidado', 'Productos de cuidado e higiene'
where not exists (select 1 from public.categorias where slug = 'cuidado');
