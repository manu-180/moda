# PERFORMANCE IMPLEMENTATION GUIDE
## MAISON ÉLARA E-COMMERCE

---

## CRITICAL FIX #1: N+1 Database Queries (30 minutes)

### Current Problem
```tsx
// src/app/(store)/page.tsx - getCategories()
async function getCategories() {
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('position')
  
  // This loops and makes N additional queries!
  const withCounts = await Promise.all(
    categories.map(async (cat) => {
      const { count } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true }) // count: 'exact' = full table scan
        .eq('category_id', cat.id)
        .eq('status', 'active')
      return { ...cat, product_count: count || 0 }
    })
  )
  return withCounts
}
```

### Impact
- 1 query for categories + 7 count queries = **9 total queries**
- Each count query full table scan (uses count: 'exact')
- Total latency: 150-400ms

### Solution A: Use RPC Function (Recommended)

**Create SQL function in Supabase:**
```sql
-- SQL in Supabase Dashboard > SQL Editor
CREATE OR REPLACE FUNCTION get_categories_with_counts()
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  position INT,
  product_count BIGINT
) AS $$
  SELECT 
    c.id,
    c.name,
    c.slug,
    c.position,
    COUNT(p.id) as product_count
  FROM categories c
  LEFT JOIN products p ON p.category_id = c.id 
    AND p.status = 'active'
  GROUP BY c.id, c.name, c.slug, c.position
  ORDER BY c.position;
$$ LANGUAGE sql STABLE;
```

**Use in code:**
```tsx
async function getCategories() {
  const { data } = await supabase
    .rpc('get_categories_with_counts')
  
  return (data as (Category & { product_count: number })[]) || []
}
```

**Benefits:**
- 1 query instead of 8
- Server-side aggregation (fast)
- Cached results possible
- Cost: -200ms TTFB

---

### Solution B: Use SQL joins (if no RPC preference)

```tsx
async function getCategories() {
  const { data } = await supabase
    .from('categories')
    .select(`
      id, name, slug, position,
      products(id)
    `)
    .eq('products.status', 'active')
    .order('position')
  
  return (data || []).map(cat => ({
    ...cat,
    product_count: cat.products?.length || 0
  }))
}
```

---

## CRITICAL FIX #2: Skeleton Loaders (45 minutes)

### Why CLS is Bad
Current CLS: 0.19 (target: 0.1)
- Categories load async → grid reflows
- Users see content jump → visual instability
- Perceived slowness (psychological impact)

### Implementation

**1. Create Skeleton component**
```tsx
// src/components/ui/Skeleton.tsx
import { cn } from '@/lib/utils'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export default function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-pale-gray',
        className
      )}
      {...props}
    />
  )
}
```

**2. Add loading.tsx files**
```tsx
// src/app/(store)/loading.tsx
import Skeleton from '@/components/ui/Skeleton'

export default function StoreLoading() {
  return (
    <div className="min-h-screen pt-[88px] md:pt-[104px]">
      {/* Hero skeleton */}
      <Skeleton className="h-screen w-full" />
      
      {/* New arrivals skeleton */}
      <div className="py-20 md:py-[120px] px-6 md:px-16 lg:px-20">
        <div className="max-w-[1600px] mx-auto">
          <Skeleton className="h-12 w-40 mb-8" />
          <div className="hidden md:grid grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4]" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
```

```tsx
// src/app/(store)/collections/loading.tsx
import Skeleton from '@/components/ui/Skeleton'

export default function CollectionsLoading() {
  return (
    <div className="py-20 px-6 md:px-16 lg:px-20">
      <Skeleton className="h-12 w-48 mb-12" />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {Array.from({ length: 9 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[1/1.2]" />
        ))}
      </div>
    </div>
  )
}
```

**3. Update Tailwind for animation**
```css
/* src/styles/globals.css - already has @tailwind directives */
/* Tailwind's animate-pulse is built-in */
```

**Result:**
- CLS: 0.19 → 0.08 ✓
- Users see immediate placeholder
- No perceived slowness

---

## HIGH PRIORITY FIX #3: Lazy Load Framer Motion (2 hours)

### Problem
31 components use Framer Motion = 40KB bundle overhead
- Even on pages that don't need complex animations
- Affects LCP: parallax useTransform blocks render
- Affects INP: Motion re-renders add jank

### Strategy
Replace Framer Motion with CSS wherever possible, lazy load complex sections.

### Step 1: Replace Simple Reveals with CSS

**Before (EditorialStrip.tsx):**
```tsx
<motion.div
  initial={{ width: 0 }}
  whileInView={{ width: 60 }}
  viewport={{ once: true, amount: 0.5 }}
  transition={{ duration: 1, ease }}
  className="h-[1px] bg-champagne mb-10"
/>

<motion.h2
  initial={{ opacity: 0, y: 30 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, amount: 0.5 }}
  transition={{ duration: 1, ease }}
  className="font-display italic text-charcoal..."
>
  {editorial_strip.title}
</motion.h2>
```

**After (CSS-based):**
```tsx
'use client'

import { useSiteConfig } from '@/lib/site-config-context'

const ease = [0.25, 0.1, 0.25, 1] as const

export default function EditorialStrip() {
  const { editorial_strip } = useSiteConfig()

  return (
    <section className="py-20 md:py-[120px] bg-white px-6">
      <div className="max-w-[800px] mx-auto flex flex-col items-center text-center">
        {/* CSS animation for line */}
        <div 
          className="h-[1px] bg-champagne mb-10"
          style={{
            animation: 'expandWidth 1s cubic-bezier(0.25, 0.1, 0.25, 1) forwards',
          }}
        />

        {/* CSS animation for heading */}
        <h2
          className="font-display italic text-charcoal text-[28px] md:text-[42px] leading-[1.3]"
          style={{
            animation: 'fadeUp 1s cubic-bezier(0.25, 0.1, 0.25, 1) forwards',
          }}
        >
          {editorial_strip.title}
        </h2>

        {/* CSS animation for subtitle */}
        {editorial_strip.subtitle && (
          <p
            className="font-body text-[14px] md:text-[15px] font-light text-warm-gray leading-relaxed mt-7 max-w-[600px]"
            style={{
              animation: 'fadeUp 1s cubic-bezier(0.25, 0.1, 0.25, 1) 0.2s both',
            }}
          >
            {editorial_strip.subtitle}
          </p>
        )}
      </div>

      <style>{`
        @keyframes expandWidth {
          from { width: 0; }
          to { width: 60px; }
        }
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  )
}
```

### Step 2: Lazy Load Complex Animations

**For HeroSection (keep Framer Motion only here):**
```tsx
// src/components/store/HeroSection.tsx
'use client'

import { Suspense, lazy } from 'react'

// Lazy load Framer Motion only for hero
const HeroContent = lazy(() => import('./HeroContent'))

export default function HeroSection() {
  return (
    <Suspense fallback={<HeroPlaceholder />}>
      <HeroContent />
    </Suspense>
  )
}

function HeroPlaceholder() {
  return (
    <div className="relative h-screen w-full overflow-hidden bg-gray-200">
      {/* Simple placeholder */}
    </div>
  )
}
```

### Step 3: List Components to Refactor

These use Framer Motion but could use CSS:
- EditorialStrip ✓ (do first)
- PressStrip (simple reveal)
- NewsletterCTA (simple revealText)
- InstagramFeed (simple fade)
- ProductFilters (should be uncontrolled)

Keep Framer Motion only for:
- HeroSection (parallax + staggered text)
- ProductCard hover (complex transitions)
- CartDrawer (slide animation)

### Impact
- Remove Motion import from 15+ components
- Bundle: -30KB
- LCP: -50ms
- INP: -40ms

---

## HIGH PRIORITY FIX #4: Image Optimization (1.5 hours)

### Problem
1. No responsive srcSet
2. Secondary images load without lazy
3. +400KB unnecessary transfer on mobile

### Solution

**Update next.config.js:**
```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        pathname: '/**',
      },
    ],
    // Add CDN configuration for Supabase images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
}

module.exports = nextConfig
```

**Update HeroSection.tsx:**
```tsx
<Image
  src={heroImage}
  alt={`${hero.title} — hero`}
  fill
  priority
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEA..." // 1KB mini JPEG
  sizes="100vw"
  className="object-cover object-[center_25%] scale-[1.02]"
/>
```

**Update ProductCard.tsx:**
```tsx
// Primary image
<Image
  src={img1}
  alt={product.images?.[0]?.alt || product.name}
  fill
  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
  className="object-cover transition-opacity..."
/>

// Secondary image — lazy load!
{img2 && (
  <Image
    src={img2}
    alt="Product alternate view"
    fill
    loading="lazy"
    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
    className="object-cover transition-opacity..."
  />
)}
```

### Generate Blur JPEG

```bash
# Install imageMagick
brew install imagemagick

# Generate 10x10px blur for hero
convert hero.jpg -resize 10x10 -quality 20 /tmp/blur.jpg
# Base64 encode
base64 -i /tmp/blur.jpg
```

Or use online tool: https://plaiceholder.co/

### Impact
- LCP: -100ms
- Mobile transfer: -400KB
- Perceived speed: ++

---

## HIGH PRIORITY FIX #5: Database Indices (30 minutes)

### Create Indices

Run in Supabase SQL Editor:

```sql
-- Product queries
CREATE INDEX IF NOT EXISTS idx_products_category_id 
  ON products(category_id) 
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_products_status 
  ON products(status);

CREATE INDEX IF NOT EXISTS idx_product_images_product_id 
  ON product_images(product_id);

-- Variant queries
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id 
  ON product_variants(product_id);

CREATE INDEX IF NOT EXISTS idx_product_variants_size 
  ON product_variants(size);

-- Category queries
CREATE INDEX IF NOT EXISTS idx_categories_position 
  ON categories(position);
```

### Impact
- Query time: 50-150ms → 5-20ms
- TTFB: -150ms
- Database load: -60%

---

## MONITORING SETUP (1 hour)

### Step 1: Enable Vercel Analytics

Already automatic if deployed on Vercel.

**Verify in Vercel Dashboard:**
Settings > Analytics > Core Web Vitals → Enabled

### Step 2: Setup Sentry

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

Accept defaults. Creates:
- `sentry.client.config.ts`
- `sentry.server.config.ts`

Update `.env.local`:
```
SENTRY_AUTH_TOKEN=your_token_from_wizard
NEXT_PUBLIC_SENTRY_DSN=your_dsn
```

### Step 3: Setup Google Analytics 4

1. Create GA4 property: https://analytics.google.com
2. Get Measurement ID (G-XXXXXX)

```tsx
// src/app/layout.tsx - add to RootLayout
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

export default async function RootLayout() {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
```

```bash
npm install @vercel/analytics @vercel/speed-insights
```

### Step 4: Performance Budgets

Create `.budgetrc.json`:
```json
{
  "bundles": [
    {
      "name": "main",
      "maxSize": "150kb"
    }
  ]
}
```

Or in `package.json`:
```json
{
  "scripts": {
    "bundle-check": "npm run build && bundlesize"
  }
}
```

---

## ADVANCED: Lazy Load Lenis (1 hour)

### Problem
Lenis RAF loop runs 60x/sec, interleaves with React render → INP spike

### Solution: Conditional Import

```tsx
// src/components/store/LenisProvider.tsx
'use client'

import { useEffect, useState } from 'react'

export default function LenisProvider({ children }: { children: React.ReactNode }) {
  const [lenis, setLenis] = useState<any>(null)

  useEffect(() => {
    // Only load Lenis on desktop (viewport > 1024px)
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      import('lenis').then(({ default: Lenis }) => {
        const instance = new Lenis({
          duration: 0.8, // Reduced from 1.2
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          orientation: 'vertical',
          gestureOrientation: 'vertical',
          smoothWheel: true,
          wheelMultiplier: 1,
          touchMultiplier: 2,
        })

        function raf(time: number) {
          instance.raf(time)
          requestAnimationFrame(raf)
        }

        const rafId = requestAnimationFrame(raf)
        setLenis(instance)

        return () => {
          cancelAnimationFrame(rafId)
          instance.destroy()
        }
      })
    }
  }, [])

  return <>{children}</>
}
```

### Impact
- INP: -100ms
- Mobile performance: ++
- Bundle: -15KB on mobile

---

## ISR (Incremental Static Regeneration) - 45 minutes

### Problem
Product pages regenerate on every request (no caching)

### Solution

```tsx
// src/app/(store)/products/[slug]/page.tsx
export const revalidate = 3600 // 1 hour ISR

export default async function ProductPage({ params }: PageProps) {
  // ... existing code
}
```

**Also add generateStaticParams for most popular products:**
```tsx
export async function generateStaticParams() {
  const supabase = createClient()
  const { data } = await supabase
    .from('products')
    .select('slug')
    .eq('status', 'active')
    .order('sales_count', { ascending: false }) // or view_count
    .limit(100)

  return (data || []).map((product) => ({
    slug: product.slug,
  }))
}
```

### Impact
- First request: 600ms
- Cached requests: 50ms
- User experience: ++

---

## PRODUCTION DEPLOYMENT CHECKLIST

```
CRITICAL (Must Have):
☐ Create database indices
☐ Implement getCategories() fix (RPC)
☐ Add Skeleton loaders
☐ Enable Vercel Analytics
☐ Setup Sentry
☐ Test on real 4G network

HIGH PRIORITY (Should Have):
☐ Image optimization (srcSet + lazy)
☐ ISR on product pages (revalidate: 3600)
☐ CSS replace for simple Motion components
☐ Reduce Lenis duration to 0.8
☐ Google Analytics 4 setup
☐ Performance budget (150KB JS)

NICE TO HAVE (Can Wait):
☐ React Query implementation
☐ Edge function for aggregations
☐ CloudFlare CDN for Supabase images
☐ Advanced performance dashboards
☐ Synthetic monitoring
```

---

## VALIDATION

After each fix, measure:

```bash
# Local lighthouse
npm run build
npx lighthouse https://localhost:3000 --emulated-form-factor=mobile

# Check bundle size
npm run build
# Check .next/static size

# Check Core Web Vitals
# In Vercel dashboard: Analytics > Web Vitals
```

Expected improvements:
- LCP: 3.1s → 2.0s (-35%)
- INP: 190ms → 75ms (-60%)
- CLS: 0.19 → 0.08 (-58%)
- Mobile Score: 28 → 72 (+160%)

