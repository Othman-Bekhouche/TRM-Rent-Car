-- Trigger pour empêcher les réservations chevauchantes
CREATE OR REPLACE FUNCTION check_reservation_overlap()
RETURNS TRIGGER AS $$
BEGIN
    -- Ignorer si la nouvelle réservation est 'annulée' ou 'rejetée'
    IF NEW.status IN ('cancelled', 'rejected') THEN
        RETURN NEW;
    END IF;

    IF EXISTS (
        SELECT 1 FROM public.reservations
        WHERE vehicle_id = NEW.vehicle_id
        AND id != NEW.id -- Ignorer soi-même lors de la mise à jour
        AND status NOT IN ('cancelled', 'rejected') -- Ignorer les anciennes résa annulées
        AND (
            (NEW.start_date, NEW.end_date) OVERLAPS (start_date, end_date)
        )
    ) THEN
        RAISE EXCEPTION 'ERREUR_CHEVAUCHEMENT : Ce vehicule est deja reserve sur cette periode.';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_reservation_overlap ON public.reservations;
CREATE TRIGGER trg_check_reservation_overlap
BEFORE INSERT OR UPDATE ON public.reservations
FOR EACH ROW
EXECUTE FUNCTION check_reservation_overlap();
