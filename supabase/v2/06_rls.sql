-- =============================================
-- 06_rls.sql
-- Politiques de sécurité (Row Level Security)
-- =============================================

-- Activation RLS
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

-- 1. Unified Staff Policy
DO $$ 
DECLARE
    t text;
BEGIN
    FOR t IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Staff manage %I" ON public.%I', t, t);
        EXECUTE format('CREATE POLICY "Staff manage %I" ON public.%I FOR ALL USING (public.is_staff())', t, t);
    END LOOP;
END $$;

-- 2. Public Policies
DROP POLICY IF EXISTS "Public view vehicles" ON public.vehicles;
CREATE POLICY "Public view vehicles" ON public.vehicles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public view images" ON public.vehicle_images;
CREATE POLICY "Public view images" ON public.vehicle_images FOR SELECT USING (true);

-- 3. Customer Policies
DROP POLICY IF EXISTS "Customers view self" ON public.customers;
CREATE POLICY "Customers view self" ON public.customers FOR SELECT USING (
    LOWER(email) = LOWER(COALESCE(auth.jwt()->>'email', auth.email()))
);

DROP POLICY IF EXISTS "Customers view reservations" ON public.reservations;
CREATE POLICY "Customers view reservations" ON public.reservations FOR SELECT USING (
    customer_id IN (
        SELECT id FROM public.customers 
        WHERE LOWER(email) = LOWER(COALESCE(auth.jwt()->>'email', auth.email()))
    )
);

DROP POLICY IF EXISTS "Users view own profile" ON public.profiles;
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users view own notifications" ON public.system_notifications;
CREATE POLICY "Users view own notifications" ON public.system_notifications FOR SELECT USING (user_id = auth.uid());
