# Ternurita Bebé

E-commerce de ropa y accesorios infantiles. Backend en Node.js/Express + Supabase. Frontend SPA en HTML/CSS/JS vanilla con Tailwind CDN.

## Stack

- **Backend:** Node.js + Express + Supabase (PostgreSQL, Auth, Storage, RLS)
- **Frontend:** HTML/CSS/JS vanilla, Tailwind CDN, hash-router SPA
- **Auth:** Supabase Auth con JWT ES256 (verificado con `jose`)
- **Validación:** Zod
- **Tests:** Jest + supertest

## Estructura

```
ternurita-bebe/
├── client/                 # Frontend SPA (servido por Express)
│   ├── js/
│   │   ├── pages/          # Páginas del router SPA
│   │   ├── services/       # Servicios: auth, productos, admin, etc.
│   │   ├── components/     # Navbar, Footer, ProductCard
│   │   ├── store.js        # Store reactivo (Proxy)
│   │   ├── router.js       # Hash router con dynamic imports
│   │   └── config.js       # Supabase URL, Anon Key, API base URL
│   └── css/
├── server/                # Backend Express
│   ├── config/            # Supabase client
│   ├── controllers/        # Lógica de endpoints
│   ├── middleware/         # auth, admin, rateLimiter, errorHandler
│   ├── routes/            # Definición de rutas REST
│   ├── validators/        # Schemas Zod
│   ├── utils/             # Logger (Winston)
│   └── __tests__/         # Jest tests (7 passing)
└── supabase/
    └── migrations/        # 001_init.sql — schema + RLS + stored procedures
```

## Setup

```bash
# Instalar dependencias del backend
cd server
pnpm install

# Variables de entorno
cp ../.env.example ../.env
# Editar ../.env con SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY

# Migrar base de datos
# Ejecutar supabase/migrations/001_init.sql en el SQL Editor de Supabase

# Iniciar servidor
pnpm start          # Producción
pnpm dev            # Desarrollo (node --watch)
```

El servidor corre en `http://localhost:3000` y sirve tanto la API como el frontend.

## Variables de Entorno

```env
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
SUPABASE_JWKS_URL=https://tu-proyecto.supabase.co/auth/v1/.well-known/jwks.json
PORT=3000
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development
```

## Usuarios de Prueba

| Rol | Email | Password |
|-----|-------|----------|
| Admin | `admin@ternuritabebe.com` | `Admin123!` |
| Cliente | `cliente@ternuritabebe.com` | `Cliente123!` |

## Tests

```bash
cd server
pnpm test           # Ejecutar tests
pnpm test:watch     # Watch mode
```

7 tests cubren: health, SPA fallback, auth validación, search, admin auth.

## Documentación

- [**API-FRONTEND.md**](./API-FRONTEND.md) — Guía completa de la API REST + queries Supabase para el frontend dev
- [supabase/migrations/001_init.sql](./supabase/migrations/001_init.sql) — Schema completo, RLS, stored procedure `crear_pedido()`
