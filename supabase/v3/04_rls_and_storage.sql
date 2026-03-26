-- =============================================
-- 04_rls_and_storage.sql
-- =============================================

-- 1. ENABLE RLS
DO $$ 
DECLARE
    t text;
BEGIN
    FOR t IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    END LOOP;
END $$;

-- 2. STAFF POLICIES (Super Access)
DO $$ 
DECLARE
    t text;
BEGIN
    FOR t IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Staff manage %I" ON public.%I', t, t);
        EXECUTE format('CREATE POLICY "Staff manage %I" ON public.%I FOR ALL USING (public.is_staff())', t, t);
    END LOOP;
END $$;

-- 3. CUSTOMER POLICIES (Self-Service)
-- Profiles access
DROP POLICY IF EXISTS "See own profile" ON public.profiles;
CREATE POLICY "See own profile" ON public.profiles FOR SELECT USING (id = auth.uid());

DROP POLICY IF EXISTS "Update own profile" ON public.profiles FOR UPDATE USING (id = auth.uid());

-- Reservation access
DROP POLICY IF EXISTS "Customers view reservations" ON public.reservations;
CREATE POLICY "Customers view reservations" ON public.reservations FOR SELECT USING (
    customer_id IN (
        SELECT id FROM public.customers 
        WHERE LOWER(email) = LOWER(COALESCE(auth.jwt()->>'email', auth.email()))
    )
    OR
    customer_id = auth.uid()
);

-- Vehicle visibility (Public/Auth)
DROP POLICY IF EXISTS "All see active vehicles" ON public.vehicles;
CREATE POLICY "All see active vehicles" ON public.vehicles FOR SELECT USING (status != 'inactive');

DROP POLICY IF EXISTS "All see images" ON public.vehicle_images;
CREATE POLICY "All see images" ON public.vehicle_images FOR SELECT USING (true);

-- 4. STORAGE SETUP
INSERT INTO storage.buckets (id, name, public) VALUES ('vehicles', 'vehicles', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('customers', 'customers', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('contracts', 'contracts', true) ON CONFLICT (id) DO NOTHING;

-- Storage Policies
-- PUBLIC SELECT
DROP POLICY IF EXISTS "Public select vehicles" ON storage.objects;
CREATE POLICY "Public select vehicles" ON storage.objects FOR SELECT USING (bucket_id = 'vehicles');

DROP POLICY IF EXISTS "Public select customers" ON storage.objects;
CREATE POLICY "Public select customers" ON storage.objects FOR SELECT USING (bucket_id = 'customers');

-- STAFF FULL ACCESS ON STORAGE
DROP POLICY IF EXISTS "Staff upload vehicles" ON storage.objects;
CREATE POLICY "Staff upload vehicles" ON storage.objects FOR ALL USING (
    bucket_id = 'vehicles' AND public.is_staff()
);

DROP POLICY IF EXISTS "Staff management storage" ON storage.objects;
CREATE POLICY "Staff management storage" ON storage.objects FOR ALL USING (public.is_staff());

-- 5. GRANTS
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role, supabase_admin;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role, supabase_admin;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, service_role, supabase_admin;

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON public.vehicles, public.vehicle_images, public.company_settings TO anon;
GRANT INSERT ON public.reservations, public.customers TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;

-- Force RLS on all tables again
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles FORCE ROW LEVEL SECURITY;
ALTER TABLE public.customers FORCE ROW LEVEL SECURITY;
ALTER TABLE public.reservations FORCE ROW LEVEL SECURITY;
