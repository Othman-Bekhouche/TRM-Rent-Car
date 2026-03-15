-- =============================================
-- TRM Rent Car — DESTRUCTIVE RESET & MIGRATION
-- Version: CLEAN START V3
-- =============================================

-- 0. NETTOYAGE TOTAL (On rase tout dans public)
SET search_path TO public, auth, extensions, storage;

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

-- 1. ENUMS
CREATE TYPE user_role AS ENUM ('customer', 'admin', 'super_admin', 'gestionnaire', 'assistant');
CREATE TYPE vehicle_status AS ENUM ('available', 'booked', 'maintenance', 'inactive', 'rented');
CREATE TYPE reservation_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed', 'rejected', 'rented', 'returned');
CREATE TYPE transaction_type AS ENUM ('encaissement', 'caution', 'remboursement', 'charge');

-- 2. TABLES
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY,
    full_name TEXT,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    role user_role DEFAULT 'customer'::user_role,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.customers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT NOT NULL,
    cin TEXT,
    city TEXT,
    status TEXT DEFAULT 'Actif',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.vehicles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    year INT NOT NULL,
    plate_number TEXT UNIQUE NOT NULL,
    color TEXT,
    fuel_type TEXT,
    transmission TEXT,
    price_per_day DECIMAL(10,2) NOT NULL,
    deposit_amount DECIMAL(10,2) NOT NULL,
    status vehicle_status DEFAULT 'available'::vehicle_status,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.vehicle_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    is_cover BOOLEAN DEFAULT FALSE
);

CREATE TABLE public.reservations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID REFERENCES public.customers(id),
    vehicle_id UUID REFERENCES public.vehicles(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    status reservation_status DEFAULT 'pending'::reservation_status,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. AUTOMATISME (Trigger)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Création profil
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'full_name', 'Client'), new.email, 'customer')
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
  
  -- Création customer auto
  INSERT INTO public.customers (id, full_name, email, phone)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'full_name', 'Client'), new.email, COALESCE(new.raw_user_meta_data->>'phone', ''))
  ON CONFLICT (id) DO NOTHING;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. RÉPARATION DES RÔLES (Racine de l'erreur role "")
ALTER ROLE authenticator SET search_path TO public, auth, extensions, storage;
ALTER ROLE anonymous SET search_path TO public, auth, extensions, storage;
ALTER ROLE authenticated SET search_path TO public, auth, extensions, storage;
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- Désactivation RLS pour le test initial (On réactivera plus tard)
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations DISABLE ROW LEVEL SECURITY;

-- 5. DONNÉES LOCALES
INSERT INTO public.vehicles (id, brand, model, color, fuel_type, transmission, year, plate_number, price_per_day, deposit_amount, status)
VALUES 
('11111111-1111-1111-1111-111111111111', 'Peugeot', '208 (Citadine)', 'Noir', 'Diesel', 'Manuelle', 2026, '208-A-001', 420.00, 5000.00, 'available'),
('22222222-2222-2222-2222-222222222222', 'Peugeot', '208 (Citadine)', 'Gris', 'Hybride', 'Automatique', 2026, '208-B-002', 520.00, 6000.00, 'available'),
('33333333-3333-3333-3333-333333333333', 'Dacia', 'Logan (Berline)', 'Blanc', 'Diesel', 'Manuelle', 2026, 'LOG-C-003', 300.00, 3000.00, 'available'),
('44444444-4444-4444-4444-444444444444', 'Dacia', 'Logan (Berline)', 'Gris', 'Diesel', 'Manuelle', 2026, 'LOG-C-004', 300.00, 3000.00, 'rented');

INSERT INTO public.vehicle_images (vehicle_id, image_url, is_cover) VALUES
('11111111-1111-1111-1111-111111111111', '/images/cars/peugeot_208_noir.png', true),
('22222222-2222-2222-2222-222222222222', '/images/cars/peugeot_208_gris.png', true),
('33333333-3333-3333-3333-333333333333', '/images/cars/dacia_logan_blanc.png', true),
('44444444-4444-4444-4444-444444444444', '/images/cars/dacia_logan_gris.png', true);

-- Injection forcée de l'admin
DELETE FROM public.profiles WHERE email = 'admin@trmrentcar.ma';
INSERT INTO public.profiles (id, full_name, email, role)
VALUES ('d5d4d3d2-d1d0-4a9b-8c8d-7e6f5d4c3b2a', 'Med Tahiri', 'admin@trmrentcar.ma', 'super_admin');
