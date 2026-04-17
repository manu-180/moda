-- ============================================================
-- MAISON ÉLARA — Complete Supabase Schema
-- Execute this entire file in Supabase SQL Editor
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

-- Auto-generate order_number: ME-00001, ME-00002...
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

-- Auto-update updated_at
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
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public read collections" ON collections FOR SELECT USING (true);
CREATE POLICY "Public read products" ON products FOR SELECT USING (true);
CREATE POLICY "Public read product_images" ON product_images FOR SELECT USING (true);
CREATE POLICY "Public read product_variants" ON product_variants FOR SELECT USING (true);

-- Orders: anon can create
CREATE POLICY "Anon can create orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Anon can create order_items" ON order_items FOR INSERT WITH CHECK (true);

-- Orders: auth can read/update
CREATE POLICY "Auth read orders" ON orders FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth update orders" ON orders FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth read order_items" ON order_items FOR SELECT TO authenticated USING (true);

-- Admin CRUD on catalog
CREATE POLICY "Auth insert categories" ON categories FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update categories" ON categories FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth delete categories" ON categories FOR DELETE TO authenticated USING (true);
CREATE POLICY "Auth insert collections" ON collections FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update collections" ON collections FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth delete collections" ON collections FOR DELETE TO authenticated USING (true);
CREATE POLICY "Auth insert products" ON products FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update products" ON products FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth delete products" ON products FOR DELETE TO authenticated USING (true);
CREATE POLICY "Auth insert product_images" ON product_images FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update product_images" ON product_images FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth delete product_images" ON product_images FOR DELETE TO authenticated USING (true);
CREATE POLICY "Auth insert product_variants" ON product_variants FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update product_variants" ON product_variants FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth delete product_variants" ON product_variants FOR DELETE TO authenticated USING (true);

-- Site settings
CREATE POLICY "Public read site_settings" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Auth update site_settings" ON site_settings FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth insert site_settings" ON site_settings FOR INSERT TO authenticated WITH CHECK (true);

-- ============================================================
-- 5. STORAGE BUCKETS
-- ============================================================

INSERT INTO storage.buckets (id, name, public) VALUES ('products', 'products', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('categories', 'categories', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('collections', 'collections', true);

CREATE POLICY "Public read products bucket" ON storage.objects FOR SELECT USING (bucket_id = 'products');
CREATE POLICY "Auth upload products bucket" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'products');
CREATE POLICY "Auth update products bucket" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'products');
CREATE POLICY "Auth delete products bucket" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'products');
CREATE POLICY "Public read categories bucket" ON storage.objects FOR SELECT USING (bucket_id = 'categories');
CREATE POLICY "Auth upload categories bucket" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'categories');
CREATE POLICY "Public read collections bucket" ON storage.objects FOR SELECT USING (bucket_id = 'collections');
CREATE POLICY "Auth upload collections bucket" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'collections');

-- ============================================================
-- 6. SEED DATA — Categories
-- ============================================================

INSERT INTO categories (id, name, slug, description, image_url, position) VALUES
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Dresses', 'dresses', 'Elegant dresses for every occasion', 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1200&q=85', 1),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'Tops', 'tops', 'Refined blouses and tops', 'https://images.unsplash.com/photo-1619086303291-0ef7699e4b31?auto=format&fit=crop&w=1200&q=85', 2),
  ('a1b2c3d4-0003-4000-8000-000000000003', 'Bottoms', 'bottoms', 'Tailored skirts and trousers', 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1200&q=85', 3),
  ('a1b2c3d4-0004-4000-8000-000000000004', 'Outerwear', 'outerwear', 'Luxurious coats and jackets', 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&w=1200&q=85', 4),
  ('a1b2c3d4-0005-4000-8000-000000000005', 'Bags', 'bags', 'Statement bags and accessories', 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1200&q=85', 5),
  ('a1b2c3d4-0006-4000-8000-000000000006', 'Shoes', 'shoes', 'Handcrafted footwear', 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1200&q=85', 6);

-- Collections
INSERT INTO collections (id, name, slug, description, image_url, is_active, season) VALUES
  ('b2c3d4e5-0001-4000-8000-000000000001', 'Autumn Whisper', 'autumn-whisper', 'A contemplative collection inspired by the golden silence of late October — layers of warmth in muted earth tones and sumptuous textures.', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=2000&q=85', true, 'FW25'),
  ('b2c3d4e5-0002-4000-8000-000000000002', 'Mediterranean Light', 'mediterranean-light', 'Sun-drenched linens and fluid silhouettes that capture the effortless allure of the Amalfi Coast at golden hour.', 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=2000&q=85', true, 'SS26');

-- ============================================================
-- 7. SEED DATA — Products (12)
-- ============================================================

-- 1. Silk Drape Midi Dress
INSERT INTO products (id, name, slug, description, price, compare_at_price, category_id, collection_id, is_featured, is_new) VALUES
  ('c3d4e5f6-0001-4000-8000-000000000001', 'Silk Drape Midi Dress', 'silk-drape-midi-dress', 'A liquid silk midi that moves like water against the skin. Bias-cut with an asymmetric hemline that catches the light as you walk.', 1280, 1580, 'a1b2c3d4-0001-4000-8000-000000000001', 'b2c3d4e5-0001-4000-8000-000000000001', true, true);

INSERT INTO product_images (product_id, url, alt, position) VALUES
  ('c3d4e5f6-0001-4000-8000-000000000001', 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1200&q=85', 'Silk Drape Midi Dress — front', 0),
  ('c3d4e5f6-0001-4000-8000-000000000001', 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=1200&q=85', 'Silk Drape Midi Dress — detail', 1);

INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku) VALUES
  ('c3d4e5f6-0001-4000-8000-000000000001', 'XS', 'Champagne', '#C4A265', 4, 'ME-SDMD-XS-CHP'),
  ('c3d4e5f6-0001-4000-8000-000000000001', 'S', 'Champagne', '#C4A265', 6, 'ME-SDMD-S-CHP'),
  ('c3d4e5f6-0001-4000-8000-000000000001', 'M', 'Champagne', '#C4A265', 3, 'ME-SDMD-M-CHP'),
  ('c3d4e5f6-0001-4000-8000-000000000001', 'L', 'Champagne', '#C4A265', 0, 'ME-SDMD-L-CHP'),
  ('c3d4e5f6-0001-4000-8000-000000000001', 'S', 'Noir', '#1A1A1A', 5, 'ME-SDMD-S-NOR'),
  ('c3d4e5f6-0001-4000-8000-000000000001', 'M', 'Noir', '#1A1A1A', 7, 'ME-SDMD-M-NOR');

-- 2. Cashmere Oversized Coat
INSERT INTO products (id, name, slug, description, price, category_id, collection_id, is_featured, is_new) VALUES
  ('c3d4e5f6-0002-4000-8000-000000000002', 'Cashmere Oversized Coat', 'cashmere-oversized-coat', 'Enveloping pure cashmere in a relaxed silhouette. Double-faced construction with hand-stitched lapels and hidden horn buttons.', 2800, 'a1b2c3d4-0004-4000-8000-000000000004', 'b2c3d4e5-0001-4000-8000-000000000001', true, true);

INSERT INTO product_images (product_id, url, alt, position) VALUES
  ('c3d4e5f6-0002-4000-8000-000000000002', 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=85', 'Cashmere Oversized Coat', 0),
  ('c3d4e5f6-0002-4000-8000-000000000002', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=85', 'Cashmere Oversized Coat — detalle', 1);

INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku) VALUES
  ('c3d4e5f6-0002-4000-8000-000000000002', 'S', 'Camel', '#C19A6B', 3, 'ME-COC-S-CML'),
  ('c3d4e5f6-0002-4000-8000-000000000002', 'M', 'Camel', '#C19A6B', 5, 'ME-COC-M-CML'),
  ('c3d4e5f6-0002-4000-8000-000000000002', 'L', 'Camel', '#C19A6B', 2, 'ME-COC-L-CML');

-- 3. Leather Structured Tote
INSERT INTO products (id, name, slug, description, price, category_id, is_featured, is_new) VALUES
  ('c3d4e5f6-0003-4000-8000-000000000003', 'Leather Structured Tote', 'leather-structured-tote', 'Full-grain Italian leather shaped into an architectural silhouette. Interior suede lining with discreet magnetic closure.', 1650, 'a1b2c3d4-0005-4000-8000-000000000005', true, false);

INSERT INTO product_images (product_id, url, alt, position) VALUES
  ('c3d4e5f6-0003-4000-8000-000000000003', 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1200&q=85', 'Leather Structured Tote', 0),
  ('c3d4e5f6-0003-4000-8000-000000000003', 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1200&q=85', 'Leather Structured Tote — editorial', 1);

INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku) VALUES
  ('c3d4e5f6-0003-4000-8000-000000000003', 'One Size', 'Cognac', '#9A4B1C', 8, 'ME-LST-OS-COG'),
  ('c3d4e5f6-0003-4000-8000-000000000003', 'One Size', 'Noir', '#1A1A1A', 5, 'ME-LST-OS-NOR');

-- 4. Pleated Wide-Leg Trousers
INSERT INTO products (id, name, slug, description, price, category_id, collection_id, is_featured, is_new) VALUES
  ('c3d4e5f6-0004-4000-8000-000000000004', 'Pleated Wide-Leg Trousers', 'pleated-wide-leg-trousers', 'Fluid crepe trousers with deep inverted pleats. High waist with a self-fabric belt that cinches perfectly.', 680, 'a1b2c3d4-0003-4000-8000-000000000003', 'b2c3d4e5-0002-4000-8000-000000000002', false, true);

INSERT INTO product_images (product_id, url, alt, position) VALUES
  ('c3d4e5f6-0004-4000-8000-000000000004', 'https://images.unsplash.com/photo-1619086303291-0ef7699e4b31?auto=format&fit=crop&w=1200&q=85', 'Pleated Wide-Leg Trousers', 0),
  ('c3d4e5f6-0004-4000-8000-000000000004', 'https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?auto=format&fit=crop&w=1200&q=85', 'Pleated Wide-Leg Trousers — editorial', 1);

INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku) VALUES
  ('c3d4e5f6-0004-4000-8000-000000000004', 'XS', 'Ivory', '#FAF8F5', 4, 'ME-PWLT-XS-IVR'),
  ('c3d4e5f6-0004-4000-8000-000000000004', 'S', 'Ivory', '#FAF8F5', 6, 'ME-PWLT-S-IVR'),
  ('c3d4e5f6-0004-4000-8000-000000000004', 'M', 'Ivory', '#FAF8F5', 2, 'ME-PWLT-M-IVR');

-- 5. Draped Silk Blouse
INSERT INTO products (id, name, slug, description, price, category_id, collection_id, is_featured, is_new) VALUES
  ('c3d4e5f6-0005-4000-8000-000000000005', 'Draped Silk Blouse', 'draped-silk-blouse', 'Washed silk charmeuse with a sculpted cowl neckline. The fabric pools and drapes naturally, catching light in every fold.', 520, 'a1b2c3d4-0002-4000-8000-000000000002', 'b2c3d4e5-0002-4000-8000-000000000002', true, true);

INSERT INTO product_images (product_id, url, alt, position) VALUES
  ('c3d4e5f6-0005-4000-8000-000000000005', 'https://images.unsplash.com/photo-1526413232644-8a40f03cc03b?auto=format&fit=crop&w=1200&q=85', 'Draped Silk Blouse', 0),
  ('c3d4e5f6-0005-4000-8000-000000000005', 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=1200&q=85', 'Draped Silk Blouse — detalle', 1);

INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku) VALUES
  ('c3d4e5f6-0005-4000-8000-000000000005', 'XS', 'Petal', '#F4E1D2', 5, 'ME-DSB-XS-PTL'),
  ('c3d4e5f6-0005-4000-8000-000000000005', 'S', 'Petal', '#F4E1D2', 7, 'ME-DSB-S-PTL'),
  ('c3d4e5f6-0005-4000-8000-000000000005', 'M', 'Petal', '#F4E1D2', 3, 'ME-DSB-M-PTL'),
  ('c3d4e5f6-0005-4000-8000-000000000005', 'S', 'Slate', '#708090', 4, 'ME-DSB-S-SLT');

-- 6. Sculpted Heel Mule
INSERT INTO products (id, name, slug, description, price, category_id, collection_id, is_featured, is_new) VALUES
  ('c3d4e5f6-0006-4000-8000-000000000006', 'Sculpted Heel Mule', 'sculpted-heel-mule', 'Architectural 75mm heel carved from a single block, paired with supple nappa leather. Sculptural yet supremely wearable.', 890, 'a1b2c3d4-0006-4000-8000-000000000006', 'b2c3d4e5-0001-4000-8000-000000000001', false, true);

INSERT INTO product_images (product_id, url, alt, position) VALUES
  ('c3d4e5f6-0006-4000-8000-000000000006', 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1200&q=85', 'Sculpted Heel Mule', 0),
  ('c3d4e5f6-0006-4000-8000-000000000006', 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1200&q=85', 'Sculpted Heel Mule — editorial', 1);

INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku) VALUES
  ('c3d4e5f6-0006-4000-8000-000000000006', '36', 'Noir', '#1A1A1A', 3, 'ME-SHM-36-NOR'),
  ('c3d4e5f6-0006-4000-8000-000000000006', '37', 'Noir', '#1A1A1A', 4, 'ME-SHM-37-NOR'),
  ('c3d4e5f6-0006-4000-8000-000000000006', '38', 'Noir', '#1A1A1A', 5, 'ME-SHM-38-NOR'),
  ('c3d4e5f6-0006-4000-8000-000000000006', '39', 'Noir', '#1A1A1A', 2, 'ME-SHM-39-NOR');

-- 7. Linen Wrap Dress
INSERT INTO products (id, name, slug, description, price, category_id, collection_id, is_featured, is_new) VALUES
  ('c3d4e5f6-0007-4000-8000-000000000007', 'Linen Wrap Dress', 'linen-wrap-dress', 'Stone-washed Belgian linen in a timeless wrap silhouette. Each piece develops a unique patina with wear.', 780, 'a1b2c3d4-0001-4000-8000-000000000001', 'b2c3d4e5-0002-4000-8000-000000000002', false, true);

INSERT INTO product_images (product_id, url, alt, position) VALUES
  ('c3d4e5f6-0007-4000-8000-000000000007', 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=85', 'Linen Wrap Dress', 0),
  ('c3d4e5f6-0007-4000-8000-000000000007', 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=1200&q=85', 'Linen Wrap Dress — detalle', 1);

INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku) VALUES
  ('c3d4e5f6-0007-4000-8000-000000000007', 'S', 'Sand', '#C2B280', 6, 'ME-LWD-S-SND'),
  ('c3d4e5f6-0007-4000-8000-000000000007', 'M', 'Sand', '#C2B280', 4, 'ME-LWD-M-SND'),
  ('c3d4e5f6-0007-4000-8000-000000000007', 'L', 'Sand', '#C2B280', 3, 'ME-LWD-L-SND');

-- 8. Wool Tailored Blazer
INSERT INTO products (id, name, slug, description, price, compare_at_price, category_id, collection_id, is_featured, is_new) VALUES
  ('c3d4e5f6-0008-4000-8000-000000000008', 'Wool Tailored Blazer', 'wool-tailored-blazer', 'Single-breasted Super 150s merino wool. Canvassed chest, pick-stitched lapels, and feminine waist suppression.', 1450, 1750, 'a1b2c3d4-0004-4000-8000-000000000004', 'b2c3d4e5-0001-4000-8000-000000000001', true, false);

INSERT INTO product_images (product_id, url, alt, position) VALUES
  ('c3d4e5f6-0008-4000-8000-000000000008', 'https://images.unsplash.com/photo-1617922001439-4a2e6562f328?auto=format&fit=crop&w=1200&q=85', 'Wool Tailored Blazer', 0),
  ('c3d4e5f6-0008-4000-8000-000000000008', 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=85', 'Wool Tailored Blazer — editorial', 1);

INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku) VALUES
  ('c3d4e5f6-0008-4000-8000-000000000008', 'XS', 'Charcoal', '#3D3D3D', 3, 'ME-WTB-XS-CHR'),
  ('c3d4e5f6-0008-4000-8000-000000000008', 'S', 'Charcoal', '#3D3D3D', 5, 'ME-WTB-S-CHR'),
  ('c3d4e5f6-0008-4000-8000-000000000008', 'M', 'Charcoal', '#3D3D3D', 4, 'ME-WTB-M-CHR'),
  ('c3d4e5f6-0008-4000-8000-000000000008', 'L', 'Charcoal', '#3D3D3D', 0, 'ME-WTB-L-CHR');

-- 9. Ribbed Cashmere Sweater
INSERT INTO products (id, name, slug, description, price, category_id, collection_id, is_featured, is_new) VALUES
  ('c3d4e5f6-0009-4000-8000-000000000009', 'Ribbed Cashmere Sweater', 'ribbed-cashmere-sweater', 'Grade-A Mongolian cashmere in a relaxed rib knit. Oversized fit with rolled hem adds undone elegance.', 580, 'a1b2c3d4-0002-4000-8000-000000000002', 'b2c3d4e5-0001-4000-8000-000000000001', false, false);

INSERT INTO product_images (product_id, url, alt, position) VALUES
  ('c3d4e5f6-0009-4000-8000-000000000009', 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?auto=format&fit=crop&w=1200&q=85', 'Ribbed Cashmere Sweater', 0),
  ('c3d4e5f6-0009-4000-8000-000000000009', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=85', 'Ribbed Cashmere Sweater — editorial', 1);

INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku) VALUES
  ('c3d4e5f6-0009-4000-8000-000000000009', 'S', 'Oat', '#E8DCCA', 7, 'ME-RCS-S-OAT'),
  ('c3d4e5f6-0009-4000-8000-000000000009', 'M', 'Oat', '#E8DCCA', 5, 'ME-RCS-M-OAT'),
  ('c3d4e5f6-0009-4000-8000-000000000009', 'L', 'Oat', '#E8DCCA', 3, 'ME-RCS-L-OAT'),
  ('c3d4e5f6-0009-4000-8000-000000000009', 'S', 'Forest', '#2D5016', 4, 'ME-RCS-S-FOR');

-- 10. Quilted Chain Crossbody
INSERT INTO products (id, name, slug, description, price, category_id, is_featured, is_new) VALUES
  ('c3d4e5f6-0010-4000-8000-000000000010', 'Quilted Chain Crossbody', 'quilted-chain-crossbody', 'Diamond-quilted lambskin with a brushed gold chain strap. Compact for evening, spacious for daily essentials.', 980, 'a1b2c3d4-0005-4000-8000-000000000005', false, true);

INSERT INTO product_images (product_id, url, alt, position) VALUES
  ('c3d4e5f6-0010-4000-8000-000000000010', 'https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?auto=format&fit=crop&w=1200&q=85', 'Quilted Chain Crossbody', 0),
  ('c3d4e5f6-0010-4000-8000-000000000010', 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1200&q=85', 'Quilted Chain Crossbody — detalle', 1);

INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku) VALUES
  ('c3d4e5f6-0010-4000-8000-000000000010', 'One Size', 'Noir', '#1A1A1A', 6, 'ME-QCC-OS-NOR'),
  ('c3d4e5f6-0010-4000-8000-000000000010', 'One Size', 'Champagne', '#C4A265', 0, 'ME-QCC-OS-CHP');

-- 11. Satin Pencil Skirt
INSERT INTO products (id, name, slug, description, price, category_id, collection_id, is_featured, is_new) VALUES
  ('c3d4e5f6-0011-4000-8000-000000000011', 'Satin Pencil Skirt', 'satin-pencil-skirt', 'Duchess satin in a high-waisted pencil silhouette with a discreet back slit. Luminous finish elevates any pairing.', 480, 'a1b2c3d4-0003-4000-8000-000000000003', 'b2c3d4e5-0001-4000-8000-000000000001', false, false);

INSERT INTO product_images (product_id, url, alt, position) VALUES
  ('c3d4e5f6-0011-4000-8000-000000000011', 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1200&q=85', 'Satin Pencil Skirt', 0),
  ('c3d4e5f6-0011-4000-8000-000000000011', 'https://images.unsplash.com/photo-1619086303291-0ef7699e4b31?auto=format&fit=crop&w=1200&q=85', 'Satin Pencil Skirt — detalle', 1);

INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku) VALUES
  ('c3d4e5f6-0011-4000-8000-000000000011', 'XS', 'Bordeaux', '#9B1B30', 5, 'ME-SPS-XS-BDX'),
  ('c3d4e5f6-0011-4000-8000-000000000011', 'S', 'Bordeaux', '#9B1B30', 3, 'ME-SPS-S-BDX'),
  ('c3d4e5f6-0011-4000-8000-000000000011', 'M', 'Bordeaux', '#9B1B30', 4, 'ME-SPS-M-BDX');

-- 12. Strappy Leather Sandal
INSERT INTO products (id, name, slug, description, price, category_id, collection_id, is_featured, is_new) VALUES
  ('c3d4e5f6-0012-4000-8000-000000000012', 'Strappy Leather Sandal', 'strappy-leather-sandal', 'Delicate vegetable-tanned leather straps on a 45mm block heel. Hand-finished in a small Tuscan atelier.', 620, 'a1b2c3d4-0006-4000-8000-000000000006', 'b2c3d4e5-0002-4000-8000-000000000002', false, true);

INSERT INTO product_images (product_id, url, alt, position) VALUES
  ('c3d4e5f6-0012-4000-8000-000000000012', 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1200&q=85', 'Strappy Leather Sandal', 0),
  ('c3d4e5f6-0012-4000-8000-000000000012', 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=85', 'Strappy Leather Sandal — editorial', 1);

INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku) VALUES
  ('c3d4e5f6-0012-4000-8000-000000000012', '36', 'Tan', '#D2B48C', 4, 'ME-SLS-36-TAN'),
  ('c3d4e5f6-0012-4000-8000-000000000012', '37', 'Tan', '#D2B48C', 6, 'ME-SLS-37-TAN'),
  ('c3d4e5f6-0012-4000-8000-000000000012', '38', 'Tan', '#D2B48C', 5, 'ME-SLS-38-TAN'),
  ('c3d4e5f6-0012-4000-8000-000000000012', '39', 'Tan', '#D2B48C', 3, 'ME-SLS-39-TAN');

-- ============================================================
-- 8. SEED ORDERS (5)
-- ============================================================

INSERT INTO orders (id, customer_email, customer_name, subtotal, shipping, tax, total, status, shipping_address) VALUES
  ('d4e5f6a7-0001-4000-8000-000000000001', 'valentina.rossi@email.com', 'Valentina Rossi', 2560, 0, 256, 2816, 'delivered',
   '{"line1": "Via Monte Napoleone 8", "city": "Milan", "state": "MI", "postal_code": "20121", "country": "IT"}'::jsonb);
INSERT INTO order_items (order_id, product_id, product_name, variant_size, variant_color, quantity, unit_price) VALUES
  ('d4e5f6a7-0001-4000-8000-000000000001', 'c3d4e5f6-0001-4000-8000-000000000001', 'Silk Drape Midi Dress', 'S', 'Champagne', 1, 1280),
  ('d4e5f6a7-0001-4000-8000-000000000001', 'c3d4e5f6-0001-4000-8000-000000000001', 'Silk Drape Midi Dress', 'M', 'Noir', 1, 1280);

INSERT INTO orders (id, customer_email, customer_name, subtotal, shipping, tax, total, status, shipping_address) VALUES
  ('d4e5f6a7-0002-4000-8000-000000000002', 'camille.dubois@email.com', 'Camille Dubois', 2800, 45, 280, 3125, 'shipped',
   '{"line1": "23 Rue du Faubourg Saint-Honoré", "city": "Paris", "state": "IDF", "postal_code": "75008", "country": "FR"}'::jsonb);
INSERT INTO order_items (order_id, product_id, product_name, variant_size, variant_color, quantity, unit_price) VALUES
  ('d4e5f6a7-0002-4000-8000-000000000002', 'c3d4e5f6-0002-4000-8000-000000000002', 'Cashmere Oversized Coat', 'M', 'Camel', 1, 2800);

INSERT INTO orders (id, customer_email, customer_name, subtotal, shipping, tax, total, status, shipping_address) VALUES
  ('d4e5f6a7-0003-4000-8000-000000000003', 'sofia.martinez@email.com', 'Sofía Martínez', 2170, 0, 217, 2387, 'confirmed',
   '{"line1": "Av. Alvear 1885", "city": "Buenos Aires", "state": "CABA", "postal_code": "C1129", "country": "AR"}'::jsonb);
INSERT INTO order_items (order_id, product_id, product_name, variant_size, variant_color, quantity, unit_price) VALUES
  ('d4e5f6a7-0003-4000-8000-000000000003', 'c3d4e5f6-0005-4000-8000-000000000005', 'Draped Silk Blouse', 'S', 'Petal', 1, 520),
  ('d4e5f6a7-0003-4000-8000-000000000003', 'c3d4e5f6-0003-4000-8000-000000000003', 'Leather Structured Tote', 'One Size', 'Cognac', 1, 1650);

INSERT INTO orders (id, customer_email, customer_name, subtotal, shipping, tax, total, status, shipping_address) VALUES
  ('d4e5f6a7-0004-4000-8000-000000000004', 'elena.volkov@email.com', 'Elena Volkov', 1460, 60, 146, 1666, 'pending',
   '{"line1": "Bolshaya Dmitrovka 7/5", "city": "Moscow", "state": "MOW", "postal_code": "125009", "country": "RU"}'::jsonb);
INSERT INTO order_items (order_id, product_id, product_name, variant_size, variant_color, quantity, unit_price) VALUES
  ('d4e5f6a7-0004-4000-8000-000000000004', 'c3d4e5f6-0009-4000-8000-000000000009', 'Ribbed Cashmere Sweater', 'S', 'Oat', 1, 580),
  ('d4e5f6a7-0004-4000-8000-000000000004', 'c3d4e5f6-0006-4000-8000-000000000006', 'Sculpted Heel Mule', '38', 'Noir', 1, 890);

INSERT INTO orders (id, customer_email, customer_name, subtotal, shipping, tax, total, status, shipping_address, notes) VALUES
  ('d4e5f6a7-0005-4000-8000-000000000005', 'isabella.chen@email.com', 'Isabella Chen', 680, 35, 68, 783, 'cancelled',
   '{"line1": "88 Orchard Road", "city": "Singapore", "state": "SG", "postal_code": "238839", "country": "SG"}'::jsonb,
   'Customer requested cancellation — changed mind on color.');
INSERT INTO order_items (order_id, product_id, product_name, variant_size, variant_color, quantity, unit_price) VALUES
  ('d4e5f6a7-0005-4000-8000-000000000005', 'c3d4e5f6-0004-4000-8000-000000000004', 'Pleated Wide-Leg Trousers', 'S', 'Ivory', 1, 680);

-- ============================================================
-- 9. SITE SETTINGS
-- ============================================================

INSERT INTO site_settings (key, value) VALUES
  ('store_name', '"MAISON ÉLARA"'::jsonb),
  ('store_currency', '"USD"'::jsonb),
  ('free_shipping_threshold', '500'::jsonb),
  ('announcement_bar', '{"text": "Complimentary shipping on orders over $500", "active": true}'::jsonb);
