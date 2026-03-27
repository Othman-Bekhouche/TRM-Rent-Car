-- =============================================
-- TRM Rent Car — Fix Notifications Trigger RLS
-- =============================================

-- the trigger runs with invoker privileges, which fails for Guest users (no permission to insert into system_notifications)
-- Redefine it as SECURITY DEFINER so it runs with the privileges of the creator (postgres/admin)

CREATE OR REPLACE FUNCTION notify_new_reservation()
RETURNS TRIGGER
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.system_notifications (title, message, type, link)
    VALUES (
        'Nouvelle Réservation', 
        'Une nouvelle réservation a été créée. En attente de validation.', 
        'success', 
        '/admin/reservations'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
