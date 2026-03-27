-- =============================================
-- TRM Rent Car — Add missing tables for maintenance module
-- Tables: vehicle_mileage_logs, maintenance_alerts
-- =============================================

-- 1. Vehicle Mileage Logs (tracking odometer readings)
CREATE TABLE IF NOT EXISTS public.vehicle_mileage_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
    mileage_value INT NOT NULL,
    recorded_at TIMESTAMPTZ DEFAULT NOW(),
    recorded_by TEXT,
    notes TEXT
);

-- 2. Maintenance Alerts (proactive alerts for upcoming/overdue maintenance)
CREATE TABLE IF NOT EXISTS public.maintenance_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
    maintenance_record_id UUID REFERENCES public.maintenance(id) ON DELETE SET NULL,
    alert_type TEXT NOT NULL DEFAULT 'Mileage', -- Mileage, Date, Document
    alert_message TEXT NOT NULL,
    priority TEXT DEFAULT 'medium', -- low, medium, high, urgent
    status TEXT DEFAULT 'active', -- active, resolved
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Vehicle Maintenance Records (detailed version with more fields)
-- This is a view that wraps the existing `maintenance` table with renamed columns for the frontend
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

-- 4. Indexes
CREATE INDEX IF NOT EXISTS idx_mileage_logs_vehicle ON public.vehicle_mileage_logs(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_mileage_logs_recorded ON public.vehicle_mileage_logs(recorded_at);
CREATE INDEX IF NOT EXISTS idx_alerts_vehicle ON public.maintenance_alerts(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON public.maintenance_alerts(status);
CREATE INDEX IF NOT EXISTS idx_vmr_vehicle ON public.vehicle_maintenance_records(vehicle_id);

-- 5. RLS
ALTER TABLE public.vehicle_mileage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_maintenance_records ENABLE ROW LEVEL SECURITY;

-- Read access for everyone
CREATE POLICY "Mileage logs viewable by staff." ON public.vehicle_mileage_logs FOR SELECT USING (true);
CREATE POLICY "Alerts viewable by staff." ON public.maintenance_alerts FOR SELECT USING (true);
CREATE POLICY "Maintenance records viewable by staff." ON public.vehicle_maintenance_records FOR SELECT USING (true);

-- Write access for staff roles
CREATE POLICY "Staff can manage mileage logs." ON public.vehicle_mileage_logs FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin', 'gestionnaire', 'assistant'))
);
CREATE POLICY "Staff can manage alerts." ON public.maintenance_alerts FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin', 'gestionnaire', 'assistant'))
);
CREATE POLICY "Staff can manage maintenance records." ON public.vehicle_maintenance_records FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin', 'gestionnaire', 'assistant'))
);

-- 6. Trigger for updated_at
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.vehicle_maintenance_records FOR EACH ROW EXECUTE FUNCTION update_updated_at();
