-- =============================================
-- 00_auth_schema.sql
-- Initialise le schéma auth et les fonctions d'aide
-- =============================================

CREATE SCHEMA IF NOT EXISTS auth;

-- FIX PG15: Pré-création de la table que le service Auth n'arrive pas à créer tout seul
CREATE TABLE IF NOT EXISTS public.schema_migrations (version varchar(255) primary key);
ALTER TABLE public.schema_migrations OWNER TO supabase_auth_admin;

-- Création minimale de la table users pour permettre aux triggers de se lier
-- Supabase Auth complétera la table au démarrage
CREATE TABLE IF NOT EXISTS auth.users (
    id UUID PRIMARY KEY,
    email TEXT UNIQUE,
    encrypted_password TEXT,
    email_confirmed_at TIMESTAMPTZ,
    raw_app_meta_data JSONB,
    raw_user_meta_data JSONB,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    role TEXT
);

-- auth.uid() : Récupère l'ID de l'utilisateur depuis le JWT
CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid AS $$
  SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$ LANGUAGE sql STABLE;

-- auth.jwt() : Récupère l'ensemble des claims du JWT
CREATE OR REPLACE FUNCTION auth.jwt() RETURNS jsonb AS $$
  SELECT coalesce(current_setting('request.jwt.claims', true), '{}')::jsonb;
$$ LANGUAGE sql STABLE;

-- auth.role() : Récupère le rôle
CREATE OR REPLACE FUNCTION auth.role() RETURNS text AS $$
  SELECT nullif(current_setting('request.jwt.claim.role', true), '')::text;
$$ LANGUAGE sql STABLE;

-- auth.email() : Récupère l'email
CREATE OR REPLACE FUNCTION auth.email() RETURNS text AS $$
  SELECT nullif(current_setting('request.jwt.claim.email', true), '')::text;
$$ LANGUAGE sql STABLE;
