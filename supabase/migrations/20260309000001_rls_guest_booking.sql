-- Allow public to insert customers (for guest booking)
CREATE POLICY "Public can insert customers." ON public.customers
    FOR INSERT WITH CHECK (true);

-- Allow public to insert reservations (for guest booking)
CREATE POLICY "Public can insert reservations." ON public.reservations
    FOR INSERT WITH CHECK (true);

-- Allow users to view their own reservations (if they are logged in)
CREATE POLICY "Users can view own reservations." ON public.reservations
    FOR SELECT USING (customer_id IN (
        SELECT id FROM public.customers WHERE email = auth.jwt()->>'email'
    ));

-- Ensure profiles can be created during registration
CREATE POLICY "Enable insert for authenticated users only" ON "public"."profiles"
FOR INSERT WITH CHECK (auth.uid() = id);
