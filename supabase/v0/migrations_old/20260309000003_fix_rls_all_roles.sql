-- =============================================
-- TRM Rent Car — Fix RLS policies for all roles
-- Add gestionnaire and assistant to all admin policies
-- =============================================

-- 1. DROP existing admin policies from initial_schema
DROP POLICY IF EXISTS "Admins can manage vehicles." ON public.vehicles;
DROP POLICY IF EXISTS "Admins can manage vehicle images." ON public.vehicle_images;
DROP POLICY IF EXISTS "Admins can manage all reservations." ON public.reservations;

-- 2. DROP existing admin policies from extended_schema
DROP POLICY IF EXISTS "Admins can manage customers." ON public.customers;
DROP POLICY IF EXISTS "Admins can manage infractions." ON public.infractions;
DROP POLICY IF EXISTS "Admins can manage maintenance." ON public.maintenance;
DROP POLICY IF EXISTS "Admins can manage transactions." ON public.transactions;
DROP POLICY IF EXISTS "Admins can manage gps tracking." ON public.gps_tracking;

-- 3. RECREATE policies with ALL admin roles (super_admin, admin, gestionnaire, assistant)

-- Vehicles: all staff can manage
CREATE POLICY "Staff can manage vehicles." ON public.vehicles FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin', 'gestionnaire', 'assistant'))
);

-- Vehicle Images: all staff can manage
CREATE POLICY "Staff can manage vehicle images." ON public.vehicle_images FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin', 'gestionnaire', 'assistant'))
);

-- Reservations: all staff can manage
CREATE POLICY "Staff can manage all reservations." ON public.reservations FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin', 'gestionnaire', 'assistant'))
);

-- Customers: all staff can manage
CREATE POLICY "Staff can manage customers." ON public.customers FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin', 'gestionnaire', 'assistant'))
);

-- Infractions: all staff can manage
CREATE POLICY "Staff can manage infractions." ON public.infractions FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin', 'gestionnaire', 'assistant'))
);

-- Maintenance: all staff can manage
CREATE POLICY "Staff can manage maintenance." ON public.maintenance FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin', 'gestionnaire', 'assistant'))
);

-- Transactions: all staff can manage
CREATE POLICY "Staff can manage transactions." ON public.transactions FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin', 'gestionnaire', 'assistant'))
);

-- GPS Tracking: all staff can manage
CREATE POLICY "Staff can manage gps tracking." ON public.gps_tracking FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin', 'gestionnaire', 'assistant'))
);

-- 4. Helper function to check role WITHOUT triggering RLS on profiles (avoids infinite recursion)
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT role::text FROM public.profiles WHERE id = auth.uid();
$$;

-- 5. Fix profiles policy: Admins should be able to manage ALL profiles (for user management)
DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Staff can manage all profiles." ON public.profiles FOR ALL USING (
    public.get_my_role() IN ('admin', 'super_admin')
);
