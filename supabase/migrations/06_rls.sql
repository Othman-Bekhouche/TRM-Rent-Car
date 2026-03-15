-- =============================================
-- 05_rls.sql
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.infractions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_maintenance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_mileage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rental_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rental_handover_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_notifications ENABLE ROW LEVEL SECURITY;

-- 1. Unified Staff Policy (Admins, Gestionnaires, etc.)
-- This loop creates a "Staff manage ..." policy for every table for staff members
DO $$ 
DECLARE
    t text;
BEGIN
    FOR t IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Staff manage %I" ON public.%I', t, t);
        EXECUTE format('CREATE POLICY "Staff manage %I" ON public.%I FOR ALL USING (public.is_staff())', t, t);
    END LOOP;
END $$;

-- 2. Public/Customer specific policies

-- Vehicles & Images are viewable by everyone
CREATE POLICY "Public view vehicles" ON public.vehicles FOR SELECT USING (true);
CREATE POLICY "Public view images" ON public.vehicle_images FOR SELECT USING (true);

-- Customers can view themselves
CREATE POLICY "Customers view self" ON public.customers FOR SELECT USING (
    LOWER(email) = LOWER(COALESCE(auth.jwt()->>'email', auth.email()))
);

-- Customers can view their own reservations
CREATE POLICY "Customers view reservations" ON public.reservations FOR SELECT USING (
    customer_id IN (
        SELECT id FROM public.customers 
        WHERE LOWER(email) = LOWER(COALESCE(auth.jwt()->>'email', auth.email()))
    )
);

-- Allow public lookup for checkout (optional, based on your app logic)
-- CREATE POLICY "Allow public lookup for checkout." ON public.customers FOR SELECT USING (true);

-- Profiles: Users can view their own profile
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Notifications: Users see their own
CREATE POLICY "Users view own notifications" ON public.system_notifications FOR SELECT USING (user_id = auth.uid());
