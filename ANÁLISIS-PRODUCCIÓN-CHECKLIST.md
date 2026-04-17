# 🎯 MAISON ÉLARA — ANÁLISIS COMPLETO PARA PRODUCCIÓN
**Generado:** 2026-04-16  
**Audiencia:** Manuel (Vendedor) + Team Dev  
**Propósito:** Demo → Producto Vendible Multi-Cliente

---

## 📊 ESTADO ACTUAL RESUMIDO

| Área | Estado | Riesgo | Impacto |
|------|--------|--------|---------|
| **Arquitectura** | ⚠️ MVP Sólido | **ALTO** | Problemas de escalabilidad y caching |
| **Seguridad** | 🔴 **CRÍTICA** | **CRÍTICO** | Vulnerabilidades de datos PII |
| **Base de Datos** | ✅ Bien normalizada | BAJO | Necesita 3 índices + agregaciones SQL |
| **Code Quality** | ⚠️ Funcional | MEDIO | Faltan tests, error handling, types |
| **Performance** | 🔴 **CRÍTICA** | **ALTO** | Mobile 28/100 (target: 75+) |
| **SEO Técnico** | ⚠️ Incompleto | MEDIO | Falta schema markup y sitemap dinámico |

---

## 🚨 BLOQUEANTES CRÍTICOS (NO VENDER SIN ESTO)

### SEGURIDAD — 6 vulnerabilidades críticas

#### S1. Service Role Key expuesta en .env.local y scripts
- **Riesgo:** Acceso total a DB del cliente
- **Ubicación:** `.env.local`, `clientes/_ejemplo.json`, `scripts/onboard-client.ts`
- **Acción:**
  ```bash
  1. Rotar SUPABASE_SERVICE_ROLE_KEY del proyecto actual (zrzpmgyafuesmakkoysn)
  2. Eliminar SUPABASE_SERVICE_ROLE_KEY de .env.local (línea 4)
  3. Reemplazar script onboarding para NO guardar keys en .json (usar 1Password/Bitwarden vault)
  4. Eliminar src/lib/supabase/admin.ts (código muerto, solo aumenta superficie ataque)
  ```
- **Tiempo:** 30 min
- **Prioridad:** 🔴 P0 (antes de cualquier demo)

---

#### S2. Cualquier usuario autenticado es "admin" (sin role check)
- **Riesgo:** Alguien crea cuenta → borra catálogo, roba órdenes PII
- **Archivos:**
  - `src/middleware.ts:29` — solo chequea `if (!user)`, no validar role
  - `src/app/admin/layout.tsx:11-15` — idem
  - `supabase/base.sql:196-221` — RLS policies `USING (true)`
  
- **Fix:**
  ```typescript
  // En middleware.ts:29-35
  const user = session?.user
  if (!user) return NextResponse.redirect(new URL('/auth/login', request.url))
  
  // ⭐ AGREGAR ESTO:
  if (user.app_metadata?.role !== 'admin') {
    return NextResponse.redirect(new URL('/', request.url))
  }
  ```
  
  ```sql
  -- En supabase/base.sql (reemplazar USING (true)):
  CREATE POLICY "Admin only update categories" ON categories 
    FOR UPDATE TO authenticated 
    USING ((SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
  ```

- **Tiempo:** 45 min
- **Prioridad:** 🔴 P0

---

#### S3. RLS policies genéricas sin diferencia admin/viewer
- **Riesgo:** No hay roles de staff, read-only, etc. (escalabilidad futura)
- **Acción:**
  ```sql
  ALTER TABLE profiles ADD COLUMN role text DEFAULT 'viewer' 
    CHECK (role IN ('admin', 'viewer', 'staff'));
  
  CREATE POLICY "Role based access" ON products 
    FOR UPDATE TO authenticated 
    USING ((SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
  ```
- **Tiempo:** 1 hora
- **Prioridad:** 🔴 P0

---

#### S4. Falta validación de seguridad en headers HTTP
- **Riesgo:** Clickjacking, XSS, MITM
- **Archivo:** `next.config.js` (vacío de headers)
- **Fix:**
  ```javascript
  // next.config.js
  async headers() {
    return [{
      source: '/:path*',
      headers: [
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-XSS-Protection', value: '1; mode=block' },
        { key: 'Content-Security-Policy', value: "default-src 'self'; img-src 'self' https://*.supabase.co data:; script-src 'self'" },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      ],
    }]
  }
  ```
- **Tiempo:** 30 min
- **Prioridad:** 🔴 P0

---

#### S5. Validación de colores desde DB sin escape (CSS injection)
- **Riesgo:** XSS stored vía `site_settings.brand_colors`
- **Archivo:** `src/app/layout.tsx:54-59`, `src/components/admin/AdminSettings.tsx:479-492`
- **Fix:**
  ```typescript
  // En AdminSettings.tsx (validar antes de guardar)
  const validateHexColor = (hex: string): boolean => /^#[0-9a-fA-F]{6}$/.test(hex)
  
  if (!validateHexColor(primaryColor)) {
    toast.error('Color debe ser formato hex válido (#RRGGBB)')
    return
  }
  ```
- **Tiempo:** 20 min
- **Prioridad:** 🔴 P0

---

#### S6. Falta de rate limiting en login + RPC de órdenes
- **Riesgo:** Brute force password, DoS en `create_order_with_stock_check`
- **Archivo:** `src/app/auth/login/page.tsx`
- **Fix (Supabase Dashboard):**
  ```
  Auth > Attack Protection:
  - Enable CAPTCHA (hCaptcha or Turnstile)
  - Enable MFA/TOTP (force en primer login)
  ```
- **Tiempo:** 15 min (config Supabase)
- **Prioridad:** 🔴 P0

---

### ARQUITECTURA — 5 bloqueantes

#### A1. Sin caching/revalidation — quota Supabase explota
- **Riesgo:** 100 visitas/día = quota free Supabase agotada
- **Archivos:**
  - `src/app/(store)/page.tsx` (homepage: 8 queries por pageview)
  - `src/app/(store)/products/page.tsx` (N+1 de categorías)
  - `sitemap.ts` (dinámico, sin revalidate)
  
- **Fix:**
  ```typescript
  // En (store)/page.tsx:1
  export const revalidate = 3600 // ISR 1 hora
  
  // En (store)/products/page.tsx:1
  export const revalidate = 1800
  
  // En sitemap.ts:1
  export const revalidate = 86400 // 24h
  ```
  
  **ADEMÁS: Fix N+1 de categorías:**
  ```typescript
  // Antes:
  const categories = await supabase.from('categories').select('*')
  const withCounts = Promise.all(categories.map(c => 
    supabase.from('products').select('*', {count: 'exact'}).eq('category_id', c.id)
  ))
  
  // Después:
  const { data } = await supabase.from('categories').select('*, product_count:products(count)')
  ```

- **Tiempo:** 1 hora
- **Prioridad:** 🔴 P0

---

#### A2. Checkout dobla el precio desde cliente sin validación server
- **Riesgo:** `p_shipping`, `p_tax` se confían 100% al cliente
- **Archivo:** `src/components/store/CheckoutPage.tsx:82-92` + `supabase-migrations/2026-04-16-stock-atomico.sql`
- **Fix:**
  ```sql
  -- En RPC, validar contra site_settings:
  SELECT site_settings.value->'shipping' 
  IF v_shipping != (SELECT ... from site_settings where key='shipping') THEN
    RETURN jsonb_build_object('error_code', 'shipping_mismatch')
  END IF
  ```
- **Tiempo:** 45 min
- **Prioridad:** 🔴 P0

---

#### A3. Admin panel carga TODAS las órdenes en memoria
- **Riesgo:** Con 10K órdenes → OOM crash en Vercel
- **Archivo:** `src/app/admin/page.tsx:10-82` (`getDashboardData`)
- **Fix:** Reemplazar por SQL agregada:
  ```typescript
  // Antes:
  const allOrders = await supabase.from('orders').select('*, order_items(*)')
  const totalRevenue = allOrders.reduce((s, o) => s + o.total, 0)
  
  // Después:
  const { data } = await supabase.rpc('get_dashboard_metrics', {
    days: 14
  })
  ```
- **Tiempo:** 1.5 horas
- **Prioridad:** 🔴 P0

---

#### A4. Sin Sentry/logging — incidentes invisibles
- **Riesgo:** Un cliente reporta "no funciona" y NO hay logs
- **Fix:**
  ```bash
  npm install @sentry/nextjs
  ```
  Configurar en `next.config.js`:
  ```javascript
  const withSentryConfig = require("@sentry/nextjs/withSentryConfig");
  module.exports = withSentryConfig(nextConfig, { org: "...", project: "..." })
  ```
- **Tiempo:** 1 hora
- **Prioridad:** 🔴 P0

---

#### A5. Wishlist se pierde al navegar (useState local)
- **Riesgo:** UX rota, cliente cree que agregó favorito
- **Archivo:** `src/components/store/ProductInfo.tsx:54`
- **Fix:** Mover a Zustand con persist:
  ```typescript
  export const useWishlistStore = create<WishlistStore>()(
    persist(
      (set) => ({
        items: [],
        addItem: (id) => set((state) => ({ items: [...state.items, id] })),
      }),
      { name: 'wishlist-storage' }
    )
  )
  ```
- **Tiempo:** 30 min
- **Prioridad:** 🟡 P1

---

### CODE QUALITY — 8 bloqueantes

#### C1. Middleware sin validación de role (duplicado de S2)
- Incluido en S2

#### C2. AdminSettings hace updates sin try/catch — form queda roto
- **Riesgo:** Falla a mitad, UI no lo reporta, DB inconsistente
- **Archivo:** `src/components/admin/AdminSettings.tsx:76-87`
- **Fix:**
  ```typescript
  const handleSave = async () => {
    try {
      setLoading(true)
      await Promise.all(
        Object.entries(settings).map(([key, value]) =>
          supabase.from('site_settings').upsert({
            key,
            value: typeof value === 'object' ? value : value
          })
        )
      )
      toast.success('Configuración guardada')
    } catch (error) {
      toast.error(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }
  ```
- **Tiempo:** 45 min
- **Prioridad:** 🔴 P0

---

#### C3. Doble JSON.stringify en AdminSettings:82
- **Riesgo:** Datos guardados como `"{\\"key\\":\\"value\\"}"` (string en JSONB)
- **Fix:** Remover `JSON.stringify`:
  ```typescript
  // Antes:
  value: JSON.stringify(value)
  // Después:
  value: value // Supabase serializa a JSONB automáticamente
  ```
- **Tiempo:** 5 min
- **Prioridad:** 🔴 P0

---

#### C4. OrderDetail sin try/catch en updates
- **Riesgo:** Cambio de status "parece" guardarse pero falla RLS silenciosamente
- **Archivo:** `src/components/admin/OrderDetail.tsx:42-55`
- **Fix:**
  ```typescript
  const handleStatusUpdate = async (newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', order.id)
      if (error) throw error
      toast.success('Status actualizado')
    } catch (error) {
      toast.error(`No se pudo actualizar: ${error.message}`)
    }
  }
  ```
- **Tiempo:** 30 min
- **Prioridad:** 🔴 P0

---

#### C5. Reemplazar `<img>` por `next/image` (Navbar, Footer logos)
- **Riesgo:** Sin srcset, sin lazy load, +400KB mobile
- **Archivos:** `src/components/store/Navbar.tsx:171,294`, `Footer.tsx:76`
- **Fix:**
  ```typescript
  import Image from 'next/image'
  
  <Image
    src="/logo.svg"
    alt="Maison Élara"
    width={200}
    height={60}
    priority // en header
  />
  ```
- **Tiempo:** 20 min
- **Prioridad:** 🟡 P1

---

#### C6. Eliminar `any` explícitos (4 archivos)
- **Riesgo:** Pierde type-checking, bugs invisibles
- **Archivos:**
  - `src/components/admin/RevenueChart.tsx:10` (CustomTooltip)
  - `src/components/admin/OrderDetail.tsx:33,38` (order.notes, STATUS_FLOW)
  - `src/app/admin/settings/page.tsx:7-8` (Record<string, any>)
  
- **Fix:** Ver detalles en la sección de code review
- **Tiempo:** 1 hora
- **Prioridad:** 🟡 P1

---

#### C7. Falta error.tsx en rutas admin críticas
- **Riesgo:** Query error en `/admin/[id]` explota sin UI de error
- **Archivos:** Crear `src/app/admin/error.tsx` + `src/app/admin/[...]/error.tsx`
- **Fix:**
  ```typescript
  // src/app/admin/error.tsx
  'use client'
  export default function AdminError({ error, reset }) {
    return (
      <div className="p-8">
        <h1>Error en Admin Panel</h1>
        <p>{error.message}</p>
        <button onClick={() => reset()}>Reintentar</button>
      </div>
    )
  }
  ```
- **Tiempo:** 30 min
- **Prioridad:** 🟡 P1

---

#### C8. Newsletter es un no-op (Footer.tsx:213)
- **Riesgo:** Promete funcionalidad, no hace nada
- **Opción A:** Implementar backend + Mailchimp/Resend
- **Opción B:** Ocultar hasta que esté listo
- **Tiempo:** 2 horas (opción A) o 5 min (opción B)
- **Prioridad:** 🟡 P1

---

### PERFORMANCE — 5 fixes necesarios

#### P1. Framer Motion + Lenis overhead → -35% LCP/INP
- **Riesgo:** Mobile 28/100 score
- **Fix:** 
  - Reducir animaciones en ProductCatalog, HeroSection
  - Remover Lenis RAF loop (usar CSS `scroll-behavior: smooth` en lugar)
  - Lazy load Framer Motion
- **Impacto:** LCP 3.1s → 2.0s
- **Tiempo:** 2 horas
- **Prioridad:** 🔴 P0 (si es demo vendible)

---

#### P2. N+1 de categorías en homepage
- **Incluido en A1**

---

#### P3. Sin skeleton loaders → CLS 0.19 (target 0.1)
- **Riesgo:** Content jumps, UX pobre mobile
- **Fix:** Usar `Skeleton` component en loading.tsx de todas las rutas
- **Impacto:** CLS 0.19 → 0.08
- **Tiempo:** 1 hora
- **Prioridad:** 🟡 P1

---

#### P4. SearchOverlay race condition (respuesta vieja sobrescribe actual)
- **Riesgo:** Resultados incorrectos al buscar rápido
- **Archivo:** `src/components/store/SearchOverlay.tsx:58`
- **Fix:** Agregar `AbortController`:
  ```typescript
  useEffect(() => {
    if (!q) { setResults([]); return }
    const controller = new AbortController()
    
    const timer = setTimeout(async () => {
      const { data } = await supabase
        .from('products')
        .select('id,name,slug')
        .ilike('name', `%${q.replace(/%/g, '\\%')}%`)
      
      if (!controller.signal.aborted) setResults(data)
    }, 300)
    
    return () => {
      controller.abort()
      clearTimeout(timer)
    }
  }, [q])
  ```
- **Tiempo:** 30 min
- **Prioridad:** 🟡 P1

---

#### P5. Checkout double-submit vulnerable
- **Riesgo:** Crear orden 2x con un double-click
- **Archivo:** `src/components/store/CheckoutPage.tsx:109-149`
- **Fix:** Agregar `idempotency_key`:
  ```typescript
  const idempotencyKey = useRef(crypto.randomUUID())
  
  const handleSubmit = async () => {
    const { data, error } = await supabase.rpc(
      'create_order_with_stock_check',
      { ..., idempotency_key: idempotencyKey.current }
    )
  }
  ```
- **Tiempo:** 30 min
- **Prioridad:** 🟡 P1

---

### BASE DE DATOS — 3 fixes necesarios

#### D1. Agregar índices faltantes
- **Riesgo:** Queries lentas cuando escalen datos
- **Fix:**
  ```sql
  CREATE INDEX idx_orders_customer_email ON orders(customer_email);
  CREATE INDEX idx_orders_status_created_at ON orders(status, created_at DESC);
  CREATE INDEX idx_product_variants_product_id_stock 
    ON product_variants(product_id, stock) WHERE is_active = true;
  ```
- **Tiempo:** 15 min
- **Prioridad:** 🟡 P1

---

#### D2. Agregación SQL del dashboard (no JavaScript)
- **Incluido en A3**

---

#### D3. Tabla de auditoría para órdenes
- **Riesgo:** Sin audit trail de cambios admin, imposible forense
- **Fix:**
  ```sql
  CREATE TABLE order_audit_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
    actor_email text,
    action text,
    from_value text,
    to_value text,
    changed_at timestamptz DEFAULT now()
  );
  
  CREATE TRIGGER trg_order_status_change
  AFTER UPDATE OF status ON orders
  FOR EACH ROW
  EXECUTE FUNCTION log_order_change();
  ```
- **Tiempo:** 1 hora
- **Prioridad:** 🟡 P1 (para compliance)

---

## 🎯 PLAN DE TRABAJO — ROADMAP DE 3 SEMANAS

### SEMANA 1: BLOQUEANTES CRÍTICOS (40 horas)
Debe estar listo antes de cualquier demo o venta.

**Día 1-2 (Seguridad):**
- [ ] Rotar SUPABASE_SERVICE_ROLE_KEY
- [ ] Eliminar `src/lib/supabase/admin.ts`
- [ ] Actualizar middleware con role check
- [ ] Validación de brand_colors regex
- [ ] Headers HTTP en next.config.js
- **Deliverable:** Sistema más seguro para GDPR/compliance

**Día 3-4 (Caching + N+1):**
- [ ] Agregar `revalidate` en (store)/, /products, /sitemap
- [ ] Fix N+1 de categorías con agregación SQL
- [ ] Fix admin dashboard con RPC agregada
- [ ] Integrar Sentry error tracking
- **Deliverable:** Free tier Supabase viable, logging producción

**Día 5 (Fixes de código críticos):**
- [ ] AdminSettings try/catch + remover doble stringify
- [ ] OrderDetail try/catch
- [ ] Checkout validación server shipping/tax
- [ ] Newsletter opción A o B (hidden or implement)
- **Deliverable:** App estable, errores handled

---

### SEMANA 2: CÓDIGO + PERFORMANCE (40 horas)
Calidad, velocidad, experiencia.

**Día 6-7 (Performance):**
- [ ] Reducir Framer Motion overhead
- [ ] Reemplazar `<img>` con `next/image`
- [ ] Agregar skeleton loaders en loading.tsx
- [ ] Eliminar Lenis RAF loop (CSS fallback)
- [ ] SearchOverlay AbortController
- **Impacto:** Lighthouse 28 → 70+ mobile

**Día 8-9 (Code Quality):**
- [ ] Eliminar `any` types (4 archivos)
- [ ] Agregar error.tsx en rutas admin
- [ ] CheckoutPage double-submit idempotency_key
- [ ] Wishlist → Zustand persist
- [ ] Hydration guards con useSyncExternalStore
- **Deliverable:** TypeScript strict, error handling completo

**Día 10 (BD):**
- [ ] Agregar índices faltantes
- [ ] Crear tabla audit_log + trigger
- [ ] Validación de longitudes (CHECK constraints)
- **Deliverable:** DB optimizada para escala

---

### SEMANA 3: TESTING + DOCS (40 horas)
Confianza para producción y transferencia.

**Día 11-12 (Tests):**
- [ ] Playwright E2E: add-to-cart → checkout → confirmación
- [ ] Vitest unit: cart.ts store (merge, update, clear)
- [ ] RPC test: stock checks, validation, rollback
- [ ] Admin dashboard test: filter, export, settings save
- **Deliverable:** Regresión detectada automáticamente

**Día 13-14 (Documentación + Launch):**
- [ ] README con setup de cliente nuevo
- [ ] Runbook de deployment Vercel
- [ ] Guía onboarding Supabase (roles, RLS check)
- [ ] Checklist pre-lanzamiento cliente
- [ ] Demo setup + customización template
- **Deliverable:** Listo para vender

---

## ✅ CHECKLIST POR TAREA (ACCIONABLE)

### SEGURIDAD (Semana 1)

- [ ] **S1a:** Ir a `https://zrzpmgyafuesmakkoysn.supabase.co/project/api-keys` → Rotar `Service Role Key`
- [ ] **S1b:** Actualizar `.env.local` LOCAL con nueva key (testing solamente)
- [ ] **S1c:** Eliminar archivo `src/lib/supabase/admin.ts`
- [ ] **S1d:** Grep verificar que no hay import de `admin.ts` en ningún lado: `grep -r "from.*supabase/admin" src/`
- [ ] **S1e:** Eliminar reference a service role en `scripts/onboard-client.ts` → reemplazar por magic link invitation
- [ ] **S2a:** Editar `src/middleware.ts`:29-35, agregar role check
- [ ] **S2b:** Editar `src/app/admin/layout.tsx`:11-15, agregar role check
- [ ] **S3a:** Editar `supabase/base.sql`, reemplazar todos `USING (true)` con policy real
- [ ] **S4a:** Editar `next.config.js`, agregar bloque `async headers()`
- [ ] **S4b:** Incluir headers: `X-Frame-Options`, `Strict-Transport-Security`, `CSP`, etc.
- [ ] **S5a:** Editar `src/components/admin/AdminSettings.tsx:479-492`, agregar función `validateHexColor`
- [ ] **S5b:** Test: intentar guardar color inválido, debe rejetar
- [ ] **S6a:** Supabase Dashboard > Auth > Attack Protection > Enable CAPTCHA
- [ ] **S6b:** Supabase Dashboard > Auth > Attack Protection > Enable MFA

---

### ARQUITECTURA (Semana 1)

- [ ] **A1a:** Agregar `export const revalidate = 3600` en `src/app/(store)/page.tsx`
- [ ] **A1b:** Agregar `export const revalidate = 1800` en `src/app/(store)/products/page.tsx`
- [ ] **A1c:** Agregar `export const revalidate = 86400` en `sitemap.ts`
- [ ] **A1d:** Refactor `getCategories()` en products/page.tsx: eliminar loop, usar SQL agregada
- [ ] **A1e:** Test: Supabase > Statistics tab, verificar queries bajaron
- [ ] **A2a:** Revisar `supabase-migrations/2026-04-16-stock-atomico.sql` línea 168, agregar validación de shipping/tax contra site_settings
- [ ] **A3a:** Crear nueva RPC `get_dashboard_metrics(days_back int)` que retorna JSON agregado
- [ ] **A3b:** Refactor `src/app/admin/page.tsx` para usar la RPC en lugar de cargar todas las órdenes
- [ ] **A3c:** Test: crear 1000 órdenes de prueba, verificar dashboard no se cuelga
- [ ] **A4a:** Instalar Sentry: `npm install @sentry/nextjs @sentry/tracing`
- [ ] **A4b:** Crear `sentry.server.config.js` y `sentry.client.config.js`
- [ ] **A4c:** Actualizar `next.config.js` con withSentryConfig
- [ ] **A4d:** Test: forzar un error, verificar que aparezca en Sentry dashboard
- [ ] **A5a:** Crear Zustand store `src/lib/store/wishlist.ts` con persist
- [ ] **A5b:** Reemplazar useState en `ProductInfo.tsx:54` con `useWishlistStore`
- [ ] **A5c:** Test: agregar producto favorito, refrescar página, debe estar ahí

---

### CODE QUALITY (Semana 1-2)

- [ ] **C2a:** Refactor `AdminSettings.handleSave` con try/catch y Promise.all
- [ ] **C2b:** Test: forzar error Supabase, debe mostrar toast
- [ ] **C3a:** Remover `JSON.stringify` en `AdminSettings.tsx:82`
- [ ] **C3b:** Test: guardar setting, verificar en Supabase que es JSONB válido (no string doblemente anidado)
- [ ] **C4a:** Agregar try/catch en `OrderDetail.tsx:42-55`
- [ ] **C4b:** Test: cambiar status sin conexión, debe mostrar error
- [ ] **C5a:** Reemplazar `<img>` en Navbar.tsx:171 con `next/image`
- [ ] **C5b:** Reemplazar `<img>` en Navbar.tsx:294 con `next/image`
- [ ] **C5c:** Reemplazar `<img>` en Footer.tsx:76 con `next/image`
- [ ] **C6a:** Tipar `CustomTooltip` en RevenueChart.tsx con tipos de Recharts
- [ ] **C6b:** Tipar `order: Order & { notes?: string | null }` en OrderDetail.tsx
- [ ] **C6c:** Tipar settings con `Record<string, unknown>` en settings/page.tsx, agregar type guard
- [ ] **C7a:** Crear `src/app/admin/error.tsx`
- [ ] **C7b:** Crear `src/app/admin/[id]/error.tsx` para páginas dinámicas
- [ ] **C8a:** Opción A (implementar newsletter): crear Supabase table + API route + integración Mailchimp
- [ ] **C8b:** Opción B (ocultar): quitar `NewsletterCTA` de home, comentar en Footer

---

### PERFORMANCE (Semana 2)

- [ ] **P1a:** Auditar componentes con Framer Motion, reducir animaciones innecesarias
- [ ] **P1b:** Reemplazar Lenis con `html { scroll-behavior: smooth; }`
- [ ] **P1c:** Lazy load Framer Motion: `import dynamic from 'next/dynamic'`
- [ ] **P1d:** Test en Lighthouse: LCP debe estar < 2.5s
- [ ] **P3a:** Crear skeleton loaders para homepage (HeroSection, CategoriesGrid, ProductCatalog)
- [ ] **P3b:** Agregar `Suspense` fallback para cada sección
- [ ] **P3c:** Test CLS con Chrome DevTools > Rendering > CLS visualizer
- [ ] **P4a:** Agregar `AbortController` en SearchOverlay.tsx
- [ ] **P4b:** Test: buscar "dress", luego "dre" rápidamente, resultados deben ser correctos
- [ ] **P5a:** Generar `idempotencyKey` en CheckoutPage con `crypto.randomUUID()`
- [ ] **P5b:** Pasar a RPC `create_order_with_stock_check(idempotency_key)`
- [ ] **P5c:** Test: double-submit en checkout, debe crear solo 1 orden

---

### BASE DE DATOS (Semana 2)

- [ ] **D1a:** Crear índices en Supabase:
  ```sql
  CREATE INDEX idx_orders_customer_email ON orders(customer_email);
  CREATE INDEX idx_orders_status_created_at ON orders(status, created_at DESC);
  CREATE INDEX idx_product_variants_product_id_stock 
    ON product_variants(product_id, stock) WHERE is_active = true;
  ```
- [ ] **D1b:** Verificar que se crearon: `SELECT indexname FROM pg_indexes WHERE tablename='orders';`
- [ ] **D3a:** Crear tabla `order_audit_log` en migration nueva
- [ ] **D3b:** Crear función `log_order_change()` que inserta en audit_log
- [ ] **D3c:** Crear trigger `trg_order_status_change` en tabla `orders`
- [ ] **D3d:** Test: cambiar status de orden, verificar que se registra en audit_log

---

### TESTING (Semana 3)

- [ ] **T1a:** Instalar Playwright: `npm install -D @playwright/test`
- [ ] **T1b:** Crear `tests/e2e/checkout.spec.ts` con flow completo
- [ ] **T1c:** Test: navegar → producto → add-to-cart → checkout → confirmación
- [ ] **T1d:** Run: `npx playwright test`
- [ ] **T2a:** Instalar Vitest: `npm install -D vitest @testing-library/react`
- [ ] **T2b:** Crear `src/lib/store/cart.test.ts`
- [ ] **T2c:** Test: addItem, updateQuantity, removeItem, clearCart
- [ ] **T2d:** Run: `npx vitest src/lib/store/cart.test.ts`
- [ ] **T3a:** Test RPC manualmente en Supabase SQL editor
- [ ] **T3b:** Casos: stock insuficiente, precio manipulado, variante inactiva, idempotencia

---

### DOCUMENTACIÓN (Semana 3)

- [ ] **D0a:** Crear `README.md` con setup local
- [ ] **D0b:** Crear `DEPLOYMENT.md` con checklist pre-lanzamiento
- [ ] **D0c:** Crear `ONBOARDING_CLIENT.md` paso a paso
- [ ] **D0d:** Crear `SECURITY.md` con vulnerabilidades comunes a evitar
- [ ] **D0e:** Crear `CUSTOMIZATION.md` con cómo cambiar colores, nombre, features para un cliente

---

## 📈 MÉTRICAS DE ÉXITO

**Después de Semana 1 (Bloqueantes):**
- ✅ Supabase quota no se agota con 100 visitas/día
- ✅ Admin requiere role para acceder
- ✅ Errores se loguean en Sentry
- ✅ Checkout valida precios server-side

**Después de Semana 2 (Código + Performance):**
- ✅ Lighthouse score 70+ mobile
- ✅ No hay `any` types
- ✅ Todos los errores tienen try/catch
- ✅ BD indices creados

**Después de Semana 3 (Tests + Docs):**
- ✅ E2E tests pasan
- ✅ Documentación completa
- ✅ Runbook de deployment
- ✅ Listo para vender a primer cliente

---

## 🚀 PRÓXIMOS PASOS

1. **Leer checklist arriba** (este documento)
2. **Crear issues en GitHub** para cada tarea (Semana 1 primero)
3. **Daily standup** con equipo (¿qué completaste ayer, qué hoy, qué bloquea?)
4. **End of Semana 1:** Testing de bloqueantes (demo manual)
5. **End of Semana 2:** Lighthouse verde, E2E tests verdes
6. **End of Semana 3:** Deploy a staging, QA completo, lanzamiento

---

**Generado con análisis de 5 especialistas (Arquitecto, Security Auditor, DB Optimizer, Code Reviewer, Performance Engineer).**

**Tiempo estimado total:** 120 horas (3 semanas / 1 dev, o 2 semanas / 2 devs)
