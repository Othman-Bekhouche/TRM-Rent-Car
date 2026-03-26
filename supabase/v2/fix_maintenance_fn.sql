CREATE OR REPLACE FUNCTION public.check_vehicle_maintenance_by_id(p_vehicle_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_vehicle RECORD;
    v_latest_maint RECORD;
    v_alert_msg TEXT;
    v_mileage_threshold INTEGER := 1000;
    v_days_threshold INTEGER := 30;
BEGIN
    SELECT * INTO v_vehicle FROM public.vehicles WHERE id = p_vehicle_id;
    IF NOT FOUND THEN RETURN; END IF;

    -- Find latest completed maintenance record
    SELECT * INTO v_latest_maint 
    FROM public.vehicle_maintenance_records 
    WHERE vehicle_id = p_vehicle_id AND (status ILIKE 'Termine%' OR status = 'Terminé')
    ORDER BY last_service_date DESC, created_at DESC
    LIMIT 1;

    IF v_latest_maint IS NOT NULL THEN
        -- Mileage Check
        IF v_latest_maint.next_service_mileage IS NOT NULL AND v_vehicle.mileage >= (v_latest_maint.next_service_mileage - v_mileage_threshold) THEN
            v_alert_msg := 'Entretien ' || v_latest_maint.maintenance_type || ' a prevoir (' || v_latest_maint.next_service_mileage || ' km). Actuel: ' || v_vehicle.mileage || ' km.';
            
            INSERT INTO public.maintenance_alerts (vehicle_id, maintenance_record_id, alert_type, alert_message, priority, status)
            VALUES (p_vehicle_id, v_latest_maint.id, 'Mileage', v_alert_msg, 
                    CASE WHEN v_vehicle.mileage >= v_latest_maint.next_service_mileage THEN 'urgent' ELSE 'high' END, 
                    'active')
            ON CONFLICT (vehicle_id, alert_type, status) DO UPDATE SET alert_message = EXCLUDED.alert_message, priority = EXCLUDED.priority;
            
            PERFORM public.notify_staff('Alerte Kilometrage', v_alert_msg, 'warning', NULL, '/admin/maintenance');
        END IF;

        -- Date Check
        IF v_latest_maint.next_service_date IS NOT NULL AND v_latest_maint.next_service_date <= (CURRENT_DATE + v_days_threshold) THEN
            v_alert_msg := 'Entretien ' || v_latest_maint.maintenance_type || ' prevu pour le ' || v_latest_maint.next_service_date;
            
             INSERT INTO public.maintenance_alerts (vehicle_id, maintenance_record_id, alert_type, alert_message, priority, status)
             VALUES (p_vehicle_id, v_latest_maint.id, 'Date', v_alert_msg, 
                     CASE WHEN v_latest_maint.next_service_date <= CURRENT_DATE THEN 'urgent' ELSE 'medium' END, 
                     'active')
             ON CONFLICT (vehicle_id, alert_type, status) DO UPDATE SET alert_message = EXCLUDED.alert_message, priority = EXCLUDED.priority;

             PERFORM public.notify_staff('Echeance de Maintenance', v_alert_msg, 'warning', NULL, '/admin/maintenance');
        END IF;
    END IF;
END;
$function$;
