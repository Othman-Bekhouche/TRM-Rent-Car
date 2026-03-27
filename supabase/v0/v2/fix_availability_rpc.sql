CREATE OR REPLACE FUNCTION public.check_vehicle_availability(p_vehicle_id uuid, p_start_date date, p_end_date date)
RETURNS TABLE (is_available boolean, next_available_date date) AS $$
DECLARE
    v_conflict_end date;
BEGIN
    SELECT end_date INTO v_conflict_end
    FROM public.reservations
    WHERE vehicle_id = p_vehicle_id
    AND status NOT IN ('cancelled', 'completed', 'returned', 'rejected')
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
