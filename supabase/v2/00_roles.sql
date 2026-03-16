-- =============================================
-- 00_roles.sql
-- Configuration RACINE : Fix définitif de Propriété PG15
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

-- Héritage des rôles pour PostgREST (Fix role "" does not exist)
GRANT anon TO authenticator;
GRANT authenticated TO authenticator;
GRANT service_role TO authenticator;
GRANT supabase_admin TO authenticator;

-- Synchronisation des mots de passe
ALTER ROLE postgres WITH PASSWORD 'trmrentcar2026';
ALTER ROLE authenticator WITH PASSWORD 'trmrentcar2026';
ALTER ROLE supabase_admin WITH PASSWORD 'trmrentcar2026';
ALTER ROLE supabase_auth_admin WITH PASSWORD 'trmrentcar2026';
ALTER ROLE supabase_storage_admin WITH PASSWORD 'trmrentcar2026';

-- Autorisations de connexion de base
GRANT CONNECT ON DATABASE postgres TO supabase_auth_admin, supabase_storage_admin, supabase_admin, authenticator;

-- ROOT FIX POUR POSTGRESQL 15 (Schéma Public)
ALTER SCHEMA public OWNER TO postgres;
GRANT ALL ON SCHEMA public TO public;
GRANT ALL ON SCHEMA public TO postgres, supabase_admin, supabase_auth_admin, supabase_storage_admin;
GRANT USAGE, CREATE ON SCHEMA public TO supabase_auth_admin, supabase_storage_admin;

-- PRÉ-CRÉATION ET OWNERSHIP DES SCHÉMAS
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS storage;
CREATE SCHEMA IF NOT EXISTS realtime;

ALTER SCHEMA auth OWNER TO supabase_auth_admin;
ALTER SCHEMA storage OWNER TO supabase_storage_admin;
ALTER SCHEMA realtime OWNER TO supabase_admin;

-- TRANSFERT DE PROPRIÉTÉ CHIRURGICAL (Fix ERROR: must be owner of table)
-- Cette partie donne tout le contenu des schémas aux admins respectifs
DO $$ 
DECLARE
    r RECORD;
BEGIN 
    -- Transfert pour le schéma AUTH
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'auth') LOOP
        EXECUTE 'ALTER TABLE auth.' || quote_ident(r.tablename) || ' OWNER TO supabase_auth_admin';
    END LOOP;
    FOR r IN (SELECT proname, oidvectortypes(proargtypes) as args FROM pg_proc INNER JOIN pg_namespace ON pg_proc.pronamespace = pg_namespace.oid WHERE pg_namespace.nspname = 'auth') LOOP
        EXECUTE 'ALTER FUNCTION auth.' || quote_ident(r.proname) || '(' || r.args || ') OWNER TO supabase_auth_admin';
    END LOOP;

    -- Transfert pour le schéma STORAGE
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'storage') LOOP
        EXECUTE 'ALTER TABLE storage.' || quote_ident(r.tablename) || ' OWNER TO supabase_storage_admin';
    END LOOP;

    -- Cas spécial : table de migration dans public
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'schema_migrations') THEN
        ALTER TABLE public.schema_migrations OWNER TO supabase_auth_admin;
    END IF;
END $$;

-- SEARCH PATHS COHÉRENTS
ALTER ROLE anon SET search_path TO public, auth, extensions;
ALTER ROLE authenticated SET search_path TO public, auth, extensions;
ALTER ROLE authenticator SET search_path TO public, auth, extensions;
ALTER ROLE supabase_auth_admin SET search_path TO auth, public;
ALTER ROLE supabase_storage_admin SET search_path TO storage, public;
ALTER ROLE supabase_admin SET search_path TO public, extensions, realtime;

-- CONFIGURATION POSTGREST (Fix role "" does not exist)
ALTER ROLE authenticator SET pgrst.db_schemas = 'public, auth, storage';
ALTER ROLE authenticator SET pgrst.db_anon_role = 'anon';

-- USAGE SUR LES SCHÉMAS TECHNIQUES (Essentiel pour auth.uid())
GRANT USAGE ON SCHEMA public, auth, storage, extensions TO anon, authenticated, service_role;
