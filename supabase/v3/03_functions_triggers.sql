-- =============================================
-- 03_functions_triggers.sql
-- =============================================

-- 1. Updated At Trigger Function
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Security Helpers
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT LANGUAGE sql SECURITY DEFINER STABLE AS $$
    SELECT role::text FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'super_admin', 'gestionnaire', 'assistant')
    );
$$;

-- 3. Checkout RPC (Quick Customer Creation/Update)
CREATE OR REPLACE FUNCTION public.handle_checkout_customer(
    p_first_name text, p_last_name text, p_email text, p_phone text,
    p_cin text, p_address text, p_city text, p_status text
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_customer_id uuid;
BEGIN
    SELECT id INTO v_customer_id FROM public.customers WHERE LOWER(email) = LOWER(p_email) LIMIT 1;
    IF v_customer_id IS NOT NULL THEN
        UPDATE public.customers SET
            full_name = p_first_name || ' ' || p_last_name, phone = p_phone, cin = COALESCE(p_cin, cin),
            address = COALESCE(p_address, address), city = COALESCE(p_city, city), status = p_status, updated_at = NOW()
        WHERE id = v_customer_id;
    ELSE
        INSERT INTO public.customers (full_name, email, phone, cin, address, city, status)
        VALUES (p_first_name || ' ' || p_last_name, LOWER(p_email), p_phone, p_cin, p_address, p_city, p_status)
        RETURNING id INTO v_customer_id;
    END IF;
    RETURN v_customer_id;
END; $$;

-- 4. Auth Link (Auto-create profile and customer on signup)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'full_name', 'Client'), new.email, 'customer')
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
  
  INSERT INTO public.customers (id, full_name, email, phone)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'full_name', 'Client'), new.email, COALESCE(new.raw_user_meta_data->>'phone', ''))
  ON CONFLICT (email) DO NOTHING;
  
  RETURN NEW;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Availability Check RPC (The Fixed Version)
CREATE OR REPLACE FUNCTION public.check_vehicle_availability(
    p_vehicle_id uuid, 
    p_start_date date, 
    p_end_date date,
    p_exclude_id uuid DEFAULT NULL
)
RETURNS TABLE (is_available boolean, next_available_date date) AS $$
DECLARE
    v_conflict_end date;
BEGIN
    SELECT end_date INTO v_conflict_end
    FROM public.reservations
    WHERE vehicle_id = p_vehicle_id
    AND status NOT IN ('cancelled', 'completed', 'returned', 'rejected')
    AND (p_exclude_id IS NULL OR id != p_exclude_id)
    AND (
        (p_start_date BETWEEN start_date AND end_date) OR
        (p_end_date BETWEEN start_date AND end_date) OR
        (start_date BETWEEN p_start_date AND p_end_date)
    )
    LIMIT 1;

    IF v_conflict_end IS NULL THEN
        RETURN QUERY SELECT true, NULL::date;
    ELSE
        RETURN QUERY SELECT false, (v_conflict_end + INTERVAL '1 day')::date;
    END IF;
END; $$ LANGUAGE plpgsql STABLE;

-- 6. Accounting Automation: Reservation Payments
CREATE OR REPLACE FUNCTION public.sync_reservation_payment_to_transactions()
RETURNS TRIGGER AS $$
DECLARE
    v_desc TEXT;
BEGIN
    -- Sync on payment-worthy statuses
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
    ELSIF OLD.status IN ('rented', 'returned', 'completed') AND OLD.total_price != NEW.total_price THEN
        UPDATE public.transactions 
        SET amount = NEW.total_price 
        WHERE reservation_id = NEW.id AND transaction_type = 'encaissement';
    END IF;
    
    RETURN NEW;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Accounting Automation: Handover Deposit
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

-- 8. WIRING TRIGGERS
-- Auth and Profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- Note: Requires auth schema to exist. In manual setup, we might need to handle this.
-- CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated At
DO $$ 
DECLARE
    t text;
BEGIN
    FOR t IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('profiles', 'vehicles', 'customers', 'reservations', 'vehicle_maintenance_records', 'company_settings', 'infractions', 'quotes', 'invoices', 'rental_contracts', 'rental_handover_records')) LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS set_updated_at ON public.%I', t);
        EXECUTE format('CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.update_updated_at()', t);
    END LOOP;
END $$;

-- Accounting triggers
DROP TRIGGER IF EXISTS tr_res_payment_sync ON public.reservations;
CREATE TRIGGER tr_res_payment_sync
AFTER INSERT OR UPDATE OF status, total_price ON public.reservations
FOR EACH ROW EXECUTE FUNCTION public.sync_reservation_payment_to_transactions();

DROP TRIGGER IF EXISTS tr_handover_deposit_sync ON public.rental_handover_records;
CREATE TRIGGER tr_handover_deposit_sync
AFTER INSERT ON public.rental_handover_records
FOR EACH ROW EXECUTE FUNCTION public.sync_handover_deposit_to_transactions();
