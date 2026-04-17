CREATE INDEX IF NOT EXISTS idx_orders_customer_email
  ON orders(customer_email);

CREATE INDEX IF NOT EXISTS idx_orders_status_created_at
  ON orders(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_product_variants_product_id_stock
  ON product_variants(product_id, stock)
  WHERE is_active = true;
