-- Final fix for Customer Profile and RLS visibility
-- This ensures that customers can ALWAYS see their own record and their reservations

-- 1. Ensure RLS is enabled
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing potentially conflicting policies to avoid confusion
DROP POLICY IF EXISTS "Public can view customers." ON public.customers;
DROP POLICY IF EXISTS "Customers can view their own reservations." ON public.reservations;
DROP POLICY IF EXISTS "Users can view own reservations." ON public.reservations;

-- 3. Create robust case-insensitive policies for Customers table
CREATE POLICY "Customers can view own record." ON public.customers
    FOR SELECT USING (
        LOWER(email) = LOWER(COALESCE(auth.jwt()->>'email', auth.email()))
    );

-- 4. Create robust case-insensitive policies for Reservations table
-- A user can see a reservation if it's linked to a customer record that matches their email
CREATE POLICY "Users can view own reservations." ON public.reservations
    FOR SELECT USING (
        customer_id IN (
            SELECT id FROM public.customers WHERE LOWER(email) = LOWER(COALESCE(auth.jwt()->>'email', auth.email()))
        )
    );

-- 5. Staff access (ensure admins can always see everything)
CREATE POLICY "Staff can view all customers." ON public.customers
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin', 'gestionnaire', 'assistant'))
    );

CREATE POLICY "Staff can view all reservations." ON public.reservations
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin', 'gestionnaire', 'assistant'))
    );

-- 6. Add a fallback policy for the 'customers' table to allow registration/lookup during checkout
CREATE POLICY "Allow public lookup for checkout." ON public.customers
    FOR SELECT USING (true);
