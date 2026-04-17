# 🎯 PROMPT SESIÓN 2 — MAISON ÉLARA: LO QUE FALTA

**Proyecto:** MAISON ÉLARA — E-commerce de ropa multi-cliente  
**Stack:** Next.js 14.2.21 (App Router) + Supabase PostgreSQL + Zustand + Tailwind CSS  
**Ubicación:** `C:\MisProyectos\catalogo_de_webs\e-commerce_mujer`  
**Objetivo:** Completar el hardening de producción para poder vender el template.

---

## ✅ LO QUE YA ESTÁ HECHO (no repetir)

### Seguridad
- **S1** ✅ `src/lib/supabase/admin.ts` eliminado (código muerto). `scripts/onboard-client.ts` refactorizado para leer `SUPABASE_SERVICE_ROLE_KEY` desde env var en lugar del JSON.
- **S2** ✅ `src/middleware.ts` y `src/app/admin/layout.tsx` verifican `user.app_metadata?.role === 'admin'`. `onboard-client.ts` usa `app_metadata` al crear admins (no `user_metadata`).
- **S3** ✅ RLS policies arregladas — todas las tablas de escritura (catálogo, órdenes, settings, storage) requieren rol admin. Función `is_admin()` creada. **PENDIENTE MANUAL: ejecutar migration en Supabase.**
- **S4** ✅ Headers HTTP en `next.config.js`: CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy. Verificados en browser.
- **S5** ✅ `AdminSettings.tsx`: `validateHexColor()` añadida, input de texto filtra chars inválidos, `handleSave` lanza error si el color no es `#RRGGBB` válido.

### Caching + Performance
- **A1** ✅ ISR en rutas públicas: `home` = 3600s, `products` = 1800s, `sitemap` = 86400s.
- **A2** ✅ N+1 en categorías eliminado: de 7 queries → 2 queries planas + grouping en memoria.
- **A3** ✅ RPC `create_order_with_stock_check` ahora valida `p_shipping` y `p_tax` contra `site_settings`. **PENDIENTE MANUAL: ejecutar migration en Supabase.**

### Features
- **A5** ✅ Wishlist persistente: `src/lib/store/wishlist.ts` con Zustand + persist. `ProductInfo.tsx` usa `useWishlistStore`.

---

## 🔴 PASOS MANUALES URGENTES (hacerlos en Supabase dashboard ANTES de continuar)

Estas acciones no son código — hay que hacerlas a mano:

### 1. Rotar Service Role Key
- Ir a: `https://supabase.com/dashboard` → tu proyecto → Settings → API
- Click **"Regenerate"** en Service Role Key
- Actualizar `.env.local` con el nuevo valor

### 2. Ejecutar migración RLS (S3)
- Ir a Supabase SQL Editor
- Copiar y ejecutar el contenido de: `supabase/migrations/2026-04-17-fix-rls-admin-role.sql`

### 3. Ejecutar migración RPC (A3)
- Ir a Supabase SQL Editor
- Copiar y ejecutar el contenido de: `supabase/migrations/2026-04-17-rpc-shipping-tax-validation.sql`

### 4. Actualizar admins existentes
- Ir a Supabase → Authentication → Users
- Por cada usuario admin: editar → App Metadata → pegar `{"role": "admin"}`
- (Los creados con el script viejo tienen `user_metadata.role`, no `app_metadata.role`)

### 5. Habilitar CAPTCHA (S6)
- Supabase → Authentication → Attack Protection
- Activar CAPTCHA (hCaptcha o Turnstile)
- Activar MFA/TOTP

---

## 📋 CHECKLIST DE LO QUE FALTA IMPLEMENTAR

### BLOQUE 3: FIXES DE CÓDIGO CRÍTICOS (~2 horas)

#### C2 + C3 — AdminSettings: error handling + double stringify
**Archivo:** `src/components/admin/AdminSettings.tsx`  
**Línea aprox:** 76-95 (función `handleSave`)

Instalar toast primero:
```bash
npm install sonner
```

Agregar en `src/app/layout.tsx`:
```tsx
import { Toaster } from 'sonner'
// dentro del <body>:
<Toaster position="bottom-right" />
```

Reemplazar la función `handleSave` completa (actualmente líneas 76-91):
```typescript
async function handleSave() {
  // S5: validación de colores (ya existe, mantener)
  const colors = settings['brand_colors'] as Record<string, string> | undefined
  if (colors) {
    if (!validateHexColor(colors.primary)) {
      toast.error(`Color primario inválido: "${colors.primary}"`)
      return
    }
    if (!validateHexColor(colors.accent)) {
      toast.error(`Color de acento inválido: "${colors.accent}"`)
      return
    }
  }

  try {
    setSaving(true)
    const supabase = createClient()
    // C3: usar value directamente (NO JSON.stringify — Supabase lo maneja)
    await Promise.all(
      Object.entries(settings).map(([key, value]) =>
        supabase.from('site_settings').upsert(
          { key, value, updated_at: new Date().toISOString() },
          { onConflict: 'key' }
        )
      )
    )
    setDirty(false)
    toast.success('Configuración guardada')
  } catch (error) {
    toast.error(`Error al guardar: ${error instanceof Error ? error.message : 'Error desconocido'}`)
  } finally {
    setSaving(false)
  }
}
```

Agregar import arriba del archivo:
```typescript
import { toast } from 'sonner'
```

**Test:** Desconectar red, guardar → debe mostrar toast de error.  
**Commit:** `"fix: add error handling and remove double stringify in AdminSettings (C2+C3)"`

---

#### C4 — OrderDetail: try/catch en updates de status y notas
**Archivo:** `src/components/admin/OrderDetail.tsx`  
**Líneas aprox:** 42-55 (buscar las dos funciones que hacen `.update()`)

Primero instalar sonner si no está (misma instalación de C2).

Encontrar las funciones de update de status y notas, agregar try/catch:
```typescript
const handleStatusUpdate = async (newStatus: string) => {
  try {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', order.id)
    if (error) throw error
    toast.success('Estado actualizado')
  } catch (error) {
    toast.error(`Error: ${error instanceof Error ? error.message : 'Error desconocido'}`)
  }
}

const handleNotesUpdate = async (notes: string) => {
  try {
    const { error } = await supabase
      .from('orders')
      .update({ notes })
      .eq('id', order.id)
    if (error) throw error
    toast.success('Notas guardadas')
  } catch (error) {
    toast.error(`Error: ${error instanceof Error ? error.message : 'Error desconocido'}`)
  }
}
```

**Test:** Sin conexión, intentar cambiar estado → debe mostrar toast de error.  
**Commit:** `"fix: add error handling in OrderDetail updates (C4)"`

---

#### C8 — Ocultar newsletter no implementado
**Archivo:** `src/components/store/Footer.tsx`  
**Buscar:** `<NewsletterCTA` y comentarlo o eliminar ese bloque.

**Commit:** `"chore: hide unimplemented newsletter CTA (C8)"`

---

### BLOQUE 4: BASE DE DATOS (~1.5 horas — todo en Supabase SQL Editor)

#### D1 — Índices críticos
Ejecutar en Supabase SQL Editor:
```sql
CREATE INDEX IF NOT EXISTS idx_orders_customer_email
  ON orders(customer_email);

CREATE INDEX IF NOT EXISTS idx_orders_status_created_at
  ON orders(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_product_variants_product_id_stock
  ON product_variants(product_id, stock)
  WHERE is_active = true;
```

También crear archivo `supabase/migrations/2026-04-17-performance-indexes.sql` con el mismo contenido y commitearlo.

**Verificar:** Supabase → Table Editor → cualquier tabla → Indexes → ver que existen.  
**Commit:** `"database: add performance indexes for orders and variants (D1)"`

---

#### D3 — Tabla de auditoría de órdenes
Crear archivo `supabase/migrations/2026-04-17-order-audit-log.sql`:
```sql
CREATE TABLE IF NOT EXISTS order_audit_log (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    uuid REFERENCES orders(id) ON DELETE CASCADE,
  actor_email text,
  action      text NOT NULL,
  from_value  text,
  to_value    text,
  changed_at  timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_order_id ON order_audit_log(order_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_changed_at ON order_audit_log(changed_at DESC);

ALTER TABLE order_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin read audit log" ON order_audit_log FOR SELECT TO authenticated USING (is_admin());

CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO order_audit_log (order_id, action, from_value, to_value)
    VALUES (NEW.id, 'status_change', OLD.status, NEW.status);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_order_status_change ON orders;
CREATE TRIGGER trg_order_status_change
  AFTER UPDATE OF status ON orders
  FOR EACH ROW
  EXECUTE FUNCTION log_order_status_change();
```

Ejecutar en Supabase SQL Editor y commitear el archivo.

**Test:** Cambiar estado de una orden → verificar fila en `order_audit_log`.  
**Commit:** `"database: add order audit log table and trigger (D3)"`

---

### BLOQUE 5: PERFORMANCE (~3 horas)

#### P2 — Reemplazar Lenis con CSS scroll-behavior
**Archivo:** `src/app/layout.tsx`  
Buscar el wrapper `<Lenis>` o `ReactLenis` y eliminarlo.

**Archivo:** `src/styles/globals.css`  
Agregar al principio:
```css
html {
  scroll-behavior: smooth;
}
```

Desinstalar:
```bash
npm uninstall lenis
```

**Test:** Scroll en home debe ser suave. Lighthouse FCP debe mejorar.  
**Commit:** `"perf: replace Lenis with native CSS scroll-behavior (P2)"`

---

#### P4 — SearchOverlay: fix race condition con AbortController
**Archivo:** `src/components/store/SearchOverlay.tsx`  
**Líneas aprox:** 58-70 (el useEffect de búsqueda)

Reemplazar el useEffect:
```typescript
useEffect(() => {
  if (!q) { setResults([]); return }
  const controller = new AbortController()
  const timer = setTimeout(async () => {
    const { data } = await supabase
      .from('products')
      .select('id, name, slug, price, images:product_images(url)')
      .ilike('name', `%${q}%`)
      .eq('status', 'active')
      .limit(8)
    if (!controller.signal.aborted) setResults(data ?? [])
  }, 300)
  return () => {
    controller.abort()
    clearTimeout(timer)
  }
}, [q])
```

**Test:** Tipear "dre" rápido → resultados correctos, sin flickering.  
**Commit:** `"fix: add AbortController to search to prevent race conditions (P4)"`

---

#### P5 — Checkout: idempotency key para doble-submit
**Archivo:** `src/components/store/CheckoutPage.tsx`  
**Línea aprox:** al inicio del componente, agregar:
```typescript
import { useRef } from 'react'
// dentro del componente:
const idempotencyKey = useRef(crypto.randomUUID())
```

En la llamada a la RPC (aprox línea 109), pasar la key como parámetro adicional. Primero verificar si la RPC acepta un parámetro de idempotency o si hay que agregar lógica de "submitting" para bloquear el doble click.

Si la RPC no tiene parámetro de idempotency todavía, la solución más simple es un flag:
```typescript
const [submitting, setSubmitting] = useState(false)

const handleSubmit = async () => {
  if (submitting) return // prevenir doble submit
  setSubmitting(true)
  try {
    // ... lógica de checkout
  } finally {
    setSubmitting(false)
  }
}
```

**Test:** Click rápido 2 veces en "Confirmar pedido" → debe crear solo 1 orden.  
**Commit:** `"fix: prevent double-submit in checkout (P5)"`

---

#### P1 — Reducir overhead de Framer Motion
**Estrategia:** Auditar y lazy-load animaciones no críticas.

```bash
grep -r "framer-motion" src/ --include="*.tsx" -l
```

Para cada archivo con animaciones no críticas (ProductCard, categorías, etc.):
```typescript
// Cambiar import estático:
import { motion } from 'framer-motion'
// Por import dinámico:
import dynamic from 'next/dynamic'
const MotionDiv = dynamic(() => import('framer-motion').then(m => m.motion.div), { ssr: false })
```

Solo mantener Framer Motion síncrono en componentes críticos above-the-fold (HeroSection).

**Test:** Lighthouse mobile Performance → apuntar a 65+.  
**Commit:** `"perf: lazy-load Framer Motion in non-critical components (P1)"`

---

#### P3 — Skeleton loaders + Suspense
**Crear:** `src/app/(store)/loading.tsx`:
```tsx
export default function StoreLoading() {
  return (
    <div className="min-h-screen pt-[88px] md:pt-[104px]">
      <div className="h-screen animate-pulse bg-pale-gray" />
      <div className="max-w-[1600px] mx-auto px-6 py-16 grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="aspect-[3/4] animate-pulse bg-pale-gray rounded" />
        ))}
      </div>
    </div>
  )
}
```

**Commit:** `"perf: add skeleton loader for store routes (P3)"`

---

### BLOQUE 6: CODE QUALITY (~2 horas)

#### C5 — Reemplazar `<img>` con `next/image`
Buscar img tags en los archivos:
```bash
grep -n "<img " src/components/store/Navbar.tsx src/components/store/Footer.tsx
```

Reemplazar con:
```tsx
import Image from 'next/image'
// Cambiar: <img src="..." alt="..." />
// Por: <Image src="..." alt="..." width={200} height={60} />
```

**Commit:** `"perf: replace img tags with next/image (C5)"`

---

#### C6 — Eliminar `any` types
**Archivos a arreglar:**
- `src/components/admin/RevenueChart.tsx` línea ~10: tipar `CustomTooltip` con tipos Recharts:
  ```typescript
  import type { TooltipProps } from 'recharts'
  import type { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent'
  const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => { ... }
  ```
- `src/components/admin/OrderDetail.tsx` líneas ~33, 38: reemplazar `as any` por el tipo correcto del evento.
- `src/app/admin/settings/page.tsx` líneas ~7-8: cambiar `Record<string, any>` por `Record<string, unknown>` o el tipo específico.

**Test:** `npx tsc --noEmit` sin errores.  
**Commit:** `"refactor: remove any types for better type safety (C6)"`

---

#### C7 — Error boundaries en rutas admin
**Crear** `src/app/admin/error.tsx`:
```tsx
'use client'

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 p-8">
      <h2 className="font-display text-[20px] text-charcoal">Algo salió mal</h2>
      <p className="font-body text-[13px] text-warm-gray text-center max-w-md">{error.message}</p>
      <button
        onClick={reset}
        className="font-body text-[12px] uppercase tracking-[0.1em] border border-charcoal px-6 py-2 hover:bg-charcoal hover:text-white transition-colors duration-300"
      >
        Reintentar
      </button>
    </div>
  )
}
```

**Commit:** `"feat: add error boundary to admin routes (C7)"`

---

### BLOQUE 7: TESTING (~2 horas)

#### T1 — Playwright E2E test
```bash
npm install -D @playwright/test
npx playwright install chromium
```

**Crear** `tests/e2e/checkout.spec.ts`:
```typescript
import { test, expect } from '@playwright/test'

test('add to cart and reach checkout', async ({ page }) => {
  await page.goto('http://localhost:3000/products')
  await page.locator('[data-testid="product-card"]').first().click()
  // seleccionar talle y color si los hay
  await page.locator('[data-testid="add-to-cart"]').click()
  await page.locator('[data-testid="cart-icon"]').click()
  await expect(page.locator('[data-testid="cart-drawer"]')).toBeVisible()
  await page.locator('[data-testid="checkout-button"]').click()
  await expect(page).toHaveURL(/.*checkout/)
})
```

**Nota:** Agregar `data-testid` a los componentes relevantes primero si no existen.

**Commit:** `"test: add E2E test for cart and checkout flow (T1)"`

---

#### T2 — Vitest unit tests para cart store
```bash
npm install -D vitest @testing-library/react @vitejs/plugin-react jsdom
```

**Crear** `src/lib/store/cart.test.ts`:
```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { useCartStore } from './cart'

describe('cart store', () => {
  beforeEach(() => useCartStore.setState({ items: [] }))

  it('starts empty', () => {
    expect(useCartStore.getState().items).toHaveLength(0)
  })

  it('addItem increases count', () => {
    const mockProduct = { id: '1', name: 'Dress', price: 100 } as any
    const mockVariant = { id: 'v1', size: 'S', color: 'Black' } as any
    useCartStore.getState().addItem(mockProduct, mockVariant, 1)
    expect(useCartStore.getState().items).toHaveLength(1)
  })

  it('removeItem decreases count', () => {
    const mockProduct = { id: '1', name: 'Dress', price: 100 } as any
    const mockVariant = { id: 'v1', size: 'S', color: 'Black' } as any
    useCartStore.getState().addItem(mockProduct, mockVariant, 1)
    useCartStore.getState().removeItem('v1')
    expect(useCartStore.getState().items).toHaveLength(0)
  })
})
```

**Commit:** `"test: add unit tests for cart store (T2)"`

---

### BLOQUE 8: DOCUMENTACIÓN (~1 hora)

#### D0 — Deployment docs
**Crear** `DEPLOYMENT.md` con:
- Cómo deployar en Vercel (conectar repo, env vars)
- Cómo configurar Supabase para cliente nuevo (correr base.sql + migrations)
- Variables de entorno requeridas: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`
- Checklist pre-lanzamiento cliente (RLS activo, CAPTCHA habilitado, dominio configurado)

**Crear** `ONBOARDING_CLIENT.md` con:
- Cómo onboardear cliente nuevo con `scripts/onboard-client.ts`
- Qué personalizar (colores, logo, nombre) vía admin panel
- Cómo agregar productos y colecciones

**Commit:** `"docs: add deployment and client onboarding guides (D0)"`

---

## 📊 ESTADO ACTUAL DEL PROYECTO

### Commits de esta sesión
```
a409945 security: validate hex colors to prevent CSS injection (S5)
7428817 security: add HTTP security headers (S4)
e92c529 security: fix RLS policies to require admin role (S3)
239d553 security: add admin role check in middleware and layout (S2)
f463386 security: rotate service role key exposure risk (S1)
351c5b0 perf: add ISR revalidation and fix N+1 category queries (A1+A2)
5c5d9a7 security: validate shipping + tax server-side in RPC (A3)
476aae2 feat: persistent wishlist with Zustand (A4)
```

### Archivos clave del proyecto
- `src/middleware.ts` — autenticación + role check
- `src/app/admin/layout.tsx` — segunda capa de protección admin
- `supabase/base.sql` — schema completo con RLS y is_admin()
- `supabase/migrations/` — migrations para aplicar en Supabase
- `src/lib/store/` — cart.ts + wishlist.ts (Zustand)
- `src/components/admin/AdminSettings.tsx` — panel de configuración
- `scripts/onboard-client.ts` — onboarding de nuevos clientes

---

## 🎯 ORDEN SUGERIDO PARA ESTA SESIÓN

1. **Primero:** Hacer los 5 pasos manuales de Supabase (críticos)
2. **C2 + C3** — AdminSettings error handling (30 min)
3. **C4** — OrderDetail error handling (20 min)
4. **C8** — Ocultar newsletter (5 min)
5. **D1** — Índices de base de datos (20 min)
6. **D3** — Audit log de órdenes (30 min)
7. **P2** — Reemplazar Lenis (15 min)
8. **P4** — SearchOverlay AbortController (20 min)
9. **P5** — Checkout doble-submit prevention (20 min)
10. **C5** — next/image (20 min)
11. **C6** — Eliminar any types (30 min)
12. **C7** — Error boundaries (15 min)
13. **P1** — Framer Motion lazy-load (45 min)
14. **P3** — Skeleton loaders (20 min)
15. **T1 + T2** — Tests E2E + unit (60 min)
16. **D0** — Documentación (30 min)

---

## ✅ CRITERIOS DE ÉXITO AL TERMINAR

- `npx tsc --noEmit` → sin errores
- `npm run build` → sin errores  
- Lighthouse mobile → 65+ Performance
- Admin panel → solo accesible con `app_metadata.role = "admin"`
- Checkout → precios/shipping/tax imposibles de manipular desde cliente
- Tests E2E → pasan en CI
- Wishlist → persiste al refrescar
- Errors → todos muestran toast con mensaje claro
- Documentación → cliente puede onboardearse solo

**Al completar esto: template enterprise-ready, listo para vender a cliente #1** 🚀
