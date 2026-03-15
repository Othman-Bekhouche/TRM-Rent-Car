-- =============================================
-- 00_roles.sql
-- Configuration RACINE : Permissions et Propriétaires PG15
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

-- Synchronisation des mots de passe
ALTER ROLE postgres WITH PASSWORD 'trmrentcar2026';
ALTER ROLE authenticator WITH PASSWORD 'trmrentcar2026';
ALTER ROLE supabase_admin WITH PASSWORD 'trmrentcar2026';
ALTER ROLE supabase_auth_admin WITH PASSWORD 'trmrentcar2026';
ALTER ROLE supabase_storage_admin WITH PASSWORD 'trmrentcar2026';

-- Autorisations de connexion
GRANT CONNECT ON DATABASE postgres TO supabase_auth_admin, supabase_storage_admin, supabase_admin, authenticator;

-- ROOT FIX POUR POSTGRESQL 15 (Schéma Public)
ALTER SCHEMA public OWNER TO postgres;
GRANT ALL ON SCHEMA public TO public;
GRANT ALL ON SCHEMA public TO postgres, supabase_admin, supabase_auth_admin, supabase_storage_admin;
GRANT USAGE, CREATE ON SCHEMA public TO supabase_auth_admin, supabase_storage_admin;

-- GESTION DES SCHÉMAS TECHNIQUES (Propriété)
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS storage;
CREATE SCHEMA IF NOT EXISTS realtime;
CREATE SCHEMA IF NOT EXISTS extensions;

ALTER SCHEMA auth OWNER TO supabase_auth_admin;
ALTER SCHEMA storage OWNER TO supabase_storage_admin;
ALTER SCHEMA realtime OWNER TO supabase_admin;
ALTER SCHEMA extensions OWNER TO supabase_admin;

-- SEARCH PATHS
ALTER ROLE authenticator SET search_path TO public, auth, extensions, storage;
ALTER ROLE anon SET search_path TO public, extensions;
ALTER ROLE authenticated SET search_path TO public, extensions;
ALTER ROLE supabase_admin SET search_path TO public, extensions, realtime;
ALTER ROLE supabase_auth_admin SET search_path TO auth, public;
ALTER ROLE supabase_storage_admin SET search_path TO storage, public;

-- TRANSFERT DE PROPRIÉTÉ SI TABLES EXISTENT DÉJÀ
DO $$ 
BEGIN 
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'auth' AND tablename = 'users') THEN
    ALTER TABLE auth.users OWNER TO supabase_auth_admin;
  END IF;
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'schema_migrations') THEN
    ALTER TABLE public.schema_migrations OWNER TO supabase_auth_admin;
  END IF;
END $$;
