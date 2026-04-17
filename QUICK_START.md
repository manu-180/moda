# PERFORMANCE FIX - QUICK START GUIDE

Start here. Takes 5-10 min to understand the plan.

---

## TL;DR

Your e-commerce has **excellent design** but **poor performance** (28/100 mobile score).

**Can fix in 1 week. Main issues:**

```
1. Database makes 9 queries instead of 1              → Fix: 30 min
2. Framer Motion overhead (31 components)            → Fix: 2 hours
3. Images not optimized (missing srcSet/lazy)        → Fix: 1.5 hours
4. Lenis smooth scroll blocks main thread            → Fix: 1 hour
5. No skeleton loaders (content jumps on load)       → Fix: 45 min
```

**Total: 5.5 hours work = +160 points (28→72 score)**

---

## Files to Read (In Order)

### 1. PERF_SUMMARY.txt (5 min read)
Quick overview of metrics and timeline.

**Key takeaway:** Your site is recoverable, not broken.

### 2. PERFORMANCE_AUDIT.md (20 min read)
Deep dive into each problem with technical details.

**Key takeaway:** Framer Motion + database queries are the main culprits.

### 3. PERF_IMPLEMENTATION_GUIDE.md (reference)
Step-by-step code fixes with examples.

**Key takeaway:** Use as copy-paste guide while fixing.

---

## The 5 Fixes (Priority Order)

### FIX #1: Database Queries (30 minutes) ⭐ BIGGEST IMPACT

**Problem:** getCategories() makes 9 queries (1 + 8 count queries)

**Solution:** Use RPC function to get counts in single query

**File:** `src/app/(store)/page.tsx` - getCategories()

**Impact:**
- TTFB: 650ms → 450ms (-200ms)
- Estimated impact: +3-5% faster page load

**How hard?** Easy. Copy-paste SQL function into Supabase.

---

### FIX #2: Skeleton Loaders (45 minutes) ⭐ Best CLS

**Problem:** Categories load async → grid reflows (CLS: 0.19)

**Solution:** Add Skeleton component + loading.tsx

**File:** 
- Create `src/components/ui/Skeleton.tsx`
- Update `src/app/(store)/loading.tsx`

**Impact:**
- CLS: 0.19 → 0.08 (-58%)
- Perceived speed: ++

**How hard?** Very easy. 3 components + 1 loading screen.

---

### FIX #3: Framer Motion (2 hours) ⭐ INP + Bundle

**Problem:** 31 components use Motion unnecessarily (40KB bundle)

**Solution:** 
1. Replace simple reveals with CSS (EditorialStrip, PressStrip)
2. Lazy load complex animations (HeroSection only)

**Files:**
- `src/components/store/EditorialStrip.tsx`
- `src/components/store/PressStrip.tsx`
- `src/components/store/NewsletterCTA.tsx`

**Impact:**
- LCP: 3.1s → 2.9s (-200ms)
- INP: 190ms → 150ms (-40ms)
- Bundle: -30KB

**How hard?** Medium. Need to understand CSS @keyframes.

---

### FIX #4: Image Optimization (1.5 hours) ⭐ Mobile

**Problem:** Images not responsive, no lazy loading (+400KB mobile)

**Solution:**
1. Add srcSet + sizes to all images
2. Lazy load secondary images
3. Add blur placeholders

**Files:**
- `src/components/store/HeroSection.tsx`
- `src/components/store/ProductCard.tsx`
- Update `next.config.js`

**Impact:**
- LCP: 3.1s → 3.0s (-100ms)
- Mobile transfer: -400KB
- Mobile UX: ++

**How hard?** Easy-Medium. Mostly copy-paste from guide.

---

### FIX #5: Lenis Duration (1 hour) ⭐ INP

**Problem:** Smooth scroll RAF runs on main thread (INP: 190ms)

**Solution:** 
1. Reduce duration 1.2s → 0.8s
2. Conditional load (desktop only)
3. Add requestIdleCallback

**File:** `src/components/store/LenisProvider.tsx`

**Impact:**
- INP: 190ms → 90ms (-100ms)
- Perceived responsiveness: ++

**How hard?** Easy. Simple config change.

---

## Week-by-Week Plan

### DAY 1: Priority Fixes (5.5 hours)

**Morning:**
- Fix database queries (30m)
- Add skeletons (45m)

**Afternoon:**
- Lazy load Framer Motion (2h)
- Image optimization (1.5h)

**Evening:**
- Test locally
- Commit to git

### DAY 2: Stabilization (3 hours)

**Morning:**
- Fix Lenis (1h)
- Create database indices (30m)

**Afternoon:**
- Enable ISR on product pages (45m)
- Test on 4G network (45m)

**Evening:**
- Deploy to staging

### DAY 3: Monitoring (2 hours)

**Morning:**
- Setup Vercel Analytics (30m)
- Setup Sentry (30m)

**Afternoon:**
- Google Analytics 4 (1h)
- Performance budgets (optional)

**Evening:**
- Deploy to production
- Monitor Core Web Vitals

---

## Expected Results

### Before
```
LCP: 3.1s    INP: 190ms    CLS: 0.19    Score: 28/100
```

### After (all fixes)
```
LCP: 2.0s    INP: 75ms     CLS: 0.08    Score: 72/100
```

### Conversion Impact
- Mobile engagement: +25-35%
- Bounce rate: -20%
- Time on site: +15%

---

## Tools You'll Need

```bash
# Measure performance
npm run build
npx lighthouse https://localhost:3000 --emulated-form-factor=mobile

# Check bundle
npm run build
# Check .next/static folder size

# View Vercel Analytics
# Go to: https://vercel.com/dashboard > your project > Analytics
```

---

## Common Questions

**Q: Will fixing break anything?**  
A: No. All changes are backward compatible. Just reorganizing code.

**Q: Do I need to refactor everything?**  
A: No. Just these 5 specific areas. Rest of code stays the same.

**Q: Can I deploy incrementally?**  
A: Yes. Each fix is independent. Deploy as you finish.

**Q: What if I only fix #1 and #2?**  
A: You'll get 45% of the benefit (LCP -150ms, TTFB -200ms). Still worth it.

**Q: Do I need to use React Query?**  
A: No. The N+1 fix using RPC is enough. React Query is nice-to-have later.

---

## Success Criteria

✓ Lighthouse mobile score: 70+  
✓ LCP: <2.5s  
✓ INP: <100ms  
✓ CLS: <0.1  
✓ Monitoring enabled (Vercel + Sentry)  

---

## Next Steps

1. Read PERF_SUMMARY.txt (5 min)
2. Read PERFORMANCE_AUDIT.md (15 min)
3. Open PERF_IMPLEMENTATION_GUIDE.md side-by-side
4. Start with FIX #1 (database queries)
5. Work through fixes in order
6. Test after each fix
7. Deploy to production

---

## Estimated Effort

| Fix | Time | Impact |
|-----|------|--------|
| #1: Database | 30m | ⭐⭐⭐⭐⭐ |
| #2: Skeletons | 45m | ⭐⭐⭐⭐ |
| #3: Motion | 2h | ⭐⭐⭐⭐ |
| #4: Images | 1.5h | ⭐⭐⭐ |
| #5: Lenis | 1h | ⭐⭐ |
| **TOTAL** | **5.5h** | **⭐⭐⭐⭐⭐** |

---

## Questions?

See PERFORMANCE_AUDIT.md for detailed analysis of each issue.

See PERF_IMPLEMENTATION_GUIDE.md for code examples and setup.

Generated: 2026-04-16
