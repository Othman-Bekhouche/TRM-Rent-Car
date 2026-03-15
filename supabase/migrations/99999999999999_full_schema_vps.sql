-- =============================================
-- TRM Rent Car — GRAND UNIFIED SCHEMA (VPS)
-- Version: 2.0 - COMPLETE MIRROR OF LOCAL + ALL FIXES
-- =============================================

-- 0. ROLES & SECURITY INFRASTRUCTURE
-- (Crucial for fixing 'role "" does not exist' and permission issues)
DO $$
BEGIN
    -- Core Roles
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'anon') THEN CREATE ROLE anon NOLOGIN NOINHERIT; END IF;
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'authenticated') THEN CREATE ROLE authenticated NOLOGIN NOINHERIT; END IF;
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'service_role') THEN CREATE ROLE service_role NOLOGIN NOINHERIT; END IF;

    -- Authenticator (The API bridge)
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'authenticator') THEN 
        CREATE ROLE authenticator NOINHERIT LOGIN;
    END IF;

    -- Hierarchy
    GRANT anon, authenticated, service_role TO authenticator;
END $$;

-- 1. EXTENSIONS & SCHEMAS
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS extensions;
CREATE SCHEMA IF NOT EXISTS storage;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pgcrypto" SCHEMA extensions;

-- Set search paths
ALTER ROLE authenticator SET search_path TO public, auth, extensions, storage;
ALTER ROLE anon SET search_path TO public, extensions;
ALTER ROLE authenticated SET search_path TO public, extensions;

-- 2. CLEAR PREVIOUS STRUCTURE (SAFE RESTART)
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;
    FOR r IN (SELECT typname FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace WHERE n.nspname = 'public') LOOP
        EXECUTE 'DROP TYPE IF EXISTS public.' || quote_ident(r.typname) || ' CASCADE';
    END LOOP;
END $$;

-- 3. ENUMS
CREATE TYPE public.user_role AS ENUM ('customer', 'admin', 'super_admin', 'gestionnaire', 'assistant');
CREATE TYPE public.vehicle_status AS ENUM ('available', 'booked', 'maintenance', 'inactive', 'rented');
CREATE TYPE public.reservation_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed', 'rejected', 'rented', 'returned');
CREATE TYPE public.infraction_status AS ENUM ('pending', 'matched', 'transmitted', 'resolved', 'unmatched');
CREATE TYPE public.infraction_type AS ENUM ('radar_fixe', 'exces_vitesse', 'stationnement_interdit', 'feu_rouge', 'controle_routier', 'autre');
CREATE TYPE public.maintenance_status AS ENUM ('planned', 'in_progress', 'completed');
CREATE TYPE public.transaction_type AS ENUM ('encaissement', 'caution', 'remboursement', 'charge');
CREATE TYPE public.quote_status AS ENUM ('draft', 'sent', 'accepted', 'rejected', 'expired');

-- 4. BASIC TRIGGER FUNCTIONS
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. TABLES

-- Profiles
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    role public.user_role DEFAULT 'customer'::public.user_role,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vehicles
CREATE TABLE public.vehicles (
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
CREATE TABLE public.customers (
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
CREATE TABLE public.reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE RESTRICT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    pickup_location TEXT,
    return_location TEXT,
    total_price DECIMAL(10,2) NOT NULL,
    status public.reservation_status DEFAULT 'pending'::public.reservation_status,
    payment_status TEXT DEFAULT 'unpaid',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_dates CHECK (end_date >= start_date)
);

-- Maintenance Module
CREATE TABLE public.vehicle_maintenance_records (
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

CREATE TABLE public.vehicle_mileage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
    mileage_value INTEGER NOT NULL,
    recorded_at TIMESTAMPTZ DEFAULT NOW(),
    recorded_by UUID REFERENCES auth.users(id),
    notes TEXT
);

CREATE TABLE public.maintenance_alerts (
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
CREATE TABLE public.infractions (
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

-- Accounting
CREATE TABLE public.transactions (
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

CREATE TABLE public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reservation_id UUID REFERENCES public.reservations(id) ON DELETE CASCADE,
    invoice_number TEXT UNIQUE NOT NULL,
    invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    payment_status TEXT DEFAULT 'unpaid',
    pdf_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contracts & Operations
CREATE TABLE public.rental_contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reservation_id UUID REFERENCES public.reservations(id) ON DELETE CASCADE,
    contract_number TEXT UNIQUE NOT NULL,
    pdf_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.rental_handover_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reservation_id UUID REFERENCES public.reservations(id) ON DELETE CASCADE,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    handover_date TIMESTAMPTZ DEFAULT NOW(),
    return_date TIMESTAMPTZ,
    mileage_out INT,
    mileage_in INT,
    fuel_level_out TEXT,
    fuel_level_in TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quotes
CREATE TABLE public.quotes (
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

-- Fleet Images
CREATE TABLE public.vehicle_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    is_cover BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Settings & Notifications
CREATE TABLE public.company_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT NOT NULL DEFAULT 'TRM Rent Car',
    phone TEXT,
    email TEXT,
    address TEXT,
    website TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.system_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. INDEXES
CREATE INDEX idx_veh_plate ON public.vehicles(plate_number);
CREATE INDEX idx_res_dates ON public.reservations(start_date, end_date);
CREATE INDEX idx_res_status ON public.reservations(status);
CREATE INDEX idx_cust_email ON public.customers(email);
CREATE INDEX idx_maint_veh ON public.vehicle_maintenance_records(vehicle_id);
CREATE INDEX idx_inf_res ON public.infractions(reservation_id);

-- 7. FUNCTIONS (RPC & SECURITY HELPERS)

-- Security Helpers
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

-- Checkout RPC
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

-- Auth Trigger
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

-- 8. TRIGGERS
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.vehicles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.reservations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.quotes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.vehicle_maintenance_records FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 9. SECURITY (RLS)
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

-- Unified Staff Policy
DO $$ 
DECLARE
    t text;
BEGIN
    FOR t IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Staff manage %I" ON public.%I', t, t);
        EXECUTE format('CREATE POLICY "Staff manage %I" ON public.%I FOR ALL USING (public.is_staff())', t, t);
    END LOOP;
END $$;

-- Public/Customer Policies
CREATE POLICY "Public view vehicles" ON public.vehicles FOR SELECT USING (true);
CREATE POLICY "Public view images" ON public.vehicle_images FOR SELECT USING (true);
CREATE POLICY "Allow public lookup for checkout." ON public.customers FOR SELECT USING (true);

-- Visibility mirroring fix_rls_visibility.sql
CREATE POLICY "Customers view self" ON public.customers FOR SELECT USING (
    LOWER(email) = LOWER(COALESCE(auth.jwt()->>'email', auth.email()))
);
CREATE POLICY "Customers view reservations" ON public.reservations FOR SELECT USING (
    customer_id IN (SELECT id FROM public.customers WHERE LOWER(email) = LOWER(COALESCE(auth.jwt()->>'email', auth.email())))
);

-- 10. STORAGE SETUP
INSERT INTO storage.buckets (id, name, public) VALUES ('vehicles', 'vehicles', true) ON CONFLICT (id) DO NOTHING;
CREATE POLICY "Public Access for Vehicle Images" ON storage.objects FOR SELECT USING (bucket_id = 'vehicles');
CREATE POLICY "Staff manage vehicle storage" ON storage.objects FOR ALL USING (
    bucket_id = 'vehicles' AND EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin', 'gestionnaire', 'assistant'))
);

-- 11. PERMISSIONS (FINAL GRANT)
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT USAGE ON SCHEMA storage TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;

-- Force default role for new users in the Auth schema (Crucial for PostgREST)
ALTER TABLE auth.users ALTER COLUMN role SET DEFAULT 'authenticated';
UPDATE auth.users SET role = 'authenticated' WHERE role IS NULL OR role = '';

-- 12. SEED DATA
DO $$
DECLARE
    v1 UUID := gen_random_uuid();
    v2 UUID := gen_random_uuid();
    v3 UUID := gen_random_uuid();
BEGIN
    INSERT INTO public.vehicles (id, brand, model, color, fuel_type, transmission, year, plate_number, price_per_day, deposit_amount, status)
    VALUES 
    (v1, 'Peugeot', '208 (Citadine)', 'Noir', 'Diesel', 'Manuelle', 2026, '208-A-001', 420.00, 5000.00, 'available'),
    (v2, 'Peugeot', '208 (Citadine)', 'Gris', 'Hybride', 'Automatique', 2026, '208-B-002', 520.00, 6000.00, 'available'),
    (v3, 'Dacia', 'Logan (Berline)', 'Blanc', 'Diesel', 'Manuelle', 2026, 'LOG-C-003', 300.00, 3000.00, 'available');

    INSERT INTO public.vehicle_images (vehicle_id, image_url, is_cover) VALUES
    (v1, '/images/cars/peugeot_208_noir.png', true),
    (v1, '/images/cars/peugeot_208_noir_front.png', false),
    (v2, '/images/cars/peugeot_208_gris.png', true),
    (v3, '/images/cars/dacia_logan_blanc.png', true);
END $$;
