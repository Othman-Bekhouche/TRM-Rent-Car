-- =============================================
-- 00_auth_schema.sql
-- Initialise le schéma auth et les fonctions d'aide (helpers)
-- Indispensable pour l'auto-hébergement (self-hosted)
-- =============================================

CREATE SCHEMA IF NOT EXISTS auth;

-- auth.uid() : Récupère l'ID de l'utilisateur depuis le JWT
CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid AS $$
  SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$ LANGUAGE sql STABLE;

-- auth.role() : Récupère le rôle depuis le JWT
CREATE OR REPLACE FUNCTION auth.role() RETURNS text AS $$
  SELECT nullif(current_setting('request.jwt.claim.role', true), '')::text;
$$ LANGUAGE sql STABLE;

-- auth.email() : Récupère l'email depuis le JWT
CREATE OR REPLACE FUNCTION auth.email() RETURNS text AS $$
  SELECT nullif(current_setting('request.jwt.claim.email', true), '')::text;
$$ LANGUAGE sql STABLE;

-- auth.jwt() : Récupère l'ensemble des claims du JWT
CREATE OR REPLACE FUNCTION auth.jwt() RETURNS jsonb AS $$
  SELECT coalesce(current_setting('request.jwt.claims', true), '{}')::jsonb;
$$ LANGUAGE sql STABLE;
