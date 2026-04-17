# 🎯 PROMPT DETALLADO — SESIÓN DE ROBUSTEZ DEL PROYECTO

**Copia este contenido completo como prompt inicial en la siguiente sesión de Claude Code**

---

## 📌 CONTEXTO DEL PROYECTO

**Proyecto:** MAISON ÉLARA — E-commerce de ropa para mujeres (template vendible multi-cliente)  
**Stack:** Next.js 14.2.21 (App Router) + Supabase PostgreSQL + Zustand + Tailwind CSS  
**Ubicación:** `C:\MisProyectos\catalogo_de_webs\e-commerce_mujer`  
**Objetivo:** Convertir un MVP visual hermoso en un producto **enterprise-ready y vendible** a múltiples tiendas de ropa

**Estado actual:** MVP funcional al 90%, pero **20 bloqueantes críticos** impiden vender (vulnerabilidades de seguridad, caching insostenible, performance pobre, sin tests).

---

## 🎯 OBJETIVO DE ESTA SESIÓN

**Implementar TODOS los fixes del Checklist Semana 1 + Semana 2** para llevar el proyecto de "no vendible" a "vendible con confianza".

**Entregable:** 
- ✅ Código robusto, seguro, rápido
- ✅ Tests E2E para checkout
- ✅ Error handling completo
- ✅ Documentación de deployment
- ✅ Listo para vender a cliente #1

---

## 📂 DOCUMENTACIÓN CLAVE (LEE PRIMERO)

Antes de empezar, **lee estos documentos en este orden:**

1. **`RESUMEN-EJECUTIVO.md`** (5 min)
   - Los 5 problemas masivos
   - Roadmap de 3 semanas
   
2. **`ANÁLISIS-TÉCNICO-DETALLADO.md`** (30 min)
   - Contexto de cada vulnerabilidad/problema
   - Severidad, impacto, por qué es crítico
   
3. **`ANÁLISIS-PRODUCCIÓN-CHECKLIST.md`** (MASTER REFERENCE)
   - Checklist ultra-detallado por tarea
   - Estimaciones de tiempo
   - Criteria de éxito por semana
   
4. **`QUICK-REFERENCE-FIXES.md`** (MIENTRAS CODIFICAS)
   - Tabla rápida: archivo → línea → acción
   - Búsqueda rápida por problema

---

## 📋 CHECKLIST EJECUTABLE — SEMANA 1 + SEMANA 2

### ✅ SEMANA 1: BLOQUEANTES CRÍTICOS (19-20 horas)

Estas tareas **DEBEN completarse** antes de hacer cualquier demo segura.

---

#### **BLOQUE 1: SEGURIDAD (4 horas)**

**S1 — Service Role Key expuesta + admin.ts muerto**
- [ ] Ir a `https://zrzpmgyafuesmakkoysn.supabase.co/project/api-keys`
- [ ] Click "Regenerate" en Service Role Key
- [ ] Actualizar `.env.local` solo para testing local
- [ ] **Eliminar archivo:** `src/lib/supabase/admin.ts` (código muerto)
- [ ] Verificar que NO hay imports de `admin.ts` en ningún lado: `grep -r "supabase/admin" src/`
- [ ] Refactor `scripts/onboard-client.ts` para NO guardar keys en .json
- [ ] Git commit: "security: rotate service role key, remove dead admin.ts"

**S2 — Middleware + Layout sin role check**
- [ ] Editar `src/middleware.ts` línea 29-35
  ```typescript
  const user = session?.user
  if (!user) return NextResponse.redirect(new URL('/auth/login', request.url))
  // ⭐ AGREGAR ESTO:
  if (user.app_metadata?.role !== 'admin') {
    return NextResponse.redirect(new URL('/', request.url))
  }
  ```
- [ ] Editar `src/app/admin/layout.tsx` línea 11-15, agregar mismo check
- [ ] Test: intentar acceder a `/admin` sin ser admin, debe redirigir a home
- [ ] Git commit: "security: add role check in middleware and admin layout"

**S3 — RLS policies permisivas (USING true)**
- [ ] Abrir `supabase/base.sql` línea 196-221
- [ ] Reemplazar TODOS los `USING (true)` con policies basadas en role
  ```sql
  CREATE POLICY "Admin only edit categories" ON categories 
    FOR UPDATE TO authenticated 
    USING ((SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
  ```
- [ ] Aplicar cambios a Supabase (via dashboard o SQL editor)
- [ ] Test: create user without admin role, try to update category, debe fallar con 403
- [ ] Git commit: "database: fix RLS policies to require admin role"

**S4 — Headers HTTP de seguridad faltantes**
- [ ] Editar `next.config.js`
- [ ] Agregar bloque `async headers()` con:
  - X-Frame-Options: DENY
  - Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
  - X-Content-Type-Options: nosniff
  - Content-Security-Policy (básico)
  - Referrer-Policy
  - Permissions-Policy
- [ ] Test en Lighthouse: verificar headers en Network tab
- [ ] Git commit: "security: add HTTP security headers (CSP, HSTS, etc.)"

**S5 — Validación de color sin escape (CSS injection)**
- [ ] Editar `src/components/admin/AdminSettings.tsx` línea 479-492
- [ ] Agregar función:
  ```typescript
  const validateHexColor = (hex: string): boolean => /^#[0-9a-fA-F]{6}$/.test(hex)
  ```
- [ ] Validar antes de guardar en DB
- [ ] Test: intentar guardar color inválido (ej: `#fff;}</style>`), debe rejetar
- [ ] Git commit: "security: validate hex colors to prevent CSS injection"

**S6 — Rate limiting + CAPTCHA**
- [ ] Supabase Dashboard > Auth > Attack Protection
- [ ] Enable CAPTCHA (hCaptcha o Turnstile)
- [ ] Enable MFA/TOTP en Supabase
- [ ] Test: intentar login con contraseña incorrecta, debe mostrar CAPTCHA
- [ ] Git commit: "security: enable CAPTCHA and MFA in Supabase"

---

#### **BLOQUE 2: CACHING + N+1 QUERIES (3 horas)**

**A1 — Agregar revalidate en rutas (ISR)**
- [ ] `src/app/(store)/page.tsx` línea 1:
  ```typescript
  export const revalidate = 3600 // 1 hora
  ```
- [ ] `src/app/(store)/products/page.tsx` línea 1:
  ```typescript
  export const revalidate = 1800 // 30 min
  ```
- [ ] `sitemap.ts` línea 1:
  ```typescript
  export const revalidate = 86400 // 24h
  ```
- [ ] Test: Vercel Analytics, verificar que hits a Supabase bajaron
- [ ] Git commit: "perf: add ISR revalidation to public routes"

**A2 — Fix N+1 de categorías (1 query en lugar de 7)**
- [ ] Abrir `src/app/(store)/products/page.tsx`
- [ ] Encontrar función `getCategories()` (aprox línea 40-60)
- [ ] Refactor para usar SQL agregada:
  ```typescript
  // Antes: loop con await (N+1)
  // Después: una query con GROUP BY
  const { data } = await supabase
    .from('categories')
    .select('*, product_count:products(count)')
  ```
- [ ] Test: Network tab DevTools, debe ser 1 query en lugar de 7
- [ ] Git commit: "perf: fix N+1 queries in category listing"

**A3 — Validación server-side de precio/tax en RPC**
- [ ] Abrir `supabase-migrations/2026-04-16-stock-atomico.sql`
- [ ] En la RPC `create_order_with_stock_check`, agregar validación:
  ```sql
  -- Validar shipping contra site_settings
  SELECT site_settings.value->>'shipping' INTO v_expected_shipping
  IF v_shipping != v_expected_shipping THEN
    RETURN jsonb_build_object('error_code', 'shipping_mismatch')
  END IF
  ```
- [ ] Test: Intentar checkout con precio manipulado en DevTools, debe fallar
- [ ] Git commit: "security: validate shipping and tax server-side in RPC"

**A4 — Integración de Sentry para error tracking**
- [ ] `npm install @sentry/nextjs @sentry/tracing`
- [ ] Crear `sentry.server.config.js` (copiar template de docs)
- [ ] Crear `sentry.client.config.js` (copiar template de docs)
- [ ] Editar `next.config.js`:
  ```javascript
  const withSentryConfig = require('@sentry/nextjs/withSentryConfig');
  module.exports = withSentryConfig(nextConfig, { org: '...', project: '...' })
  ```
- [ ] Test: Forzar un error (ej: `throw new Error('test')`), debe aparecer en Sentry dashboard
- [ ] Git commit: "observability: integrate Sentry for error tracking"

**A5 — Wishlist persistente (Zustand + persist)**
- [ ] Crear `src/lib/store/wishlist.ts`:
  ```typescript
  import { create } from 'zustand'
  import { persist } from 'zustand/middleware'
  
  export const useWishlistStore = create<WishlistStore>()(
    persist(
      (set) => ({
        items: [],
        addItem: (id) => set((state) => ({ items: [...state.items, id] })),
        removeItem: (id) => set((state) => ({ items: state.items.filter(i => i !== id) })),
      }),
      { name: 'wishlist-storage' }
    )
  )
  ```
- [ ] Editar `src/components/store/ProductInfo.tsx` línea 54, reemplazar `useState` con `useWishlistStore`
- [ ] Test: Agregar a wishlist, refrescar página, debe estar ahí
- [ ] Git commit: "feat: implement persistent wishlist with Zustand"

---

#### **BLOQUE 3: FIXES DE CÓDIGO CRÍTICOS (2 horas)**

**C2 — AdminSettings con try/catch**
- [ ] Editar `src/components/admin/AdminSettings.tsx` línea 76-87
- [ ] Wrap en try/catch, usar `Promise.all()` en lugar de `for-await`:
  ```typescript
  const handleSave = async () => {
    try {
      setLoading(true)
      await Promise.all(
        Object.entries(settings).map(([key, value]) =>
          supabase.from('site_settings').upsert({ key, value })
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
- [ ] Test: Desconectar red, intentar guardar, debe mostrar toast de error
- [ ] Git commit: "fix: add error handling in AdminSettings"

**C3 — Remove doble JSON.stringify**
- [ ] Editar `src/components/admin/AdminSettings.tsx` línea 82
- [ ] Cambiar: `value: JSON.stringify(value)` → `value: value`
- [ ] Test: Guardar configuración, verificar en Supabase que es JSONB válido (no string)
- [ ] Git commit: "fix: remove double stringify in settings"

**C4 — OrderDetail con try/catch**
- [ ] Editar `src/components/admin/OrderDetail.tsx` línea 42-48 y 50-55
- [ ] Agregar try/catch en ambos updates (status y notes):
  ```typescript
  const handleStatusUpdate = async (newStatus: string) => {
    try {
      const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', order.id)
      if (error) throw error
      toast.success('Status actualizado')
    } catch (error) {
      toast.error(`Error: ${error.message}`)
    }
  }
  ```
- [ ] Test: Cambiar status sin conexión, debe mostrar error toast
- [ ] Git commit: "fix: add error handling in OrderDetail updates"

**C8 — Newsletter opción B (ocultar)**
- [ ] Editar `src/components/store/Footer.tsx` línea ~213
- [ ] Comentar o eliminar `<NewsletterCTA />`
- [ ] Test: Verificar que footer no muestra CTA de newsletter
- [ ] Git commit: "chore: hide unimplemented newsletter feature"

---

#### **BLOQUE 4: BASE DE DATOS (2 horas)**

**D1 — Agregar índices críticos**
- [ ] Ir a Supabase SQL Editor
- [ ] Ejecutar:
  ```sql
  CREATE INDEX idx_orders_customer_email ON orders(customer_email);
  CREATE INDEX idx_orders_status_created_at ON orders(status, created_at DESC);
  CREATE INDEX idx_product_variants_product_id_stock 
    ON product_variants(product_id, stock) WHERE is_active = true;
  ```
- [ ] Test: Supabase > Indexes, verificar que se crearon
- [ ] Git commit: "database: add performance indexes"

**D3 — Tabla de auditoría de órdenes**
- [ ] Crear migration nueva `supabase/migrations/YYYY-MM-DD-order-audit-log.sql`
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
  
  CREATE OR REPLACE FUNCTION log_order_status_change()
  RETURNS TRIGGER AS $$
  BEGIN
    INSERT INTO order_audit_log (order_id, action, from_value, to_value)
    VALUES (NEW.id, 'status_change', OLD.status, NEW.status);
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;
  
  CREATE TRIGGER trg_order_status_change
  AFTER UPDATE OF status ON orders
  FOR EACH ROW
  EXECUTE FUNCTION log_order_status_change();
  ```
- [ ] Aplicar en Supabase
- [ ] Test: Cambiar status de una orden, verificar que se loguea en audit_log
- [ ] Git commit: "database: add order audit logging"

---

### 📊 SEMANA 1 — VERIFICACIÓN FINAL

**Checklist de validación:**

- [ ] **Seguridad:** Middleware + Layout validan role ✅
- [ ] **Seguridad:** Headers HTTP presentes en DevTools ✅
- [ ] **Seguridad:** CAPTCHA funciona en login ✅
- [ ] **Caching:** Vercel Analytics muestra menos queries a Supabase ✅
- [ ] **Database:** Índices creados (SQL Editor > Indexes) ✅
- [ ] **Error handling:** Errores muestran toasts al usuario ✅
- [ ] **Tests:** `npm run build` sin errores ✅
- [ ] **Git:** Todo commiteado con mensajes claros ✅

**Deploy a staging:**
- [ ] `git push origin semana-1-bloqueantes`
- [ ] Vercel auto-deploy
- [ ] Manual testing: home, productos, admin panel
- [ ] Lighthouse score en staging

---

### ✅ SEMANA 2: PERFORMANCE + CODE QUALITY (12 horas)

*(Incluida para referencia, implementar después de Semana 1)*

#### **BLOQUE 1: PERFORMANCE (3 horas)**

**P1 — Reducir Framer Motion overhead**
- [ ] Auditar componentes con animaciones (grep `"use client" + framer-motion`)
- [ ] Remover animaciones innecesarias (HeroSection, ProductCard, etc.)
- [ ] Lazy load Framer Motion: `import dynamic from 'next/dynamic'`
- [ ] Test: Lighthouse LCP debe bajar (target 2.5s)
- [ ] Git commit: "perf: reduce Framer Motion overhead, lazy load animations"

**P2 — Reemplazar Lenis con CSS scroll-behavior**
- [ ] `src/app/layout.tsx`: remover `<Lenis>` wrapper
- [ ] `src/styles/globals.css`: agregar `html { scroll-behavior: smooth; }`
- [ ] Test: Scroll en home, debe ser smooth pero sin RAF overhead
- [ ] Git commit: "perf: replace Lenis with CSS scroll-behavior"

**P3 — Add skeleton loaders**
- [ ] Crear `src/app/(store)/loading.tsx` con skeleton sections
- [ ] Agregar `<Suspense>` en home alrededor de secciones pesadas
- [ ] Test: CLS (Cumulative Layout Shift) en DevTools < 0.1
- [ ] Git commit: "perf: add skeleton loaders and Suspense boundaries"

**P4 — SearchOverlay race condition fix**
- [ ] `src/components/store/SearchOverlay.tsx` línea 58-70
- [ ] Agregar `AbortController`:
  ```typescript
  useEffect(() => {
    if (!q) { setResults([]); return }
    const controller = new AbortController()
    const timer = setTimeout(async () => {
      const { data } = await supabase.from('products')...
      if (!controller.signal.aborted) setResults(data)
    }, 300)
    return () => {
      controller.abort()
      clearTimeout(timer)
    }
  }, [q])
  ```
- [ ] Test: Buscar "dress", luego "dre" rápidamente, resultados correctos
- [ ] Git commit: "fix: add AbortController to search to prevent race conditions"

**P5 — Checkout idempotency key**
- [ ] `src/components/store/CheckoutPage.tsx` línea 109
- [ ] Agregar:
  ```typescript
  const idempotencyKey = useRef(crypto.randomUUID())
  ```
- [ ] Pasar a RPC `create_order_with_stock_check(idempotency_key)`
- [ ] Test: Double-submit en checkout, debe crear solo 1 orden
- [ ] Git commit: "fix: add idempotency key to prevent double-submit"

#### **BLOQUE 2: CODE QUALITY (3 horas)**

**C5 — Reemplazar `<img>` con `next/image`**
- [ ] `src/components/store/Navbar.tsx` línea 171, 294
- [ ] `src/components/store/Footer.tsx` línea 76
- [ ] Cambiar a: `<Image src="..." alt="..." width={200} height={60} />`
- [ ] Test: Lighthouse, imágenes deben tener srcset
- [ ] Git commit: "perf: replace img tags with next/image for optimization"

**C6 — Eliminar `any` types (4 archivos)**
- [ ] `src/components/admin/RevenueChart.tsx` línea 10
  - Tipar `CustomTooltip` con tipos Recharts
- [ ] `src/components/admin/OrderDetail.tsx` línea 33, 38
  - Cambiar `as any` por tipos correctos
- [ ] `src/app/admin/settings/page.tsx` línea 7-8
  - Cambiar `Record<string, any>` por tipo correcto
- [ ] Test: `npm run build` sin type errors
- [ ] Git commit: "refactor: remove any types for better type safety"

**C7 — Error boundaries**
- [ ] Crear `src/app/admin/error.tsx`:
  ```typescript
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
- [ ] Crear `src/app/admin/[id]/error.tsx` (igual para rutas dinámicas)
- [ ] Test: Forzar error en admin, debe mostrarse error boundary
- [ ] Git commit: "feat: add error boundaries to admin routes"

#### **BLOQUE 3: TESTING (2 horas)**

**T1 — Playwright E2E test**
- [ ] `npm install -D @playwright/test`
- [ ] Crear `tests/e2e/checkout.spec.ts`:
  ```typescript
  test('complete checkout flow', async ({ page }) => {
    await page.goto('/')
    await page.click('[data-testid="product-card"]:first-child')
    await page.click('[data-testid="add-to-cart"]')
    await page.click('[data-testid="cart-icon"]')
    await page.click('[data-testid="checkout-button"]')
    await page.fill('[name="email"]', 'test@example.com')
    await page.click('[data-testid="place-order"]')
    await expect(page).toHaveURL(/.*confirmed/)
  })
  ```
- [ ] `npx playwright test`
- [ ] Test: Debe pasar sin errores
- [ ] Git commit: "test: add E2E test for checkout flow"

**T2 — Vitest unit tests**
- [ ] `npm install -D vitest @testing-library/react`
- [ ] Crear `src/lib/store/cart.test.ts`:
  ```typescript
  import { renderHook, act } from '@testing-library/react'
  import { useCartStore } from './cart'
  
  test('addItem increases count', () => {
    const { result } = renderHook(() => useCartStore())
    act(() => result.current.addItem({ id: '1', name: 'Dress', quantity: 1 }))
    expect(result.current.items).toHaveLength(1)
  })
  ```
- [ ] `npx vitest src/lib/store/cart.test.ts`
- [ ] Test: Debe pasar sin errores
- [ ] Git commit: "test: add unit tests for cart store"

#### **BLOQUE 4: DOCUMENTACIÓN (1 hora)**

**D0 — Documentación de deployment**
- [ ] Crear `DEPLOYMENT.md`:
  - Checklist pre-lanzamiento cliente
  - Cómo desplegar en Vercel
  - Cómo configurar Supabase
- [ ] Crear `ONBOARDING_CLIENT.md`:
  - Paso a paso para cliente nuevo
  - Qué editar (colores, nombre, logo)
  - Cómo agregar productos

---

## 🎯 CRITERIOS DE ÉXITO

**Después de Semana 1:**
- ✅ Supabase quota viable (100+ visitas/día)
- ✅ Admin protegido (solo admins pueden editar)
- ✅ Precios validados server-side
- ✅ Errors loguados en Sentry
- ✅ No hay vulnerabilidades GDPR obvias

**Después de Semana 2:**
- ✅ Lighthouse 70+ mobile
- ✅ No hay `any` types
- ✅ Todos los updates tienen try/catch
- ✅ E2E tests pasan
- ✅ Documentación de deployment completa

**Resultado final:**
- ✅ **LISTO PARA VENDER** a cliente #1 con confianza
- ✅ Template replicable para 10+ clientes
- ✅ Soporte mínimo (tests evitan regressions)

---

## 📦 ARCHIVOS CLAVE A REVISAR

Mientras trabajas, mantén estos archivos a mano:

1. **ANÁLISIS-PRODUCCIÓN-CHECKLIST.md** — Referencia completa
2. **QUICK-REFERENCE-FIXES.md** — Tabla archivo→línea→acción
3. **RESUMEN-EJECUTIVO.md** — Contexto rápido
4. **ANÁLISIS-TÉCNICO-DETALLADO.md** — Por qué cada fix es crítico

---

## 🚀 WORKFLOW DIARIO

**Cada día:**
1. Abre `ANÁLISIS-PRODUCCIÓN-CHECKLIST.md`
2. Identifica qué tarea hacer hoy
3. Usa `QUICK-REFERENCE-FIXES.md` para números de línea exactos
4. Codifica, test, commit
5. Mark items como `- [x]` en el checklist
6. Push a rama: `semana-1-bloqueantes`

**Al final del día:**
- [ ] Todos los fixes son commits separados (uno por fix)
- [ ] Tests pasan: `npm run build`
- [ ] No hay warnings en console
- [ ] Changes están en repo (git push)

---

## 💬 INSTRUCCIONES FINALES

**Cuando empiezes la sesión:**

1. Di: "Estoy comenzando Semana 1 de robustez del MAISON ÉLARA e-commerce"
2. Abre los 4 archivos de documentación (en tabs diferentes)
3. Empieza con BLOQUE 1: SEGURIDAD
4. Sigue el checklist exacto
5. No hagas multi-tasking, **completa un fix antes de pasar al siguiente**
6. Cuando termines cada fix, haz commit inmediato

**Si te atascas:**
- Busca en `ANÁLISIS-TÉCNICO-DETALLADO.md` sección correspondiente (da contexto)
- Busca en `QUICK-REFERENCE-FIXES.md` (busca el problema por nombre)
- Si no está, pregunta (esto significa que el checklist necesita update)

---

**Generated:** 2026-04-16  
**Duration:** Semana 1 = 19-20 horas dev, Semana 2 = 12 horas dev  
**Outcome:** Template enterprise-ready, vendible a múltiples clientes

**¡Adelante! 🚀**
