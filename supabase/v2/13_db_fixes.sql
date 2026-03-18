-- 1. Correct Transaction statuses and descriptions
UPDATE public.transactions SET status = 'Payé' WHERE status LIKE 'Pay%';
UPDATE public.transactions SET description = REPLACE(description, 'R??servation', 'Réservation');

-- 2. Fix RLS for Handovers
ALTER TABLE public.rental_handover_records ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Staff manage handovers" ON public.rental_handover_records;
CREATE POLICY "Staff manage handovers" ON public.rental_handover_records 
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 3. Correct Reservations if any
UPDATE public.reservations SET status = 'completed' WHERE status = 'Terminé';
UPDATE public.reservations SET status = 'confirmed' WHERE status = 'Confirmé';

-- 4. Invoices and Contracts (just in case they have same issues)
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Staff manage invoices" ON public.invoices;
CREATE POLICY "Staff manage invoices" ON public.invoices FOR ALL TO authenticated USING (true) WITH CHECK (true);

ALTER TABLE public.rental_contracts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Staff manage contracts" ON public.rental_contracts;
CREATE POLICY "Staff manage contracts" ON public.rental_contracts FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 5. RELOAD SCHEMA CACHE
NOTIFY pgrst, 'reload schema';
