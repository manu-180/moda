-- ============================================================
-- MIGRACIÓN 2026-04-16 — Stock atómico + variantes estables
-- Correr en Supabase SQL Editor (una sola vez)
-- ============================================================

-- ─────────────────────────────────────────────────────
-- 1. SOFT DELETE en product_variants
-- ─────────────────────────────────────────────────────
ALTER TABLE product_variants
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

CREATE INDEX IF NOT EXISTS idx_product_variants_is_active
  ON product_variants(is_active);

-- ─────────────────────────────────────────────────────
-- 2. variant_id en order_items (nullable por seeds existentes)
-- ─────────────────────────────────────────────────────
ALTER TABLE order_items
  ADD COLUMN IF NOT EXISTS variant_id uuid REFERENCES product_variants(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_order_items_variant_id
  ON order_items(variant_id);

-- ─────────────────────────────────────────────────────
-- 3. Ajustar stock de seeds para reflejar las 5 órdenes demo
-- (coherencia: lo que ya "se vendió" se descuenta del stock)
-- ─────────────────────────────────────────────────────
-- Orden 1: Silk Drape Midi Dress S Champagne × 1, M Noir × 1
UPDATE product_variants SET stock = stock - 1
  WHERE sku = 'ME-SDMD-S-CHP';
UPDATE product_variants SET stock = stock - 1
  WHERE sku = 'ME-SDMD-M-NOR';

-- Orden 2: Cashmere Oversized Coat M Camel × 1
UPDATE product_variants SET stock = stock - 1
  WHERE sku = 'ME-COC-M-CML';

-- Orden 3: Draped Silk Blouse S Petal × 1, Leather Structured Tote OS Cognac × 1
UPDATE product_variants SET stock = stock - 1
  WHERE sku = 'ME-DSB-S-PTL';
UPDATE product_variants SET stock = stock - 1
  WHERE sku = 'ME-LST-OS-COG';

-- Orden 4: Ribbed Cashmere Sweater S Oat × 1, Sculpted Heel Mule 38 Noir × 1
UPDATE product_variants SET stock = stock - 1
  WHERE sku = 'ME-RCS-S-OAT';
UPDATE product_variants SET stock = stock - 1
  WHERE sku = 'ME-SHM-38-NOR';

-- Orden 5 (cancelada): Pleated Wide-Leg Trousers S Ivory × 1
-- Estado 'cancelled' → NO descontamos. El cliente nunca recibió.

-- También backfilleamos variant_id en order_items para las 5 órdenes seed
-- (así los reportes históricos pueden navegar de order_item → variant)
UPDATE order_items oi
SET variant_id = pv.id
FROM product_variants pv
WHERE oi.variant_id IS NULL
  AND pv.product_id = oi.product_id
  AND pv.size = oi.variant_size
  AND pv.color = oi.variant_color;

-- ─────────────────────────────────────────────────────
-- 4. RPC atómica para crear orden + descontar stock
-- ─────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION create_order_with_stock_check(
  p_customer_email text,
  p_customer_name text,
  p_shipping_address jsonb,
  p_items jsonb,        -- [{ variant_id, quantity, unit_price }, ...]
  p_shipping numeric,
  p_tax numeric
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_item          jsonb;
  v_variant_id    uuid;
  v_quantity      int;
  v_unit_price    numeric;
  v_variant       record;
  v_product       record;
  v_subtotal      numeric := 0;
  v_total         numeric;
  v_order_id      uuid;
  v_order_number  text;
BEGIN
  -- Validación básica del payload
  IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error_code', 'empty_cart',
      'error_message', 'El carrito está vacío.'
    );
  END IF;

  -- Loop 1: validar stock, status, is_active — CON LOCK DE FILA
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_variant_id := (v_item->>'variant_id')::uuid;
    v_quantity   := (v_item->>'quantity')::int;
    v_unit_price := (v_item->>'unit_price')::numeric;

    IF v_quantity <= 0 THEN
      RETURN jsonb_build_object(
        'success', false,
        'error_code', 'invalid_quantity',
        'error_message', 'Cantidad inválida en uno de los ítems.'
      );
    END IF;

    -- LOCK DE FILA: nadie más puede modificar este stock hasta que esta transacción termine
    SELECT id, product_id, size, color, stock, is_active
      INTO v_variant
      FROM product_variants
      WHERE id = v_variant_id
      FOR UPDATE;

    IF NOT FOUND THEN
      RETURN jsonb_build_object(
        'success', false,
        'error_code', 'variant_not_found',
        'error_message', 'Una de las variantes ya no existe. Revisá tu bolsa.',
        'variant_id', v_variant_id
      );
    END IF;

    IF NOT v_variant.is_active THEN
      RETURN jsonb_build_object(
        'success', false,
        'error_code', 'variant_inactive',
        'error_message', format('La variante %s %s ya no está disponible.', v_variant.size, v_variant.color),
        'variant_id', v_variant_id
      );
    END IF;

    -- Validar que el producto esté active
    SELECT id, name, status, price INTO v_product
      FROM products
      WHERE id = v_variant.product_id;

    IF v_product.status <> 'active' THEN
      RETURN jsonb_build_object(
        'success', false,
        'error_code', 'product_unavailable',
        'error_message', format('%s ya no está disponible.', v_product.name),
        'variant_id', v_variant_id
      );
    END IF;

    -- Validar stock suficiente
    IF v_variant.stock < v_quantity THEN
      RETURN jsonb_build_object(
        'success', false,
        'error_code', 'insufficient_stock',
        'error_message', format('%s — Talle %s · %s: sin stock suficiente (quedan %s).',
          v_product.name, v_variant.size, v_variant.color, v_variant.stock),
        'variant_id', v_variant_id,
        'available_stock', v_variant.stock
      );
    END IF;

    -- Validar que el precio del cliente coincida con el de la DB
    -- (protección anti-manipulación: el cliente podría mandar precios falsos)
    IF v_unit_price <> v_product.price THEN
      RETURN jsonb_build_object(
        'success', false,
        'error_code', 'price_mismatch',
        'error_message', format('El precio de %s cambió. Refrescá tu bolsa.', v_product.name),
        'variant_id', v_variant_id
      );
    END IF;

    v_subtotal := v_subtotal + (v_product.price * v_quantity);
  END LOOP;

  v_total := v_subtotal + p_shipping + p_tax;

  -- Crear la orden (trigger genera order_number)
  INSERT INTO orders (
    customer_email, customer_name, shipping_address,
    subtotal, shipping, tax, total, status
  ) VALUES (
    p_customer_email, p_customer_name, p_shipping_address,
    v_subtotal, p_shipping, p_tax, v_total, 'pending'
  )
  RETURNING id, order_number INTO v_order_id, v_order_number;

  -- Loop 2: descontar stock + insertar order_items
  -- (el FOR UPDATE del loop 1 mantiene los locks hasta el COMMIT)
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_variant_id := (v_item->>'variant_id')::uuid;
    v_quantity   := (v_item->>'quantity')::int;

    -- Descontar stock
    UPDATE product_variants
      SET stock = stock - v_quantity
      WHERE id = v_variant_id;

    -- Snapshot del item (nombre y variantes al momento de la compra)
    INSERT INTO order_items (
      order_id, product_id, variant_id,
      product_name, variant_size, variant_color,
      quantity, unit_price
    )
    SELECT
      v_order_id, pv.product_id, pv.id,
      p.name, pv.size, pv.color,
      v_quantity, p.price
    FROM product_variants pv
    JOIN products p ON p.id = pv.product_id
    WHERE pv.id = v_variant_id;
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'order_id', v_order_id,
    'order_number', v_order_number
  );

EXCEPTION WHEN OTHERS THEN
  -- Cualquier error en la transacción → rollback automático + respuesta estructurada
  RETURN jsonb_build_object(
    'success', false,
    'error_code', 'unexpected',
    'error_message', 'Error al procesar el pedido. Intentá de nuevo en unos segundos.',
    'sql_error', SQLERRM
  );
END;
$$;

-- ─────────────────────────────────────────────────────
-- 5. Permisos: que anon/authenticated puedan ejecutar la RPC
-- ─────────────────────────────────────────────────────
GRANT EXECUTE ON FUNCTION create_order_with_stock_check(text, text, jsonb, jsonb, numeric, numeric) TO anon;
GRANT EXECUTE ON FUNCTION create_order_with_stock_check(text, text, jsonb, jsonb, numeric, numeric) TO authenticated;

-- ─────────────────────────────────────────────────────
-- 6. Cerrar la puerta vieja: anon NO puede insertar orders/order_items directo
-- (ahora solo puede ir vía RPC, que valida todo)
-- ─────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Anon can create orders" ON orders;
DROP POLICY IF EXISTS "Anon can create order_items" ON order_items;
-- La RPC usa SECURITY DEFINER, no necesita estas policies para insertar.
