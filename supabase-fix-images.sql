-- ============================================================
-- MAISON ÉLARA — Fix local placeholder images → Unsplash URLs
-- Run this in Supabase SQL Editor to update existing data
-- ============================================================

-- Categories
UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1200&q=85' WHERE slug = 'dresses';
UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1619086303291-0ef7699e4b31?auto=format&fit=crop&w=1200&q=85' WHERE slug = 'tops';
UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1200&q=85' WHERE slug = 'bottoms';
UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&w=1200&q=85' WHERE slug = 'outerwear';
UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1200&q=85' WHERE slug = 'bags';
UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1200&q=85' WHERE slug = 'shoes';

-- Collections
UPDATE collections SET image_url = 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=2000&q=85' WHERE slug = 'autumn-whisper';
UPDATE collections SET image_url = 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=2000&q=85' WHERE slug = 'mediterranean-light';

-- Product images — remove all local placeholders and replace with fashion photos
DELETE FROM product_images WHERE url LIKE '/images/%';

-- Silk Drape Midi Dress
INSERT INTO product_images (product_id, url, alt, position)
SELECT id, 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1200&q=85', 'Silk Drape Midi Dress — front', 0
FROM products WHERE slug = 'silk-drape-midi-dress'
ON CONFLICT DO NOTHING;

INSERT INTO product_images (product_id, url, alt, position)
SELECT id, 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=1200&q=85', 'Silk Drape Midi Dress — detail', 1
FROM products WHERE slug = 'silk-drape-midi-dress'
ON CONFLICT DO NOTHING;

-- Cashmere Oversized Coat
INSERT INTO product_images (product_id, url, alt, position)
SELECT id, 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=85', 'Cashmere Oversized Coat', 0
FROM products WHERE slug = 'cashmere-oversized-coat'
ON CONFLICT DO NOTHING;

INSERT INTO product_images (product_id, url, alt, position)
SELECT id, 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=85', 'Cashmere Oversized Coat — detalle', 1
FROM products WHERE slug = 'cashmere-oversized-coat'
ON CONFLICT DO NOTHING;

-- Leather Structured Tote
INSERT INTO product_images (product_id, url, alt, position)
SELECT id, 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1200&q=85', 'Leather Structured Tote', 0
FROM products WHERE slug = 'leather-structured-tote'
ON CONFLICT DO NOTHING;

INSERT INTO product_images (product_id, url, alt, position)
SELECT id, 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1200&q=85', 'Leather Structured Tote — editorial', 1
FROM products WHERE slug = 'leather-structured-tote'
ON CONFLICT DO NOTHING;

-- Pleated Wide-Leg Trousers
INSERT INTO product_images (product_id, url, alt, position)
SELECT id, 'https://images.unsplash.com/photo-1619086303291-0ef7699e4b31?auto=format&fit=crop&w=1200&q=85', 'Pleated Wide-Leg Trousers', 0
FROM products WHERE slug = 'pleated-wide-leg-trousers'
ON CONFLICT DO NOTHING;

INSERT INTO product_images (product_id, url, alt, position)
SELECT id, 'https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?auto=format&fit=crop&w=1200&q=85', 'Pleated Wide-Leg Trousers — editorial', 1
FROM products WHERE slug = 'pleated-wide-leg-trousers'
ON CONFLICT DO NOTHING;

-- Draped Silk Blouse
INSERT INTO product_images (product_id, url, alt, position)
SELECT id, 'https://images.unsplash.com/photo-1526413232644-8a40f03cc03b?auto=format&fit=crop&w=1200&q=85', 'Draped Silk Blouse', 0
FROM products WHERE slug = 'draped-silk-blouse'
ON CONFLICT DO NOTHING;

INSERT INTO product_images (product_id, url, alt, position)
SELECT id, 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=1200&q=85', 'Draped Silk Blouse — detalle', 1
FROM products WHERE slug = 'draped-silk-blouse'
ON CONFLICT DO NOTHING;

-- Sculpted Heel Mule
INSERT INTO product_images (product_id, url, alt, position)
SELECT id, 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1200&q=85', 'Sculpted Heel Mule', 0
FROM products WHERE slug = 'sculpted-heel-mule'
ON CONFLICT DO NOTHING;

INSERT INTO product_images (product_id, url, alt, position)
SELECT id, 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1200&q=85', 'Sculpted Heel Mule — editorial', 1
FROM products WHERE slug = 'sculpted-heel-mule'
ON CONFLICT DO NOTHING;

-- Linen Wrap Dress
INSERT INTO product_images (product_id, url, alt, position)
SELECT id, 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=85', 'Linen Wrap Dress', 0
FROM products WHERE slug = 'linen-wrap-dress'
ON CONFLICT DO NOTHING;

INSERT INTO product_images (product_id, url, alt, position)
SELECT id, 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=1200&q=85', 'Linen Wrap Dress — detalle', 1
FROM products WHERE slug = 'linen-wrap-dress'
ON CONFLICT DO NOTHING;

-- Wool Tailored Blazer
INSERT INTO product_images (product_id, url, alt, position)
SELECT id, 'https://images.unsplash.com/photo-1617922001439-4a2e6562f328?auto=format&fit=crop&w=1200&q=85', 'Wool Tailored Blazer', 0
FROM products WHERE slug = 'wool-tailored-blazer'
ON CONFLICT DO NOTHING;

INSERT INTO product_images (product_id, url, alt, position)
SELECT id, 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=85', 'Wool Tailored Blazer — editorial', 1
FROM products WHERE slug = 'wool-tailored-blazer'
ON CONFLICT DO NOTHING;

-- Ribbed Cashmere Sweater
INSERT INTO product_images (product_id, url, alt, position)
SELECT id, 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?auto=format&fit=crop&w=1200&q=85', 'Ribbed Cashmere Sweater', 0
FROM products WHERE slug = 'ribbed-cashmere-sweater'
ON CONFLICT DO NOTHING;

INSERT INTO product_images (product_id, url, alt, position)
SELECT id, 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=85', 'Ribbed Cashmere Sweater — editorial', 1
FROM products WHERE slug = 'ribbed-cashmere-sweater'
ON CONFLICT DO NOTHING;

-- Quilted Chain Crossbody
INSERT INTO product_images (product_id, url, alt, position)
SELECT id, 'https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?auto=format&fit=crop&w=1200&q=85', 'Quilted Chain Crossbody', 0
FROM products WHERE slug = 'quilted-chain-crossbody'
ON CONFLICT DO NOTHING;

INSERT INTO product_images (product_id, url, alt, position)
SELECT id, 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1200&q=85', 'Quilted Chain Crossbody — detalle', 1
FROM products WHERE slug = 'quilted-chain-crossbody'
ON CONFLICT DO NOTHING;

-- Satin Pencil Skirt
INSERT INTO product_images (product_id, url, alt, position)
SELECT id, 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1200&q=85', 'Satin Pencil Skirt', 0
FROM products WHERE slug = 'satin-pencil-skirt'
ON CONFLICT DO NOTHING;

INSERT INTO product_images (product_id, url, alt, position)
SELECT id, 'https://images.unsplash.com/photo-1619086303291-0ef7699e4b31?auto=format&fit=crop&w=1200&q=85', 'Satin Pencil Skirt — detalle', 1
FROM products WHERE slug = 'satin-pencil-skirt'
ON CONFLICT DO NOTHING;

-- Strappy Leather Sandal
INSERT INTO product_images (product_id, url, alt, position)
SELECT id, 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1200&q=85', 'Strappy Leather Sandal', 0
FROM products WHERE slug = 'strappy-leather-sandal'
ON CONFLICT DO NOTHING;

INSERT INTO product_images (product_id, url, alt, position)
SELECT id, 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=85', 'Strappy Leather Sandal — editorial', 1
FROM products WHERE slug = 'strappy-leather-sandal'
ON CONFLICT DO NOTHING;
