-- =============================================
-- TRM Rent Car — FULL CONSOLIDATED SCHEMA (VPS)
-- Version: MASTER SYNC - DATA INCLUDED
-- =============================================

-- 0. Préparation
SET search_path TO public, auth, extensions, storage;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. ENUMS
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('customer', 'admin', 'super_admin', 'gestionnaire', 'assistant');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vehicle_status') THEN
        CREATE TYPE vehicle_status AS ENUM ('available', 'booked', 'maintenance', 'inactive', 'rented');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'reservation_status') THEN
        CREATE TYPE reservation_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed', 'rejected', 'rented', 'returned');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'infraction_status') THEN
        CREATE TYPE infraction_status AS ENUM ('pending', 'matched', 'transmitted', 'resolved', 'unmatched');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'infraction_type') THEN
        CREATE TYPE infraction_type AS ENUM ('radar_fixe', 'exces_vitesse', 'stationnement_interdit', 'feu_rouge', 'controle_routier', 'autre');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'maintenance_status') THEN
        CREATE TYPE maintenance_status AS ENUM ('planned', 'in_progress', 'completed');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_type') THEN
        CREATE TYPE transaction_type AS ENUM ('encaissement', 'caution', 'remboursement', 'charge');
    END IF;
END $$;

-- 2. Tables de Base
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY,
    full_name TEXT,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    role user_role DEFAULT 'customer'::user_role,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.customers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT NOT NULL,
    cin TEXT,
    address TEXT,
    city TEXT,
    total_spent DECIMAL(10,2) DEFAULT 0,
    total_reservations INT DEFAULT 0,
    status TEXT DEFAULT 'Actif',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.vehicles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    year INT NOT NULL,
    plate_number TEXT UNIQUE NOT NULL,
    color TEXT,
    fuel_type TEXT,
    transmission TEXT,
    seats INT DEFAULT 5,
    doors INT DEFAULT 5,
    traction TEXT,
    price_per_day DECIMAL(10,2) NOT NULL,
    deposit_amount DECIMAL(10,2) NOT NULL,
    status vehicle_status DEFAULT 'available'::vehicle_status,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.vehicle_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    is_cover BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.reservations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID REFERENCES public.customers(id),
    vehicle_id UUID REFERENCES public.vehicles(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    pickup_location TEXT,
    return_location TEXT,
    total_price DECIMAL(10,2) NOT NULL,
    status reservation_status DEFAULT 'pending'::reservation_status,
    payment_status TEXT DEFAULT 'unpaid',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reservation_id UUID REFERENCES public.reservations(id),
    customer_id UUID REFERENCES public.customers(id),
    transaction_type transaction_type NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method TEXT,
    description TEXT,
    status TEXT DEFAULT 'Payé',
    transaction_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Automatisme d'Inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'full_name', 'Client'), new.email, 'customer')
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
  
  INSERT INTO public.customers (id, full_name, email, phone)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'full_name', 'Client'), new.email, COALESCE(new.raw_user_meta_data->>'phone', ''))
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Nettoyage et Permissions
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions DISABLE ROW LEVEL SECURITY;

GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role, postgres;
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- 5. INSERTION DES DONNÉES RÉELLES (LOCAL -> VPS)
DO $$
DECLARE
    -- Véhicules fixes
    v1 UUID := '11111111-1111-1111-1111-111111111111';
    v2 UUID := '22222222-2222-2222-2222-222222222222';
    v3 UUID := '33333333-3333-3333-3333-333333333333';
    v4 UUID := '44444444-4444-4444-4444-444444444444';
    v5 UUID := '55555555-5555-5555-5555-555555555555';
BEGIN
    -- Véhicules
    INSERT INTO public.vehicles (id, brand, model, color, fuel_type, transmission, year, plate_number, price_per_day, deposit_amount, status)
    VALUES 
    (v1, 'Peugeot', '208 (Citadine)', 'Noir', 'Diesel', 'Manuelle', 2026, '208-A-001', 420.00, 5000.00, 'available'),
    (v2, 'Peugeot', '208 (Citadine)', 'Gris', 'Hybride', 'Automatique', 2026, '208-B-002', 520.00, 6000.00, 'available'),
    (v3, 'Dacia', 'Logan (Berline)', 'Blanc', 'Diesel', 'Manuelle', 2026, 'LOG-C-003', 300.00, 3000.00, 'available'),
    (v4, 'Dacia', 'Logan (Berline)', 'Gris', 'Diesel', 'Manuelle', 2026, 'LOG-C-004', 300.00, 3000.00, 'rented'),
    (v5, 'Range Rover', 'Evoque (SUV)', 'Gris', 'Diesel', 'Automatique', 2026, 'RRE-E-008', 1200.00, 15000.00, 'available')
    ON CONFLICT (id) DO NOTHING;

    -- Images
    INSERT INTO public.vehicle_images (vehicle_id, image_url, is_cover) VALUES
    (v1, '/images/cars/peugeot_208_noir.png', true),
    (v2, '/images/cars/peugeot_208_gris.png', true),
    (v3, '/images/cars/dacia_logan_blanc.png', true),
    (v4, '/images/cars/dacia_logan_gris.png', true),
    (v5, '/images/cars/range_rover_evoque.png', true)
    ON CONFLICT DO NOTHING;

    -- Profil Admin (Vôtre)
    INSERT INTO public.profiles (id, full_name, email, role)
    VALUES ('d5d4d3d2-d1d0-4a9b-8c8d-7e6f5d4c3b2a', 'Med Tahiri', 'admin@trmrentcar.ma', 'super_admin')
    ON CONFLICT (id) DO UPDATE SET role = 'super_admin';
END $$;
