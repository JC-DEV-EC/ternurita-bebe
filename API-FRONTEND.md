# Ternurita Bebé — Guía para el Frontend

> Documento completo de la API REST y los datos disponibles para el frontend.
> Última actualización: 19 jul 2026

---

## Índice

1. [Setup](#1-setup)
2. [Autenticación](#2-autenticación)
3. [Endpoints REST (Backend Express)](#3-endpoints-rest-backend-express)
   - 3.1 Health
   - 3.2 Auth
   - 3.3 Search
   - 3.4 Checkout
   - 3.5 Admin — Dashboard
   - 3.6 Admin — Productos
   - 3.7 Admin — Pedidos
   - 3.8 Admin — Usuarios
   - 3.9 Admin — Categorías
4. [Queries Directas a Supabase (Cliente)](#4-queries-directas-a-supabase-cliente)
   - Catálogo (público)
   - Carrito (auth)
   - Perfil (auth)
   - Pedidos propios (auth)
5. [Modelos de Datos](#5-modelos-de-datos)
6. [Rate Limiting](#6-rate-limiting)
7. [Códigos de Error](#7-códigos-de-error)
8. [Estado del Frontend](#8-estado-del-frontend)
9. [Pendientes del Frontend](#9-pendientes-del-frontend)

---

## 1. Setup

| Variable | Valor |
|----------|-------|
| **API base URL** | `http://localhost:3000` |
| **Supabase URL** | `https://fssandkzjzplyuluwrbq.supabase.co` |
| **Supabase Anon Key** | En `client/js/config.js` |
| **Cliente Supabase** | Cargado desde `client/js/vendor/supabase.min.js` (global `window.supabase`) |

### Configuración actual del cliente

```js
// client/js/config.js
const CONFIG = {
  SUPABASE_URL: 'https://fssandkzjzplyuluwrbq.supabase.co',
  SUPABASE_ANON_KEY: '...',
  API_BASE_URL: 'http://localhost:3000',
}
```

### Inicialización del cliente Supabase

```js
// client/js/services/supabase.service.js
import CONFIG from '../config.js'
const supabase = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY)
export default supabase
```

---

## 2. Autenticación

La autenticación se maneja **enteramente con Supabase Auth** desde el cliente (no hay endpoints REST `/login` o `/register`).

### Registro

```js
import supabase from './services/supabase.service.js'

const { data, error } = await supabase.auth.signUp({
  email: 'usuario@email.com',
  password: 'tu-password',
  options: { data: { nombre_completo: 'Nombre del Usuario' } }
})
```

> **Importante:** El campo de metadata debe ser `nombre_completo` (no `nombre`). Un trigger en la BD crea automáticamente el perfil en `perfiles` con `rol = 'cliente'`.

Tras el registro, hacer upsert del perfil para asegurar consistencia:

```js
await supabase.from('perfiles').upsert({
  id: data.user.id,
  nombre_completo: 'Nombre',
  rol: 'cliente',
}, { onConflict: 'id' })
```

### Login

```js
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'usuario@email.com',
  password: 'tu-password'
})
// data.session.access_token → usar en Authorization header para endpoints REST
```

### Sesión actual

```js
const { data: { session } } = await supabase.auth.getSession()
if (session) {
  // session.access_token
  // session.user.id
  // session.user.email
}
```

### Listener de cambios de auth

```js
supabase.auth.onAuthStateChange((event, session) => {
  // event: 'SIGNED_IN', 'SIGNED_OUT', 'TOKEN_REFRESHED', 'PASSWORD_RECOVERY'
})
```

### Logout

```js
await supabase.auth.signOut()
```

### Usuarios de prueba

| Rol | Email | Password |
|-----|-------|----------|
| Admin | `admin@ternuritabebe.com` | `Admin123!` |
| Cliente | `cliente@ternuritabebe.com` | `Cliente123!` |

### Token JWT

- Algoritmo: **ES256** (EC P-256)
- El `access_token` se obtiene de `session.access_token` tras login
- **Caduca en 1 hora** (se refresca automáticamente con `onAuthStateChange`)
- El backend lo verifica con la librería `jose` contra el JWKS de Supabase
- El `rol` se lee de `app_metadata.rol` del JWT (seteado por el admin al crear usuarios)

---

## 3. Endpoints REST (Backend Express)

Todos los endpoints REST están bajo `/api/...`. Los endpoints de admin requieren `Authorization: Bearer <token>` + rol `admin`.

### Convenciones de respuesta

**Éxito (lista paginada):**
```json
{
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "total_pages": 5
  }
}
```

**Éxito (objeto individual):**
```json
{
  "message": "Mensaje de éxito",
  "campo": { ... }
}
```

**Error:**
```json
{
  "error": "Mensaje de error descriptivo"
}
```

**Error de validación (400):**
```json
{
  "error": "Datos inválidos",
  "detalle": [
    { "campo": "nombre", "mensaje": "Nombre requerido" }
  ]
}
```

---

### 3.1 Health

#### `GET /api/health`

Verifica que el servidor y Supabase estén conectados. No requiere auth.

**Respuesta:**
```json
{
  "status": "ok",
  "supabase_connected": true,
  "timestamp": "2026-07-19T12:00:00.000Z"
}
```

---

### 3.2 Auth

#### `POST /api/auth/forgot-password`

Envía email de recuperación de contraseña. Rate limited: **10 requests / 15 min**.

**Body:**
```json
{
  "email": "usuario@email.com",
  "redirectTo": "https://tudominio.com/#/reset-password"
}
```

`redirectTo` es opcional. Si se omite, usa `http://localhost:3000/#/reset-password`.

**Respuesta:**
```json
{
  "message": "Correo de recuperación enviado. Revisa tu email."
}
```

**Errores:**

| Status | Mensaje |
|--------|---------|
| 400 | `Email válido requerido` |
| 500 | `Error al enviar correo de recuperación` |

#### `POST /api/auth/reset-password`

Cambia la contraseña usando el token de recuperación (viene en el query param del email). Rate limited: **10 requests / 15 min**.

**Header:**
```
Authorization: Bearer <token_hash_del_email>
```

**Body:**
```json
{
  "newPassword": "nueva-password-123"
}
```

**Respuesta:**
```json
{
  "message": "Contraseña actualizada correctamente"
}
```

**Errores:**

| Status | Mensaje |
|--------|---------|
| 400 | `La contraseña debe tener al menos 6 caracteres` |
| 401 | `Token de recuperación requerido` |
| 401 | `Token inválido o expirado` |

---

### 3.3 Search

#### `GET /api/search/productos?q=<término>&page=1&limit=20`

Búsqueda full-text en productos activos. Busca en `nombre`, `descripcion`, `marca`, `sku` con `ILIKE`. No requiere auth.

**Query params:**

| Param | Tipo | Default | Descripción |
|-------|------|---------|-------------|
| `q` | string | — | **Requerido.** Mínimo 2 caracteres |
| `page` | int | 1 | Número de página |
| `limit` | int | 20 | Items por página |

**Respuesta:**
```json
{
  "data": [
    {
      "id": 4,
      "nombre": "Camiseta color fuerte",
      "descripcion": "Camiseta manga corta...",
      "precio": 2.00,
      "marca": "Ternurita Bebe",
      "imagenes": [{ "url": "https://..." }],
      "categorias": { "nombre": "Prendas superiores", "slug": "prendas-superiores" }
    }
  ],
  "query": "camiseta",
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 2,
    "total_pages": 1
  }
}
```

**Errores:**

| Status | Mensaje |
|--------|---------|
| 400 | `Término de búsqueda requerido (mín. 2 caracteres)` |
| 500 | `Error en la búsqueda` |

---

### 3.4 Checkout

#### `POST /api/checkout`

Crea un pedido a partir del carrito del usuario. Requiere auth.

**Header:**
```
Authorization: Bearer <access_token>
```

**Body:**
```json
{
  "direccion_envio": {
    "direccion": "Av. Amazonas N34-451",
    "ciudad": "Quito",
    "telefono": "0991234567",
    "nombre": "Jasse Gerardoc"
  },
  "notas": "Entregar en horario de tarde"
}
```

**Esquema de validación (Zod):**
| Campo | Reglas |
|-------|--------|
| `direccion_envio.direccion` | Mín. 5 caracteres |
| `direccion_envio.ciudad` | Mín. 2 caracteres |
| `direccion_envio.telefono` | Mín. 7 caracteres |
| `direccion_envio.nombre` | Mín. 2 caracteres |
| `notas` | Máx. 500 caracteres, opcional |

**Respuesta (201):**
```json
{
  "message": "Pedido creado exitosamente",
  "pedido": {
    "pedido_id": 1,
    "total": 25.00,
    "estado": "pendiente"
  }
}
```

**Errores:**

| Status | Código PG | Mensaje |
|--------|-----------|---------|
| 400 | `CARTE` | `El carrito esta vacio` |
| 409 | `STKIN` | `Stock insuficiente para X (disponible: Y, solicitado: Z)` |
| 400 | — | `Datos inválidos` + `detalle` |
| 500 | — | `Error al crear el pedido` |

> **Nota:** El server llama al stored procedure `crear_pedido()` que automáticamente:
> 1. Valida el carrito
> 2. Calcula el total
> 3. Crea el pedido (`estado = pendiente`)
> 4. Inserta los detalles
> 5. Descuenta stock
> 6. Vacía el carrito

---

### 3.5 Admin — Dashboard

#### `GET /api/admin/`

Obtiene estadísticas para el dashboard. Requiere auth admin.

**Respuesta:**
```json
{
  "productos": 98,
  "pedidos": 0,
  "usuarios": 4,
  "categorias": 10
}
```

**Errores:**

| Status | Mensaje |
|--------|---------|
| 401 | `Token requerido` o `Token inválido` |
| 403 | `Se requiere rol de administrador` |
| 500 | `Error al obtener estadísticas` |

---

### 3.6 Admin — Productos

**Base:** `/api/admin/productos` — Requiere auth admin.

#### `GET /api/admin/productos?page=1&limit=20&incluir_inactivos=true`

Lista productos con paginación. Filtra soft-deleted por defecto.

**Query params:**

| Param | Tipo | Default | Descripción |
|-------|------|---------|-------------|
| `page` | int | 1 | Página |
| `limit` | int | 20 | Items por página |
| `incluir_inactivos` | string | `false` | `true` para incluir soft-deleted |

**Respuesta:** `data` con array de productos incluyendo `imagenes(*)` y `categorias(nombre, slug)`.

#### `POST /api/admin/productos`

Crea un producto.

**Body (esquema Zod `createProductoSchema`):**
```json
{
  "categoria_id": 1,
  "subcategoria": "Camisetas",
  "nombre": "Body algodón",
  "slug": "body-algodon",
  "descripcion": "Body de algodón orgánico",
  "precio": 5.50,
  "precio_oferta": 4.50,
  "stock_total": 100,
  "colores": "blanco,rosado,celeste",
  "talla": "0-3 meses",
  "marca": "Ternurita Bebe",
  "imagen_url": "https://...",
  "activo": true,
  "destacado": false,
  "sku": "BODY-001"
}
```

| Campo | Reglas |
|-------|--------|
| `nombre` | **Requerido**, mín. 2 caracteres |
| `precio` | **Requerido**, número > 0 |
| `slug` | Opcional (se autogenera del nombre si no viene) |
| `stock_total` | Int ≥ 0, default 0 |
| `talla` | String, default `'0-3 meses'` |
| `marca` | String, default `'Ternurita Bebe'` |
| `activo` | Boolean, default `true` |
| `destacado` | Boolean, default `false` |

**Respuesta (201):**
```json
{
  "message": "Producto creado",
  "producto": { ... }
}
```

#### `PUT /api/admin/productos/:id`

Actualiza un producto. Body: cualquier subset de `createProductoSchema` (partial).

**Respuesta:**
```json
{
  "message": "Producto actualizado",
  "producto": { ... }
}
```

#### `DELETE /api/admin/productos/:id`

Soft-delete (no borra, setea `deleted_at` y `activo=false`).

**Respuesta:**
```json
{
  "message": "Producto eliminado"
}
```

#### `POST /api/admin/productos/:id/imagenes`

Sube una imagen al producto. **multipart/form-data** (no JSON).

**Form data:**
- `imagen` → archivo (max 5MB, solo imágenes)

**Respuesta (201):**
```json
{
  "message": "Imagen subida",
  "imagen": {
    "id": 1,
    "producto_id": 4,
    "url": "https://...supabase.co/storage/...",
    "orden": 0,
    "created_at": "..."
  }
}
```

> El archivo se sube al bucket `productos` de Supabase Storage y se crea un registro en la tabla `imagenes`.

---

### 3.7 Admin — Pedidos

**Base:** `/api/admin/pedidos` — Requiere auth admin.

#### `GET /api/admin/pedidos?page=1&limit=20&estado=pendiente&fecha_desde=2026-07-01&fecha_hasta=2026-07-31`

Lista pedidos con filtros y paginación.

**Query params:**

| Param | Tipo | Descripción |
|-------|------|-------------|
| `page` | int | Página (default 1) |
| `limit` | int | Items por página (default 20) |
| `estado` | string | `pendiente` \| `confirmado` \| `enviado` \| `entregado` \| `cancelado` |
| `fecha_desde` | date | Filtra `fecha_pedido >= fecha_desde` |
| `fecha_hasta` | date | Filtra `fecha_pedido <= fecha_hasta` |

**Respuesta:** `data` con array de pedidos, cada uno incluye `detalles_pedido(*)` y `perfiles(nombre_completo, telefono, ciudad)`.

#### `PUT /api/admin/pedidos/:id/estado`

Cambia el estado de un pedido con validación de transiciones.

**Body:**
```json
{
  "estado": "confirmado"
}
```

**Transiciones válidas:**
| Estado actual | Permite cambiar a |
|---------------|-------------------|
| `pendiente` | `confirmado`, `cancelado` |
| `confirmado` | `enviado`, `cancelado` |
| `enviado` | `entregado`, `cancelado` |
| `entregado` | — (estado final) |
| `cancelado` | — (estado final) |

**Respuesta:**
```json
{
  "message": "Estado actualizado",
  "pedido": { ... }
}
```

**Errores:**

| Status | Mensaje |
|--------|---------|
| 400 | `Transición inválida: de "entregado" a "confirmado". Permitidas: ` |
| 404 | `Pedido no encontrado` |

---

### 3.8 Admin — Usuarios

**Base:** `/api/admin/usuarios` — Requiere auth admin.

#### `GET /api/admin/usuarios?page=1&limit=20`

Lista usuarios (perfiles + datos de auth.users).

**Respuesta:** `data` con array de:
```json
{
  "id": "uuid",
  "nombre_completo": "...",
  "telefono": "...",
  "ciudad": "...",
  "direccion": "...",
  "email": "usuario@email.com",
  "rol": "admin" | "cliente",
  "created_at": "..."
}
```

#### `PUT /api/admin/usuarios/:id/rol`

Cambia el rol de un usuario (actualiza `app_metadata.rol` en auth.users).

**Body:**
```json
{
  "rol": "admin"
}
```

Valores válidos: `"admin"` o `"cliente"`.

**Respuesta:**
```json
{
  "message": "Rol actualizado",
  "usuario": { "id": "uuid", "rol": "admin" }
}
```

> **Importante:** El cambio de rol requiere que el usuario **vuelva a iniciar sesión** para que su JWT incluya el nuevo rol en `app_metadata`.

---

### 3.9 Admin — Categorías

**Base:** `/api/admin/categorias` — Requiere auth admin.

#### `GET /api/admin/categorias?page=1&limit=20&incluir_inactivos=true`

Lista categorías con paginación.

**Query params:**

| Param | Tipo | Default | Descripción |
|-------|------|---------|-------------|
| `page` | int | 1 | Página |
| `limit` | int | 20 | Items por página |
| `incluir_inactivos` | string | `false` | `true` para incluir `activo = false` |

**Respuesta:** `data` con array de categorías: `{ id, nombre, slug, descripcion, imagen_url, activo, created_at }`.

#### `POST /api/admin/categorias`

Crea una categoría.

```json
{
  "nombre": "Ropa de invierno",
  "slug": "ropa-invierno",
  "descripcion": "Ropa abrigada para invierno",
  "imagen_url": "https://..."
}
```

`slug` se autogenera del nombre si no se provee. Solo `nombre` es requerido (mín. 2 caracteres).

#### `PUT /api/admin/categorias/:id`

Actualiza una categoría. Body: cualquier subset de `{ nombre, slug, descripcion, imagen_url, activo }`.

#### `DELETE /api/admin/categorias/:id`

Desactiva la categoría (`activo = false`). **No borra** la categoría.

---

## 4. Queries Directas a Supabase (Cliente)

El frontend usa el SDK de Supabase directamente para varias operaciones, sin pasar por el backend Express.

### Catálogo (público, sin auth)

#### Listar productos (con filtros)

```js
import supabase from './services/supabase.service.js'

const { data, error, count } = await supabase
  .from('productos')
  .select('*, categorias!inner(nombre, slug), imagenes(*)', { count: 'exact' })
  .eq('activo', true)
  .is('deleted_at', null)
  .order('created_at', { ascending: false })
  // Opcionales:
  .eq('categorias.slug', 'prendas-superiores')  // filtrar por categoría
  .ilike('nombre', '%camiseta%')                  // buscar
  .range(0, 11)                                   // paginación
```

#### Obtener producto por slug

```js
const { data, error } = await supabase
  .from('productos')
  .select('*, categorias(nombre, slug), imagenes(*)')
  .eq('slug', 'body-algodon')
  .eq('activo', true)
  .is('deleted_at', null)
  .single()
```

#### Productos destacados

```js
const { data, error } = await supabase
  .from('productos')
  .select('*, categorias(nombre, slug), imagenes(*)')
  .eq('destacado', true)
  .eq('activo', true)
  .is('deleted_at', null)
  .limit(8)
```

#### Listar categorías activas

```js
const { data, error } = await supabase
  .from('categorias')
  .select('*')
  .eq('activo', true)
  .order('nombre')
```

### Carrito (auth requerido, RLS por `auth.uid()`)

```js
// Obtener carrito
const { data, error } = await supabase
  .from('carrito_items')
  .select('*, productos(*, imagenes(*))')
  .eq('perfil_id', user.id)

// Agregar item (con upsert si ya existe)
const { data: existente } = await supabase
  .from('carrito_items')
  .select('id, cantidad')
  .eq('perfil_id', user.id)
  .eq('producto_id', productoId)
  .maybeSingle()

if (existente) {
  // Update
  await supabase.from('carrito_items')
    .update({ cantidad: existente.cantidad + 1 })
    .eq('id', existente.id)
} else {
  // Insert
  await supabase.from('carrito_items')
    .insert({ perfil_id: user.id, producto_id: productoId, cantidad: 1 })
}

// Actualizar cantidad
await supabase.from('carrito_items')
  .update({ cantidad: 5 })
  .eq('id', itemId)
  .eq('perfil_id', user.id)

// Eliminar item
await supabase.from('carrito_items')
  .delete()
  .eq('id', itemId)
  .eq('perfil_id', user.id)

// Vaciar carrito (lo hace el backend automáticamente al hacer checkout)
await supabase.from('carrito_items')
  .delete()
  .eq('perfil_id', user.id)
```

### Perfil (auth requerido, RLS: solo el propio usuario)

```js
// Leer perfil
const { data, error } = await supabase
  .from('perfiles')
  .select('*')
  .eq('id', user.id)
  .single()

// Actualizar perfil
await supabase.from('perfiles')
  .update({
    nombre_completo: 'Jasse Gerardoc',
    telefono: '0991234567',
    ciudad: 'Quito',
    direccion: 'Av. Amazonas N34-451'
  })
  .eq('id', user.id)
```

### Pedidos propios (auth requerido, RLS por `cliente_id`)

```js
// Listar mis pedidos
const { data, error } = await supabase
  .from('pedidos')
  .select('*, detalles_pedido(*, productos(nombre, imagenes(url)))')
  .eq('cliente_id', user.id)
  .order('fecha_pedido', { ascending: false })

// Ver un pedido específico
const { data, error } = await supabase
  .from('pedidos')
  .select('*, detalles_pedido(*, productos(nombre, precio, imagenes(url)))')
  .eq('id', pedidoId)
  .eq('cliente_id', user.id)  // RLS protege igual
  .single()
```

---

## 5. Modelos de Datos

### `categorias`
| Columna | Tipo | Notas |
|---------|------|------|
| `id` | serial PK | Auto-increment |
| `nombre` | text | Requerido |
| `slug` | text unique | Nullable, se autogenera |
| `descripcion` | text | Nullable |
| `imagen_url` | text | Nullable |
| `activo` | boolean | Default `true`, se usa para soft-delete |
| `created_at` | timestamptz | Default `now()` |

### `productos`
| Columna | Tipo | Notas |
|---------|------|------|
| `id` | serial PK | |
| `categoria_id` | integer FK → categorias | Nullable |
| `subcategoria` | text | Default `''` |
| `nombre` | text | Requerido |
| `slug` | text unique | Nullable, se autogenera |
| `descripcion` | text | Nullable |
| `precio` | numeric(10,2) | Requerido > 0 |
| `precio_oferta` | numeric(10,2) | Nullable |
| `stock_total` | integer | Default 0 |
| `colores` | text | CSV: `"rojo,azul,verde"` |
| `talla` | text | Default `'0-3 meses'` |
| `marca` | text | Default `'Ternurita Bebe'` |
| `imagen_url` | text | Nullable |
| `activo` | boolean | Default `true` |
| `destacado` | boolean | Default `false` |
| `sku` | text unique | Nullable |
| `created_at` | timestamptz | Default `now()` |
| `updated_at` | timestamptz | Default `now()` |
| `deleted_at` | timestamptz | Nullable (soft delete) |

### `imagenes`
| Columna | Tipo | Notas |
|---------|------|------|
| `id` | serial PK | |
| `producto_id` | integer FK → productos | `ON DELETE CASCADE` |
| `url` | text | URL pública de Supabase Storage |
| `orden` | integer | Default 0 (para múltiples imágenes) |
| `created_at` | timestamptz | Default `now()` |

### `perfiles`
| Columna | Tipo | Notas |
|---------|------|------|
| `id` | uuid PK | Match con `auth.users.id` |
| `nombre_completo` | text | Nullable |
| `telefono` | text | Nullable |
| `ciudad` | text | Nullable |
| `direccion` | text | Nullable |
| `rol` | text | Default `'cliente'` (no está en JWT directamente, se lee de `app_metadata`) |
| `created_at` | timestamptz | Default `now()` |
| `updated_at` | timestamptz | Default `now()` |

### `carrito_items`
| Columna | Tipo | Notas |
|---------|------|------|
| `id` | serial PK | |
| `perfil_id` | uuid FK → perfiles | `ON DELETE CASCADE` |
| `producto_id` | integer FK → productos | `ON DELETE CASCADE` |
| `cantidad` | integer | Check `> 0`, default 1 |
| `created_at` | timestamptz | Default `now()` |
| | | Unique: `(perfil_id, producto_id)` |

### `pedidos`
| Columna | Tipo | Notas |
|---------|------|------|
| `id` | serial PK | |
| `cliente_id` | uuid FK → perfiles | |
| `total_pedido` | numeric(10,2) | Calculado por `crear_pedido()` |
| `subtotal` | numeric(10,2) | Default 0 |
| `impuesto` | numeric(10,2) | Default 0 |
| `envio` | numeric(10,2) | Default 0 |
| `direccion_envio` | jsonb | `{ direccion, ciudad, telefono, nombre }` |
| `notas` | text | Nullable |
| `estado` | text | `pendiente` → `confirmado` → `enviado` → `entregado` o `cancelado` |
| `fecha_pedido` | date | Default `now()` |
| `created_at` | timestamptz | Default `now()` |
| `updated_at` | timestamptz | Default `now()` |

### `detalles_pedido`
| Columna | Tipo | Notas |
|---------|------|------|
| `id` | serial PK | |
| `pedido_id` | integer FK → pedidos | |
| `producto_id` | integer FK → productos | |
| `cantidad` | integer | |
| `precio_unitario` | numeric(10,2) | Snapshot del precio al momento del pedido |
| `created_at` | timestamptz | Default `now()` |

---

## 6. Rate Limiting

| Scope | Rate limit | Aplicado a |
|-------|------------|------------|
| **Global** | 200 req / 15 min | Todas las rutas |
| **Auth** | 10 req / 15 min | `/api/auth/*` y `/api/checkout` |
| **API** | 100 req / 15 min | `/api/admin/*` |

Cuando se excede el límite, la API devuelve:
```json
{
  "error": "Demasiadas solicitudes. Intenta de nuevo en 15 minutos."
}
```
Status: **429 Too Many Requests**.

---

## 7. Códigos de Error

| Status HTTP | Significado | Cuándo |
|-------------|------------|--------|
| 200 | OK | Respuesta exitosa |
| 201 | Created | POST exitoso (crear recurso) |
| 400 | Bad Request | Validación fallida o datos inválidos |
| 401 | Unauthorized | Token faltante, inválido o expirado |
| 403 | Forbidden | Token válido pero rol no permitido |
| 404 | Not Found | Recurso no existe (en algunos endpoints) |
| 409 | Conflict | Stock insuficiente al crear pedido |
| 429 | Too Many Requests | Rate limit excedido |
| 500 | Internal Server Error | Error del servidor o de BD |

### Errores comunes

| Mensaje | Causa |
|---------|-------|
| `Token requerido` | No se envió `Authorization: Bearer ...` en admin |
| `Token inválido` o `Token expirado` | JWT inválido o caducado |
| `Se requiere rol de administrador` | El usuario tiene rol `cliente` |
| `El carrito esta vacio` | Checkout sin items en el carrito |
| `Stock insuficiente para X` | Cantidad pedida > stock disponible |

---

## 8. Estado del Frontend

### Ya implementadas (funcionando)

| Página | Ruta | Estado |
|--------|------|--------|
| Home | `#/` | ✅ Hero + categorías + destacados |
| Productos | `#/productos` | ✅ Filtros por categoría |
| Producto detalle | `#/productos/:slug` | ✅ |
| Login | `#/login` | ✅ |
| Registro | `#/registro` | ✅ |
| Carrito | `#/carrito` | ✅ |
| Checkout | `#/checkout` | ✅ Crea pedido vía API |
| Perfil | `#/perfil` | ✅ |
| Mis pedidos | `#/pedidos` | ✅ |
| Pedido detalle | `#/pedidos/:id` | ✅ |
| Admin Dashboard | `#/admin` | ⚠️ Skeleton cargando stats (ver [§9](#9-pendientes-del-frontend)) |
| Admin Productos | `#/admin/productos` | ⚠️ CRUD + upload de imágenes |
| Admin Pedidos | `#/admin/pedidos` | ⚠️ List + cambiar estado |
| Admin Usuarios | `#/admin/usuarios` | ⚠️ List + cambiar rol |

### Pendiente de verificar

> **Nota:** Las páginas admin actuales ya cargan datos vía `admin.service.js`. Si no muestran datos, revisar:
> 1. Que el usuario tenga `rol = 'admin'` en `app_metadata.rol` (no en `perfiles.rol`)
> 2. Que el token se envíe en `Authorization: Bearer <access_token>`
> 3. Que no haya errores CORS

---

## 9. Pendientes del Frontend

### 🔴 Prioridad alta (bloqueantes para la demo)

#### 9.1 Admin Dashboard — mostrar stats reales

El endpoint `GET /api/admin/` ya existe y devuelve:
```json
{ "productos": 98, "pedidos": 0, "usuarios": 4, "categorias": 10 }
```

**Tareas:**
- [ ] Crear `client/js/services/admin.service.js` → agregar `dashboard: { stats: () => request('GET', '/api/admin/') }`
- [ ] En `client/js/pages/admin/dashboard.js`, llamar a la API en `afterRender()` y reemplazar los `-` por números
- [ ] Mostrar pedidos recientes (últimos 5) y productos con stock bajo

#### 9.2 Admin Categorías — página CRUD

El endpoint existe: `/api/admin/categorias` (GET, POST, PUT, DELETE).

**Tareas:**
- [ ] Crear página `client/js/pages/admin/categorias.js`
- [ ] Render: tabla con categorías, botón "Nueva categoría", editar/eliminar
- [ ] Form de crear/editar (nombre, slug, descripción, imagen_url)
- [ ] Agregar al servicio: `admin.service.js` → `categorias: { listar, crear, actualizar, eliminar }`
- [ ] Agregar ruta en `router.js`: `{ pattern: '/admin/categorias', page: 'admin-categorias', auth: 'admin' }`

#### 9.3 Forgot/Reset Password — UI

Los endpoints ya existen: `POST /api/auth/forgot-password` y `POST /api/auth/reset-password`.

**Tareas:**
- [ ] Crear página `client/js/pages/forgot-password.js` con input de email
- [ ] Llamar `POST /api/auth/forgot-password` con `{ email }`
- [ ] Crear página `client/js/pages/reset-password.js` con input de nueva contraseña
- [ ] Extraer el token del query param (ej: `?type=recovery&token_hash=xxx`)
- [ ] Llamar `POST /api/auth/reset-password` con `{ newPassword }` y `Authorization: Bearer <token_hash>`
- [ ] Agregar rutas:
  - `{ pattern: '/forgot-password', page: 'forgot-password', auth: false }`
  - `{ pattern: '/reset-password', page: 'reset-password', auth: false }`

#### 9.4 Search — integrar barra de búsqueda

El endpoint existe: `GET /api/search/productos?q=...`.

**Tareas:**
- [ ] Agregar input de búsqueda en el Navbar (o como página separada `#/buscar?q=...`)
- [ ] Opcional: crear servicio `client/js/services/search.service.js`:
  ```js
  export async function buscarProductos(q, page = 1) {
    const res = await fetch(`${CONFIG.API_BASE_URL}/api/search/productos?q=${encodeURIComponent(q)}&page=${page}`)
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    return data
  }
  ```
- [ ] Mostrar resultados usando `renderProductCard` de `components/ProductCard.js`
- [ ] Paginación

---

### 🟡 Prioridad media (deseable)

#### 9.5 Admin Dashboard — widgets extra

**Tareas:**
- [ ] Gráfico de pedidos por estado (pendiente, confirmado, enviado, etc.)
- [ ] Últimos 5 pedidos (tabla rápida con link al detalle)
- [ ] Productos con stock < 10 (alerta visual)

> **Nota:** Para obtener pedidos por estado o últimos 5, se puede usar el endpoint `GET /api/admin/pedidos?estado=X&limit=5` o `GET /api/admin/pedidos?page=1&limit=5`.

#### 9.6 Filtros avanzados en catálogo de productos

**Tareas:**
- [ ] Filtro por talla (0-3 meses, 3-6 meses, 6-12 meses, etc.)
- [ ] Filtro por rango de precio (min/max slider)
- [ ] Ordenamiento (precio asc, precio desc, más recientes)
- [ ] Integrar con la búsqueda `GET /api/search/productos?q=...`

#### 9.7 Imágenes en producto detalle

**Tareas:**
- [ ] Gallery component con miniaturas y zoom
- [ ] Si el producto tiene `imagenes[]`, mostrar todas; sino, usar `imagen_url`
- [ ] Componente reusable `ProductGallery.js`

#### 9.8 Toast notifications en admin

**Tareas:**
- [ ] Mostrar toast de éxito/error al crear/editar/eliminar productos, categorías, pedidos, usuarios
- [ ] Confirmación visual al cambiar estado de pedido ( ej: "Pedido #12 confirmado")

---

### 🟢 Prioridad baja (nice-to-have)

#### 9.9 Optimizaciones

- [ ] Lazy loading de imágenes (`loading="lazy"`)
- [ ] Skeleton loaders mientras cargan datos
- [ ] Infinite scroll en catálogo (o paginación con números)
- [ ] Breadcrumb en producto detalle (Inicio > Categoría > Producto)
- [ ] Vista grid/lista en catálogo

#### 9.10 Páginas faltantes

- [ ] Página de contacto (`#/contacto`)
- [ ] Página "Sobre nosotros" (`#/nosotros`)
- [ ] Página de políticas de envío/devolución
- [ ] FAQ

---

## Resumen de lo que el frontend debe conectar

### Servicios REST nuevos a crear

```js
// Agregar a client/js/services/admin.service.js:

export const categorias = {
  listar: () => listarWrapper('/api/admin/categorias'),
  crear: (data) => request('POST', '/api/admin/categorias', data),
  actualizar: (id, data) => request('PUT', `/api/admin/categorias/${id}`, data),
  eliminar: (id) => request('DELETE', `/api/admin/categorias/${id}`),
}

export const dashboard = {
  stats: () => request('GET', '/api/admin/'),
}
```

```js
// Nuevo servicio: client/js/services/search.service.js
import CONFIG from '../config.js'

export async function buscarProductos(q, page = 1) {
  const res = await fetch(
    `${CONFIG.API_BASE_URL}/api/search/productos?q=${encodeURIComponent(q)}&page=${page}`
  )
  const data = await res.json()
  if (!res.ok) throw new Error(data.error)
  return data // { data, query, pagination }
}
```

```js
// Nuevo servicio: client/js/services/auth-api.service.js
import CONFIG from '../config.js'

export async function forgotPassword(email) {
  const res = await fetch(`${CONFIG.API_BASE_URL}/api/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  })
  return res.json()
}

export async function resetPassword(tokenHash, newPassword) {
  const res = await fetch(`${CONFIG.API_BASE_URL}/api/auth/reset-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenHash}`
    },
    body: JSON.stringify({ newPassword })
  })
  return res.json()
}
```

### Rutas nuevas a agregar al router

```js
// En client/js/router.js, agregar al objeto pages:
'admin-categorias': () => import('./pages/admin/categorias.js'),
'forgot-password':   () => import('./pages/forgot-password.js'),
'reset-password':    () => import('./pages/reset-password.js'),
'buscar':            () => import('./pages/buscar.js'),
```

```js
// En el array routes:
{ pattern: '/admin/categorias', page: 'admin-categorias', auth: 'admin' },
{ pattern: '/forgot-password',  page: 'forgot-password',  auth: false },
{ pattern: '/reset-password',   page: 'reset-password',   auth: false },
{ pattern: '/buscar',           page: 'buscar',            auth: false },
```

### Estructura de carpetas sugerida

```
client/js/
├── pages/
│   ├── admin/
│   │   ├── dashboard.js        # Actualizar: llamar a /api/admin/
│   │   ├── productos.js
│   │   ├── pedidos.js
│   │   ├── usuarios.js
│   │   └── categorias.js      # NUEVO
│   ├── forgot-password.js     # NUEVO
│   ├── reset-password.js      # NUEVO
│   └── buscar.js               # NUEVO
├── services/
│   ├── admin.service.js       # Actualizar: + categorias, + dashboard
│   ├── search.service.js      # NUEVO
│   └── auth-api.service.js    # NUEVO
└── components/
    ├── ProductGallery.js      # NUEVO (opcional)
    └── ... (existentes)
```

---

## Apéndice: Script de Testing con curl

```bash
# Health
curl http://localhost:3000/api/health

# Login (este endpoint NO existe - login se hace con Supabase desde el cliente)
# Token se obtiene con supabase.auth.signInWithPassword

# Forgot password
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@ternuritabebe.com"}'

# Search
curl "http://localhost:3000/api/search/productos?q=camiseta"

# Admin (requiere token)
TOKEN="eyJhbGciOiJFUzI1NiIs..."

# Dashboard stats
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/admin/

# Categorias
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/admin/categorias
curl -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"nombre":"Ropa de invierno"}' http://localhost:3000/api/admin/categorias

# Checkout
curl -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"direccion_envio":{"direccion":"Av. Amazonas","ciudad":"Quito","telefono":"0991234567","nombre":"Jasse"}}' \
  http://localhost:3000/api/checkout
```
