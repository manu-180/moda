-- ============================================================
-- UPDATE PRODUCT PRICES FROM USD TO ARGENTINE PESOS (ARS)
-- Multiplier: 80 (realistic for luxury fashion market in Argentina)
-- ============================================================

-- Update all product prices
UPDATE products
SET
  price = ROUND(price * 80, 0),
  compare_at_price = CASE WHEN compare_at_price IS NOT NULL
    THEN ROUND(compare_at_price * 80, 0)
    ELSE NULL
  END,
  updated_at = now()
WHERE status IN ('active', 'draft');

-- Verify the updates
SELECT id, name, price, compare_at_price FROM products ORDER BY price DESC;
