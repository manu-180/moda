-- Migration: Server-side shipping + tax validation in RPC (A3)
-- Problem: client sends p_shipping and p_tax — a user could manipulate DevTools
--          to send p_shipping=0 / p_tax=0 and pay less than they should.
-- Fix: read the authoritative values from site_settings and reject mismatches.
--
-- Run this in Supabase SQL Editor.

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
  v_item                    jsonb;
  v_variant_id              uuid;
  v_quantity                int;
  v_unit_price              numeric;
  v_variant                 record;
  v_product                 record;
  v_subtotal                numeric := 0;
  v_total                   numeric;
  v_order_id                uuid;
  v_order_number            text;
  -- shipping / tax validation
  v_shipping_std            numeric;
  v_free_shipping_threshold numeric;
  v_tax_rate                numeric;
  v_expected_shipping       numeric;
  v_expected_tax            numeric;
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

  -- ── Validar shipping y tax contra site_settings ────────────────────────────
  -- Leemos los valores autoritativos del servidor (no confiamos en el cliente)
  SELECT COALESCE((SELECT value::numeric FROM site_settings WHERE key = 'shipping_standard'),    0)   INTO v_shipping_std;
  SELECT COALESCE((SELECT value::numeric FROM site_settings WHERE key = 'free_shipping_threshold'), 999999) INTO v_free_shipping_threshold;
  SELECT COALESCE((SELECT value::numeric FROM site_settings WHERE key = 'tax_rate'),             0)   INTO v_tax_rate;

  v_expected_shipping := CASE WHEN v_subtotal >= v_free_shipping_threshold THEN 0 ELSE v_shipping_std END;
  v_expected_tax      := ROUND(v_subtotal * v_tax_rate, 2);

  IF p_shipping <> v_expected_shipping THEN
    RETURN jsonb_build_object(
      'success', false,
      'error_code', 'shipping_mismatch',
      'error_message', 'El costo de envío no coincide. Refrescá la página.',
      'expected', v_expected_shipping,
      'received', p_shipping
    );
  END IF;

  IF p_tax <> v_expected_tax THEN
    RETURN jsonb_build_object(
      'success', false,
      'error_code', 'tax_mismatch',
      'error_message', 'El impuesto calculado no coincide. Refrescá la página.',
      'expected', v_expected_tax,
      'received', p_tax
    );
  END IF;
  -- ───────────────────────────────────────────────────────────────────────────

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
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_variant_id := (v_item->>'variant_id')::uuid;
    v_quantity   := (v_item->>'quantity')::int;

    UPDATE product_variants
      SET stock = stock - v_quantity
      WHERE id = v_variant_id;

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
  RETURN jsonb_build_object(
    'success', false,
    'error_code', 'unexpected',
    'error_message', 'Error al procesar el pedido. Intentá de nuevo en unos segundos.',
    'sql_error', SQLERRM
  );
END;
$$;
