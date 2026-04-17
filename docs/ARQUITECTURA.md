# Arquitectura — MAISON ÉLARA Multi-Client Template

> Documento técnico para el próximo dev/AI que trabaje en este proyecto.
> Stack: **Next.js 14 App Router + Supabase + Tailwind + TypeScript**

---

## Modelo de negocio y arquitectura de alto nivel

Este es un template de tienda de moda de lujo construido en modo **multi-client SaaS manual**:

- Existe **un único repo** en Git
- Existe **una instancia "demo"** deployada en Vercel, que actúa como vitrina para vender el template
- Cada cliente que compra recibe **su propio proyecto Supabase** (base de datos aislada) + **su propio proyecto Vercel** (deploy del mismo repo)
- La personalización (nombre, colores, textos, logos, feature flags) **no requiere tocar código** — todo vive en la tabla `site_settings` de Supabase y se configura desde un admin panel

El resultado: Manu puede vender la misma codebase N veces, cada cliente ve "su" tienda personalizada, y si Manu mejora el template base puede actualizar los deploys de los clientes haciendo merge.

### Diagrama conceptual

```
[Repo Git único]
       |
       |── deploy → [Vercel: demo.maison-elara.com]  ← Supabase proyecto DEMO
       |── deploy → [Vercel: vanesa-boutique.com]    ← Supabase proyecto VANESA
       └── deploy → [Vercel: otra-tienda.com]        ← Supabase proyecto OTRA
```

Cada Vercel sabe a qué Supabase conectar por las 2 env vars. Nada hardcodeado en código.

---

## Variables de entorno

**Exactamente 2 env vars por deployment. Nada más.**

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
```

Todo lo demás (nombre, colores, textos, social links, feature flags) se lee de `site_settings` en runtime.

---

## Estructura de archivos relevante

Solo los archivos nuevos/modificados respecto a un Next.js 14 estándar:

```
src/
├── app/
│   ├── layout.tsx                    # Fetch site config + inyecta CSS vars de colores
│   ├── page.tsx                      # Home, usa feature flags para renders condicionales
│   ├── admin/
│   │   ├── layout.tsx                # Layout del admin panel (auth guard)
│   │   └── settings/
│   │       └── page.tsx              # AdminSettings.tsx — UI de configuración
│   └── auth/
│       └── login/page.tsx            # Login page del admin
│
├── lib/
│   ├── site-config.ts               # getSiteConfig() — fetch + merge + cache
│   ├── site-config-types.ts         # Tipos TypeScript: SiteConfig, BrandColors, Features
│   └── supabase/
│       ├── client.ts                # createBrowserClient()
│       └── server.ts                # createServerClient()
│
├── components/
│   ├── providers/
│   │   └── SiteConfigProvider.tsx   # Context provider client-side
│   └── admin/
│       └── AdminSettings.tsx        # Tabs UI para editar site_settings
│
supabase/
├── base.sql                         # Schema completo (todas las tablas + RLS)
├── seed-demo.sql                    # Datos demo para la vitrina de ventas
└── seed-empty-client.sql            # Datos vacíos para cliente nuevo

scripts/
└── onboard-client.ts                # Script de bootstrapping de cliente nuevo

clientes/
└── {slug}.json                      # Config por cliente (gitignored, contiene service keys)
```

---

## Flujo de `getSiteConfig()`

Archivo: `src/lib/site-config.ts`

```
Request entrante (cualquier página)
    │
    ▼
getSiteConfig()  [server-side, cacheado con React cache()]
    │
    ├── 1. Chequea el cache de React (per-request memoization)
    │       └── Si hay hit → retorna SiteConfig cacheado
    │
    ├── 2. createServerClient() con las 2 env vars
    │
    ├── 3. supabase.from('site_settings').select('key, value')
    │       └── Trae todas las rows de la tabla como array [{key, value}]
    │
    ├── 4. mergeSettings(rows)
    │       ├── Convierte el array a un objeto {key: value}
    │       ├── Aplica defaults para cualquier key faltante
    │       └── Parsea los campos JSON (brand_colors, features, social_links)
    │
    └── 5. Retorna SiteConfig (objeto tipado)
```

### Por qué `React cache()` y no `unstable_cache`

`React cache()` deduplica llamadas dentro del mismo render tree (por request). No persiste entre requests — cada request hace su propio fetch a Supabase. Esto es intencional: queremos que los cambios del admin se vean de inmediato sin revalidar caché de Next.js.

Si en el futuro se necesita caching más agresivo (ISR), se puede agregar `unstable_cache` con un tag `site-config` y revalidar desde el admin al guardar.

---

## Patrón `SiteConfigProvider`

El problema: `getSiteConfig()` es server-only (usa `createServerClient`). Los componentes client (`'use client'`) no pueden llamarlo directamente.

La solución:

```
layout.tsx (Server Component)
    │
    ├── await getSiteConfig()  → SiteConfig
    │
    └── <SiteConfigProvider initialConfig={siteConfig}>
              {children}
        </SiteConfigProvider>
```

`SiteConfigProvider` es un Client Component que:
1. Recibe `initialConfig` como prop desde el server
2. Lo guarda en un React Context
3. Expone `useSiteConfig()` para cualquier componente client que lo necesite

```tsx
// En cualquier componente client:
const { storeName, brandColors, features } = useSiteConfig()
```

Los componentes server que necesiten la config llaman directamente a `getSiteConfig()` (no usan el hook).

---

## Flujo de CSS vars de colores de marca

El objetivo: el cliente elige colores en el admin → se aplican en toda la UI sin rebuild.

```
site_settings (Supabase)
    │   brand_colors: { primary: "#C9A96E", accent: "#4A3728" }
    │
    ▼
getSiteConfig() → siteConfig.brandColors
    │
    ▼
layout.tsx (Server Component)
    │   Genera inline style:
    │   `--color-brand-primary: #C9A96E;`
    │   `--color-brand-accent: #4A3728;`
    │
    ▼
<html style={cssVarsString}>  ← se inyecta en el <html> tag
    │
    ▼
tailwind.config.ts
    │   colors: {
    │     'brand-primary': 'var(--color-brand-primary)',
    │     'brand-accent': 'var(--color-brand-accent)',
    │   }
    │
    ▼
Clases Tailwind: bg-brand-primary, text-brand-accent, border-brand-primary
    │
    ▼
Runtime override: cuando el cliente cambia el color en el admin
    → PUT a site_settings
    → Próximo page load lee el nuevo valor
    → CSS var actualizada → toda la UI cambia de color
```

Los nombres semánticos internos (`champagne`, `mocha`) mapean a:
- `champagne` → `--color-brand-primary` (dorado claro, tono lujo)
- `mocha` → `--color-brand-accent` (marrón oscuro, contraste)

---

## Patrón de feature flags

Feature flags son booleanos en `site_settings` bajo la key `features` (JSON):

```json
{
  "show_press_strip": true,
  "show_newsletter": true,
  "show_testimonials": false,
  "show_instagram_feed": false,
  "show_offer_banner": true
}
```

Uso en páginas server:

```tsx
// app/page.tsx (Server Component)
const config = await getSiteConfig()

return (
  <main>
    <HeroSection />
    <ProductGrid />
    {config.features.show_press_strip && <PressStrip />}
    {config.features.show_newsletter && <NewsletterSection />}
    {config.features.show_testimonials && <Testimonials />}
  </main>
)
```

Nunca renderizar el componente y ocultarlo con CSS — usar condicional a nivel JSX para evitar hydration cost y leakage de HTML.

---

## Catálogo completo de keys de `site_settings`

Cada row es `{ key: string, value: string }`. Los valores JSON se guardan como string y se parsean en `mergeSettings()`.

| Key | Tipo del value | Controla |
|---|---|---|
| `store_name` | string | Nombre de la tienda (header, tab title, SEO) |
| `store_tagline` | string | Frase corta debajo del nombre |
| `store_description` | string | Meta description y About |
| `logo_url` | string (URL) | Logo del header |
| `favicon_url` | string (URL) | Favicon del browser |
| `brand_colors` | JSON string | `{ primary: string, accent: string }` |
| `hero_title` | string | H1 del hero de la home |
| `hero_subtitle` | string | Subtítulo del hero |
| `hero_cta_text` | string | Texto del botón CTA del hero |
| `hero_cta_url` | string | URL a la que apunta el CTA |
| `hero_image_url` | string (URL) | Imagen de fondo del hero |
| `features` | JSON string | Feature flags (ver sección anterior) |
| `social_links` | JSON string | `{ instagram, facebook, tiktok, pinterest, whatsapp }` |
| `offer_banner_text` | string | Texto del banner de oferta superior |
| `admin_email` | string | Email del usuario admin del cliente |
| `currency` | string | Código de moneda (ej: "USD", "ARS") |
| `contact_email` | string | Email de contacto público de la tienda |

---

## Script `onboard-client.ts`

Ubicación: `scripts/onboard-client.ts`
Comando: `npm run onboard-client clientes/{slug}.json`

Qué hace, en orden:

1. Lee el JSON del cliente desde `clientes/{slug}.json`
2. Inicializa un Supabase client con la `supabaseServiceKey` (privilegios de admin)
3. Ejecuta `supabase/seed-empty-client.sql` contra la base del cliente
   - Inserta categorías base vacías
   - Inserta rows en `site_settings` con los defaults del sistema
4. Override de settings con los valores del JSON del cliente (store name, tagline, etc.)
5. Crea el usuario admin via `supabase.auth.admin.createUser()` con email + temp password
6. Loggea éxito/error de cada paso con prefijos claros

El script usa `tsx` para correr TypeScript directamente sin compilar. Está configurado en `package.json`:

```json
{
  "scripts": {
    "onboard-client": "tsx scripts/onboard-client.ts"
  }
}
```

---

## Jerarquía de archivos SQL

```
supabase/base.sql
    │
    │   Define todo el schema:
    │   - Tablas: products, categories, orders, order_items, site_settings
    │   - Tipos ENUM: order_status, product_status
    │   - RLS policies (anon puede leer productos; solo auth puede leer orders; service_role para todo)
    │   - Índices en columnas de alta consulta
    │
    ├── supabase/seed-demo.sql
    │       Corre sobre base.sql
    │       Inserta: productos demo con fotos de Unsplash, categorías de ejemplo,
    │       settings de MAISON ÉLARA (nombre, colores champagne/mocha, textos de lujo)
    │       Uso: instancia demo/vitrina de ventas
    │
    └── supabase/seed-empty-client.sql
            Corre sobre base.sql
            Inserta: categorías vacías genéricas, settings mínimos con defaults del sistema
            NO inserta productos (el cliente los carga desde el admin)
            Uso: cliente nuevo recién onboardeado
```

**Nunca correr seed-demo.sql en un proyecto de cliente real.** El onboard-client script siempre usa `seed-empty-client.sql`.

---

## Cómo agregar una nueva setting en el futuro

Proceso de 5 pasos, estricto, sin saltearse nada:

**Paso 1 — Agregar la key a los seeds SQL**

En `supabase/seed-empty-client.sql` y `supabase/seed-demo.sql`:
```sql
INSERT INTO site_settings (key, value) VALUES ('nueva_key', 'valor_default');
```

**Paso 2 — Agregar el tipo en `site-config-types.ts`**

```typescript
// src/lib/site-config-types.ts
export interface SiteConfig {
  // ... existentes ...
  nuevaKey: string  // o el tipo que corresponda
}
```

**Paso 3 — Agregar a `mergeSettings()` en `site-config.ts`**

```typescript
// src/lib/site-config.ts
function mergeSettings(rows: SettingRow[]): SiteConfig {
  const map = Object.fromEntries(rows.map(r => [r.key, r.value]))
  return {
    // ... existentes ...
    nuevaKey: map['nueva_key'] ?? 'valor_default',
  }
}
```

**Paso 4 — Agregar el campo en `AdminSettings.tsx`**

Buscar el tab correspondiente y agregar el input:
```tsx
// src/components/admin/AdminSettings.tsx
<input
  value={settings.nuevaKey}
  onChange={e => updateSetting('nueva_key', e.target.value)}
  placeholder="Valor por defecto"
/>
```

**Paso 5 — Usar la nueva setting donde corresponda**

En componentes server: `const config = await getSiteConfig(); config.nuevaKey`
En componentes client: `const { nuevaKey } = useSiteConfig()`

No hay paso 6. No requiere rebuild ni redeploy del schema si la tabla `site_settings` ya existe — solo nuevas rows.

---

## Limitaciones conocidas

Estas cosas están hardcodeadas y **no son configurables desde el admin actualmente**. Son deuda técnica conocida.

### `formatPrice()` hardcodeado a es-AR / USD

```typescript
// Dónde: src/lib/utils.ts (o similar)
// Problema: siempre usa locale es-AR y currency USD
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'USD',  // ← hardcodeado
  }).format(price)
}
```

Fix futuro: leer `currency` y `locale` de `SiteConfig`.

### Logos del PressStrip hardcodeados

```typescript
// Dónde: src/components/PressStrip.tsx
// Problema: los logos de medios son imágenes estáticas en el código
const PRESS_LOGOS = [
  { name: 'Vogue', src: '/logos/vogue.svg' },
  // ...
]
```

Fix futuro: agregar tabla `press_logos` en Supabase o key JSON en `site_settings`.

### `NAV_LINKS` hardcodeados

```typescript
// Dónde: src/components/Header.tsx (o Nav.tsx)
// Problema: la navegación principal está en el código, no es editable desde el admin
const NAV_LINKS = [
  { label: 'Colección', href: '/productos' },
  { label: 'Nosotros', href: '/nosotros' },
  // ...
]
```

Fix futuro: agregar key `nav_links` como JSON array en `site_settings`.

---

## Convenciones de código

- **Server Components por defecto** — `'use client'` solo cuando sea estrictamente necesario (interactividad, hooks de estado, efectos)
- **`getSiteConfig()` solo en server** — nunca importar desde un componente client
- **`useSiteConfig()` solo en client** — el hook del context provider
- **Settings como strings en DB** — Supabase guarda todo como `text`, el parsing a tipos complejos ocurre en `mergeSettings()`
- **Sin variables de entorno adicionales** — si necesitás configurar algo nuevo, va a `site_settings`, no a `.env`

---

*Última actualización: Abril 2026 — APEX / theapexweb.com*
