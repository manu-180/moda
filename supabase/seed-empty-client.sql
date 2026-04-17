-- ============================================================
-- MAISON ÉLARA — Empty Client Seed
-- ============================================================
-- Use this file when setting up a new client project.
-- It populates site_settings with safe defaults and empty
-- placeholder values so the admin panel works from day one.
--
-- The client fills in their brand details, content, and
-- social links entirely through the admin panel — nothing
-- needs to be edited here before running.
--
-- Rules:
--   • NO categories, collections, products, or orders
--   • ONLY site_settings rows
--   • ON CONFLICT DO NOTHING — safe to run multiple times;
--     existing rows are never overwritten, preserving any
--     changes the client has already made via the admin.
--
-- Run order:
--   1. base.sql          (schema)
--   2. seed-empty-client.sql (this file)
-- ============================================================


-- ============================================================
-- SITE SETTINGS — empty / default values
-- ============================================================

INSERT INTO site_settings (key, value) VALUES

  -- Store identity
  ('store_name',        '""'::jsonb),
  ('store_tagline',     '""'::jsonb),
  ('store_description', '""'::jsonb),
  ('logo_url',          '""'::jsonb),
  ('favicon_url',       '""'::jsonb),

  -- Contact
  ('contact_phone',    '""'::jsonb),
  ('contact_email',    '""'::jsonb),
  ('contact_whatsapp', '""'::jsonb),
  ('contact_hours',    '""'::jsonb),
  ('contact_address',  '""'::jsonb),

  -- Social
  ('social_instagram', '""'::jsonb),
  ('social_pinterest', '""'::jsonb),
  ('social_twitter',   '""'::jsonb),
  ('social_facebook',  '""'::jsonb),
  ('social_tiktok',    '""'::jsonb),
  ('instagram_handle', '""'::jsonb),

  -- Store config (sensible defaults)
  ('store_currency',          '"USD"'::jsonb),
  ('store_locale',            '"es-AR"'::jsonb),
  ('free_shipping_threshold', '500'::jsonb),
  ('shipping_standard',       '15'::jsonb),
  ('tax_rate',                '0.21'::jsonb),   -- Argentina IVA
  ('footer_copyright_year',   '2026'::jsonb),

  -- Hero section
  ('hero_title',        '""'::jsonb),
  ('hero_season_label', '""'::jsonb),
  ('hero_subtitle',     '""'::jsonb),
  ('hero_cta_text',     '"Ver colecciones"'::jsonb),
  ('hero_cta_href',     '"/collections"'::jsonb),
  ('hero_image_url',    '""'::jsonb),

  -- Editorial section
  ('editorial_season_label',   '""'::jsonb),
  ('editorial_title',          '""'::jsonb),
  ('editorial_description',    '""'::jsonb),
  ('editorial_cta_href',       '"/collections"'::jsonb),
  ('editorial_strip_title',    '""'::jsonb),
  ('editorial_strip_subtitle', '""'::jsonb),

  -- Announcement bar (inactive by default)
  ('announcement_bar', '{"text": "", "active": false, "link": ""}'::jsonb),

  -- Newsletter
  ('newsletter_active',   'true'::jsonb),
  ('newsletter_title',    '""'::jsonb),
  ('newsletter_subtitle', '""'::jsonb),

  -- Feature flags (conservative defaults — client enables features as ready)
  ('features', '{"show_instagram_feed": true, "show_press_strip": false, "show_newsletter_cta": true, "show_editorial_section": false, "show_announcement_bar": false, "show_editorial_strip": true}'::jsonb),

  -- Brand colors (MAISON ÉLARA palette as starting point — client can override)
  ('brand_colors', '{"primary": "#C4A265", "accent": "#A47764"}'::jsonb),

  -- SEO
  ('seo_home_title',              '""'::jsonb),
  ('seo_home_description',        '""'::jsonb),
  ('seo_og_image',                '""'::jsonb),
  ('seo_products_description',    '""'::jsonb),
  ('seo_collections_description', '""'::jsonb)

ON CONFLICT (key) DO NOTHING;
