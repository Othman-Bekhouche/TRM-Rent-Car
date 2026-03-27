-- Fix handover deposit trigger
CREATE OR REPLACE FUNCTION public.sync_handover_deposit_to_transactions() RETURNS trigger AS $$ 
BEGIN 
    -- If deposit_collected is true and no caution transaction exists for this reservation
    IF NEW.deposit_collected = true AND NOT EXISTS (
        SELECT 1 FROM public.transactions 
        WHERE reservation_id = NEW.reservation_id AND transaction_type = 'caution'
    ) THEN 
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
            NEW.reservation_id, 
            NEW.customer_id, 
            'caution', 
            0, -- Caution is often documented as 0 amount if only a footprint/auth, or the actual amount
            'Espèces', 
            'Dépôt de garantie collecté', 
            'Payé', 
            CURRENT_DATE
        ); 
    END IF; 
    RETURN NEW; 
END; 
$$ LANGUAGE plpgsql;

-- Sync maintenance costs to transactions
CREATE OR REPLACE FUNCTION public.sync_maintenance_to_transactions() RETURNS trigger AS $$
BEGIN
    IF NEW.actual_cost > 0 THEN
        INSERT INTO public.transactions (
            transaction_type,
            amount,
            payment_method,
            description,
            status,
            transaction_date
        ) VALUES (
            'décaissement',
            NEW.actual_cost,
            'Virement',
            'Frais de maintenance: ' || NEW.maintenance_type || ' (' || (SELECT plate_number FROM vehicles WHERE id = NEW.vehicle_id) || ')',
            'Payé',
            COALESCE(NEW.last_service_date::date, CURRENT_DATE)
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_sync_maintenance_to_transactions ON public.vehicle_maintenance_records;
CREATE TRIGGER tr_sync_maintenance_to_transactions
AFTER INSERT OR UPDATE OF actual_cost ON public.vehicle_maintenance_records
FOR EACH ROW
EXECUTE FUNCTION public.sync_maintenance_to_transactions();
