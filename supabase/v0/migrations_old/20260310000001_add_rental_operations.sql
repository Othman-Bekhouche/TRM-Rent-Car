-- =============================================
-- TRM Rent Car — Add Rental Operations Features
-- Invoices, Contracts, Handovers, and new statuses
-- =============================================

-- Add new values to ENUMs
DO $$
BEGIN
    -- Add to reservation_status if they don't exist
    BEGIN
        ALTER TYPE public.reservation_status ADD VALUE 'rented';
    EXCEPTION WHEN duplicate_object THEN null;
    END;
    
    BEGIN
        ALTER TYPE public.reservation_status ADD VALUE 'returned';
    EXCEPTION WHEN duplicate_object THEN null;
    END;

    -- Add to vehicle_status if they don't exist
    BEGIN
        ALTER TYPE public.vehicle_status ADD VALUE 'rented';
    EXCEPTION WHEN duplicate_object THEN null;
    END;
END $$;

-- 1. Create Invoices Table
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

-- 2. Create Rental Contracts Table
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

-- 3. Create Handover Records Table
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

-- Enable RLS
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rental_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rental_handover_records ENABLE ROW LEVEL SECURITY;

-- Policies for Staff (Assuming `get_my_role()` from 20260309000003_fix_rls_all_roles.sql is available)
CREATE POLICY "Staff can manage invoices" ON public.invoices FOR ALL USING (
    public.get_my_role() IN ('admin', 'super_admin', 'gestionnaire', 'assistant')
);

CREATE POLICY "Customers can view their own invoices" ON public.invoices FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.reservations r JOIN public.customers c ON r.customer_id = c.id WHERE r.id = reservation_id AND c.email = auth.jwt()->>'email')
);

CREATE POLICY "Staff can manage contracts" ON public.rental_contracts FOR ALL USING (
    public.get_my_role() IN ('admin', 'super_admin', 'gestionnaire', 'assistant')
);

CREATE POLICY "Customers can view their own contracts" ON public.rental_contracts FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.reservations r JOIN public.customers c ON r.customer_id = c.id WHERE r.id = reservation_id AND c.email = auth.jwt()->>'email')
);

CREATE POLICY "Staff can manage handovers" ON public.rental_handover_records FOR ALL USING (
    public.get_my_role() IN ('admin', 'super_admin', 'gestionnaire', 'assistant')
);

-- Drop triggers if exists, then recreate for updated_at
DROP TRIGGER IF EXISTS set_updated_at ON public.invoices;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.rental_contracts;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.rental_contracts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.rental_handover_records;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.rental_handover_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
