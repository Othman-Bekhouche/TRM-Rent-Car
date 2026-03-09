
-- Maintenance module tables

-- Ensure vehicles has current mileage tracking
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS last_oil_change_mileage INTEGER DEFAULT 0;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS next_oil_change_mileage INTEGER DEFAULT 0;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS last_service_mileage INTEGER DEFAULT 0;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS next_service_mileage INTEGER DEFAULT 0;

-- Maintenance records
CREATE TABLE IF NOT EXISTS public.vehicle_maintenance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
    maintenance_type TEXT NOT NULL, -- Vidange, Révision, Pneus, etc.
    status TEXT DEFAULT 'Planifié', -- Planifié, En cours, Terminé
    last_service_date DATE,
    last_service_mileage INTEGER,
    next_service_date DATE,
    next_service_mileage INTEGER,
    estimated_cost DECIMAL(10,2),
    actual_cost DECIMAL(10,2),
    vendor_name TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mileage logs
CREATE TABLE IF NOT EXISTS public.vehicle_mileage_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
    mileage_value INTEGER NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    recorded_by UUID REFERENCES auth.users(id),
    notes TEXT
);

-- Alerts
CREATE TABLE IF NOT EXISTS public.maintenance_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
    maintenance_record_id UUID REFERENCES public.vehicle_maintenance_records(id) ON DELETE CASCADE,
    alert_type TEXT NOT NULL, -- Mileage, Date, Document
    alert_message TEXT,
    priority TEXT DEFAULT 'low', -- low, medium, high, urgent
    status TEXT DEFAULT 'active', -- active, resolved
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE vehicle_maintenance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_mileage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_alerts ENABLE ROW LEVEL SECURITY;

-- Simple policies for admin access
CREATE POLICY \
Allow
admin
all
maintainance\ ON vehicle_maintenance_records FOR ALL TO authenticated USING (true);
CREATE POLICY \Allow
admin
all
mileage\ ON vehicle_mileage_logs FOR ALL TO authenticated USING (true);
CREATE POLICY \Allow
admin
all
alerts\ ON maintenance_alerts FOR ALL TO authenticated USING (true);

