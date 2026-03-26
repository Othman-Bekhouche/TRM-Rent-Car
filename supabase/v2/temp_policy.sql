DROP POLICY IF EXISTS "Public view reservations for calendar" ON public.reservations;
CREATE POLICY "Public view reservations for calendar" ON public.reservations FOR SELECT USING (true);
