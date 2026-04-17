-- Migration: Fix RLS policies to require admin role
-- Problem: All policies used TO authenticated USING (true) — any logged-in user
--          could read orders, edit catalog, change settings, upload files.
-- Fix: Replace with app_metadata role check (set server-side, not user-modifiable).
--
-- Run this in Supabase SQL Editor.

-- ─── Helper: is_admin() ────────────────────────────────────────────────────
-- Wrapping in SELECT prevents per-row JWT evaluation (performance).
-- app_metadata is server-only (unlike user_metadata which users can change).

CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
$$;

-- ─── ORDERS ────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Auth read orders"      ON orders;
DROP POLICY IF EXISTS "Auth update orders"    ON orders;
DROP POLICY IF EXISTS "Auth read order_items" ON order_items;

CREATE POLICY "Admin read orders"       ON orders      FOR SELECT TO authenticated USING (is_admin());
CREATE POLICY "Admin update orders"     ON orders      FOR UPDATE TO authenticated USING (is_admin());
CREATE POLICY "Admin read order_items"  ON order_items FOR SELECT TO authenticated USING (is_admin());

-- ─── CATALOG (categories, collections, products, images, variants) ──────────

DROP POLICY IF EXISTS "Auth insert categories"        ON categories;
DROP POLICY IF EXISTS "Auth update categories"        ON categories;
DROP POLICY IF EXISTS "Auth delete categories"        ON categories;
DROP POLICY IF EXISTS "Auth insert collections"       ON collections;
DROP POLICY IF EXISTS "Auth update collections"       ON collections;
DROP POLICY IF EXISTS "Auth delete collections"       ON collections;
DROP POLICY IF EXISTS "Auth insert products"          ON products;
DROP POLICY IF EXISTS "Auth update products"          ON products;
DROP POLICY IF EXISTS "Auth delete products"          ON products;
DROP POLICY IF EXISTS "Auth insert product_images"    ON product_images;
DROP POLICY IF EXISTS "Auth update product_images"    ON product_images;
DROP POLICY IF EXISTS "Auth delete product_images"    ON product_images;
DROP POLICY IF EXISTS "Auth insert product_variants"  ON product_variants;
DROP POLICY IF EXISTS "Auth update product_variants"  ON product_variants;
DROP POLICY IF EXISTS "Auth delete product_variants"  ON product_variants;

CREATE POLICY "Admin insert categories"        ON categories        FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY "Admin update categories"        ON categories        FOR UPDATE TO authenticated USING (is_admin());
CREATE POLICY "Admin delete categories"        ON categories        FOR DELETE TO authenticated USING (is_admin());
CREATE POLICY "Admin insert collections"       ON collections       FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY "Admin update collections"       ON collections       FOR UPDATE TO authenticated USING (is_admin());
CREATE POLICY "Admin delete collections"       ON collections       FOR DELETE TO authenticated USING (is_admin());
CREATE POLICY "Admin insert products"          ON products          FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY "Admin update products"          ON products          FOR UPDATE TO authenticated USING (is_admin());
CREATE POLICY "Admin delete products"          ON products          FOR DELETE TO authenticated USING (is_admin());
CREATE POLICY "Admin insert product_images"    ON product_images    FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY "Admin update product_images"    ON product_images    FOR UPDATE TO authenticated USING (is_admin());
CREATE POLICY "Admin delete product_images"    ON product_images    FOR DELETE TO authenticated USING (is_admin());
CREATE POLICY "Admin insert product_variants"  ON product_variants  FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY "Admin update product_variants"  ON product_variants  FOR UPDATE TO authenticated USING (is_admin());
CREATE POLICY "Admin delete product_variants"  ON product_variants  FOR DELETE TO authenticated USING (is_admin());

-- ─── SITE SETTINGS ─────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Auth update site_settings" ON site_settings;
DROP POLICY IF EXISTS "Auth insert site_settings" ON site_settings;

CREATE POLICY "Admin update site_settings" ON site_settings FOR UPDATE TO authenticated USING (is_admin());
CREATE POLICY "Admin insert site_settings" ON site_settings FOR INSERT TO authenticated WITH CHECK (is_admin());

-- ─── STORAGE BUCKETS ───────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Auth upload products bucket"    ON storage.objects;
DROP POLICY IF EXISTS "Auth update products bucket"    ON storage.objects;
DROP POLICY IF EXISTS "Auth delete products bucket"    ON storage.objects;
DROP POLICY IF EXISTS "Auth upload categories bucket"  ON storage.objects;
DROP POLICY IF EXISTS "Auth upload collections bucket" ON storage.objects;

CREATE POLICY "Admin upload products bucket"    ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'products'    AND is_admin());
CREATE POLICY "Admin update products bucket"    ON storage.objects FOR UPDATE TO authenticated USING  (bucket_id = 'products'    AND is_admin());
CREATE POLICY "Admin delete products bucket"    ON storage.objects FOR DELETE TO authenticated USING  (bucket_id = 'products'    AND is_admin());
CREATE POLICY "Admin upload categories bucket"  ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'categories'  AND is_admin());
CREATE POLICY "Admin upload collections bucket" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'collections' AND is_admin());
