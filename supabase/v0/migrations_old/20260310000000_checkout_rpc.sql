CREATE OR REPLACE FUNCTION public.handle_checkout_customer(
    p_first_name text,
    p_last_name text,
    p_email text,
    p_phone text,
    p_cin text,
    p_address text,
    p_city text,
    p_status text
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_customer_id uuid;
BEGIN
    -- Check if customer exists by email (case-insensitive)
    IF p_email IS NOT NULL AND p_email != '' THEN
        SELECT id INTO v_customer_id FROM public.customers WHERE LOWER(email) = LOWER(p_email) LIMIT 1;
    END IF;
    
    IF v_customer_id IS NOT NULL THEN
        -- Update existing customer
        UPDATE public.customers SET
            full_name = p_first_name || ' ' || p_last_name,
            phone = p_phone,
            cin = COALESCE(p_cin, cin),
            address = COALESCE(p_address, address),
            city = COALESCE(p_city, city),
            status = p_status,
            updated_at = NOW()
        WHERE id = v_customer_id;
    ELSE
        -- Insert new customer
        INSERT INTO public.customers (full_name, email, phone, cin, address, city, status)
        VALUES (p_first_name || ' ' || p_last_name, LOWER(NULLIF(p_email, '')), p_phone, p_cin, p_address, p_city, p_status)
        RETURNING id INTO v_customer_id;
    END IF;
    
    RETURN v_customer_id;
END;
$$;
