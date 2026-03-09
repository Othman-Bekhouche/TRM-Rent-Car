-- =============================================
-- TRM Rent Car — Consolidated System Fix
-- This script fixes all current database-related errors:
-- 1. Adds missing columns to vehicles
-- 2. Creates Maintenance module tables
-- 3. Fixes unique constraint for Customers (upsert)
-- 4. Set permissions for all roles
-- =============================================

-- 1. VEHICLE TABLE EXTENSION
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS last_oil_change_mileage INTEGER DEFAULT 0;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS next_oil_change_mileage INTEGER DEFAULT 0;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS last_service_mileage INTEGER DEFAULT 0;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS next_service_mileage INTEGER DEFAULT 0;

-- 2. CUSTOMERS TABLE FIX
-- Required for BookingCheckout "ON CONFLICT" error
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'customers_email_unique'
    ) THEN
        ALTER TABLE public.customers ADD CONSTRAINT customers_email_unique UNIQUE (email);
    END IF;
END $$;

-- 3. MAINTENANCE MODULE TABLES
-- Drop and recreate to ensure clean structure if partially failed
DROP TABLE IF EXISTS public.maintenance_alerts CASCADE;
DROP TABLE IF EXISTS public.vehicle_mileage_logs CASCADE;
DROP TABLE IF EXISTS public.vehicle_maintenance_records CASCADE;

-- Maintenance Records (Digital Logbook)
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

-- Mileage Logs (Odometer History)
CREATE TABLE public.vehicle_mileage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
    mileage_value INTEGER NOT NULL,
    recorded_at TIMESTAMPTZ DEFAULT NOW(),
    recorded_by UUID REFERENCES auth.users(id),
    notes TEXT
);

-- Active Alerts (Auto-calculated)
CREATE TABLE public.maintenance_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
    maintenance_record_id UUID REFERENCES public.vehicle_maintenance_records(id) ON DELETE CASCADE,
    alert_type TEXT NOT NULL, -- Kilométrage, Date, Document
    alert_message TEXT NOT NULL,
    priority TEXT DEFAULT 'low', -- low, medium, high, urgent
    status TEXT DEFAULT 'active', -- active, resolved
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.vehicle_maintenance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_mileage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_alerts ENABLE ROW LEVEL SECURITY;

-- 5. PERMISSIONS POLICIES (Full access for authenticated admins/managers)
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Full access records" ON public.vehicle_maintenance_records;
    DROP POLICY IF EXISTS "Full access mileage" ON public.vehicle_mileage_logs;
    DROP POLICY IF EXISTS "Full access alerts" ON public.maintenance_alerts;

    -- Allow all operations for authenticated staff members
    CREATE POLICY "Full access records" ON public.vehicle_maintenance_records FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin', 'assistant', 'gestionnaire'))
    );
    CREATE POLICY "Full access mileage" ON public.vehicle_mileage_logs FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin', 'assistant', 'gestionnaire'))
    );
    CREATE POLICY "Full access alerts" ON public.maintenance_alerts FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin', 'assistant', 'gestionnaire'))
    );
END $$;

-- 6. INDEXES for fast dashboard loading
CREATE INDEX IF NOT EXISTS idx_maint_vehicle ON public.vehicle_maintenance_records(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_mileage_vehicle ON public.vehicle_mileage_logs(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON public.maintenance_alerts(status);
