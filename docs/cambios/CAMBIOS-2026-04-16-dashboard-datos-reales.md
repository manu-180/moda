# CAMBIOS MAISON ÉLARA — Limpieza de datos falsos en dashboard admin

> **Para Cursor (modo auto):** Aplicá los siguientes cambios al proyecto.
> Cada cambio indica archivo, acción y código final.
> No modifiques nada que no esté listado acá.

---

## 🎯 Contexto del problema

El dashboard admin en `src/app/admin/page.tsx` muestra **3 tipos de datos falsos** que confunden a cualquier persona que mire el panel:

1. **Revenue chart**: días sin ventas muestran `Math.floor(Math.random() * 2000 + 500)` en vez de `0`. Esto hace que el gráfico parezca que siempre hay actividad comercial.
2. **Tendencias (`trend`)** hardcodeadas en los 4 `StatsCard`: `12.5%`, `8.3%`, `-3.2%`, `1.8%`. Son valores fijos que nunca cambian, no vienen de ningún cálculo.
3. **Tasa de conversión** hardcodeada como `"3,2%"`. Sin datos de tráfico (analytics) no se puede calcular realmente.

Todos son restos de la fase de mockup/seed. En un dashboard honesto, los datos que no se pueden calcular no se muestran (o se muestran como "—").

**Decisión de diseño:** Sacamos las 3 cosas falsas. No calculamos trends reales en esta sesión porque requiere comparar períodos (más complejidad). La `StatsCard` ya soporta no pasar la prop `trend` (es opcional y el componente tiene guard `{trend !== undefined && ...}`), así que no hay que tocar `StatsCard.tsx`.

La `StatsCard` de "Tasa de conversión" la sacamos del grid directamente — sin datos reales de tráfico no aporta nada. El grid queda de 3 columnas en lugar de 4 (más limpio visualmente también).

---

## 📝 CAMBIO 1 — Revenue chart: reemplazar `Math.random()` por `0`

**Archivo:** `src/app/admin/page.tsx`
**Acción:** Editar sección específica — función `getDashboardData`, bloque del `chartData`.

**Justificación:**
1. Los días sin ventas deben mostrar `0`, no un número inventado.
2. El comentario `(mock last 14 days with seed data distribution)` queda obsoleto — el chart pasa a reflejar datos reales.
3. Operador `|| Math.floor(...)` se reemplaza por el valor real del `reduce`.

**Código a reemplazar (buscar exactamente este bloque):**

```typescript
  // Revenue chart data (mock last 14 days with seed data distribution)
  const chartData = Array.from({ length: 14 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (13 - i))
    const dayOrders = allOrders.filter((o) => {
      const od = new Date(o.created_at)
      return od.toDateString() === d.toDateString()
    })
    return {
      date: d.toLocaleDateString('es-AR', { month: 'short', day: 'numeric' }),
      revenue: dayOrders.reduce((s, o) => s + (o.total || 0), 0) || Math.floor(Math.random() * 2000 + 500),
    }
  })
```

**Reemplazar por:**

```typescript
  // Revenue chart data: últimos 14 días con ingresos reales (0 si no hubo ventas ese día)
  const chartData = Array.from({ length: 14 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (13 - i))
    const dayOrders = allOrders.filter((o) => {
      const od = new Date(o.created_at)
      return od.toDateString() === d.toDateString()
    })
    return {
      date: d.toLocaleDateString('es-AR', { month: 'short', day: 'numeric' }),
      revenue: dayOrders.reduce((s, o) => s + (o.total || 0), 0),
    }
  })
```

---

## 📝 CAMBIO 2 — Sacar trends hardcodeados y la card de conversión

**Archivo:** `src/app/admin/page.tsx`
**Acción:** Editar sección específica — el grid de `StatsCard` dentro del `return` del componente `AdminDashboard`.

**Justificación:**
1. Los valores `trend={12.5}`, `trend={8.3}`, `trend={-3.2}`, `trend={1.8}` son fijos, no calculados — mentían.
2. La "Tasa de conversión" `"3,2%"` también era fija y sin analytics no se puede calcular.
3. `StatsCard` acepta que no se pase `trend` (prop opcional con guard interno) — no hay error de TypeScript ni warning.
4. Pasamos el grid de 4 a 3 columnas (`lg:grid-cols-3`) para que quede balanceado visualmente.
5. Reasignamos los `index` de 0 a 2 (sin saltos) para que la animación de entrada (stagger con delay por index) quede correlativa.

**Código a reemplazar (buscar exactamente este bloque):**

```tsx
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label="Ingresos totales" value={`$${Math.round(data.totalRevenue).toLocaleString('es-AR')}`} trend={12.5} icon={DollarSign} accentColor="#C4A265" index={0} />
        <StatsCard label="Pedidos" value={String(data.orderCount)} trend={8.3} icon={ShoppingBag} accentColor="#1A1A1A" index={1} />
        <StatsCard label="Ticket promedio" value={`$${Math.round(data.avgOrderValue)}`} trend={-3.2} icon={BarChart3} accentColor="#2D5016" index={2} />
        <StatsCard label="Tasa de conversión" value="3,2%" trend={1.8} icon={TrendingUp} accentColor="#9B1B30" index={3} />
      </div>
```

**Reemplazar por:**

```tsx
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatsCard label="Ingresos totales" value={`$${Math.round(data.totalRevenue).toLocaleString('es-AR')}`} icon={DollarSign} accentColor="#C4A265" index={0} />
        <StatsCard label="Pedidos" value={String(data.orderCount)} icon={ShoppingBag} accentColor="#1A1A1A" index={1} />
        <StatsCard label="Ticket promedio" value={`$${Math.round(data.avgOrderValue)}`} icon={BarChart3} accentColor="#2D5016" index={2} />
      </div>
```

---

## 📝 CAMBIO 3 — Limpiar import `TrendingUp` que queda sin uso

**Archivo:** `src/app/admin/page.tsx`
**Acción:** Editar la línea de imports de `lucide-react`.

**Justificación:**
1. Al sacar la card de "Tasa de conversión", el ícono `TrendingUp` ya no se usa en este archivo.
2. ESLint (con `eslint-config-next`) marca imports sin usar como warning.
3. `DollarSign`, `ShoppingBag`, `BarChart3` siguen en uso.

**Código a reemplazar (buscar exactamente esta línea):**

```typescript
import { DollarSign, ShoppingBag, BarChart3, TrendingUp } from 'lucide-react'
```

**Reemplazar por:**

```typescript
import { DollarSign, ShoppingBag, BarChart3 } from 'lucide-react'
```

---

## ✅ Checklist final para Cursor

- [ ] `src/app/admin/page.tsx` — bloque `chartData` modificado (sin `Math.random()`)
- [ ] `src/app/admin/page.tsx` — grid `StatsCard` cambiado a 3 columnas, sin `trend`, sin card de conversión
- [ ] `src/app/admin/page.tsx` — import de `lucide-react` sin `TrendingUp`
- [ ] `StatsCard.tsx` — **NO debe modificarse** (ya soporta `trend` opcional)
- [ ] Correr `npm run build` y verificar que compila sin errores ni warnings nuevos
- [ ] Correr `npm run dev`, entrar a `/admin` (con sesión) y verificar:
  - [ ] El chart de ingresos muestra ceros en días sin ventas (líneas rectas en 0)
  - [ ] Las 3 `StatsCard` no tienen flechitas de tendencia
  - [ ] La card "Tasa de conversión" ya no aparece
  - [ ] En desktop (≥1024px) el grid muestra 3 cards en línea, no 4
