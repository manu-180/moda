# ⚡ QUICK REFERENCE — QUÉ ARCHIVO EDITAR PARA CADA FIX

**Use esto cuando estés codificando:** Ctrl+F, busca la línea, edita.

---

## 🔴 BLOQUEANTES SEMANA 1 (19 horas)

### SEGURIDAD

| Fix | Archivo | Línea | Acción |
|-----|---------|-------|--------|
| **S1a** — Rotar service role key | Supabase Dashboard | N/A | Settings > API > Keys > Regenerate |
| **S1b** — Eliminar admin.ts (muerto) | `src/lib/supabase/admin.ts` | Todos | Eliminar archivo completo + imports |
| **S1c** — Remove from .env | `.env.local` | 4 | Eliminar línea `SUPABASE_SERVICE_ROLE_KEY=` |
| **S1d** — Remove service role from scripts | `scripts/onboard-client.ts` | 87, 148 | Reemplazar por magic link invitation |
| **S2a** — Role check en middleware | `src/middleware.ts` | 29-35 | Agregar `if (user.app_metadata?.role !== 'admin') return redirect('/')` |
| **S2b** — Role check en admin layout | `src/app/admin/layout.tsx` | 11-15 | Agregar mismo check |
| **S3a** — Fix RLS policies (admin-only) | `supabase/base.sql` | 196-221 | Reemplazar `USING (true)` con policy basada en role |
| **S4a** — Headers HTTP | `next.config.js` | Fin file | Agregar bloque `async headers() { ... }` |
| **S5a** — Validar hex color | `src/components/admin/AdminSettings.tsx` | 479-492 | Agregar `validateHexColor(/^#[0-9a-fA-F]{6}$/)` |
| **S6a** — CAPTCHA en Supabase | Supabase Dashboard | Auth > Attack Protection | Enable CAPTCHA |
| **S6b** — MFA en Supabase | Supabase Dashboard | Auth > Attack Protection | Enable MFA/TOTP |

### CACHING & N+1

| Fix | Archivo | Línea | Acción |
|-----|---------|-------|--------|
| **A1a** — ISR homepage | `src/app/(store)/page.tsx` | 1 | Agregar `export const revalidate = 3600` |
| **A1b** — ISR products | `src/app/(store)/products/page.tsx` | 1 | Agregar `export const revalidate = 1800` |
| **A1c** — ISR sitemap | `sitemap.ts` | 1 | Agregar `export const revalidate = 86400` |
| **A1d** — Fix N+1 categories | `src/app/(store)/products/page.tsx` | ~40-60 | Refactor `getCategories()` para usar SQL agregada |
| **A2a** — Validar shipping/tax RPC | `supabase-migrations/2026-04-16-stock-atomico.sql` | 168-175 | Agregar `CROSS JOIN site_settings` y comparar valores |
| **A3a** — Crear RPC dashboard metrics | `supabase/migrations/` | Nueva | Crear función `get_dashboard_metrics(days_back int)` |
| **A3b** — Usar RPC en admin | `src/app/admin/page.tsx` | 10-82 | Reemplazar loop con `supabase.rpc('get_dashboard_metrics')` |
| **A4a** — Instalar Sentry | `package.json` | Después "dependencies" | Agregar `"@sentry/nextjs": "^7.80.0"` |
| **A4b** — Config Sentry | `next.config.js` | Top | `const withSentryConfig = require('@sentry/nextjs/withSentryConfig')` |
| **A4c** — Crear sentry.client.config.js | Raíz proyecto | Nueva | Ver docs Sentry para Next.js |
| **A4d** — Crear sentry.server.config.js | Raíz proyecto | Nueva | Ver docs Sentry para Next.js |
| **A5a** — Crear wishlist store | `src/lib/store/wishlist.ts` | Nueva | Copiar patrón de `cart.ts` con Zustand persist |
| **A5b** — Usar wishlist en ProductInfo | `src/components/store/ProductInfo.tsx` | 54 | Reemplazar `useState` con `useWishlistStore` |

### CODE FIXES CRÍTICOS

| Fix | Archivo | Línea | Acción |
|-----|---------|-------|--------|
| **C2a** — AdminSettings try/catch | `src/components/admin/AdminSettings.tsx` | 76-87 | Wrap con try/catch, usar `Promise.all()` en lugar de for-await |
| **C3a** — Remove doble stringify | `src/components/admin/AdminSettings.tsx` | 82 | Cambiar `value: JSON.stringify(value)` → `value: value` |
| **C4a** — OrderDetail try/catch | `src/components/admin/OrderDetail.tsx` | 42-48 | Agregar try/catch, toast en error |
| **C4b** — OrderDetail notes try/catch | `src/components/admin/OrderDetail.tsx` | 50-55 | Agregar try/catch, toast en error |
| **C5a** — Navbar logo next/image | `src/components/store/Navbar.tsx` | 171 | Reemplazar `<img>` por `<Image from "next/image"` |
| **C5b** — Navbar cart icon img | `src/components/store/Navbar.tsx` | 294 | Reemplazar `<img>` por `<Image>` |
| **C5c** — Footer logo next/image | `src/components/store/Footer.tsx` | 76 | Reemplazar `<img>` por `<Image>` |
| **C8a** — Newsletter opción B (ocultar) | `src/components/store/Footer.tsx` | 213 | Comentar o eliminar `<NewsletterCTA />` |
| **C8b** — Newsletter opción A (implementar) | `src/lib/` | Nueva | Crear `newsletter.ts` con función subscribe |

---

## 🟡 IMPORTANTES SEMANA 2-3 (30 horas)

### PERFORMANCE

| Fix | Archivo | Línea | Acción |
|-----|---------|-------|--------|
| **P1a** — Reducir Framer Motion | Multiple | Audit | Revisar componentes, remover animaciones innecesarias |
| **P1b** — Remove Lenis | `src/app/layout.tsx` | ~50 | Cambiar `<Lenis>` por `html { scroll-behavior: smooth }` |
| **P3a** — Add skeleton loaders | `src/app/(store)/loading.tsx` | Nuevo | Crear componentes skeleton |
| **P3b** — Suspense en home | `src/app/(store)/page.tsx` | ~30-80 | Wrap sections con `<Suspense fallback={<Skeleton />}>` |
| **P4a** — Search AbortController | `src/components/store/SearchOverlay.tsx` | 58-70 | Agregar `AbortController`, abort en cleanup |
| **P5a** — Checkout idempotency | `src/components/store/CheckoutPage.tsx` | 109-149 | Generar `idempotencyKey`, pasar a RPC |

### CODE QUALITY

| Fix | Archivo | Línea | Acción |
|-----|---------|-------|--------|
| **C6a** — Type CustomTooltip | `src/components/admin/RevenueChart.tsx` | 10 | Importar tipos Recharts, tipar `TooltipProps<...>` |
| **C6b** — Type OrderDetail notes | `src/components/admin/OrderDetail.tsx` | 33 | Cambiar `as any` por `Order & { notes?: string }` |
| **C6c** — Type settings | `src/app/admin/settings/page.tsx` | 7-8 | Cambiar `Record<string, any>` por `SiteConfig` tipado |
| **C7a** — Error boundary admin | `src/app/admin/error.tsx` | Nueva | Crear componente error.tsx |
| **C7b** — Error boundary admin child | `src/app/admin/[id]/error.tsx` | Nueva | Crear para rutas dinámicas |

### BASE DE DATOS

| Fix | Archivo | Línea | Acción |
|-----|---------|-------|--------|
| **D1a** — Índice customer_email | Supabase SQL | Nueva | `CREATE INDEX idx_orders_customer_email ON orders(customer_email);` |
| **D1b** — Índice status_created_at | Supabase SQL | Nueva | `CREATE INDEX idx_orders_status_created_at ON orders(status, created_at DESC);` |
| **D1c** — Índice variants stock | Supabase SQL | Nueva | `CREATE INDEX idx_product_variants_product_id_stock ON ...` |
| **D3a** — Tabla audit_log | `supabase/migrations/` | Nueva | Crear tabla + función + trigger |
| **D3b** — Trigger order change | `supabase/migrations/` | Nueva | Create trigger on orders UPDATE |

### TESTING

| Fix | Archivo | Línea | Acción |
|-----|---------|-------|--------|
| **T1a** — Install Playwright | `package.json` | devDependencies | Agregar `"@playwright/test": "^1.40.0"` |
| **T1b** — Create E2E test | `tests/e2e/checkout.spec.ts` | Nueva | Escribir test add-to-cart → checkout |
| **T2a** — Install Vitest | `package.json` | devDependencies | Agregar `"vitest": "^1.0.0"` |
| **T2b** — Cart unit tests | `src/lib/store/cart.test.ts` | Nueva | Test addItem, updateQuantity, removeItem |

---

## 🔍 BÚSQUEDA RÁPIDA POR PROBLEMA

**Necesito fixar X rápido, no sé dónde:**

### "Cualquiera puede entrar al admin"
→ Busca: `src/middleware.ts:29` + `src/app/admin/layout.tsx:11`

### "Keys de Supabase expuestas"
→ Busca: `.env.local:4` + `src/lib/supabase/admin.ts` (eliminar)

### "Supabase quota explota"
→ Busca: `src/app/(store)/page.tsx:1` + `src/app/(store)/products/page.tsx:1` (agregar revalidate)

### "Search es lento/incorrecto"
→ Busca: `src/components/store/SearchOverlay.tsx:58`

### "Admin form no guarda cambios"
→ Busca: `src/components/admin/AdminSettings.tsx:76` (agregar try/catch)

### "Dashboard se cuelga con muchas órdenes"
→ Busca: `src/app/admin/page.tsx:10` (reescribir con RPC)

### "Mobile muy lento"
→ Busca: `src/app/(store)/page.tsx` + `src/components/store/Navbar.tsx:171` (next/image)

### "Órdenes sin audit trail"
→ Busca: `supabase/migrations/` (crear tabla order_audit_log)

---

## 📊 ESTIMATION POR FIX

| Duración | Fixes | Total Horas |
|----------|-------|------------|
| **15 min** | S1c, S1d, C3a, S5a | 1 |
| **30 min** | S1a, S1b, P4a, P5a, C5a-c, A5a | 3 |
| **45 min** | S2a, S2b, C2a, C4a, A2a | 4 |
| **1 hora** | S3a, S4a, A1d, A4b, A5b, C4b | 6 |
| **1.5h** | A1a-c, A3a-b, C6a-c, C7a | 3 |
| **2h** | P1a, P1b, P3a-b, T1b, T2b | 10 |
| **N/A** | S6a, S6b (Supabase UI) | 0.25 |
| **TOTAL** | 35+ fixes | **27.25h** |

**Realista con review + testing:** 40-50 horas

---

## 🚀 WORKFLOW RECOMENDADO

1. **Abre este archivo al lado** (Ctrl+K Ctrl+P en VS Code)
2. **Sigue ANÁLISIS-PRODUCCIÓN-CHECKLIST.md** para orden
3. **Busca archivo aquí**, abre en editor
4. **Sigue acción exacta**, no improvises
5. **Test después** (Lighthouse, unit test, manual test)
6. **Mark done** en checklist
7. **Commit & push** cada 2-3 fixes

---

**Last updated:** 2026-04-16  
**For questions:** Ver `ANÁLISIS-TÉCNICO-DETALLADO.md` para context.
