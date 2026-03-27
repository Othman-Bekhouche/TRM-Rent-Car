-- =============================================
-- 09_accounting_v2.sql
-- Enhancing accounting with categories and improved tracking
-- =============================================

-- 1. Add category column to transactions
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS category TEXT;

-- 2. Update existing transactions with sensible defaults
UPDATE public.transactions 
SET category = 'Location' 
WHERE transaction_type = 'encaissement' AND category IS NULL;

UPDATE public.transactions 
SET category = 'Maintenance' 
WHERE description LIKE '%Maintenance%' AND category IS NULL;

UPDATE public.transactions 
SET category = 'Caution' 
WHERE transaction_type = 'caution' AND category IS NULL;

UPDATE public.transactions 
SET category = 'Autre' 
WHERE category IS NULL;

-- 3. Update Trigger Functions to include category

-- Update reservation payment sync
CREATE OR REPLACE FUNCTION public.sync_reservation_payment_to_transactions()
RETURNS TRIGGER AS $$
DECLARE
    v_desc TEXT;
BEGIN
    IF NEW.status IN ('rented', 'returned', 'completed') AND 
       NOT EXISTS (SELECT 1 FROM public.transactions WHERE reservation_id = NEW.id AND transaction_type = 'encaissement') THEN
        
        v_desc := 'Paiement de la Réservation #' || COALESCE(NEW.reservation_number, SUBSTRING(NEW.id::text, 1, 8));
        
        INSERT INTO public.transactions (
            reservation_id,
            customer_id,
            transaction_type,
            category,
            amount,
            payment_method,
            description,
            status,
            transaction_date
        ) VALUES (
            NEW.id,
            NEW.customer_id,
            'encaissement',
            'Location',
            NEW.total_price,
            NEW.payment_method,
            v_desc,
            'Payé',
            CURRENT_DATE
        );
    ELSIF OLD.status IN ('rented', 'returned', 'completed') AND OLD.total_price != NEW.total_price THEN
        UPDATE public.transactions 
        SET amount = NEW.total_price 
        WHERE reservation_id = NEW.id AND transaction_type = 'encaissement';
    END IF;
    
    RETURN NEW;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update maintenance sync
CREATE OR REPLACE FUNCTION public.sync_maintenance_to_transactions() RETURNS trigger AS $$
BEGIN
    IF NEW.actual_cost > 0 THEN
        INSERT INTO public.transactions (
            transaction_type,
            category,
            amount,
            payment_method,
            description,
            status,
            transaction_date
        ) VALUES (
            'charge',
            'Maintenance',
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

-- Update handover deposit sync
CREATE OR REPLACE FUNCTION public.sync_handover_deposit_to_transactions() RETURNS trigger AS $$ 
BEGIN 
    IF NEW.deposit_collected = true AND NOT EXISTS (
        SELECT 1 FROM public.transactions 
        WHERE reservation_id = NEW.reservation_id AND transaction_type = 'caution'
    ) THEN 
        INSERT INTO public.transactions (
            reservation_id, 
            customer_id, 
            transaction_type, 
            category,
            amount, 
            payment_method, 
            description, 
            status, 
            transaction_date
        ) VALUES (
            NEW.reservation_id, 
            NEW.customer_id, 
            'caution', 
            'Caution',
            0, 
            'Espèces', 
            'Dépôt de garantie collecté', 
            'Payé', 
            CURRENT_DATE
        ); 
    END IF; 
    RETURN NEW; 
END; 
$$ LANGUAGE plpgsql;
