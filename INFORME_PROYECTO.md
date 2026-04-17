# INFORME DEL PROYECTO — MAISON ÉLARA (maison-elara)

## 1. Identidad

- **Nombre del proyecto:** `maison-elara` (npm `package.json`); marca **MAISON ÉLARA** (`SITE_NAME` en `src/lib/constants.ts`).
- **Descripción en 2 líneas:** E-commerce de moda femenina con estética editorial de lujo, orientado a catálogo curado y experiencia boutique. Incluye tienda pública y panel de administración conectado a Supabase.
- **Estado actual:** En desarrollo / preparación para deploy — stack completo en código; producción depende de instancia Supabase y variables de entorno (no verificado desde este entorno).
- **URL:** No hay URL de producción fijada en el repo. Fallbacks en código: `http://localhost:3000` (`SITE_URL`, `layout.tsx`) y `https://maisonelara.com` como default en `src/app/sitemap.ts` si falta `NEXT_PUBLIC_SITE_URL`.

## 2. Stack técnico

- **Framework:** Next.js **14.2.21** (App Router, React 18.3).
- **Lenguaje:** TypeScript **~5.7** (`devDependencies`).
- **Base de datos / backend:** **Supabase** — PostgreSQL vía cliente JS, Auth (email/contraseña + callback OAuth PKCE), Storage (buckets definidos en SQL; uploads desde app no verificados en código).
- **Librerías clave (propósito):**
  - `@supabase/supabase-js` + `@supabase/ssr` — clientes browser/server/middleware, cookies SSR.
  - `tailwindcss` + `clsx` + `tailwind-merge` — UI utility-first; helper `cn()` en `src/lib/utils.ts`.
  - `framer-motion` — animaciones en tienda (hero, checkout, cards, etc.).
  - `lenis` — scroll suave; `LenisProvider` en layout tienda.
  - `embla-carousel-react` + `embla-carousel-autoplay` — carruseles (galerías, home).
  - `lucide-react` — íconos.
  - `zustand` + `persist` — carrito con persistencia `localStorage` (`maison-elara-cart`).
  - **Recharts** — importado en `RevenueChart.tsx` y `OrdersDonut.tsx` (gráficos admin); **no declarado** en `package.json` del proyecto (riesgo de build roto o dependencia implícita; ver §10).
- **Herramientas de dev:** ESLint **8** + `eslint-config-next` 14.2.21; PostCSS + Autoprefixer; **Prettier** no está en `package.json` del proyecto (solo a través de dependencias transitivas en `node_modules`).

## 3. Estructura de carpetas

Árbol principal hasta 2 niveles (sin `node_modules`, `.next`, `dist`):

```
e-commerce_mujer/
├── public/              → assets estáticos servidos por Next (imágenes locales referenciadas en código).
├── src/
│   ├── app/             → rutas App Router: tienda (store), admin, auth, layout raíz, sitemap.
│   ├── components/      → UI: subcarpetas `store/`, `admin/`, `ui/` (primitivos reutilizables).
│   ├── lib/             → utilidades, constantes, clientes Supabase, store Zustand, imágenes editoriales.
│   ├── styles/          → `globals.css` (variables CSS, Lenis, focus, scrollbar).
│   └── types/           → modelos TS compartidos (Product, Order, etc.).
├── supabase-schema.sql  → DDL, RLS, buckets, seed demo (ejecutar en Supabase SQL Editor).
├── supabase-fix-images.sql → script auxiliar de imágenes (nombre descriptivo; no auditado línea a línea en este informe).
├── tailwind.config.ts   → tokens de color, fuentes, easings, animación shimmer.
├── next.config.js       → `images.remotePatterns` (Supabase storage, Unsplash, picsum).
├── package.json / package-lock.json
└── README.md            → setup y lista de env (puede desincronizarse del código; cruzar con §7).
```

**Nota:** En un listado de filesystem apareció una ruta anómala tipo `src\{app\...` con llaves; conviene verificar en el disco si existe una carpeta mal creada y eliminarla si es basura.

## 4. Identidad visual

- **Paleta (Tailwind + `:root` en `globals.css`):**  
  `ivory` **#FAF8F5** · `cream` **#F0EEE9** (Cloud Dancer 2026) · `charcoal` **#1A1A1A** · `dark-gray` **#3D3D3D** · `warm-gray` **#8A8A8A** · `champagne` **#C4A265** (acento dorado) · `mocha` **#A47764** (Mocha Mousse) · `pale-gray` **#E8E4DF** · `muted-red` **#9B1B30** · `deep-forest` **#2D5016**.
- **Tipografías:** **Display** — Bodoni Moda (`next/font/google` `Bodoni_Moda`, variable `--font-bodoni`, weights 400/700, italic). **Body** — Inter (`--font-inter`, weights 300–600). Clases utilitarias: `font-display` / `font-body` (definidas en CSS + `tailwind.config.ts`).
- **Transiciones / easing custom (`transitionTimingFunction`):** `luxury` `cubic-bezier(0.25, 0.1, 0.25, 1)` · `expo` `cubic-bezier(0.76, 0, 0.24, 1)` · `reveal` `cubic-bezier(0.6, 0.05, 0.01, 0.9)`. Animación **shimmer** (keyframes en Tailwind).
- **Tono visual (1 frase):** Moda de lujo editorial minimalista: mucho aire, tipografía serif display, acentos champagne/mocha, bordes finos y micro-copy en mayúsculas con tracking amplio.

## 5. Convenciones de código

- **Componentes:** PascalCase, un componente principal por archivo (ej. `Navbar.tsx` export default). Sin barrel `index.ts` en `components/`.
- **Rutas App Router:** Grupo `(store)` para la tienda con layout compartido; `admin` y `auth` fuera del grupo. Páginas delgadas que componen secciones desde `components/store` o `components/admin`.
- **Tailwind:** Clases utilitarias densas; `cn()` para merges condicionales. Colores semánticos del theme extendido. Spacing y tipografía a menudo en valores arbitrarios (`text-[10px]`, `tracking-[0.3em]`).
- **Estado:** Carrito global con **Zustand** (`src/lib/store/cart.ts`). Resto: estado local en componentes cliente; **sin** Redux. Toast vía `ToastProvider` en layout raíz.
- **Supabase:**  
  - Servidor / RSC: `createClient()` desde `src/lib/supabase/server.ts` (cookies `next/headers`).  
  - Cliente: `src/lib/supabase/client.ts` (`createBrowserClient`).  
  - Middleware: instancia SSR para `getUser()` y protección de rutas.  
  - `src/lib/supabase/admin.ts` expone `createAdminClient()` (service role) — **no hay usos** en `src/` fuera de ese archivo (código muerto o reservado).

## 6. Módulos principales

### Tienda — Home y layout

- **Rutas:** `/` → `src/app/(store)/page.tsx` (home).
- **Componentes principales:** `HeroSection`, `EditorialStrip`, `NewArrivals`, `EditorialSection`, `CategoriesGrid`, `PressStrip`, `InstagramFeed`, `NewsletterCTA`; envueltos por `(store)/layout.tsx` con `Navbar`, `Footer`, `LenisProvider`.
- **Funcional:** SSR con queries Supabase si hay env (`hasSupabaseEnv`); novedades (`is_new`), categorías con conteo de productos. Constante de paginación catálogo: `ITEMS_PER_PAGE = 12` (`src/lib/constants.ts`).
- **Estado:** Completo a nivel UI/integración con datos; depende de datos reales en Supabase.
- **Newsletter (`NewsletterCTA`):** formulario **solo UI** — el botón “Unirme” limpia el email local (`setEmail('')`); **no hay** POST a API ni tabla de suscriptores en el esquema SQL provisto.

### Tienda — Catálogo y producto

- **Rutas:** `/products`, `/products/[slug]` (+ `loading.tsx`); filtros/paginación en listado.
- **Componentes:** `ProductCatalog`, `ProductCard`, `ProductFilters`, `ProductGallery`, `ProductInfo`, `RelatedProducts`.
- **Funcional:** Listado, detalle, variantes (talla/color), stock mostrado desde DB.
- **Estado:** Completo para lectura; checkout no descuenta stock (ver §10).

### Tienda — Colecciones

- **Rutas:** `/collections`, `/collections/[slug]` (ej. `new-arrivals` enlazado desde `NAV_LINKS`).
- **Componentes:** `CollectionsIndex`, `CollectionPage`.
- **Funcional:** Listado de colecciones activas y página por slug con productos asociados.
- **Estado:** Completo con datos.

### Tienda — Carrito y checkout

- **Rutas:** `/cart`, `/checkout` (misma página checkout maneja query `?confirmed=ME-xxxxx`).
- **Componentes:** `CartDrawer`, `CartPage`, `CheckoutPage`.
- **Funcional:** Carrito persistente; checkout inserta fila en `orders` + líneas en `order_items` con cliente Supabase anónimo; cálculo subtotal/envío (gratis ≥ 500) / impuesto aproximado 10%; vista confirmación editorial.
- **Estado:** Flujo “captura pedido” operativo; **paso “Pago” del UI es mayormente informativo** — no hay pasarela (Stripe/Mercado Pago, etc.) integrada en código revisado.

### Tienda — Búsqueda

- **Ruta:** `/search` → `src/app/(store)/search/page.tsx` hace **`redirect('/')`**; la búsqueda vive en **`SearchOverlay`** dentro de `Navbar` (no hay página de resultados dedicada).
- **Funcional:** Overlay con consultas a Supabase desde el cliente (patrón típico debounced; revisar `Navbar.tsx` / `SearchOverlay.tsx` para detalle de queries).
- **Estado:** UX de búsqueda en header **[x]**; ruta `/search` como tal es **[ ]** placeholder (solo redirección).

### Autenticación

- **Rutas:** `/auth/login` (form email/password), `/auth/callback` (route handler intercambia `code` por sesión).
- **Funcional:** Sign-in; redirect post-login a `/admin` o `next` query.
- **Estado:** Completo para flujo email/contraseña + OAuth si está configurado en Supabase.

### Admin — Dashboard y CRUD

- **Rutas:** `/admin` (home métricas), `/admin/products`, `/admin/products/[id]`, `/admin/categories`, `/admin/inventory`, `/admin/orders`, `/admin/orders/[id]`, `/admin/settings`; layouts y `loading`/`error` dedicados.
- **Componentes:** `Sidebar`, `TopBar`, `StatsCard`, `RevenueChart`, `OrdersDonut`, `TopProducts`, `DataTable`, formularios `ProductForm`, listas de categorías/pedidos, `AdminSettings`, etc.
- **Funcional:** CRUD catálogo y pedidos vía Supabase con usuario autenticado; dashboard agrega órdenes e ítems; gráfico de revenue mezcla datos reales por día con **fallback aleatorio** si no hay ventas ese día (`admin/page.tsx`).
- **Estado:** Funcional con autenticación; gráficos dependen de Recharts instalado (ver §10).

### SEO / metadata

- **Archivos:** `src/app/layout.tsx` (metadata global, `metadataBase`, OG, `locale: es_AR`), `sitemap.ts` (URLs estáticas + productos activos + colecciones activas), `not-found.tsx`.
- **Estado:** Implementado.

### API Routes

- **Carpeta:** `src/app/api` — **vacía** en esta copia (sin route handlers REST propios).

### Apéndice — mapa rápido de rutas → archivos

| Ruta | Archivo página principal |
|------|---------------------------|
| `/` | `src/app/(store)/page.tsx` |
| `/products` | `src/app/(store)/products/page.tsx` |
| `/products/[slug]` | `src/app/(store)/products/[slug]/page.tsx` |
| `/collections` | `src/app/(store)/collections/page.tsx` |
| `/collections/[slug]` | `src/app/(store)/collections/[slug]/page.tsx` |
| `/cart` | `src/app/(store)/cart/page.tsx` |
| `/checkout` | `src/app/(store)/checkout/page.tsx` |
| `/search` | `src/app/(store)/search/page.tsx` (redirect a `/`) |
| `/auth/login` | `src/app/auth/login/page.tsx` |
| `/auth/callback` | `src/app/auth/callback/route.ts` |
| `/admin` | `src/app/admin/page.tsx` |
| `/admin/products` | `src/app/admin/products/page.tsx` |
| `/admin/products/[id]` | `src/app/admin/products/[id]/page.tsx` |
| `/admin/categories` | `src/app/admin/categories/page.tsx` |
| `/admin/inventory` | `src/app/admin/inventory/page.tsx` |
| `/admin/orders` | `src/app/admin/orders/page.tsx` |
| `/admin/orders/[id]` | `src/app/admin/orders/[id]/page.tsx` |
| `/admin/settings` | `src/app/admin/settings/page.tsx` |

**Middleware (`src/middleware.ts`):** `matcher: ['/admin/:path*', '/auth/login']` — solo esas rutas pasan por la lógica de sesión Supabase (refresh de cookies + redirects).

### Transiciones entre páginas de la tienda

- **`src/app/(store)/template.tsx` (client):** “Cortina” full-screen `motion.div` con fondo `bg-cream` que hace **scaleY** de 1→0 con easing **expo** (`[0.76, 0, 0.24, 1]`); el contenido hace fade-in con delay 0.5s y easing **luxury** (`[0.25, 0.1, 0.25, 1]`). Cada navegación dentro de `(store)` dispara la animación.

### Errores y loading (App Router)

- **Store:** `src/app/(store)/error.tsx`, `loading.tsx` — estados de error y carga del segmento tienda.
- **Admin:** `src/app/admin/error.tsx`, `loading.tsx` + `loading.tsx` en subrutas (`categories`, `inventory`, `orders`, `products`, `settings`).
- **Global:** `src/app/not-found.tsx`.

### `public/`

- Contiene al menos **`robots.txt`** (crawl rules estáticos; sin `llms.txt` ni archivos extra detectados en esta copia).

## 7. Integraciones externas

- **Supabase:** Auth, PostgREST (tablas públicas de catálogo + inserts anónimos de órdenes), Storage (políticas en SQL).
- **CDNs de imagen:** Unsplash (URLs en seed y `editorial-images.ts`); `next/image` permite también `*.supabase.co` storage y `picsum.photos` (dev/placeholder).
- **Variables de entorno (solo nombres):**  
  `NEXT_PUBLIC_SUPABASE_URL`  
  `NEXT_PUBLIC_SUPABASE_ANON_KEY`  
  `SUPABASE_SERVICE_ROLE_KEY`  
  `NEXT_PUBLIC_SITE_URL`  
  (README menciona `.env.local.example` — verificar existencia en el repo; en el análisis no se listó el archivo ejemplo.)
- **Webhooks / triggers externos:** No hay código de webhooks de pagos ni Edge Functions en este repositorio.

## 8. Base de datos

Definición canónica: `supabase-schema.sql`.

- **`categories`** — Jerarquía opcional (`parent_id`), slug, imagen, orden.
- **`collections`** — Campañas/temporadas, slug, `is_active`, `season`.
- **`products`** — Catálogo: precio, `compare_at_price`, FK categoría/colección, flags `is_featured` / `is_new`, `status` (`active` | `draft` | `archived`).
- **`product_images`** — Galería por producto (`position`).
- **`product_variants`** — SKU único, talla, color, `color_hex`, `stock`.
- **`orders`** — Cliente, totales, `status`, `shipping_address` JSONB; `order_number` autogenerado `ME-00001` vía secuencia/trigger.
- **`order_items`** — Líneas de pedido con snapshot de nombre/talla/color/precio.
- **`site_settings`** — Pares clave/valor JSON para configuración (nombre tienda, moneda, umbral envío gratis, barra de anuncio en seed).

**Relaciones clave:** `products` → `categories`, `collections`; `product_images` / `product_variants` → `products` ON DELETE CASCADE; `order_items` → `orders` y referencia opcional `products`.

**RLS (resumen):** Lectura pública de catálogo e imágenes/variantes; inserción anónima permitida en `orders` y `order_items`; lectura/actualización de órdenes para `authenticated`; CRUD completo en catálogo para `authenticated`; `site_settings` lectura pública, escritura autenticada; políticas Storage alineadas (lectura pública, escritura autenticada en buckets `products`, `categories`, `collections`).

## 9. Estado de funcionalidades

- [x] Tienda responsive con home editorial y secciones marketing (Instagram/press/newsletter como contenido estático/editorial).
- [x] Listado y detalle de productos con variantes y precios en USD (`formatPrice` es `es-AR` + `USD`).
- [x] Carrito con persistencia local.
- [x] Checkout que persiste pedido en Supabase y pantalla de confirmación.
- [x] Auth admin + middleware de protección `/admin`.
- [x] Panel admin: productos, categorías, colecciones, inventario, pedidos, ajustes, dashboard.
- [x] Sitemap dinámico y metadata OG base.
- [~] **Pagos reales** — no integrados; pedido queda `pending` sin pasarela.
- [~] **Inventario post-venta** — no hay decremento de `product_variants.stock` en el flujo de checkout revisado.
- [~] **Gráfico de ingresos admin** — puede mostrar valores random en días sin ventas.
- [ ] **Upload de imágenes a Supabase Storage desde el admin** — no detectado en `ProductForm` (URLs manuales / seed).
- [ ] **API routes internas** — carpeta vacía.
- [ ] **Tests automatizados** — no hay suite en `package.json` (solo `lint`).

## 10. Problemas conocidos o deuda técnica

- **Recharts ausente en `package.json`:** Los componentes admin importan `recharts`. **Verificado (abr. 2026):** `npm run build` falla con `Module not found: Can't resolve 'recharts'` en `OrdersDonut.tsx` y `RevenueChart.tsx`. Solución: `npm install recharts` y commitear dependencia; alinear README con `package.json`.
- **Checkout sin actualización de stock** — riesgo de sobreventa; conviene transacción RPC o trigger y validación de stock antes del insert.
- **`createAdminClient` sin uso** — o se integra (ej. tareas server-side privilegiadas) o se elimina para reducir superficie de documentación/env.
- **Datos mock en chart de revenue** — `Math.random()` en días sin órdenes (`admin/page.tsx`) puede confundir en demo/productivo.
- **Proyecto sin Git en esta copia** — no hay trazabilidad de versiones local (`fatal: not a git repository`); conviene inicializar remoto para CI y changelog.
- **Posible carpeta corrupta `src\{app\...`** — revisar filesystem.
- **README en inglés / código y copy en español** — mezcla intencional o pendiente de unificar tono.

## 11. Últimos cambios significativos

No fue posible obtener **git log** (el directorio analizado no es un repositorio git). A partir del código y comentarios visibles:

- Esquema SQL extenso con seed de **12 productos**, **6 categorías**, **2 colecciones**, **5 pedidos** demo y `site_settings` iniciales.
- Paleta 2026 documentada en comentarios (`globals.css`, `tailwind.config.ts` — Cloud Dancer / Mocha Mousse).
- Ajuste de `Bodoni_Moda` con `adjustFontFallback: false` para evitar error de métricas en `next/font`.
- Layout tienda con offset fijo de header documentado (`STORE_HEADER_OFFSET` alineado con `Navbar` / hero).
- `editorial-images.ts` con URLs Unsplash curadas y helper `isRemoteImageUrl` / `getPrimaryProductImageUrl` para fallbacks de imagen.
- Sitemap que consume slugs de productos y colecciones desde Supabase.

*(Cuando haya git: regenerar esta sección con `git log -10 --oneline`.)*

## 12. Nota para el próximo asistente

Este proyecto es un **e-commerce de lujo en Next 14 + Supabase** con mucho trabajo puesto en **UI editorial, motion y copy en español rioplatense**. Lo que más van a pedir suele ser **refinamiento visual por página**, nuevas secciones marketing, o **endurecer el flujo comercial** (pagos, stock, emails de pedido) sin romper la estética ni las políticas RLS. Antes de tocar el admin dashboard, verificá que **Recharts** esté declarado y que el build pase.

---

## Apéndice C — Inventario de componentes (`src/components/`)

Referencias únicas para ubicar lógica UI sin abrir el repo entero. Todos bajo `src/components/`.

### `store/` (vitamina de la tienda pública)

| Archivo | Rol breve |
|---------|-----------|
| `Navbar.tsx` | Header fijo, navegación, mega menú, carrito, integración búsqueda. |
| `Footer.tsx` | Pie de sitio, links legales/editorial. |
| `LenisProvider.tsx` | Proveedor scroll Lenis para el layout tienda. |
| `HeroSection.tsx` | Hero home con motion / imagen editorial. |
| `EditorialStrip.tsx` | Franja editorial entre secciones. |
| `EditorialSection.tsx` | Bloque editorial asimétrico. |
| `NewArrivals.tsx` | Grid/carrusel de novedades. |
| `CategoriesGrid.tsx` | Grilla de categorías con conteos. |
| `PressStrip.tsx` | Logos o menciones prensa. |
| `InstagramFeed.tsx` | Mosaico tipo Instagram (`editorial-images` / grid fijo). |
| `NewsletterCTA.tsx` | CTA newsletter (sin backend). |
| `ProductCard.tsx` | Tarjeta producto para grillas. |
| `ProductCatalog.tsx` | Listado catálogo + paginación. |
| `ProductFilters.tsx` | Filtros laterales o drawer. |
| `ProductGallery.tsx` | Galería detalle (Embla + zoom si aplica). |
| `ProductInfo.tsx` | Nombre, precio, variantes, add to cart. |
| `RelatedProducts.tsx` | Cross-sell al final del PDP. |
| `CollectionPage.tsx` | Vista colección con hero. |
| `CollectionsIndex.tsx` | Índice de todas las colecciones. |
| `CartDrawer.tsx` | Drawer lateral del carrito. |
| `CartPage.tsx` | Página `/cart` completa. |
| `CheckoutPage.tsx` | Flujo checkout + confirmación por querystring. |
| `SearchOverlay.tsx` | Overlay de búsqueda en vivo. |

### `admin/` (dashboard)

| Archivo | Rol breve |
|---------|-----------|
| `Sidebar.tsx` | Navegación lateral colapsable. |
| `TopBar.tsx` | Barra superior admin. |
| `StatsCard.tsx` | Tarjetas KPI. |
| `RevenueChart.tsx` | Gráfico de ingresos (Recharts). |
| `OrdersDonut.tsx` | Dona de estados de pedido (Recharts). |
| `TopProducts.tsx` | Ranking productos vendidos. |
| `DataTable.tsx` | Tabla genérica reutilizable. |
| `ProductForm.tsx` | Alta/edición producto + variantes. |
| `AdminProductsList.tsx` | Listado admin de productos. |
| `AdminCategoriesCollections.tsx` | Gestión categorías y colecciones. |
| `AdminInventory.tsx` | Stock / variantes masivo. |
| `AdminOrdersList.tsx` | Listado de pedidos. |
| `OrderDetail.tsx` | Detalle de un pedido. |
| `AdminSettings.tsx` | Pares clave/valor `site_settings`. |

### `ui/` (primitivos)

`Badge`, `Button`, `Input`, `Modal`, `Select`, `Skeleton`, `Tabs`, `Textarea`, `Toast`, `Toggle` — estética alineada al design system (bordes finos, tipografía body/display).

### `lib/` (no son componentes pero suelen tocarse con la UI)

- `constants.ts` — nombre del sitio, links de nav, estados de pedido/producto, `ITEMS_PER_PAGE`.
- `editorial-images.ts` — URLs Unsplash curadas, `instagramGridImages`, helpers de imagen remota vs placeholder.
- `utils.ts` — `cn`, `formatPrice` (USD + locale `es-AR`), fechas, `slugify`, `truncate`.
- `store/cart.ts` — store Zustand persistido.
- `supabase/{client,server,admin}.ts` — factories de cliente Supabase.
