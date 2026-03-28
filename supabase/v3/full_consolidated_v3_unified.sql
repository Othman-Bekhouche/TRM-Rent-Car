-- ========================================================
-- 🏆 TRM RENT CAR - CONSOLIDATED DATABASE SCHEMA V3_FINAL
-- ========================================================
-- This script unifies all tables, enums, functions and RLS policies
-- needed for the production-ready TRM Rent Car platform.
-- ========================================================

-- 1. SETUP EXTENSIONS
CREATE SCHEMA IF NOT EXISTS extensions;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pg_net" SCHEMA extensions;

-- 2. CREATE ENUMS
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE public.user_role AS ENUM ('customer', 'admin', 'super_admin', 'gestionnaire', 'assistant');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vehicle_status') THEN
        CREATE TYPE public.vehicle_status AS ENUM ('available', 'booked', 'maintenance', 'inactive', 'rented');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'reservation_status') THEN
        CREATE TYPE public.reservation_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed', 'rejected', 'rented', 'returned', 'active');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'infraction_status') THEN
        CREATE TYPE public.infraction_status AS ENUM ('pending', 'matched', 'transmitted', 'resolved', 'unmatched');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'infraction_type') THEN
        CREATE TYPE public.infraction_type AS ENUM ('radar_fixe', 'exces_vitesse', 'stationnement_interdit', 'feu_rouge', 'controle_routier', 'autre');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'maintenance_status') THEN
        CREATE TYPE public.maintenance_status AS ENUM ('planned', 'in_progress', 'completed', 'cancelled');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_type') THEN
        CREATE TYPE public.transaction_type AS ENUM ('encaissement', 'caution', 'remboursement', 'charge');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'quote_status') THEN
        CREATE TYPE public.quote_status AS ENUM ('draft', 'sent', 'accepted', 'rejected', 'expired');
    END IF;
END $$;

-- 3. CORE TABLES

-- Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY,
    full_name TEXT,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    role public.user_role DEFAULT 'customer'::public.user_role,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vehicles
CREATE TABLE IF NOT EXISTS public.vehicles (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
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
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT NOT NULL,
    cin TEXT,
    passport TEXT,
    address TEXT,
    city TEXT,
    license_number TEXT,
    license_expiry_date DATE,
    birth_date DATE,
    birth_place TEXT,
    license_image_url TEXT,
    cin_image_url TEXT,
    passport_image_url TEXT,
    total_spent DECIMAL(10,2) DEFAULT 0,
    total_reservations INT DEFAULT 0,
    status TEXT DEFAULT 'Actif',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reservations
CREATE TABLE IF NOT EXISTS public.reservations (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    reservation_number TEXT UNIQUE,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE RESTRICT,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    pickup_location TEXT,
    dropoff_location TEXT,
    total_price DECIMAL(10,2) NOT NULL,
    status public.reservation_status DEFAULT 'pending'::public.reservation_status,
    payment_method TEXT DEFAULT 'Espèces',
    payment_status TEXT DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_dates CHECK (end_date >= start_date)
);

-- Maintenance records
CREATE TABLE IF NOT EXISTS public.vehicle_maintenance_records (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
    maintenance_type TEXT NOT NULL,
    status public.maintenance_status DEFAULT 'planned'::public.maintenance_status,
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
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
    mileage_value INTEGER NOT NULL,
    recorded_at TIMESTAMPTZ DEFAULT NOW(),
    recorded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    notes TEXT
);

-- Maintenance alerts
CREATE TABLE IF NOT EXISTS public.maintenance_alerts (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
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
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
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
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    reservation_id UUID REFERENCES public.reservations(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    transaction_type public.transaction_type NOT NULL DEFAULT 'encaissement',
    category TEXT,
    amount DECIMAL(10,2) NOT NULL,
    payment_method TEXT,
    description TEXT,
    status TEXT DEFAULT 'Payé',
    transaction_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoices
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
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
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
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
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
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
    accessories_checklist JSONB DEFAULT '[]'::jsonb,
    deposit_collected DECIMAL(10,2) DEFAULT 0,
    payment_collected DECIMAL(10,2) DEFAULT 0,
    extra_charges DECIMAL(10,2) DEFAULT 0,
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quotes
CREATE TABLE IF NOT EXISTS public.quotes (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    quote_number TEXT UNIQUE NOT NULL,
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status public.quote_status DEFAULT 'draft'::public.quote_status,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vehicle Images
CREATE TABLE IF NOT EXISTS public.vehicle_images (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    is_cover BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Company Settings
CREATE TABLE IF NOT EXISTS public.company_settings (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
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
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    user_id UUID,
    link TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- GPS Tracking
CREATE TABLE IF NOT EXISTS public.gps_tracking (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    speed DECIMAL(5,2),
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. FUNCTIONS & TRIGGERS

-- Updated At
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Security Helpers
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT LANGUAGE sql SECURITY DEFINER STABLE AS $$
    SELECT role::text FROM public.profiles WHERE id = auth.uid();
$$;

-- Checkout RPC (Quick Customer Creation/Update)
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

-- Auth Sync: New Profile & Customer
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

-- Availability Check (RPC)
CREATE OR REPLACE FUNCTION public.check_vehicle_availability(
    p_vehicle_id uuid, 
    p_start_date timestamptz, 
    p_end_date timestamptz,
    p_exclude_id uuid DEFAULT NULL
)
RETURNS TABLE (is_available boolean, next_available_date timestamptz) AS $$
DECLARE
    v_conflict_end timestamptz;
BEGIN
    SELECT end_date INTO v_conflict_end
    FROM public.reservations
    WHERE vehicle_id = p_vehicle_id
    AND status NOT IN ('cancelled', 'completed', 'returned', 'rejected')
    AND (p_exclude_id IS NULL OR id != p_exclude_id)
    AND (
        (p_start_date, p_end_date) OVERLAPS (start_date, end_date)
    )
    LIMIT 1;

    IF v_conflict_end IS NULL THEN
        RETURN QUERY SELECT true, NULL::timestamptz;
    ELSE
        RETURN QUERY SELECT false, (v_conflict_end + INTERVAL '1 hour')::timestamptz;
    END IF;
END; $$ LANGUAGE plpgsql STABLE;

-- Accounting Automation: Reservation Payments
CREATE OR REPLACE FUNCTION public.sync_reservation_payment_to_transactions()
RETURNS TRIGGER AS $$
DECLARE
    v_desc TEXT;
BEGIN
    IF NEW.status IN ('rented', 'returned', 'completed') AND 
       NOT EXISTS (SELECT 1 FROM public.transactions WHERE reservation_id = NEW.id AND transaction_type = 'encaissement') THEN
        
        v_desc := 'Paiement de la Réservation #' || COALESCE(NEW.reservation_number, SUBSTRING(NEW.id::text, 1, 8));
        
        INSERT INTO public.transactions (
            reservation_id, customer_id, transaction_type, amount, payment_method, description, status, transaction_date
        ) VALUES (
            NEW.id, NEW.customer_id, 'encaissement', NEW.total_price, NEW.payment_method, v_desc, 'Payé', CURRENT_DATE
        );
    ELSIF OLD.status IN ('rented', 'returned', 'completed') AND OLD.total_price != NEW.total_price THEN
        UPDATE public.transactions 
        SET amount = NEW.total_price 
        WHERE reservation_id = NEW.id AND transaction_type = 'encaissement';
    END IF;
    RETURN NEW;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- Accounting Automation: Handover Deposit
CREATE OR REPLACE FUNCTION public.sync_handover_deposit_to_transactions()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.deposit_collected > 0 AND 
       NOT EXISTS (SELECT 1 FROM public.transactions WHERE reservation_id = NEW.reservation_id AND transaction_type = 'caution') THEN
        
        INSERT INTO public.transactions (
            reservation_id, customer_id, transaction_type, amount, description, status, transaction_date
        ) VALUES (
            NEW.reservation_id, NEW.customer_id, 'caution', NEW.deposit_collected,
            'Caution encaissée - Dossier #' || SUBSTRING(NEW.reservation_id::text, 1, 8), 'Payé', CURRENT_DATE
        );
    END IF;
    RETURN NEW;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. WIRING TRIGGERS
DO $$ 
DECLARE
    t text;
BEGIN
    FOR t IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('profiles', 'vehicles', 'customers', 'reservations', 'vehicle_maintenance_records', 'company_settings', 'infractions', 'quotes', 'invoices', 'rental_contracts', 'rental_handover_records')) LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS set_updated_at ON public.%I', t);
        EXECUTE format('CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.update_updated_at()', t);
    END LOOP;
END $$;

DROP TRIGGER IF EXISTS tr_res_payment_sync ON public.reservations;
CREATE TRIGGER tr_res_payment_sync AFTER INSERT OR UPDATE OF status, total_price ON public.reservations FOR EACH ROW EXECUTE FUNCTION public.sync_reservation_payment_to_transactions();

DROP TRIGGER IF EXISTS tr_handover_deposit_sync ON public.rental_handover_records;
CREATE TRIGGER tr_handover_deposit_sync AFTER INSERT ON public.rental_handover_records FOR EACH ROW EXECUTE FUNCTION public.sync_handover_deposit_to_transactions();

-- 6. INDEXES
CREATE INDEX IF NOT EXISTS idx_veh_plate ON public.vehicles(plate_number);
CREATE INDEX IF NOT EXISTS idx_res_dates ON public.reservations(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_res_status ON public.reservations(status);
CREATE INDEX IF NOT EXISTS idx_cust_email ON public.customers(email);
CREATE INDEX IF NOT EXISTS idx_maint_veh ON public.vehicle_maintenance_records(vehicle_id);

-- 7. RLS & SECURITY
DO $$ 
DECLARE
    t text;
BEGIN
    FOR t IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    END LOOP;
END $$;

-- Staff Access
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'super_admin', 'gestionnaire', 'assistant')
    );
$$;

DO $$ 
DECLARE
    t text;
BEGIN
    FOR t IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Staff manage %I" ON public.%I', t, t);
        EXECUTE format('CREATE POLICY "Staff manage %I" ON public.%I FOR ALL USING (public.is_staff())', t, t);
    END LOOP;
END $$;

-- Customer Access
CREATE POLICY "See own profile" ON public.profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "Update own profile" ON public.profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Customers view reservations" ON public.reservations FOR SELECT USING (customer_id = auth.uid() OR customer_id IN (SELECT id FROM public.customers WHERE email = auth.jwt()->>'email'));
CREATE POLICY "Public see vehicles" ON public.vehicles FOR SELECT USING (status != 'inactive');
CREATE POLICY "Public see images" ON public.vehicle_images FOR SELECT USING (true);

-- 8. INITIAL DATA
INSERT INTO public.company_settings (company_name, phone, email, address, website)
SELECT 'TRM Rent Car', '06 06 06 6426', 'trm.rentcar@gmail.com', 'Appt Sabrine 2éme Etage N°6 Bloc A, 65800 Taourirt', 'www.trmrentcar.ma'
WHERE NOT EXISTS (SELECT 1 FROM public.company_settings);
