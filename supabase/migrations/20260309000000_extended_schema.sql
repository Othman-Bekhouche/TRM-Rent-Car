-- =============================================
-- TRM Rent Car — Extended Schema Migration
-- Tables: customers, infractions, maintenance, accounting
-- =============================================

-- 1. CUSTOM ENUMS FOR INFRACTIONS
CREATE TYPE infraction_status AS ENUM ('pending', 'matched', 'transmitted', 'resolved', 'unmatched');
CREATE TYPE infraction_type AS ENUM ('radar_fixe', 'exces_vitesse', 'stationnement_interdit', 'feu_rouge', 'controle_routier', 'autre');
CREATE TYPE maintenance_status AS ENUM ('planned', 'in_progress', 'completed');
CREATE TYPE transaction_type AS ENUM ('encaissement', 'caution', 'remboursement', 'charge');

-- 2. CUSTOMERS TABLE (CRM-style with CIN/passport for authority transfers)
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT NOT NULL,
    cin TEXT,                      -- Carte d'identité nationale
    passport TEXT,                 -- For foreign clients
    address TEXT,
    city TEXT,
    total_spent DECIMAL(10,2) DEFAULT 0,
    total_reservations INT DEFAULT 0,
    status TEXT DEFAULT 'Actif',   -- Actif, VIP, Inactif
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. INFRACTIONS TABLE (Traffic violations linked to vehicles and reservations)
-- First, add FK from reservations to customers now that customers table exists
ALTER TABLE public.reservations ADD CONSTRAINT fk_reservations_customer
    FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS public.infractions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
    reservation_id UUID REFERENCES public.reservations(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    
    -- Infraction details
    infraction_type infraction_type NOT NULL DEFAULT 'autre',
    infraction_date DATE NOT NULL,
    infraction_time TIME,
    city TEXT,
    location TEXT,                 -- Exact location (e.g., "Route N6 — PK 125")
    
    -- Authority info
    authority_name TEXT,           -- e.g., NARSA, Police Oujda
    reference_number TEXT,         -- Official PV reference
    
    -- Financial
    fine_amount DECIMAL(10,2) DEFAULT 0,
    
    -- Documentation
    description TEXT,
    admin_notes TEXT,
    document_url TEXT,             -- Scanned PV or photo
    
    -- Status tracking
    status infraction_status DEFAULT 'pending'::infraction_status,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. MAINTENANCE TABLE (Vehicle maintenance tracking)
CREATE TABLE IF NOT EXISTS public.maintenance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
    maintenance_type TEXT NOT NULL,        -- Vidange, Pneus, Frein, Contrôle technique, etc.
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

-- 5. TRANSACTIONS TABLE (Accounting/financial records)
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reservation_id UUID REFERENCES public.reservations(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    transaction_type transaction_type NOT NULL DEFAULT 'encaissement',
    amount DECIMAL(10,2) NOT NULL,
    payment_method TEXT,           -- Espèces, Virement, Carte
    description TEXT,
    status TEXT DEFAULT 'Payé',    -- Payé, En attente, Remboursé
    transaction_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. GPS TRACKING TABLE (Vehicle location history)
CREATE TABLE IF NOT EXISTS public.gps_tracking (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
    latitude DECIMAL(10,7),
    longitude DECIMAL(10,7),
    speed DECIMAL(5,1) DEFAULT 0,       -- km/h
    heading DECIMAL(5,1) DEFAULT 0,     -- degrees
    location_name TEXT,                  -- Reverse geocoded name
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. INDEXES for performance
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

-- 8. RLS (Row Level Security)
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.infractions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gps_tracking ENABLE ROW LEVEL SECURITY;

-- Admin-only access for all new tables
CREATE POLICY "Admins can manage customers." ON public.customers FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin'))
);
CREATE POLICY "Admins can manage infractions." ON public.infractions FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin'))
);
CREATE POLICY "Admins can manage maintenance." ON public.maintenance FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin'))
);
CREATE POLICY "Admins can manage transactions." ON public.transactions FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin'))
);
CREATE POLICY "Admins can manage gps tracking." ON public.gps_tracking FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin'))
);

-- Public read for customers table (for reservation forms)
CREATE POLICY "Public can view customers." ON public.customers FOR SELECT USING (true);

-- 9. FUNCTION: Auto-match infraction to reservation
CREATE OR REPLACE FUNCTION match_infraction_to_reservation()
RETURNS TRIGGER AS $$
DECLARE
    matched_reservation RECORD;
BEGIN
    -- Search for reservation matching vehicle + date
    SELECT r.id AS reservation_id, r.customer_id
    INTO matched_reservation
    FROM public.reservations r
    WHERE r.vehicle_id = NEW.vehicle_id
      AND r.start_date <= NEW.infraction_date
      AND r.end_date >= NEW.infraction_date
      AND r.status IN ('confirmed', 'completed')
    ORDER BY r.start_date DESC
    LIMIT 1;

    IF FOUND THEN
        NEW.reservation_id := matched_reservation.reservation_id;
        -- Try to find customer_id from profiles linked to reservation
        NEW.status := 'matched';
    ELSE
        NEW.status := 'unmatched';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-match on INSERT
CREATE TRIGGER trigger_match_infraction
    BEFORE INSERT ON public.infractions
    FOR EACH ROW
    WHEN (NEW.reservation_id IS NULL)
    EXECUTE FUNCTION match_infraction_to_reservation();

-- 10. FUNCTION: Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.vehicles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.reservations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.infractions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.maintenance FOR EACH ROW EXECUTE FUNCTION update_updated_at();
