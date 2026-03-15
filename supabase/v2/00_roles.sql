-- =============================================
-- 00_roles.sql
-- =============================================

DO $$ 
BEGIN
    -- Core Supabase Roles
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'anon') THEN
        CREATE ROLE anon nologin;
    END IF;
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'authenticated') THEN
        CREATE ROLE authenticated nologin;
    END IF;
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'service_role') THEN
        CREATE ROLE service_role nologin;
    END IF;
    
    -- Authenticator (The bridge role)
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'authenticator') THEN
        CREATE ROLE authenticator WITH LOGIN NOINHERIT PASSWORD 'postgres';
    END IF;

    -- Admin Roles (Optional but good for VPS)
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'supabase_auth_admin') THEN
        CREATE ROLE supabase_auth_admin WITH LOGIN PASSWORD 'postgres';
    END IF;
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'supabase_storage_admin') THEN
        CREATE ROLE supabase_storage_admin WITH LOGIN PASSWORD 'postgres';
    END IF;
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'supabase_admin') THEN
        CREATE ROLE supabase_admin WITH LOGIN SUPERUSER PASSWORD 'postgres';
    END IF;

END $$;

-- Grant roles to authenticator
GRANT anon, authenticated, service_role TO authenticator;

-- Set search path for roles
ALTER ROLE authenticator SET search_path TO public, auth, extensions, storage;
ALTER ROLE anon SET search_path TO public, extensions;
ALTER ROLE authenticated SET search_path TO public, extensions;

-- CRITICAL FIX FOR POSTGRES 15 (Self-hosted)
-- Permet aux services Supabase (Auth, Storage) de créer leurs tables internes dans public
ALTER SCHEMA public OWNER TO postgres;
GRANT ALL ON SCHEMA public TO public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO supabase_admin;
GRANT ALL ON SCHEMA public TO supabase_auth_admin;
GRANT ALL ON SCHEMA public TO supabase_storage_admin;

-- Grant usage for API roles
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
