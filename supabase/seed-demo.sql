-- ============================================================
-- MAISON ÉLARA — Demo Seed Data
-- ============================================================
-- Run this file AFTER base.sql on a project that needs demo
-- content for development, staging, or client previews.
--
-- Includes:
--   • 6 categories
--   • 2 collections (FW25 + SS26)
--   • 12 products with images and variants
--   • 5 demo orders with order items
--   • Full site_settings (store identity, hero, SEO, features…)
--
-- All INSERTs use ON CONFLICT DO NOTHING (categories, collections,
-- products, images, variants, orders, order_items) so re-running
-- this file is safe — existing rows are never overwritten.
-- site_settings uses ON CONFLICT … DO UPDATE so re-running always
-- refreshes the demo values.
-- ============================================================


-- ============================================================
-- CATEGORIES
-- ============================================================

INSERT INTO categories (id, name, slug, description, image_url, position) VALUES
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Dresses',   'dresses',    'Elegant dresses for every occasion',   'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1200&q=85', 1),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'Tops',      'tops',       'Refined blouses and tops',              'https://images.unsplash.com/photo-1619086303291-0ef7699e4b31?auto=format&fit=crop&w=1200&q=85', 2),
  ('a1b2c3d4-0003-4000-8000-000000000003', 'Bottoms',   'bottoms',    'Tailored skirts and trousers',          'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1200&q=85', 3),
  ('a1b2c3d4-0004-4000-8000-000000000004', 'Outerwear', 'outerwear',  'Luxurious coats and jackets',           'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&w=1200&q=85', 4),
  ('a1b2c3d4-0005-4000-8000-000000000005', 'Bags',      'bags',       'Statement bags and accessories',        'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1200&q=85', 5),
  ('a1b2c3d4-0006-4000-8000-000000000006', 'Shoes',     'shoes',      'Handcrafted footwear',                  'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1200&q=85', 6)
ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- COLLECTIONS
-- ============================================================

INSERT INTO collections (id, name, slug, description, image_url, is_active, season) VALUES
  ('b2c3d4e5-0001-4000-8000-000000000001',
   'Autumn Whisper', 'autumn-whisper',
   'A contemplative collection inspired by the golden silence of late October — layers of warmth in muted earth tones and sumptuous textures.',
   'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=2000&q=85',
   true, 'FW25'),
  ('b2c3d4e5-0002-4000-8000-000000000002',
   'Mediterranean Light', 'mediterranean-light',
   'Sun-drenched linens and fluid silhouettes that capture the effortless allure of the Amalfi Coast at golden hour.',
   'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=2000&q=85',
   true, 'SS26')
ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- PRODUCTS (12)
-- ============================================================

-- 1. Silk Drape Midi Dress
INSERT INTO products (id, name, slug, description, price, compare_at_price, category_id, collection_id, is_featured, is_new) VALUES
  ('c3d4e5f6-0001-4000-8000-000000000001',
   'Silk Drape Midi Dress', 'silk-drape-midi-dress',
   'A liquid silk midi that moves like water against the skin. Bias-cut with an asymmetric hemline that catches the light as you walk.',
   1280, 1580,
   'a1b2c3d4-0001-4000-8000-000000000001',
   'b2c3d4e5-0001-4000-8000-000000000001',
   true, true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO product_images (product_id, url, alt, position) VALUES
  ('c3d4e5f6-0001-4000-8000-000000000001', 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1200&q=85', 'Silk Drape Midi Dress — front',  0),
  ('c3d4e5f6-0001-4000-8000-000000000001', 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=1200&q=85', 'Silk Drape Midi Dress — detail', 1)
ON CONFLICT DO NOTHING;

INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku) VALUES
  ('c3d4e5f6-0001-4000-8000-000000000001', 'XS', 'Champagne', '#C4A265', 4, 'ME-SDMD-XS-CHP'),
  ('c3d4e5f6-0001-4000-8000-000000000001', 'S',  'Champagne', '#C4A265', 6, 'ME-SDMD-S-CHP'),
  ('c3d4e5f6-0001-4000-8000-000000000001', 'M',  'Champagne', '#C4A265', 3, 'ME-SDMD-M-CHP'),
  ('c3d4e5f6-0001-4000-8000-000000000001', 'L',  'Champagne', '#C4A265', 0, 'ME-SDMD-L-CHP'),
  ('c3d4e5f6-0001-4000-8000-000000000001', 'S',  'Noir',      '#1A1A1A', 5, 'ME-SDMD-S-NOR'),
  ('c3d4e5f6-0001-4000-8000-000000000001', 'M',  'Noir',      '#1A1A1A', 7, 'ME-SDMD-M-NOR')
ON CONFLICT (sku) DO NOTHING;


-- 2. Cashmere Oversized Coat
INSERT INTO products (id, name, slug, description, price, category_id, collection_id, is_featured, is_new) VALUES
  ('c3d4e5f6-0002-4000-8000-000000000002',
   'Cashmere Oversized Coat', 'cashmere-oversized-coat',
   'Enveloping pure cashmere in a relaxed silhouette. Double-faced construction with hand-stitched lapels and hidden horn buttons.',
   2800,
   'a1b2c3d4-0004-4000-8000-000000000004',
   'b2c3d4e5-0001-4000-8000-000000000001',
   true, true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO product_images (product_id, url, alt, position) VALUES
  ('c3d4e5f6-0002-4000-8000-000000000002', 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=85', 'Cashmere Oversized Coat',          0),
  ('c3d4e5f6-0002-4000-8000-000000000002', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=85', 'Cashmere Oversized Coat — detalle', 1)
ON CONFLICT DO NOTHING;

INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku) VALUES
  ('c3d4e5f6-0002-4000-8000-000000000002', 'S', 'Camel', '#C19A6B', 3, 'ME-COC-S-CML'),
  ('c3d4e5f6-0002-4000-8000-000000000002', 'M', 'Camel', '#C19A6B', 5, 'ME-COC-M-CML'),
  ('c3d4e5f6-0002-4000-8000-000000000002', 'L', 'Camel', '#C19A6B', 2, 'ME-COC-L-CML')
ON CONFLICT (sku) DO NOTHING;


-- 3. Leather Structured Tote
INSERT INTO products (id, name, slug, description, price, category_id, is_featured, is_new) VALUES
  ('c3d4e5f6-0003-4000-8000-000000000003',
   'Leather Structured Tote', 'leather-structured-tote',
   'Full-grain Italian leather shaped into an architectural silhouette. Interior suede lining with discreet magnetic closure.',
   1650,
   'a1b2c3d4-0005-4000-8000-000000000005',
   true, false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO product_images (product_id, url, alt, position) VALUES
  ('c3d4e5f6-0003-4000-8000-000000000003', 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1200&q=85', 'Leather Structured Tote',           0),
  ('c3d4e5f6-0003-4000-8000-000000000003', 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1200&q=85', 'Leather Structured Tote — editorial', 1)
ON CONFLICT DO NOTHING;

INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku) VALUES
  ('c3d4e5f6-0003-4000-8000-000000000003', 'One Size', 'Cognac', '#9A4B1C', 8, 'ME-LST-OS-COG'),
  ('c3d4e5f6-0003-4000-8000-000000000003', 'One Size', 'Noir',   '#1A1A1A', 5, 'ME-LST-OS-NOR')
ON CONFLICT (sku) DO NOTHING;


-- 4. Pleated Wide-Leg Trousers
INSERT INTO products (id, name, slug, description, price, category_id, collection_id, is_featured, is_new) VALUES
  ('c3d4e5f6-0004-4000-8000-000000000004',
   'Pleated Wide-Leg Trousers', 'pleated-wide-leg-trousers',
   'Fluid crepe trousers with deep inverted pleats. High waist with a self-fabric belt that cinches perfectly.',
   680,
   'a1b2c3d4-0003-4000-8000-000000000003',
   'b2c3d4e5-0002-4000-8000-000000000002',
   false, true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO product_images (product_id, url, alt, position) VALUES
  ('c3d4e5f6-0004-4000-8000-000000000004', 'https://images.unsplash.com/photo-1619086303291-0ef7699e4b31?auto=format&fit=crop&w=1200&q=85', 'Pleated Wide-Leg Trousers',           0),
  ('c3d4e5f6-0004-4000-8000-000000000004', 'https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?auto=format&fit=crop&w=1200&q=85', 'Pleated Wide-Leg Trousers — editorial', 1)
ON CONFLICT DO NOTHING;

INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku) VALUES
  ('c3d4e5f6-0004-4000-8000-000000000004', 'XS', 'Ivory', '#FAF8F5', 4, 'ME-PWLT-XS-IVR'),
  ('c3d4e5f6-0004-4000-8000-000000000004', 'S',  'Ivory', '#FAF8F5', 6, 'ME-PWLT-S-IVR'),
  ('c3d4e5f6-0004-4000-8000-000000000004', 'M',  'Ivory', '#FAF8F5', 2, 'ME-PWLT-M-IVR')
ON CONFLICT (sku) DO NOTHING;


-- 5. Draped Silk Blouse
INSERT INTO products (id, name, slug, description, price, category_id, collection_id, is_featured, is_new) VALUES
  ('c3d4e5f6-0005-4000-8000-000000000005',
   'Draped Silk Blouse', 'draped-silk-blouse',
   'Washed silk charmeuse with a sculpted cowl neckline. The fabric pools and drapes naturally, catching light in every fold.',
   520,
   'a1b2c3d4-0002-4000-8000-000000000002',
   'b2c3d4e5-0002-4000-8000-000000000002',
   true, true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO product_images (product_id, url, alt, position) VALUES
  ('c3d4e5f6-0005-4000-8000-000000000005', 'https://images.unsplash.com/photo-1526413232644-8a40f03cc03b?auto=format&fit=crop&w=1200&q=85', 'Draped Silk Blouse',          0),
  ('c3d4e5f6-0005-4000-8000-000000000005', 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=1200&q=85', 'Draped Silk Blouse — detalle', 1)
ON CONFLICT DO NOTHING;

INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku) VALUES
  ('c3d4e5f6-0005-4000-8000-000000000005', 'XS', 'Petal', '#F4E1D2', 5, 'ME-DSB-XS-PTL'),
  ('c3d4e5f6-0005-4000-8000-000000000005', 'S',  'Petal', '#F4E1D2', 7, 'ME-DSB-S-PTL'),
  ('c3d4e5f6-0005-4000-8000-000000000005', 'M',  'Petal', '#F4E1D2', 3, 'ME-DSB-M-PTL'),
  ('c3d4e5f6-0005-4000-8000-000000000005', 'S',  'Slate', '#708090', 4, 'ME-DSB-S-SLT')
ON CONFLICT (sku) DO NOTHING;


-- 6. Sculpted Heel Mule
INSERT INTO products (id, name, slug, description, price, category_id, collection_id, is_featured, is_new) VALUES
  ('c3d4e5f6-0006-4000-8000-000000000006',
   'Sculpted Heel Mule', 'sculpted-heel-mule',
   'Architectural 75mm heel carved from a single block, paired with supple nappa leather. Sculptural yet supremely wearable.',
   890,
   'a1b2c3d4-0006-4000-8000-000000000006',
   'b2c3d4e5-0001-4000-8000-000000000001',
   false, true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO product_images (product_id, url, alt, position) VALUES
  ('c3d4e5f6-0006-4000-8000-000000000006', 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1200&q=85', 'Sculpted Heel Mule',           0),
  ('c3d4e5f6-0006-4000-8000-000000000006', 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1200&q=85', 'Sculpted Heel Mule — editorial', 1)
ON CONFLICT DO NOTHING;

INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku) VALUES
  ('c3d4e5f6-0006-4000-8000-000000000006', '36', 'Noir', '#1A1A1A', 3, 'ME-SHM-36-NOR'),
  ('c3d4e5f6-0006-4000-8000-000000000006', '37', 'Noir', '#1A1A1A', 4, 'ME-SHM-37-NOR'),
  ('c3d4e5f6-0006-4000-8000-000000000006', '38', 'Noir', '#1A1A1A', 5, 'ME-SHM-38-NOR'),
  ('c3d4e5f6-0006-4000-8000-000000000006', '39', 'Noir', '#1A1A1A', 2, 'ME-SHM-39-NOR')
ON CONFLICT (sku) DO NOTHING;


-- 7. Linen Wrap Dress
INSERT INTO products (id, name, slug, description, price, category_id, collection_id, is_featured, is_new) VALUES
  ('c3d4e5f6-0007-4000-8000-000000000007',
   'Linen Wrap Dress', 'linen-wrap-dress',
   'Stone-washed Belgian linen in a timeless wrap silhouette. Each piece develops a unique patina with wear.',
   780,
   'a1b2c3d4-0001-4000-8000-000000000001',
   'b2c3d4e5-0002-4000-8000-000000000002',
   false, true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO product_images (product_id, url, alt, position) VALUES
  ('c3d4e5f6-0007-4000-8000-000000000007', 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=85', 'Linen Wrap Dress',          0),
  ('c3d4e5f6-0007-4000-8000-000000000007', 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=1200&q=85', 'Linen Wrap Dress — detalle', 1)
ON CONFLICT DO NOTHING;

INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku) VALUES
  ('c3d4e5f6-0007-4000-8000-000000000007', 'S', 'Sand', '#C2B280', 6, 'ME-LWD-S-SND'),
  ('c3d4e5f6-0007-4000-8000-000000000007', 'M', 'Sand', '#C2B280', 4, 'ME-LWD-M-SND'),
  ('c3d4e5f6-0007-4000-8000-000000000007', 'L', 'Sand', '#C2B280', 3, 'ME-LWD-L-SND')
ON CONFLICT (sku) DO NOTHING;


-- 8. Wool Tailored Blazer
INSERT INTO products (id, name, slug, description, price, compare_at_price, category_id, collection_id, is_featured, is_new) VALUES
  ('c3d4e5f6-0008-4000-8000-000000000008',
   'Wool Tailored Blazer', 'wool-tailored-blazer',
   'Single-breasted Super 150s merino wool. Canvassed chest, pick-stitched lapels, and feminine waist suppression.',
   1450, 1750,
   'a1b2c3d4-0004-4000-8000-000000000004',
   'b2c3d4e5-0001-4000-8000-000000000001',
   true, false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO product_images (product_id, url, alt, position) VALUES
  ('c3d4e5f6-0008-4000-8000-000000000008', 'https://images.unsplash.com/photo-1617922001439-4a2e6562f328?auto=format&fit=crop&w=1200&q=85', 'Wool Tailored Blazer',           0),
  ('c3d4e5f6-0008-4000-8000-000000000008', 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=85', 'Wool Tailored Blazer — editorial', 1)
ON CONFLICT DO NOTHING;

INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku) VALUES
  ('c3d4e5f6-0008-4000-8000-000000000008', 'XS', 'Charcoal', '#3D3D3D', 3, 'ME-WTB-XS-CHR'),
  ('c3d4e5f6-0008-4000-8000-000000000008', 'S',  'Charcoal', '#3D3D3D', 5, 'ME-WTB-S-CHR'),
  ('c3d4e5f6-0008-4000-8000-000000000008', 'M',  'Charcoal', '#3D3D3D', 4, 'ME-WTB-M-CHR'),
  ('c3d4e5f6-0008-4000-8000-000000000008', 'L',  'Charcoal', '#3D3D3D', 0, 'ME-WTB-L-CHR')
ON CONFLICT (sku) DO NOTHING;


-- 9. Ribbed Cashmere Sweater
INSERT INTO products (id, name, slug, description, price, category_id, collection_id, is_featured, is_new) VALUES
  ('c3d4e5f6-0009-4000-8000-000000000009',
   'Ribbed Cashmere Sweater', 'ribbed-cashmere-sweater',
   'Grade-A Mongolian cashmere in a relaxed rib knit. Oversized fit with rolled hem adds undone elegance.',
   580,
   'a1b2c3d4-0002-4000-8000-000000000002',
   'b2c3d4e5-0001-4000-8000-000000000001',
   false, false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO product_images (product_id, url, alt, position) VALUES
  ('c3d4e5f6-0009-4000-8000-000000000009', 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?auto=format&fit=crop&w=1200&q=85', 'Ribbed Cashmere Sweater',           0),
  ('c3d4e5f6-0009-4000-8000-000000000009', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=85', 'Ribbed Cashmere Sweater — editorial', 1)
ON CONFLICT DO NOTHING;

INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku) VALUES
  ('c3d4e5f6-0009-4000-8000-000000000009', 'S', 'Oat',    '#E8DCCA', 7, 'ME-RCS-S-OAT'),
  ('c3d4e5f6-0009-4000-8000-000000000009', 'M', 'Oat',    '#E8DCCA', 5, 'ME-RCS-M-OAT'),
  ('c3d4e5f6-0009-4000-8000-000000000009', 'L', 'Oat',    '#E8DCCA', 3, 'ME-RCS-L-OAT'),
  ('c3d4e5f6-0009-4000-8000-000000000009', 'S', 'Forest', '#2D5016', 4, 'ME-RCS-S-FOR')
ON CONFLICT (sku) DO NOTHING;


-- 10. Quilted Chain Crossbody
INSERT INTO products (id, name, slug, description, price, category_id, is_featured, is_new) VALUES
  ('c3d4e5f6-0010-4000-8000-000000000010',
   'Quilted Chain Crossbody', 'quilted-chain-crossbody',
   'Diamond-quilted lambskin with a brushed gold chain strap. Compact for evening, spacious for daily essentials.',
   980,
   'a1b2c3d4-0005-4000-8000-000000000005',
   false, true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO product_images (product_id, url, alt, position) VALUES
  ('c3d4e5f6-0010-4000-8000-000000000010', 'https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?auto=format&fit=crop&w=1200&q=85', 'Quilted Chain Crossbody',          0),
  ('c3d4e5f6-0010-4000-8000-000000000010', 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1200&q=85', 'Quilted Chain Crossbody — detalle', 1)
ON CONFLICT DO NOTHING;

INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku) VALUES
  ('c3d4e5f6-0010-4000-8000-000000000010', 'One Size', 'Noir',      '#1A1A1A', 6, 'ME-QCC-OS-NOR'),
  ('c3d4e5f6-0010-4000-8000-000000000010', 'One Size', 'Champagne', '#C4A265', 0, 'ME-QCC-OS-CHP')
ON CONFLICT (sku) DO NOTHING;


-- 11. Satin Pencil Skirt
INSERT INTO products (id, name, slug, description, price, category_id, collection_id, is_featured, is_new) VALUES
  ('c3d4e5f6-0011-4000-8000-000000000011',
   'Satin Pencil Skirt', 'satin-pencil-skirt',
   'Duchess satin in a high-waisted pencil silhouette with a discreet back slit. Luminous finish elevates any pairing.',
   480,
   'a1b2c3d4-0003-4000-8000-000000000003',
   'b2c3d4e5-0001-4000-8000-000000000001',
   false, false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO product_images (product_id, url, alt, position) VALUES
  ('c3d4e5f6-0011-4000-8000-000000000011', 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1200&q=85', 'Satin Pencil Skirt',          0),
  ('c3d4e5f6-0011-4000-8000-000000000011', 'https://images.unsplash.com/photo-1619086303291-0ef7699e4b31?auto=format&fit=crop&w=1200&q=85', 'Satin Pencil Skirt — detalle', 1)
ON CONFLICT DO NOTHING;

INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku) VALUES
  ('c3d4e5f6-0011-4000-8000-000000000011', 'XS', 'Bordeaux', '#9B1B30', 5, 'ME-SPS-XS-BDX'),
  ('c3d4e5f6-0011-4000-8000-000000000011', 'S',  'Bordeaux', '#9B1B30', 3, 'ME-SPS-S-BDX'),
  ('c3d4e5f6-0011-4000-8000-000000000011', 'M',  'Bordeaux', '#9B1B30', 4, 'ME-SPS-M-BDX')
ON CONFLICT (sku) DO NOTHING;


-- 12. Strappy Leather Sandal
INSERT INTO products (id, name, slug, description, price, category_id, collection_id, is_featured, is_new) VALUES
  ('c3d4e5f6-0012-4000-8000-000000000012',
   'Strappy Leather Sandal', 'strappy-leather-sandal',
   'Delicate vegetable-tanned leather straps on a 45mm block heel. Hand-finished in a small Tuscan atelier.',
   620,
   'a1b2c3d4-0006-4000-8000-000000000006',
   'b2c3d4e5-0002-4000-8000-000000000002',
   false, true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO product_images (product_id, url, alt, position) VALUES
  ('c3d4e5f6-0012-4000-8000-000000000012', 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1200&q=85', 'Strappy Leather Sandal',           0),
  ('c3d4e5f6-0012-4000-8000-000000000012', 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=85', 'Strappy Leather Sandal — editorial', 1)
ON CONFLICT DO NOTHING;

INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku) VALUES
  ('c3d4e5f6-0012-4000-8000-000000000012', '36', 'Tan', '#D2B48C', 4, 'ME-SLS-36-TAN'),
  ('c3d4e5f6-0012-4000-8000-000000000012', '37', 'Tan', '#D2B48C', 6, 'ME-SLS-37-TAN'),
  ('c3d4e5f6-0012-4000-8000-000000000012', '38', 'Tan', '#D2B48C', 5, 'ME-SLS-38-TAN'),
  ('c3d4e5f6-0012-4000-8000-000000000012', '39', 'Tan', '#D2B48C', 3, 'ME-SLS-39-TAN')
ON CONFLICT (sku) DO NOTHING;


-- ============================================================
-- ORDERS (5 demo orders)
-- ============================================================

INSERT INTO orders (id, customer_email, customer_name, subtotal, shipping, tax, total, status, shipping_address) VALUES
  ('d4e5f6a7-0001-4000-8000-000000000001',
   'valentina.rossi@email.com', 'Valentina Rossi',
   2560, 0, 256, 2816, 'delivered',
   '{"line1": "Via Monte Napoleone 8", "city": "Milan", "state": "MI", "postal_code": "20121", "country": "IT"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO order_items (order_id, product_id, product_name, variant_size, variant_color, quantity, unit_price) VALUES
  ('d4e5f6a7-0001-4000-8000-000000000001', 'c3d4e5f6-0001-4000-8000-000000000001', 'Silk Drape Midi Dress', 'S', 'Champagne', 1, 1280),
  ('d4e5f6a7-0001-4000-8000-000000000001', 'c3d4e5f6-0001-4000-8000-000000000001', 'Silk Drape Midi Dress', 'M', 'Noir',      1, 1280)
ON CONFLICT DO NOTHING;


INSERT INTO orders (id, customer_email, customer_name, subtotal, shipping, tax, total, status, shipping_address) VALUES
  ('d4e5f6a7-0002-4000-8000-000000000002',
   'camille.dubois@email.com', 'Camille Dubois',
   2800, 45, 280, 3125, 'shipped',
   '{"line1": "23 Rue du Faubourg Saint-Honoré", "city": "Paris", "state": "IDF", "postal_code": "75008", "country": "FR"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO order_items (order_id, product_id, product_name, variant_size, variant_color, quantity, unit_price) VALUES
  ('d4e5f6a7-0002-4000-8000-000000000002', 'c3d4e5f6-0002-4000-8000-000000000002', 'Cashmere Oversized Coat', 'M', 'Camel', 1, 2800)
ON CONFLICT DO NOTHING;


INSERT INTO orders (id, customer_email, customer_name, subtotal, shipping, tax, total, status, shipping_address) VALUES
  ('d4e5f6a7-0003-4000-8000-000000000003',
   'sofia.martinez@email.com', 'Sofía Martínez',
   2170, 0, 217, 2387, 'confirmed',
   '{"line1": "Av. Alvear 1885", "city": "Buenos Aires", "state": "CABA", "postal_code": "C1129", "country": "AR"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO order_items (order_id, product_id, product_name, variant_size, variant_color, quantity, unit_price) VALUES
  ('d4e5f6a7-0003-4000-8000-000000000003', 'c3d4e5f6-0005-4000-8000-000000000005', 'Draped Silk Blouse',      'S',        'Petal',  1, 520),
  ('d4e5f6a7-0003-4000-8000-000000000003', 'c3d4e5f6-0003-4000-8000-000000000003', 'Leather Structured Tote', 'One Size', 'Cognac', 1, 1650)
ON CONFLICT DO NOTHING;


INSERT INTO orders (id, customer_email, customer_name, subtotal, shipping, tax, total, status, shipping_address) VALUES
  ('d4e5f6a7-0004-4000-8000-000000000004',
   'elena.volkov@email.com', 'Elena Volkov',
   1460, 60, 146, 1666, 'pending',
   '{"line1": "Bolshaya Dmitrovka 7/5", "city": "Moscow", "state": "MOW", "postal_code": "125009", "country": "RU"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO order_items (order_id, product_id, product_name, variant_size, variant_color, quantity, unit_price) VALUES
  ('d4e5f6a7-0004-4000-8000-000000000004', 'c3d4e5f6-0009-4000-8000-000000000009', 'Ribbed Cashmere Sweater', 'S',  'Oat',  1, 580),
  ('d4e5f6a7-0004-4000-8000-000000000004', 'c3d4e5f6-0006-4000-8000-000000000006', 'Sculpted Heel Mule',      '38', 'Noir', 1, 890)
ON CONFLICT DO NOTHING;


INSERT INTO orders (id, customer_email, customer_name, subtotal, shipping, tax, total, status, shipping_address, notes) VALUES
  ('d4e5f6a7-0005-4000-8000-000000000005',
   'isabella.chen@email.com', 'Isabella Chen',
   680, 35, 68, 783, 'cancelled',
   '{"line1": "88 Orchard Road", "city": "Singapore", "state": "SG", "postal_code": "238839", "country": "SG"}'::jsonb,
   'Customer requested cancellation — changed mind on color.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO order_items (order_id, product_id, product_name, variant_size, variant_color, quantity, unit_price) VALUES
  ('d4e5f6a7-0005-4000-8000-000000000005', 'c3d4e5f6-0004-4000-8000-000000000004', 'Pleated Wide-Leg Trousers', 'S', 'Ivory', 1, 680)
ON CONFLICT DO NOTHING;


-- ============================================================
-- SITE SETTINGS
-- ============================================================
-- Uses ON CONFLICT … DO UPDATE so re-running always refreshes
-- the demo values to their canonical state.

INSERT INTO site_settings (key, value) VALUES
  -- Store identity
  ('store_name',        '"MAISON ÉLARA"'::jsonb),
  ('store_tagline',     '"Lujo contemporáneo desde Buenos Aires"'::jsonb),
  ('store_description', '"Moda femenina de lujo — colecciones curadas para la mujer contemporánea."'::jsonb),
  ('logo_url',          '""'::jsonb),
  ('favicon_url',       '""'::jsonb),

  -- Contact
  ('contact_phone',     '""'::jsonb),
  ('contact_email',     '"info@maisonelara.com"'::jsonb),
  ('contact_whatsapp',  '"https://wa.me/5491124842720"'::jsonb),
  ('contact_hours',     '"Lun–Vie 10–18hs"'::jsonb),
  ('contact_address',   '"Buenos Aires, Argentina"'::jsonb),

  -- Social
  ('social_instagram',  '"https://instagram.com/maisonelara"'::jsonb),
  ('social_pinterest',  '"https://pinterest.com"'::jsonb),
  ('social_twitter',    '"https://x.com"'::jsonb),
  ('social_facebook',   '""'::jsonb),
  ('social_tiktok',     '""'::jsonb),
  ('instagram_handle',  '"@maisonelara"'::jsonb),

  -- Store config
  ('store_currency',           '"USD"'::jsonb),
  ('store_locale',             '"es-AR"'::jsonb),
  ('free_shipping_threshold',  '500'::jsonb),
  ('shipping_standard',        '15'::jsonb),
  ('tax_rate',                 '0.1'::jsonb),
  ('footer_copyright_year',    '2026'::jsonb),

  -- Hero section
  ('hero_title',         '"El arte del lujo silencioso."'::jsonb),
  ('hero_season_label',  '"Colección 2026"'::jsonb),
  ('hero_subtitle',      '"Piezas atemporales. Craftsmanship sin concesiones."'::jsonb),
  ('hero_cta_text',      '"Descubrir la colección"'::jsonb),
  ('hero_cta_href',      '"/collections/autumn-whisper"'::jsonb),
  ('hero_image_url',     '""'::jsonb),

  -- Editorial section
  ('editorial_season_label',  '"FW25 Collection"'::jsonb),
  ('editorial_title',         '"Autumn Whisper"'::jsonb),
  ('editorial_description',   '"Una colección inspirada en la quietud de los amaneceres de otoño. Siluetas suaves, texturas profundas y una paleta tomada de las hojas caídas y los horizontes brumosos."'::jsonb),
  ('editorial_cta_href',      '"/collections/autumn-whisper"'::jsonb),
  ('editorial_strip_title',   '"Donde la artesanía encuentra la visión contemporánea"'::jsonb),
  ('editorial_strip_subtitle','"Cada pieza es un homenaje al arte de vestir — diseñada en Buenos Aires, pensada para el mundo."'::jsonb),

  -- Announcement bar
  ('announcement_bar', '{"text": "Envío gratuito en compras superiores a $500", "active": true, "link": ""}'::jsonb),

  -- Newsletter
  ('newsletter_active',   'true'::jsonb),
  ('newsletter_title',    '"Recibí nuestras cartas."'::jsonb),
  ('newsletter_subtitle', '"Acceso anticipado a colecciones. Eventos privados. Historias de la casa."'::jsonb),

  -- Feature flags
  ('features', '{"show_instagram_feed": true, "show_press_strip": true, "show_newsletter_cta": true, "show_editorial_section": true, "show_announcement_bar": true, "show_editorial_strip": true}'::jsonb),

  -- Brand
  ('brand_colors', '{"primary": "#C4A265", "accent": "#A47764"}'::jsonb),

  -- SEO
  ('seo_home_title',           '"MAISON ÉLARA | Moda de lujo contemporánea"'::jsonb),
  ('seo_home_description',     '"Piezas atemporales pensadas para la mujer actual. Moda de lujo diseñada en Buenos Aires."'::jsonb),
  ('seo_og_image',             '""'::jsonb),
  ('seo_products_description', '"Explorá nuestro catálogo de moda de lujo femenina."'::jsonb),
  ('seo_collections_description', '"Colecciones curadas de moda contemporánea."'::jsonb)

ON CONFLICT (key) DO UPDATE
  SET value      = EXCLUDED.value,
      updated_at = now();
