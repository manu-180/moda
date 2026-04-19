-- Demo mode: relaja is_admin() para que cualquier usuario autenticado pase RLS.
-- Esto habilita upload de imágenes y CRUD del catálogo sin asignar app_metadata.role='admin'.
--
-- PARA REVERTIR: volver a la definición original en 2026-04-17-fix-rls-admin-role.sql:
--   SELECT (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'

CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT auth.role() = 'authenticated'
$$;
