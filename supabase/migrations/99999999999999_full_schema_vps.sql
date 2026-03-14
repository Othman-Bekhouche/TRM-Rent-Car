-- =============================================
-- TRM Rent Car — FULL CONSOLIDATED SCHEMA (VPS)
-- This file contains all tables, enums, functions, and RLS policies
-- =============================================

-- 0. Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. ENUMS (Wait for GoTrue to create its schema if needed, but here we define our own)
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
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'quote_status') THEN
        CREATE TYPE quote_status AS ENUM ('draft', 'sent', 'accepted', 'rejected', 'expired');
    END IF;
END $$;

-- 2. Utility Functions
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Core Tables
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
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

CREATE TABLE IF NOT EXISTS public.vehicles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE RESTRICT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    pickup_location TEXT,
    return_location TEXT,
    total_price DECIMAL(10,2) NOT NULL,
    status reservation_status DEFAULT 'pending'::reservation_status,
    payment_status TEXT DEFAULT 'unpaid',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_dates CHECK (end_date >= start_date)
);

-- 4. Extended Tables
CREATE TABLE IF NOT EXISTS public.infractions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
    reservation_id UUID REFERENCES public.reservations(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    infraction_type infraction_type NOT NULL DEFAULT 'autre',
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
    status infraction_status DEFAULT 'pending'::infraction_status,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.maintenance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
    maintenance_type TEXT NOT NULL,
    description TEXT,
    maintenance_date DATE NOT NULL,
    next_maintenance_date DATE,
    mileage_at_maintenance INT,
    cost DECIMAL(10,2) DEFAULT 0,
    status maintenance_status DEFAULT 'planned'::maintenance_status,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reservation_id UUID REFERENCES public.reservations(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    transaction_type transaction_type NOT NULL DEFAULT 'encaissement',
    amount DECIMAL(10,2) NOT NULL,
    payment_method TEXT,
    description TEXT,
    status TEXT DEFAULT 'Payé',
    transaction_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.gps_tracking (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
    latitude DECIMAL(10,7),
    longitude DECIMAL(10,7),
    speed DECIMAL(5,1) DEFAULT 0,
    heading DECIMAL(5,1) DEFAULT 0,
    location_name TEXT,
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.vehicle_mileage_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
    mileage_value INT NOT NULL,
    recorded_at TIMESTAMPTZ DEFAULT NOW(),
    recorded_by TEXT,
    notes TEXT
);

CREATE TABLE IF NOT EXISTS public.maintenance_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
    maintenance_record_id UUID REFERENCES public.maintenance(id) ON DELETE SET NULL,
    alert_type TEXT NOT NULL DEFAULT 'Mileage',
    alert_message TEXT NOT NULL,
    priority TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.vehicle_maintenance_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
    maintenance_type TEXT NOT NULL,
    description TEXT,
    maintenance_date DATE NOT NULL,
    next_maintenance_date DATE,
    next_service_date DATE,
    next_service_mileage INT,
    mileage_at_maintenance INT,
    cost DECIMAL(10,2) DEFAULT 0,
    estimated_cost DECIMAL(10,2) DEFAULT 0,
    actual_cost DECIMAL(10,2) DEFAULT 0,
    status maintenance_status DEFAULT 'planned'::maintenance_status,
    vendor_name TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.system_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    link TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.company_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_name TEXT NOT NULL DEFAULT 'TRM Rent Car',
    phone TEXT,
    email TEXT,
    address TEXT,
    website TEXT,
    base_deposit NUMERIC(10,2) DEFAULT 3000,
    delivery_fee NUMERIC(10,2) DEFAULT 100,
    discount_week NUMERIC(5,2) DEFAULT 10,
    discount_month NUMERIC(5,2) DEFAULT 20,
    notifications_email BOOLEAN DEFAULT TRUE,
    notifications_sms BOOLEAN DEFAULT FALSE,
    updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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

CREATE TABLE IF NOT EXISTS public.rental_contracts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reservation_id UUID REFERENCES public.reservations(id) ON DELETE CASCADE,
    contract_number TEXT UNIQUE NOT NULL,
    contract_date DATE NOT NULL DEFAULT CURRENT_DATE,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
    departure_mileage INT,
    return_mileage INT,
    fuel_level_departure TEXT,
    fuel_level_return TEXT,
    vehicle_condition_departure TEXT,
    vehicle_condition_return TEXT,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    deposit_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    contract_status TEXT DEFAULT 'draft',
    pdf_url TEXT,
    signed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.rental_handover_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reservation_id UUID REFERENCES public.reservations(id) ON DELETE CASCADE UNIQUE,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    handover_date TIMESTAMPTZ,
    departure_mileage INT,
    departure_fuel_level TEXT,
    departure_condition_notes TEXT,
    return_date TIMESTAMPTZ,
    return_mileage INT,
    return_fuel_level TEXT,
    return_condition_notes TEXT,
    accessories_checklist JSONB DEFAULT '{}',
    deposit_collected BOOLEAN DEFAULT FALSE,
    payment_collected BOOLEAN DEFAULT FALSE,
    extra_charges DECIMAL(10,2) DEFAULT 0,
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.quotes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    quote_number TEXT UNIQUE NOT NULL,
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    pickup_location TEXT,
    dropoff_location TEXT,
    daily_rate DECIMAL(10,2) NOT NULL,
    total_days INT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status quote_status DEFAULT 'draft',
    valid_until DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Indexes
CREATE INDEX IF NOT EXISTS idx_infractions_vehicle ON public.infractions(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_infractions_customer ON public.infractions(customer_id);
CREATE INDEX IF NOT EXISTS idx_infractions_date ON public.infractions(infraction_date);
CREATE INDEX IF NOT EXISTS idx_infractions_status ON public.infractions(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_vehicle ON public.maintenance(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_date ON public.maintenance(maintenance_date);
CREATE INDEX IF NOT EXISTS idx_transactions_customer ON public.transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_gps_vehicle ON public.gps_tracking(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_gps_recorded ON public.gps_tracking(recorded_at);
CREATE INDEX IF NOT EXISTS idx_customers_cin ON public.customers(cin);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers(phone);
CREATE INDEX IF NOT EXISTS idx_mileage_logs_vehicle ON public.vehicle_mileage_logs(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_mileage_logs_recorded ON public.vehicle_mileage_logs(recorded_at);
CREATE INDEX IF NOT EXISTS idx_alerts_vehicle ON public.maintenance_alerts(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON public.maintenance_alerts(status);
CREATE INDEX IF NOT EXISTS idx_vmr_vehicle ON public.vehicle_maintenance_records(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_quotes_customer ON public.quotes(customer_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON public.quotes(status);

-- 6. Helper Functions & Triggers
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT role::text FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION match_infraction_to_reservation()
RETURNS TRIGGER AS $$
DECLARE
    matched_reservation RECORD;
    infraction_ts TIMESTAMPTZ;
BEGIN
    IF NEW.infraction_time IS NOT NULL THEN
        infraction_ts := (NEW.infraction_date + NEW.infraction_time)::TIMESTAMPTZ;
    END IF;

    IF infraction_ts IS NOT NULL THEN
        SELECT h.reservation_id, h.customer_id
        INTO matched_reservation
        FROM public.rental_handover_records h
        WHERE h.vehicle_id = NEW.vehicle_id
          AND h.handover_date <= infraction_ts
          AND (h.return_date >= infraction_ts OR h.return_date IS NULL)
        LIMIT 1;
    END IF;

    IF matched_reservation IS NULL THEN
        SELECT r.id AS reservation_id, r.customer_id
        INTO matched_reservation
        FROM public.reservations r
        WHERE r.vehicle_id = NEW.vehicle_id
          AND r.start_date <= NEW.infraction_date
          AND r.end_date >= NEW.infraction_date
          AND r.status IN ('confirmed', 'completed', 'rented', 'returned')
        ORDER BY r.start_date DESC
        LIMIT 1;
    END IF;

    IF matched_reservation IS NOT NULL THEN
        NEW.reservation_id := matched_reservation.reservation_id;
        NEW.customer_id := matched_reservation.customer_id;
        NEW.status := 'matched';
    ELSE
        NEW.status := 'unmatched';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION notify_new_reservation()
RETURNS TRIGGER
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.system_notifications (title, message, type, link)
    VALUES (
        'Nouvelle Réservation', 
        'Une nouvelle réservation a été créée. En attente de validation.', 
        'success', 
        '/admin/reservations'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.handle_checkout_customer(
    p_first_name text,
    p_last_name text,
    p_email text,
    p_phone text,
    p_cin text,
    p_address text,
    p_city text,
    p_status text
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_customer_id uuid;
BEGIN
    IF p_email IS NOT NULL AND p_email != '' THEN
        SELECT id INTO v_customer_id FROM public.customers WHERE LOWER(email) = LOWER(p_email) LIMIT 1;
    END IF;
    
    IF v_customer_id IS NOT NULL THEN
        UPDATE public.customers SET
            full_name = p_first_name || ' ' || p_last_name,
            phone = p_phone,
            cin = COALESCE(p_cin, cin),
            address = COALESCE(p_address, address),
            city = COALESCE(p_city, city),
            status = p_status,
            updated_at = NOW()
        WHERE id = v_customer_id;
    ELSE
        INSERT INTO public.customers (full_name, email, phone, cin, address, city, status)
        VALUES (p_first_name || ' ' || p_last_name, LOWER(NULLIF(p_email, '')), p_phone, p_cin, p_address, p_city, p_status)
        RETURNING id INTO v_customer_id;
    END IF;
    
    RETURN v_customer_id;
END;
$$;

-- Triggers
CREATE TRIGGER trigger_match_infraction BEFORE INSERT ON public.infractions FOR EACH ROW WHEN (NEW.reservation_id IS NULL) EXECUTE FUNCTION match_infraction_to_reservation();
CREATE TRIGGER trigger_notify_new_reservation AFTER INSERT ON public.reservations FOR EACH ROW EXECUTE FUNCTION notify_new_reservation();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.vehicles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.reservations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.infractions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.maintenance FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.vehicle_maintenance_records FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.company_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.rental_contracts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.rental_handover_records FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.quotes FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 7. RLS & Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.infractions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gps_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_mileage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_maintenance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rental_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rental_handover_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Staff can manage all profiles." ON public.profiles FOR ALL USING (public.get_my_role() IN ('admin', 'super_admin'));

CREATE POLICY "Vehicles are viewable by everyone." ON public.vehicles FOR SELECT USING (true);
CREATE POLICY "Staff can manage vehicles." ON public.vehicles FOR ALL USING (public.get_my_role() IN ('admin', 'super_admin', 'gestionnaire', 'assistant'));

CREATE POLICY "Vehicle images are viewable by everyone." ON public.vehicle_images FOR SELECT USING (true);
CREATE POLICY "Staff can manage vehicle images." ON public.vehicle_images FOR ALL USING (public.get_my_role() IN ('admin', 'super_admin', 'gestionnaire', 'assistant'));

CREATE POLICY "Staff can manage all reservations." ON public.reservations FOR ALL USING (public.get_my_role() IN ('admin', 'super_admin', 'gestionnaire', 'assistant'));
CREATE POLICY "Public can insert reservations." ON public.reservations FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view own reservations." ON public.reservations FOR SELECT USING (customer_id IN (SELECT id FROM public.customers WHERE LOWER(email) = LOWER(auth.jwt()->>'email')));

CREATE POLICY "Staff can manage customers." ON public.customers FOR ALL USING (public.get_my_role() IN ('admin', 'super_admin', 'gestionnaire', 'assistant'));
CREATE POLICY "Public can view customers." ON public.customers FOR SELECT USING (true);
CREATE POLICY "Public can insert customers." ON public.customers FOR INSERT WITH CHECK (true);

CREATE POLICY "Staff can manage infractions." ON public.infractions FOR ALL USING (public.get_my_role() IN ('admin', 'super_admin', 'gestionnaire', 'assistant'));
CREATE POLICY "Staff can manage maintenance." ON public.maintenance FOR ALL USING (public.get_my_role() IN ('admin', 'super_admin', 'gestionnaire', 'assistant'));
CREATE POLICY "Staff can manage transactions." ON public.transactions FOR ALL USING (public.get_my_role() IN ('admin', 'super_admin', 'gestionnaire', 'assistant'));
CREATE POLICY "Staff can manage gps tracking." ON public.gps_tracking FOR ALL USING (public.get_my_role() IN ('admin', 'super_admin', 'gestionnaire', 'assistant'));
CREATE POLICY "Staff can manage mileage logs." ON public.vehicle_mileage_logs FOR ALL USING (public.get_my_role() IN ('admin', 'super_admin', 'gestionnaire', 'assistant'));
CREATE POLICY "Staff can manage alerts." ON public.maintenance_alerts FOR ALL USING (public.get_my_role() IN ('admin', 'super_admin', 'gestionnaire', 'assistant'));
CREATE POLICY "Staff can manage maintenance records." ON public.vehicle_maintenance_records FOR ALL USING (public.get_my_role() IN ('admin', 'super_admin', 'gestionnaire', 'assistant'));

CREATE POLICY "Staff can view their notifications" ON public.system_notifications FOR SELECT USING (profile_id = auth.uid() OR profile_id IS NULL);
CREATE POLICY "Staff can update their notifications" ON public.system_notifications FOR UPDATE USING (profile_id = auth.uid());
CREATE POLICY "Staff can insert notifications" ON public.system_notifications FOR INSERT WITH CHECK (public.get_my_role() IN ('admin', 'super_admin', 'gestionnaire', 'assistant'));

CREATE POLICY "Settings are viewable by everyone" ON public.company_settings FOR SELECT USING (true);
CREATE POLICY "Only admins can update settings" ON public.company_settings FOR UPDATE USING (public.get_my_role() IN ('admin', 'super_admin'));
CREATE POLICY "Only admins can insert settings" ON public.company_settings FOR INSERT WITH CHECK (public.get_my_role() IN ('admin', 'super_admin'));

CREATE POLICY "Staff can manage invoices" ON public.invoices FOR ALL USING (public.get_my_role() IN ('admin', 'super_admin', 'gestionnaire', 'assistant'));
CREATE POLICY "Customers can view their own invoices" ON public.invoices FOR SELECT USING (EXISTS (SELECT 1 FROM public.reservations r JOIN public.customers c ON r.customer_id = c.id WHERE r.id = reservation_id AND c.email = auth.jwt()->>'email'));

CREATE POLICY "Staff can manage contracts" ON public.rental_contracts FOR ALL USING (public.get_my_role() IN ('admin', 'super_admin', 'gestionnaire', 'assistant'));
CREATE POLICY "Customers can view their own contracts" ON public.rental_contracts FOR SELECT USING (EXISTS (SELECT 1 FROM public.reservations r JOIN public.customers c ON r.customer_id = c.id WHERE r.id = reservation_id AND c.email = auth.jwt()->>'email'));

CREATE POLICY "Staff can manage handovers" ON public.rental_handover_records FOR ALL USING (public.get_my_role() IN ('admin', 'super_admin', 'gestionnaire', 'assistant'));

CREATE POLICY "Admins can manage quotes." ON public.quotes FOR ALL USING (public.get_my_role() IN ('admin', 'super_admin', 'assistant'));

-- 8. Seed Default Data
INSERT INTO public.company_settings (company_name, phone, email, address, website)
VALUES ('TRM Rent Car', '06 06 06 6426', 'trm.rentcar@gmail.com', 'Appt Sabrine 2éme Etage N°6 Bloc A, 65800 Taourirt', 'www.trmrentcar.ma');

-- 9. Storage Buckets & Policies
INSERT INTO storage.buckets (id, name, public) VALUES ('vehicles', 'vehicles', true) ON CONFLICT (id) DO NOTHING;
CREATE POLICY "Public Access for Vehicle Images" ON storage.objects FOR SELECT USING (bucket_id = 'vehicles');
CREATE POLICY "Admins can upload Vehicle Images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'vehicles' AND public.get_my_role() IN ('admin', 'super_admin', 'gestionnaire', 'assistant'));
CREATE POLICY "Admins can update Vehicle Images" ON storage.objects FOR UPDATE USING (bucket_id = 'vehicles' AND public.get_my_role() IN ('admin', 'super_admin', 'gestionnaire', 'assistant'));
CREATE POLICY "Admins can delete Vehicle Images" ON storage.objects FOR DELETE USING (bucket_id = 'vehicles' AND public.get_my_role() IN ('admin', 'super_admin', 'gestionnaire', 'assistant'));

-- 10. Dummy Seed Data
INSERT INTO public.customers (id, full_name, email, phone, cin, city, status)
VALUES 
    ('a1111111-1111-1111-1111-111111111111', 'Mehdi El Alami', 'mehdi@example.com', '0661223344', 'AB123456', 'Casablanca', 'Actif'),
    ('b2222222-2222-2222-2222-222222222222', 'Sara Benani', 'sara@example.com', '0662334455', 'CD789012', 'Rabat', 'VIP'),
    ('c3333333-3333-3333-3333-333333333333', 'Omar Tazi', 'omar@example.com', '0663445566', 'EF345678', 'Tanger', 'Actif'),
    ('d4444444-4444-4444-4444-444444444444', 'Laila Mansouri', 'laila@example.com', '0664556677', 'GH901234', 'Marrakech', 'Actif')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.vehicles (id, brand, model, year, plate_number, fuel_type, price_per_day, deposit_amount, mileage, status)
VALUES 
    ('11111111-1111-1111-1111-111111111112', 'Dacia', 'Logan', 2023, '12345-A-50', 'Diesel', 350.00, 3000.00, 15000, 'available'),
    ('22222222-2222-2222-2222-222222222223', 'Renault', 'Clio 5', 2024, '67890-B-50', 'Essence', 450.00, 4000.00, 5000, 'available'),
    ('33333333-3333-3333-3333-333333333334', 'Volkswagen', 'Golf 8', 2024, '11223-C-50', 'Diesel', 750.00, 6000.00, 2000, 'available')
ON CONFLICT (id) DO NOTHING;
