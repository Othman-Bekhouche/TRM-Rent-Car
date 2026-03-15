-- =============================================
-- 03_functions.sql
-- =============================================

-- 1. Helper for updated_at
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

-- 3. Checkout RPC
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

-- 4. Auth Trigger Function
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
