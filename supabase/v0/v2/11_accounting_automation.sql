-- =============================================
-- 11_accounting_automation.sql
-- Automatic transaction logging for accounting
-- =============================================

-- 1. Function to sync reservation payment to transactions
CREATE OR REPLACE FUNCTION public.sync_reservation_payment_to_transactions()
RETURNS TRIGGER AS $$
DECLARE
    v_desc TEXT;
BEGIN
    -- If status moves to 'rented', 'returned', or 'completed' and no 'encaissement' transaction exists for it
    IF NEW.status IN ('rented', 'returned', 'completed') AND 
       NOT EXISTS (SELECT 1 FROM public.transactions WHERE reservation_id = NEW.id AND transaction_type = 'encaissement') THEN
        
        v_desc := 'Paiement de la Réservation #' || COALESCE(NEW.reservation_number, SUBSTRING(NEW.id::text, 1, 8));
        
        INSERT INTO public.transactions (
            reservation_id,
            customer_id,
            transaction_type,
            amount,
            payment_method,
            description,
            status,
            transaction_date
        ) VALUES (
            NEW.id,
            NEW.customer_id,
            'encaissement',
            NEW.total_price,
            NEW.payment_method,
            v_desc,
            'Payé',
            CURRENT_DATE
        );
    -- If total_price updated and transaction exists, update it?
    ELSIF OLD.status IN ('rented', 'returned', 'completed') AND OLD.total_price != NEW.total_price THEN
        UPDATE public.transactions 
        SET amount = NEW.total_price 
        WHERE reservation_id = NEW.id AND transaction_type = 'encaissement';
    END IF;
    
    RETURN NEW;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Function to sync handover deposit
CREATE OR REPLACE FUNCTION public.sync_handover_deposit_to_transactions()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.deposit_collected > 0 AND 
       NOT EXISTS (SELECT 1 FROM public.transactions WHERE reservation_id = NEW.reservation_id AND transaction_type = 'caution') THEN
        
        INSERT INTO public.transactions (
            reservation_id,
            customer_id,
            transaction_type,
            amount,
            description,
            status,
            transaction_date
        ) VALUES (
            NEW.reservation_id,
            NEW.customer_id,
            'caution',
            NEW.deposit_collected,
            'Caution encaissée - Dossier #' || SUBSTRING(NEW.reservation_id::text, 1, 8),
            'Payé',
            CURRENT_DATE
        );
    END IF;
    RETURN NEW;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Wiring Triggers
DROP TRIGGER IF EXISTS tr_res_payment_sync ON public.reservations;
CREATE TRIGGER tr_res_payment_sync
AFTER INSERT OR UPDATE OF status, total_price ON public.reservations
FOR EACH ROW EXECUTE FUNCTION public.sync_reservation_payment_to_transactions();

DROP TRIGGER IF EXISTS tr_handover_deposit_sync ON public.rental_handover_records;
CREATE TRIGGER tr_handover_deposit_sync
AFTER INSERT ON public.rental_handover_records
FOR EACH ROW EXECUTE FUNCTION public.sync_handover_deposit_to_transactions();
