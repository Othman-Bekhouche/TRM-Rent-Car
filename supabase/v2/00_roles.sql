-- =============================================
-- 00_roles.sql
-- Configuration RACINE des rôles et permissions PG15
-- =============================================

DO $$ 
BEGIN
    -- Création des rôles s'ils n'existent pas
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'anon') THEN CREATE ROLE anon nologin; END IF;
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'authenticated') THEN CREATE ROLE authenticated nologin; END IF;
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'service_role') THEN CREATE ROLE service_role nologin; END IF;
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'authenticator') THEN CREATE ROLE authenticator WITH LOGIN NOINHERIT; END IF;
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'supabase_auth_admin') THEN CREATE ROLE supabase_auth_admin WITH LOGIN; END IF;
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'supabase_storage_admin') THEN CREATE ROLE supabase_storage_admin WITH LOGIN; END IF;
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'supabase_admin') THEN CREATE ROLE supabase_admin WITH LOGIN SUPERUSER; END IF;
END $$;

-- FORCE SYNCHRONIZATION DES MOTS DE PASSE (Indispensable si rôles déjà existants)
ALTER ROLE postgres WITH PASSWORD 'trmrentcar2026';
ALTER ROLE authenticator WITH PASSWORD 'trmrentcar2026';
ALTER ROLE supabase_admin WITH PASSWORD 'trmrentcar2026';
ALTER ROLE supabase_auth_admin WITH PASSWORD 'trmrentcar2026';
ALTER ROLE supabase_storage_admin WITH PASSWORD 'trmrentcar2026';

-- HIÉRARCHIE
GRANT anon, authenticated, service_role TO authenticator;

-- ROOT FIX POUR POSTGRESQL 15
-- Indispensable pour permettre à Supabase (Auth/Storage) de créer ses tables de gestion
ALTER SCHEMA public OWNER TO postgres;
GRANT ALL ON SCHEMA public TO public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO supabase_admin;
GRANT ALL ON SCHEMA public TO supabase_auth_admin;
GRANT ALL ON SCHEMA public TO supabase_storage_admin;

-- DROITS DE CRÉATION EXPLICITES
GRANT CREATE ON SCHEMA public TO supabase_auth_admin;
GRANT CREATE ON SCHEMA public TO supabase_storage_admin;

-- PERMISSIONS D'USAGE POUR L'API
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- SEARCH PATH
ALTER ROLE authenticator SET search_path TO public, auth, extensions, storage;
ALTER ROLE anon SET search_path TO public, extensions;
ALTER ROLE authenticated SET search_path TO public, extensions;
