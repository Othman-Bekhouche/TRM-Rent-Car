CREATE POLICY "Public view reservations for calendar V2" ON public.reservations FOR SELECT USING (true);
