-- ============================================================
-- MAISON ÉLARA — Base Schema (DDL Only)
-- ============================================================
-- This file contains ONLY structural definitions:
--   • CREATE TABLE statements
--   • CREATE INDEX statements
--   • CREATE SEQUENCE, functions, triggers
--   • ROW LEVEL SECURITY (ENABLE + POLICIES)
--   • Storage bucket creation + bucket policies
--
-- NO seed data is included. Run this file first on a fresh
-- Supabase project, then run either:
--   • seed-demo.sql       → MAISON ÉLARA demo content
--   • seed-empty-client.sql → blank slate for a new client
-- ============================================================


-- ============================================================
-- 1. TABLES
-- ============================================================

CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  image_url text,
  parent_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  position int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  image_url text,
  is_active boolean DEFAULT true,
  season text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  price decimal(10,2) NOT NULL,
  compare_at_price decimal(10,2),
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  collection_id uuid REFERENCES collections(id) ON DELETE SET NULL,
  is_featured boolean DEFAULT false,
  is_new boolean DEFAULT true,
  status text DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url text NOT NULL,
  alt text,
  position int DEFAULT 0
);

CREATE TABLE product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size text NOT NULL,
  color text NOT NULL,
  color_hex text NOT NULL,
  stock int DEFAULT 0,
  sku text UNIQUE NOT NULL
);

CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE,
  customer_email text NOT NULL,
  customer_name text NOT NULL,
  subtotal decimal(10,2),
  shipping decimal(10,2) DEFAULT 0,
  tax decimal(10,2) DEFAULT 0,
  total decimal(10,2),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  shipping_address jsonb,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  product_name text,
  variant_size text,
  variant_color text,
  quantity int NOT NULL,
  unit_price decimal(10,2) NOT NULL
);

CREATE TABLE site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb,
  updated_at timestamptz DEFAULT now()
);


-- ============================================================
-- 2. INDEXES
-- ============================================================

CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_collection_id ON products(collection_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_is_featured ON products(is_featured);
CREATE INDEX idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX idx_product_variants_sku ON product_variants(sku);
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_parent_id ON categories(parent_id);


-- ============================================================
-- 3. FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-generate order_number: ME-00001, ME-00002 ...
CREATE SEQUENCE order_number_seq START 1;

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number := 'ME-' || LPAD(nextval('order_number_seq')::text, 5, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_generate_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW
  WHEN (NEW.order_number IS NULL)
  EXECUTE FUNCTION generate_order_number();

-- Auto-update updated_at on products and orders
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();


-- ============================================================
-- 4. ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Public read: catalog
CREATE POLICY "Public read categories"      ON categories      FOR SELECT USING (true);
CREATE POLICY "Public read collections"     ON collections     FOR SELECT USING (true);
CREATE POLICY "Public read products"        ON products        FOR SELECT USING (true);
CREATE POLICY "Public read product_images"  ON product_images  FOR SELECT USING (true);
CREATE POLICY "Public read product_variants" ON product_variants FOR SELECT USING (true);

-- Orders: anon can create
CREATE POLICY "Anon can create orders"      ON orders      FOR INSERT WITH CHECK (true);
CREATE POLICY "Anon can create order_items" ON order_items FOR INSERT WITH CHECK (true);

-- Helper: is_admin() — checks app_metadata (server-only, not user-modifiable)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
$$;

-- Orders: admin only
CREATE POLICY "Admin read orders"       ON orders      FOR SELECT TO authenticated USING (is_admin());
CREATE POLICY "Admin update orders"     ON orders      FOR UPDATE TO authenticated USING (is_admin());
CREATE POLICY "Admin read order_items"  ON order_items FOR SELECT TO authenticated USING (is_admin());

-- Admin CRUD on catalog
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

-- Site settings
CREATE POLICY "Public read site_settings"  ON site_settings FOR SELECT USING (true);
CREATE POLICY "Admin update site_settings" ON site_settings FOR UPDATE TO authenticated USING (is_admin());
CREATE POLICY "Admin insert site_settings" ON site_settings FOR INSERT TO authenticated WITH CHECK (is_admin());


-- ============================================================
-- 5. STORAGE BUCKETS
-- ============================================================

INSERT INTO storage.buckets (id, name, public) VALUES ('products',    'products',    true);
INSERT INTO storage.buckets (id, name, public) VALUES ('categories',  'categories',  true);
INSERT INTO storage.buckets (id, name, public) VALUES ('collections', 'collections', true);

-- Products bucket policies
CREATE POLICY "Public read products bucket"  ON storage.objects FOR SELECT                   USING (bucket_id = 'products');
CREATE POLICY "Admin upload products bucket"    ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'products'    AND is_admin());
CREATE POLICY "Admin update products bucket"    ON storage.objects FOR UPDATE TO authenticated USING  (bucket_id = 'products'    AND is_admin());
CREATE POLICY "Admin delete products bucket"    ON storage.objects FOR DELETE TO authenticated USING  (bucket_id = 'products'    AND is_admin());

-- Categories bucket policies
CREATE POLICY "Public read categories bucket"   ON storage.objects FOR SELECT                  USING  (bucket_id = 'categories');
CREATE POLICY "Admin upload categories bucket"  ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'categories'  AND is_admin());

-- Collections bucket policies
CREATE POLICY "Public read collections bucket"  ON storage.objects FOR SELECT                  USING  (bucket_id = 'collections');
CREATE POLICY "Admin upload collections bucket" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'collections' AND is_admin());
