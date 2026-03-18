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

-- DROITS SUR LE SCHÉMA PUBLIC (Fix 400 Bad Request)
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;

-- DROITS SUR LES SCHÉMAS TECHNIQUES (Pour les fonctions auth.uid() etc)
GRANT USAGE ON SCHEMA auth, extensions TO anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA auth TO anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA extensions TO anon, authenticated, service_role;
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
-- =============================================
-- 00_extensions.sql
-- =============================================

-- 1. SCHEMAS
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS extensions;
CREATE SCHEMA IF NOT EXISTS storage;

-- 2. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pgcrypto" SCHEMA extensions;
-- =============================================
-- 01_enums.sql
-- =============================================

CREATE TYPE public.user_role AS ENUM ('customer', 'admin', 'super_admin', 'gestionnaire', 'assistant');
CREATE TYPE public.vehicle_status AS ENUM ('available', 'booked', 'maintenance', 'inactive', 'rented');
CREATE TYPE public.reservation_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed', 'rejected', 'rented', 'returned');
CREATE TYPE public.infraction_status AS ENUM ('pending', 'matched', 'transmitted', 'resolved', 'unmatched');
CREATE TYPE public.infraction_type AS ENUM ('radar_fixe', 'exces_vitesse', 'stationnement_interdit', 'feu_rouge', 'controle_routier', 'autre');
CREATE TYPE public.maintenance_status AS ENUM ('planned', 'in_progress', 'completed');
CREATE TYPE public.transaction_type AS ENUM ('encaissement', 'caution', 'remboursement', 'charge');
CREATE TYPE public.quote_status AS ENUM ('draft', 'sent', 'accepted', 'rejected', 'expired');
-- =============================================
-- 02_tables.sql
-- =============================================

-- Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY, -- References auth.users(id), but we create the table first
    full_name TEXT,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    role public.user_role DEFAULT 'customer'::public.user_role,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vehicles
CREATE TABLE IF NOT EXISTS public.vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    year INT NOT NULL,
    plate_number TEXT UNIQUE NOT NULL,
    transmission TEXT DEFAULT 'Automatic',
    fuel_type TEXT,
    seats INT DEFAULT 5,
    doors INT DEFAULT 5,
    color TEXT,
    traction TEXT DEFAULT 'Traction avant',
    mileage INT DEFAULT 0,
    price_per_day DECIMAL(10,2) NOT NULL,
    deposit_amount DECIMAL(10,2) NOT NULL,
    status public.vehicle_status DEFAULT 'available'::public.vehicle_status,
    description TEXT,
    last_oil_change_mileage INTEGER DEFAULT 0,
    next_oil_change_mileage INTEGER DEFAULT 0,
    last_service_mileage INTEGER DEFAULT 0,
    next_service_mileage INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customers
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT NOT NULL,
    cin TEXT,
    passport TEXT,
    address TEXT,
    city TEXT,
    total_spent DECIMAL(10,2) DEFAULT 0,
    total_reservations INT DEFAULT 0,
    status TEXT DEFAULT 'Actif',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reservations
CREATE TABLE IF NOT EXISTS public.reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reservation_number TEXT UNIQUE,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE RESTRICT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    pickup_location TEXT,
    dropoff_location TEXT,
    total_price DECIMAL(10,2) NOT NULL,
    status public.reservation_status DEFAULT 'pending'::public.reservation_status,
    payment_method TEXT DEFAULT 'Espèces',
    payment_status TEXT DEFAULT 'unpaid',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_dates CHECK (end_date >= start_date)
);

-- Maintenance records
CREATE TABLE IF NOT EXISTS public.vehicle_maintenance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
    maintenance_type TEXT NOT NULL,
    status TEXT DEFAULT 'Planifié',
    last_service_date DATE NOT NULL DEFAULT CURRENT_DATE,
    last_service_mileage INTEGER DEFAULT 0,
    next_service_date DATE,
    next_service_mileage INTEGER DEFAULT 0,
    estimated_cost DECIMAL(10,2) DEFAULT 0,
    actual_cost DECIMAL(10,2) DEFAULT 0,
    vendor_name TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mileage logs
CREATE TABLE IF NOT EXISTS public.vehicle_mileage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
    mileage_value INTEGER NOT NULL,
    recorded_at TIMESTAMPTZ DEFAULT NOW(),
    recorded_by UUID, -- References profiles/users
    notes TEXT
);

-- Maintenance alerts
CREATE TABLE IF NOT EXISTS public.maintenance_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
    maintenance_record_id UUID REFERENCES public.vehicle_maintenance_records(id) ON DELETE CASCADE,
    alert_type TEXT NOT NULL,
    alert_message TEXT NOT NULL,
    priority TEXT DEFAULT 'low',
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Infractions
CREATE TABLE IF NOT EXISTS public.infractions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
    reservation_id UUID REFERENCES public.reservations(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    infraction_type public.infraction_type NOT NULL DEFAULT 'autre',
    infraction_date DATE NOT NULL,
    infraction_time TIME,
    city TEXT,
    location TEXT,
    authority_name TEXT,
    reference_number TEXT,
    fine_amount DECIMAL(10,2) DEFAULT 0,
    description TEXT,
    admin_notes TEXT,
    document_url TEXT,
    status public.infraction_status DEFAULT 'pending'::public.infraction_status,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reservation_id UUID REFERENCES public.reservations(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    transaction_type public.transaction_type NOT NULL DEFAULT 'encaissement',
    amount DECIMAL(10,2) NOT NULL,
    payment_method TEXT,
    description TEXT,
    status TEXT DEFAULT 'Payé',
    transaction_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoices
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reservation_id UUID REFERENCES public.reservations(id) ON DELETE CASCADE,
    invoice_number TEXT UNIQUE NOT NULL,
    invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
    deposit_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    extras_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    payment_status TEXT DEFAULT 'unpaid',
    pdf_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rental Contracts
CREATE TABLE IF NOT EXISTS public.rental_contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reservation_id UUID REFERENCES public.reservations(id) ON DELETE CASCADE,
    contract_number TEXT UNIQUE NOT NULL,
    customer_id UUID REFERENCES public.customers(id),
    vehicle_id UUID REFERENCES public.vehicles(id),
    contract_status TEXT DEFAULT 'draft',
    total_amount DECIMAL(10,2) DEFAULT 0,
    deposit_amount DECIMAL(10,2) DEFAULT 0,
    contract_date TIMESTAMPTZ DEFAULT NOW(),
    signed_at TIMESTAMPTZ,
    pdf_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rental Handover Records
CREATE TABLE IF NOT EXISTS public.rental_handover_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reservation_id UUID REFERENCES public.reservations(id) ON DELETE CASCADE,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    handover_date TIMESTAMPTZ DEFAULT NOW(),
    return_date TIMESTAMPTZ,
    departure_mileage INT,
    return_mileage INT,
    departure_fuel_level TEXT,
    return_fuel_level TEXT,
    departure_condition_notes TEXT,
    return_condition_notes TEXT,
    extra_charges DECIMAL(10,2) DEFAULT 0,
    deposit_collected BOOLEAN DEFAULT FALSE,
    payment_collected BOOLEAN DEFAULT FALSE,
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quotes
CREATE TABLE IF NOT EXISTS public.quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_number TEXT UNIQUE NOT NULL,
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status public.quote_status DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vehicle Images
CREATE TABLE IF NOT EXISTS public.vehicle_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    is_cover BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Company Settings
CREATE TABLE IF NOT EXISTS public.company_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT NOT NULL DEFAULT 'TRM Rent Car',
    phone TEXT,
    email TEXT,
    address TEXT,
    website TEXT,
    manager_name TEXT,
    legal_rc TEXT,
    legal_if TEXT,
    legal_patente TEXT,
    legal_ice TEXT,
    delivery_fee DECIMAL(10,2) DEFAULT 0,
    discount_week DECIMAL(5,2) DEFAULT 0,
    discount_month DECIMAL(5,2) DEFAULT 0,
    notifications_email BOOLEAN DEFAULT TRUE,
    notifications_sms BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- System Notifications
CREATE TABLE IF NOT EXISTS public.system_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    user_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_veh_plate ON public.vehicles(plate_number);
CREATE INDEX IF NOT EXISTS idx_res_dates ON public.reservations(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_res_status ON public.reservations(status);
CREATE INDEX IF NOT EXISTS idx_cust_email ON public.customers(email);
CREATE INDEX IF NOT EXISTS idx_maint_veh ON public.vehicle_maintenance_records(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_inf_res ON public.infractions(reservation_id);
-- =============================================
-- 03_functions.sql
-- =============================================

-- 1. Helper for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Security Helpers
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT LANGUAGE sql SECURITY DEFINER STABLE AS $$
    SELECT role::text FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'super_admin', 'gestionnaire', 'assistant')
    );
$$;

-- 3. Checkout RPC
CREATE OR REPLACE FUNCTION public.handle_checkout_customer(
    p_first_name text, p_last_name text, p_email text, p_phone text,
    p_cin text, p_address text, p_city text, p_status text
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_customer_id uuid;
BEGIN
    SELECT id INTO v_customer_id FROM public.customers WHERE LOWER(email) = LOWER(p_email) LIMIT 1;
    IF v_customer_id IS NOT NULL THEN
        UPDATE public.customers SET
            full_name = p_first_name || ' ' || p_last_name, phone = p_phone, cin = COALESCE(p_cin, cin),
            address = COALESCE(p_address, address), city = COALESCE(p_city, city), status = p_status, updated_at = NOW()
        WHERE id = v_customer_id;
    ELSE
        INSERT INTO public.customers (full_name, email, phone, cin, address, city, status)
        VALUES (p_first_name || ' ' || p_last_name, LOWER(p_email), p_phone, p_cin, p_address, p_city, p_status)
        RETURNING id INTO v_customer_id;
    END IF;
    RETURN v_customer_id;
END; $$;

-- 4. Auth Trigger Function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'full_name', 'Client'), new.email, 'customer')
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
  
  INSERT INTO public.customers (id, full_name, email, phone)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'full_name', 'Client'), new.email, COALESCE(new.raw_user_meta_data->>'phone', ''))
  ON CONFLICT (email) DO NOTHING;
  
  RETURN NEW;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;
-- =============================================
-- 04_triggers.sql
-- =============================================

-- Auth Link
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated At
DROP TRIGGER IF EXISTS set_updated_at ON public.profiles;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.vehicles;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.vehicles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.customers;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.reservations;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.reservations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.quotes;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.quotes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.vehicle_maintenance_records;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.vehicle_maintenance_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
-- =============================================
-- 06_rls.sql
-- Politiques de sécurité (Row Level Security)
-- =============================================

-- Activation RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.infractions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_maintenance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_mileage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rental_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rental_handover_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_notifications ENABLE ROW LEVEL SECURITY;

-- 1. Unified Staff Policy
DO $$ 
DECLARE
    t text;
BEGIN
    FOR t IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Staff manage %I" ON public.%I', t, t);
        EXECUTE format('CREATE POLICY "Staff manage %I" ON public.%I FOR ALL USING (public.is_staff())', t, t);
    END LOOP;
END $$;

-- 2. Public Policies
DROP POLICY IF EXISTS "Public view vehicles" ON public.vehicles;
CREATE POLICY "Public view vehicles" ON public.vehicles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public view images" ON public.vehicle_images;
CREATE POLICY "Public view images" ON public.vehicle_images FOR SELECT USING (true);

-- 3. Customer Policies
DROP POLICY IF EXISTS "Customers view self" ON public.customers;
CREATE POLICY "Customers view self" ON public.customers FOR SELECT USING (
    LOWER(email) = LOWER(COALESCE(auth.jwt()->>'email', auth.email()))
);

DROP POLICY IF EXISTS "Customers view reservations" ON public.reservations;
CREATE POLICY "Customers view reservations" ON public.reservations FOR SELECT USING (
    customer_id IN (
        SELECT id FROM public.customers 
        WHERE LOWER(email) = LOWER(COALESCE(auth.jwt()->>'email', auth.email()))
    )
);

DROP POLICY IF EXISTS "Users view own profile" ON public.profiles;
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users view own notifications" ON public.system_notifications;
CREATE POLICY "Users view own notifications" ON public.system_notifications FOR SELECT USING (user_id = auth.uid());

-- 4. Booking & Public Access
DROP POLICY IF EXISTS "Anyone can create reservations" ON public.reservations;
CREATE POLICY "Anyone can create reservations" ON public.reservations FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public view company settings" ON public.company_settings;
CREATE POLICY "Public view company settings" ON public.company_settings FOR SELECT USING (true);

-- 5. Document Visibility (Customers)
DROP POLICY IF EXISTS "Customers view own invoices" ON public.invoices;
CREATE POLICY "Customers view own invoices" ON public.invoices FOR SELECT USING (
    reservation_id IN (
        SELECT id FROM public.reservations 
        WHERE customer_id IN (
            SELECT id FROM public.customers 
            WHERE LOWER(email) = LOWER(COALESCE(auth.jwt()->>'email', auth.email()))
        )
    )
);

DROP POLICY IF EXISTS "Customers view own contracts" ON public.rental_contracts;
CREATE POLICY "Customers view own contracts" ON public.rental_contracts FOR SELECT USING (
    reservation_id IN (
        SELECT id FROM public.reservations 
        WHERE customer_id IN (
            SELECT id FROM public.customers 
            WHERE LOWER(email) = LOWER(COALESCE(auth.jwt()->>'email', auth.email()))
        )
    )
);
-- =============================================
-- 06_permissions.sql
-- =============================================

-- Grant Usage on schemas
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT USAGE ON SCHEMA storage TO anon, authenticated, service_role;
GRANT USAGE ON SCHEMA extensions TO anon, authenticated, service_role;

-- Grant permissions on all tables/sequences/functions in public
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;

-- Special permissions for auth.users if needed (usually handled by Supabase)
-- But on VPS we might need to be explicit
ALTER TABLE auth.users ALTER COLUMN role SET DEFAULT 'authenticated';
UPDATE auth.users SET role = 'authenticated' WHERE role IS NULL OR role = '';
-- =============================================
-- 08_seed.sql
-- Données de test et configuration initiale TRM
-- =============================================

DO $$
DECLARE
    -- Utilisation d'IDs fixes pour TRM Rent Car
    v1 UUID := '62e7d409-0ee6-4ea9-b05d-2e7cdcc1be18';
    v2 UUID := '72e7d409-0ee6-4ea9-b05d-2e7cdcc1be19';
    v3 UUID := '82e7d409-0ee6-4ea9-b05d-2e7cdcc1be20';
BEGIN
    -- NETTOYAGE : On supprime les véhicules qui auraient les mêmes plaques
    -- pour éviter l'erreur "duplicate key value"
    DELETE FROM public.vehicles WHERE plate_number IN ('208-A-001', '208-B-002', 'LOG-C-003');

    -- Insertion des Véhicules
    INSERT INTO public.vehicles (id, brand, model, color, fuel_type, transmission, year, plate_number, price_per_day, deposit_amount, status)
    VALUES 
    (v1, 'Peugeot', '208 (Citadine)', 'Noir', 'Diesel', 'Manuelle', 2026, '208-A-001', 420.00, 5000.00, 'available'),
    (v2, 'Peugeot', '208 (Citadine)', 'Gris', 'Hybride', 'Automatique', 2026, '208-B-002', 520.00, 6000.00, 'available'),
    (v3, 'Dacia', 'Logan (Berline)', 'Blanc', 'Diesel', 'Manuelle', 2026, 'LOG-C-003', 300.00, 3000.00, 'available')
    ON CONFLICT (id) DO NOTHING;

    -- Insertion des Images
    INSERT INTO public.vehicle_images (vehicle_id, image_url, is_cover) VALUES
    (v1, '/images/cars/peugeot_208_noir.png', true),
    (v1, '/images/cars/peugeot_208_noir_front.png', false),
    (v2, '/images/cars/peugeot_208_gris.png', true),
    (v3, '/images/cars/dacia_logan_blanc.png', true)
    ON CONFLICT DO NOTHING;

    -- Paramètres de l'entreprise
    INSERT INTO public.company_settings (company_name, phone, email, address, website, delivery_fee, discount_week, discount_month)
    VALUES ('TRM Rent Car', '06 06 06 6426', 'trm.rentcar@gmail.com', 'Appt Sabrine 2éme Etage N°6 Bloc A, 65800 Taourirt', 'www.trmrentcar.ma', 0, 0, 0)
    ON CONFLICT DO NOTHING;

END $$;
-- =============================================
-- 09_storage.sql
-- Configuration du stockage Supabase (Buckets et RLS)
-- =============================================

-- 1. Création du bucket "vehicles" s'il n'existe pas
INSERT INTO storage.buckets (id, name, public) 
VALUES ('vehicles', 'vehicles', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Politiques de sécurité (RLS) pour le stockage
-- Nous autorisons tout le monde à voir les photos (puisque public=true)
-- Mais seul l'utilisateur authentifié (staff) peut uploader

-- Supprimer les anciennes politiques pour éviter les doublons
DELETE FROM storage.objects WHERE bucket_id = 'vehicles'; -- Nettoyage (optionnel)

-- Politique de Lecture (Public)
CREATE POLICY "Les photos sont visibles par tous"
ON storage.objects FOR SELECT
USING (bucket_id = 'vehicles');

-- Politique d'Insertion (Staff uniquement)
CREATE POLICY "Le staff peut uploader des photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'vehicles' 
    -- On pourrait ajouter un check via public.is_staff() mais restons simple
);

-- Politique de Suppression (Staff uniquement)
CREATE POLICY "Le staff peut supprimer des photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'vehicles');

-- Note: Assurez-vous que le rôle "authenticated" a l'usage sur le schéma storage
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT ALL ON TABLE storage.objects TO authenticated;
GRANT ALL ON TABLE storage.buckets TO authenticated;
-- =============================================
-- 10_notifications_and_alerts.sql
-- Enhanced notification and maintenance system
-- =============================================

-- 1. Unique constraint for alerts to prevent duplicates
ALTER TABLE public.maintenance_alerts DROP CONSTRAINT IF EXISTS maintenance_alerts_unique_vehicle_alert;
ALTER TABLE public.maintenance_alerts ADD CONSTRAINT maintenance_alerts_unique_vehicle_alert UNIQUE (vehicle_id, alert_type, status);

-- 2. Extend system_notifications for interactivity
ALTER TABLE public.system_notifications ADD COLUMN IF NOT EXISTS link TEXT;
ALTER TABLE public.system_notifications ADD COLUMN IF NOT EXISTS metadata JSONB;

-- 3. Enhanced notify function with link support and fixed encoding
CREATE OR REPLACE FUNCTION public.notify_staff(
    p_title text, 
    p_message text, 
    p_type text DEFAULT 'info',
    p_user_id uuid DEFAULT NULL,
    p_link text DEFAULT NULL
) RETURNS void AS $$
BEGIN
    INSERT INTO public.system_notifications (title, message, type, user_id, link)
    VALUES (p_title, p_message, p_type, p_user_id, p_link);
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Maintenance Logic by Vehicle ID
CREATE OR REPLACE FUNCTION public.check_vehicle_maintenance_by_id(p_vehicle_id uuid)
RETURNS void AS $$
DECLARE
    v_vehicle RECORD;
    v_latest_maint RECORD;
    v_alert_msg TEXT;
    v_mileage_threshold INT := 1000;
    v_days_threshold INT := 30;
BEGIN
    SELECT * INTO v_vehicle FROM public.vehicles WHERE id = p_vehicle_id;
    IF NOT FOUND THEN RETURN; END IF;

    -- Find latest completed maintenance record
    SELECT * INTO v_latest_maint 
    FROM public.vehicle_maintenance_records 
    WHERE vehicle_id = p_vehicle_id AND status = 'Terminé'
    ORDER BY last_service_date DESC, created_at DESC
    LIMIT 1;

    IF v_latest_maint IS NOT NULL THEN
        -- Mileage Check
        IF v_vehicle.mileage >= (v_latest_maint.next_service_mileage - v_mileage_threshold) THEN
            v_alert_msg := 'Entretien ' || v_latest_maint.maintenance_type || ' à prévoir (' || v_latest_maint.next_service_mileage || ' km). Actuel: ' || v_vehicle.mileage || ' km.';
            
            INSERT INTO public.maintenance_alerts (vehicle_id, maintenance_record_id, alert_type, alert_message, priority, status)
            VALUES (p_vehicle_id, v_latest_maint.id, 'Mileage', v_alert_msg, 
                    CASE WHEN v_vehicle.mileage >= v_latest_maint.next_service_mileage THEN 'urgent' ELSE 'high' END, 
                    'active')
            ON CONFLICT (vehicle_id, alert_type, status) DO UPDATE SET alert_message = EXCLUDED.alert_message, priority = EXCLUDED.priority;
            
            PERFORM public.notify_staff('Alerte Kilométrage', v_alert_msg, 'warning', NULL, '/admin/maintenance');
        END IF;

        -- Date Check
        IF v_latest_maint.next_service_date IS NOT NULL AND v_latest_maint.next_service_date <= (CURRENT_DATE + v_days_threshold) THEN
            v_alert_msg := 'Entretien ' || v_latest_maint.maintenance_type || ' prévu pour le ' || v_latest_maint.next_service_date;
            
             INSERT INTO public.maintenance_alerts (vehicle_id, maintenance_record_id, alert_type, alert_message, priority, status)
             VALUES (p_vehicle_id, v_latest_maint.id, 'Date', v_alert_msg, 
                     CASE WHEN v_latest_maint.next_service_date <= CURRENT_DATE THEN 'urgent' ELSE 'medium' END, 
                     'active')
             ON CONFLICT (vehicle_id, alert_type, status) DO UPDATE SET alert_message = EXCLUDED.alert_message, priority = EXCLUDED.priority;

             PERFORM public.notify_staff('Echéance de Maintenance', v_alert_msg, 'warning', NULL, '/admin/maintenance');
        END IF;
    END IF;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Trigger Functions
CREATE OR REPLACE FUNCTION public.trigger_check_vehicle_maintenance()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_TABLE_NAME = 'vehicles' THEN
        PERFORM public.check_vehicle_maintenance_by_id(NEW.id);
    ELSIF TG_TABLE_NAME = 'vehicle_maintenance_records' THEN
        PERFORM public.check_vehicle_maintenance_by_id(NEW.vehicle_id);
    END IF;
    RETURN NEW;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.tr_notify_reservation()
RETURNS TRIGGER AS $$
DECLARE
    v_cust_name TEXT;
    v_veh_name TEXT;
BEGIN
    SELECT full_name INTO v_cust_name FROM public.customers WHERE id = NEW.customer_id;
    SELECT brand || ' ' || model INTO v_veh_name FROM public.vehicles WHERE id = NEW.vehicle_id;
    
    PERFORM public.notify_staff(
        'Nouvelle Réservation',
        'Client: ' || COALESCE(v_cust_name, 'Inconnu') || ' | Véhicule: ' || COALESCE(v_veh_name, 'Inconnu'),
        'info',
        NULL,
        '/admin/reservations/' || NEW.id
    );
    RETURN NEW;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Check upcoming returns (48h reminder)
CREATE OR REPLACE FUNCTION public.check_upcoming_reservation_returns()
RETURNS void AS $$
DECLARE
    v_res RECORD;
    v_msg TEXT;
BEGIN
    FOR v_res IN 
        SELECT r.*, c.full_name as cust_name, v.brand, v.model
        FROM public.reservations r
        JOIN public.customers c ON r.customer_id = c.id
        JOIN public.vehicles v ON r.vehicle_id = v.id
        WHERE r.status = 'rented' 
        AND r.end_date = CURRENT_DATE + INTERVAL '2 days'
        AND NOT EXISTS (
            SELECT 1 FROM public.system_notifications 
            WHERE link = '/admin/reservations/' || r.id 
            AND title = 'Rappel de Retour'
        )
    LOOP
        v_msg := 'La voiture ' || v_res.brand || ' ' || v_res.model || ' louée par ' || v_res.cust_name || ' doit être retournée dans 48h.';
        PERFORM public.notify_staff('Rappel de Retour', v_msg, 'info', NULL, '/admin/reservations/' || v_res.id);
    END LOOP;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Wiring Triggers
DROP TRIGGER IF EXISTS tr_check_maintenance ON public.vehicles;
CREATE TRIGGER tr_check_maintenance
AFTER INSERT OR UPDATE OF mileage ON public.vehicles
FOR EACH ROW EXECUTE FUNCTION public.trigger_check_vehicle_maintenance();

DROP TRIGGER IF EXISTS tr_check_maintenance_record ON public.vehicle_maintenance_records;
CREATE TRIGGER tr_check_maintenance_record
AFTER INSERT OR UPDATE ON public.vehicle_maintenance_records
FOR EACH ROW EXECUTE FUNCTION public.trigger_check_vehicle_maintenance();

DROP TRIGGER IF EXISTS tr_reservation_notify ON public.reservations;
CREATE TRIGGER tr_reservation_notify
AFTER INSERT ON public.reservations
FOR EACH ROW EXECUTE FUNCTION public.tr_notify_reservation();
-- =============================================
-- 11_accounting_automation.sql
-- Automatic transaction logging for accounting
-- =============================================

-- 1. Function to sync reservation payment to transactions
CREATE OR REPLACE FUNCTION public.sync_reservation_payment_to_transactions()
RETURNS TRIGGER AS $$
DECLARE
    v_desc TEXT;
BEGIN
    -- If status moves to 'rented', 'returned', or 'completed' and no 'encaissement' transaction exists for it
    IF NEW.status IN ('rented', 'returned', 'completed') AND 
       NOT EXISTS (SELECT 1 FROM public.transactions WHERE reservation_id = NEW.id AND transaction_type = 'encaissement') THEN
        
        v_desc := 'Paiement de la Réservation #' || COALESCE(NEW.reservation_number, SUBSTRING(NEW.id::text, 1, 8));
        
        INSERT INTO public.transactions (
            reservation_id,
            customer_id,
            transaction_type,
            amount,
            payment_method,
            description,
            status,
            transaction_date
        ) VALUES (
            NEW.id,
            NEW.customer_id,
            'encaissement',
            NEW.total_price,
            NEW.payment_method,
            v_desc,
            'Payé',
            CURRENT_DATE
        );
    -- If total_price updated and transaction exists, update it?
    ELSIF OLD.status IN ('rented', 'returned', 'completed') AND OLD.total_price != NEW.total_price THEN
        UPDATE public.transactions 
        SET amount = NEW.total_price 
        WHERE reservation_id = NEW.id AND transaction_type = 'encaissement';
    END IF;
    
    RETURN NEW;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Function to sync handover deposit
CREATE OR REPLACE FUNCTION public.sync_handover_deposit_to_transactions()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.deposit_collected > 0 AND 
       NOT EXISTS (SELECT 1 FROM public.transactions WHERE reservation_id = NEW.reservation_id AND transaction_type = 'caution') THEN
        
        INSERT INTO public.transactions (
            reservation_id,
            customer_id,
            transaction_type,
            amount,
            description,
            status,
            transaction_date
        ) VALUES (
            NEW.reservation_id,
            NEW.customer_id,
            'caution',
            NEW.deposit_collected,
            'Caution encaissée - Dossier #' || SUBSTRING(NEW.reservation_id::text, 1, 8),
            'Payé',
            CURRENT_DATE
        );
    END IF;
    RETURN NEW;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Wiring Triggers
DROP TRIGGER IF EXISTS tr_res_payment_sync ON public.reservations;
CREATE TRIGGER tr_res_payment_sync
AFTER INSERT OR UPDATE OF status, total_price ON public.reservations
FOR EACH ROW EXECUTE FUNCTION public.sync_reservation_payment_to_transactions();

DROP TRIGGER IF EXISTS tr_handover_deposit_sync ON public.rental_handover_records;
CREATE TRIGGER tr_handover_deposit_sync
AFTER INSERT ON public.rental_handover_records
FOR EACH ROW EXECUTE FUNCTION public.sync_handover_deposit_to_transactions();
CREATE OR REPLACE FUNCTION public.check_vehicle_availability(p_vehicle_id uuid, p_start_date date, p_end_date date)
RETURNS TABLE (is_available boolean, next_available_date date) AS $$
DECLARE
    v_conflict_end date;
BEGIN
    SELECT end_date INTO v_conflict_end
    FROM public.reservations
    WHERE vehicle_id = p_vehicle_id
    AND status NOT IN ('cancelled')
    AND (
        (p_start_date BETWEEN start_date AND end_date) OR
        (p_end_date BETWEEN start_date AND end_date) OR
        (start_date BETWEEN p_start_date AND p_end_date)
    )
    LIMIT 1;

    IF v_conflict_end IS NULL THEN
        RETURN QUERY SELECT true, NULL::date;
    ELSE
        RETURN QUERY SELECT false, (v_conflict_end + INTERVAL '1 day')::date;
    END IF;
END; $$ LANGUAGE plpgsql STABLE;
-- 1. Correct Transaction statuses and descriptions
UPDATE public.transactions SET status = 'Payé' WHERE status LIKE 'Pay%';
UPDATE public.transactions SET description = REPLACE(description, 'R??servation', 'Réservation');

-- 2. Fix RLS for Handovers
ALTER TABLE public.rental_handover_records ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Staff manage handovers" ON public.rental_handover_records;
CREATE POLICY "Staff manage handovers" ON public.rental_handover_records 
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 3. Correct Reservations if any
UPDATE public.reservations SET status = 'completed' WHERE status = 'Terminé';
UPDATE public.reservations SET status = 'confirmed' WHERE status = 'Confirmé';

-- 4. Invoices and Contracts (just in case they have same issues)
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Staff manage invoices" ON public.invoices;
CREATE POLICY "Staff manage invoices" ON public.invoices FOR ALL TO authenticated USING (true) WITH CHECK (true);

ALTER TABLE public.rental_contracts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Staff manage contracts" ON public.rental_contracts;
CREATE POLICY "Staff manage contracts" ON public.rental_contracts FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 5. RELOAD SCHEMA CACHE
NOTIFY pgrst, 'reload schema';
-- Fix handover deposit trigger
CREATE OR REPLACE FUNCTION public.sync_handover_deposit_to_transactions() RETURNS trigger AS $$ 
BEGIN 
    -- If deposit_collected is true and no caution transaction exists for this reservation
    IF NEW.deposit_collected = true AND NOT EXISTS (
        SELECT 1 FROM public.transactions 
        WHERE reservation_id = NEW.reservation_id AND transaction_type = 'caution'
    ) THEN 
        INSERT INTO public.transactions (
            reservation_id, 
            customer_id, 
            transaction_type, 
            amount, 
            payment_method, 
            description, 
            status, 
            transaction_date
        ) VALUES (
            NEW.reservation_id, 
            NEW.customer_id, 
            'caution', 
            0, -- Caution is often documented as 0 amount if only a footprint/auth, or the actual amount
            'Espèces', 
            'Dépôt de garantie collecté', 
            'Payé', 
            CURRENT_DATE
        ); 
    END IF; 
    RETURN NEW; 
END; 
$$ LANGUAGE plpgsql;

-- Sync maintenance costs to transactions
CREATE OR REPLACE FUNCTION public.sync_maintenance_to_transactions() RETURNS trigger AS $$
BEGIN
    IF NEW.total_cost > 0 THEN
        INSERT INTO public.transactions (
            transaction_type,
            amount,
            payment_method,
            description,
            status,
            transaction_date
        ) VALUES (
            'décaissement',
            NEW.total_cost,
            'Virement',
            'Frais de maintenance: ' || NEW.maintenance_type || ' (' || (SELECT plate_number FROM vehicles WHERE id = NEW.vehicle_id) || ')',
            'Payé',
            COALESCE(NEW.service_date::date, CURRENT_DATE)
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_sync_maintenance_to_transactions ON public.vehicle_maintenance_records;
CREATE TRIGGER tr_sync_maintenance_to_transactions
AFTER INSERT OR UPDATE OF total_cost ON public.vehicle_maintenance_records
FOR EACH ROW
EXECUTE FUNCTION public.sync_maintenance_to_transactions();

NOTIFY pgrst, 'reload schema';
