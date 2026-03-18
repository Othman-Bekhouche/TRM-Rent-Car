-- =============================================
-- 10_notifications_and_alerts.sql
-- Enhanced notification and maintenance system
-- =============================================

-- 1. Unique constraint for alerts to prevent duplicates
ALTER TABLE public.maintenance_alerts DROP CONSTRAINT IF EXISTS maintenance_alerts_unique_vehicle_alert;
ALTER TABLE public.maintenance_alerts ADD CONSTRAINT maintenance_alerts_unique_vehicle_alert UNIQUE (vehicle_id, alert_type, status);

-- 2. Extend system_notifications for interactivity
ALTER TABLE public.system_notifications ADD COLUMN IF NOT EXISTS link TEXT;
ALTER TABLE public.system_notifications ADD COLUMN IF NOT EXISTS metadata JSONB;

-- 3. Enhanced notify function with link support and fixed encoding
CREATE OR REPLACE FUNCTION public.notify_staff(
    p_title text, 
    p_message text, 
    p_type text DEFAULT 'info',
    p_user_id uuid DEFAULT NULL,
    p_link text DEFAULT NULL
) RETURNS void AS $$
BEGIN
    INSERT INTO public.system_notifications (title, message, type, user_id, link)
    VALUES (p_title, p_message, p_type, p_user_id, p_link);
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Maintenance Logic by Vehicle ID
CREATE OR REPLACE FUNCTION public.check_vehicle_maintenance_by_id(p_vehicle_id uuid)
RETURNS void AS $$
DECLARE
    v_vehicle RECORD;
    v_latest_maint RECORD;
    v_alert_msg TEXT;
    v_mileage_threshold INT := 1000;
    v_days_threshold INT := 30;
BEGIN
    SELECT * INTO v_vehicle FROM public.vehicles WHERE id = p_vehicle_id;
    IF NOT FOUND THEN RETURN; END IF;

    -- Find latest completed maintenance record
    SELECT * INTO v_latest_maint 
    FROM public.vehicle_maintenance_records 
    WHERE vehicle_id = p_vehicle_id AND status = 'Terminé'
    ORDER BY last_service_date DESC, created_at DESC
    LIMIT 1;

    IF v_latest_maint IS NOT NULL THEN
        -- Mileage Check
        IF v_vehicle.mileage >= (v_latest_maint.next_service_mileage - v_mileage_threshold) THEN
            v_alert_msg := 'Entretien ' || v_latest_maint.maintenance_type || ' à prévoir (' || v_latest_maint.next_service_mileage || ' km). Actuel: ' || v_vehicle.mileage || ' km.';
            
            INSERT INTO public.maintenance_alerts (vehicle_id, maintenance_record_id, alert_type, alert_message, priority, status)
            VALUES (p_vehicle_id, v_latest_maint.id, 'Mileage', v_alert_msg, 
                    CASE WHEN v_vehicle.mileage >= v_latest_maint.next_service_mileage THEN 'urgent' ELSE 'high' END, 
                    'active')
            ON CONFLICT (vehicle_id, alert_type, status) DO UPDATE SET alert_message = EXCLUDED.alert_message, priority = EXCLUDED.priority;
            
            PERFORM public.notify_staff('Alerte Kilométrage', v_alert_msg, 'warning', NULL, '/admin/maintenance');
        END IF;

        -- Date Check
        IF v_latest_maint.next_service_date IS NOT NULL AND v_latest_maint.next_service_date <= (CURRENT_DATE + v_days_threshold) THEN
            v_alert_msg := 'Entretien ' || v_latest_maint.maintenance_type || ' prévu pour le ' || v_latest_maint.next_service_date;
            
             INSERT INTO public.maintenance_alerts (vehicle_id, maintenance_record_id, alert_type, alert_message, priority, status)
             VALUES (p_vehicle_id, v_latest_maint.id, 'Date', v_alert_msg, 
                     CASE WHEN v_latest_maint.next_service_date <= CURRENT_DATE THEN 'urgent' ELSE 'medium' END, 
                     'active')
             ON CONFLICT (vehicle_id, alert_type, status) DO UPDATE SET alert_message = EXCLUDED.alert_message, priority = EXCLUDED.priority;

             PERFORM public.notify_staff('Echéance de Maintenance', v_alert_msg, 'warning', NULL, '/admin/maintenance');
        END IF;
    END IF;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Trigger Functions
CREATE OR REPLACE FUNCTION public.trigger_check_vehicle_maintenance()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_TABLE_NAME = 'vehicles' THEN
        PERFORM public.check_vehicle_maintenance_by_id(NEW.id);
    ELSIF TG_TABLE_NAME = 'vehicle_maintenance_records' THEN
        PERFORM public.check_vehicle_maintenance_by_id(NEW.vehicle_id);
    END IF;
    RETURN NEW;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.tr_notify_reservation()
RETURNS TRIGGER AS $$
DECLARE
    v_cust_name TEXT;
    v_veh_name TEXT;
BEGIN
    SELECT full_name INTO v_cust_name FROM public.customers WHERE id = NEW.customer_id;
    SELECT brand || ' ' || model INTO v_veh_name FROM public.vehicles WHERE id = NEW.vehicle_id;
    
    PERFORM public.notify_staff(
        'Nouvelle Réservation',
        'Client: ' || COALESCE(v_cust_name, 'Inconnu') || ' | Véhicule: ' || COALESCE(v_veh_name, 'Inconnu'),
        'info',
        NULL,
        '/admin/reservations/' || NEW.id
    );
    RETURN NEW;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Check upcoming returns (48h reminder)
CREATE OR REPLACE FUNCTION public.check_upcoming_reservation_returns()
RETURNS void AS $$
DECLARE
    v_res RECORD;
    v_msg TEXT;
BEGIN
    FOR v_res IN 
        SELECT r.*, c.full_name as cust_name, v.brand, v.model
        FROM public.reservations r
        JOIN public.customers c ON r.customer_id = c.id
        JOIN public.vehicles v ON r.vehicle_id = v.id
        WHERE r.status = 'rented' 
        AND r.end_date = CURRENT_DATE + INTERVAL '2 days'
        AND NOT EXISTS (
            SELECT 1 FROM public.system_notifications 
            WHERE link = '/admin/reservations/' || r.id 
            AND title = 'Rappel de Retour'
        )
    LOOP
        v_msg := 'La voiture ' || v_res.brand || ' ' || v_res.model || ' louée par ' || v_res.cust_name || ' doit être retournée dans 48h.';
        PERFORM public.notify_staff('Rappel de Retour', v_msg, 'info', NULL, '/admin/reservations/' || v_res.id);
    END LOOP;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Wiring Triggers
DROP TRIGGER IF EXISTS tr_check_maintenance ON public.vehicles;
CREATE TRIGGER tr_check_maintenance
AFTER INSERT OR UPDATE OF mileage ON public.vehicles
FOR EACH ROW EXECUTE FUNCTION public.trigger_check_vehicle_maintenance();

DROP TRIGGER IF EXISTS tr_check_maintenance_record ON public.vehicle_maintenance_records;
CREATE TRIGGER tr_check_maintenance_record
AFTER INSERT OR UPDATE ON public.vehicle_maintenance_records
FOR EACH ROW EXECUTE FUNCTION public.trigger_check_vehicle_maintenance();

DROP TRIGGER IF EXISTS tr_reservation_notify ON public.reservations;
CREATE TRIGGER tr_reservation_notify
AFTER INSERT ON public.reservations
FOR EACH ROW EXECUTE FUNCTION public.tr_notify_reservation();
