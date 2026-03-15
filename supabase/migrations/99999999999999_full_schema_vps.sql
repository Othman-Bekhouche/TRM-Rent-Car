-- =============================================
-- TRM Rent Car — MASTER STRICT SCHEMA (VPS)
-- Mirrors Local Environment Exactly
-- =============================================

-- 0. Préparation de l'environnement
SET search_path TO public, auth, extensions, storage;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Nettoyage (On repart de zéro pour éviter les conflits)
DROP TABLE IF EXISTS public.vehicle_maintenance_records CASCADE;
DROP TABLE IF EXISTS public.maintenance_alerts CASCADE;
DROP TABLE IF EXISTS public.vehicle_mileage_logs CASCADE;
DROP TABLE IF EXISTS public.gps_tracking CASCADE;
DROP TABLE IF EXISTS public.transactions CASCADE;
DROP TABLE IF EXISTS public.maintenance CASCADE;
DROP TABLE IF EXISTS public.infractions CASCADE;
DROP TABLE IF EXISTS public.rental_handover_records CASCADE;
DROP TABLE IF EXISTS public.rental_contracts CASCADE;
DROP TABLE IF EXISTS public.invoices CASCADE;
DROP TABLE IF EXISTS public.quotes CASCADE;
DROP TABLE IF EXISTS public.reservations CASCADE;
DROP TABLE IF EXISTS public.vehicle_images CASCADE;
DROP TABLE IF EXISTS public.vehicles CASCADE;
DROP TABLE IF EXISTS public.customers CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.company_settings CASCADE;
DROP TABLE IF EXISTS public.system_notifications CASCADE;

-- 2. ENUMS
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
END $$;

-- 3. TABLES (Structure Complète)
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
    passport TEXT,
    address TEXT,
    city TEXT,
    total_spent DECIMAL(10,2) DEFAULT 0,
    total_reservations INT DEFAULT 0,
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
    seats INT DEFAULT 5,
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
    payment_status TEXT DEFAULT 'unpaid',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reservation_id UUID REFERENCES public.reservations(id),
    customer_id UUID REFERENCES public.customers(id),
    transaction_type TEXT NOT NULL, -- 'encaissement', 'remboursement'
    amount DECIMAL(10,2) NOT NULL,
    transaction_date DATE DEFAULT CURRENT_DATE,
    status TEXT DEFAULT 'Payé'
);

CREATE TABLE public.invoices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reservation_id UUID REFERENCES public.reservations(id) ON DELETE CASCADE,
    invoice_number TEXT UNIQUE NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    pdf_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. POLITIQUES DE SÉCURITÉ (RLS) - "Strictement comme local"
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- Profiles: Chacun voit le sien, Admin voit tout
CREATE POLICY "Profiles viewable by self" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins manage profiles" ON public.profiles FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- Vehicles: Tout le monde voit, Admin gère
CREATE POLICY "Vehicles viewable by everyone" ON public.vehicles FOR SELECT USING (true);
CREATE POLICY "Admins manage vehicles" ON public.vehicles FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'gestionnaire'))
);

-- Reservations: Clients voient les leurs, Staff voit tout
CREATE POLICY "Customers view own reservations" ON public.reservations FOR SELECT USING (
  customer_id IN (SELECT id FROM public.customers WHERE email = auth.jwt()->>'email')
);
CREATE POLICY "Staff manage all reservations" ON public.reservations FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'gestionnaire', 'assistant'))
);

-- 5. DROITS D'ACCÈS (GRANTS) - INDISPENSABLE
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- 6. DONNÉES DE BASE (Voitures et Admin)
INSERT INTO public.vehicles (id, brand, model, color, fuel_type, transmission, year, plate_number, price_per_day, deposit_amount, status)
VALUES 
('11111111-1111-1111-1111-111111111111', 'Peugeot', '208', 'Noir', 'Diesel', 'Manuelle', 2026, '208-A-001', 420.00, 5000.00, 'available'),
('22222222-2222-2222-2222-222222222222', 'Peugeot', '208', 'Gris', 'Diesel', 'Automatique', 2026, '208-B-002', 520.00, 6000.00, 'available'),
('33333333-3333-3333-3333-333333333333', 'Dacia', 'Logan', 'Blanc', 'Diesel', 'Manuelle', 2026, 'LOG-C-003', 300.00, 3000.00, 'available')
ON CONFLICT DO NOTHING;

-- Injection forcée de l'Admin principal (Attention: remplacez par votre ID réel si possible)
DELETE FROM public.profiles WHERE email = 'admin@trmrentcar.ma';
INSERT INTO public.profiles (id, full_name, email, role)
VALUES ('d5d4d3d2-d1d0-4a9b-8c8d-7e6f5d4c3b2a', 'Med Tahiri', 'admin@trmrentcar.ma', 'super_admin');

-- 7. Trigger Automatique Identique au Local
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
