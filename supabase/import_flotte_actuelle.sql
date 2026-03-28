-- Insertion des véhicules de la flotte actuelle TRM Rent Car au prix unique de 300 DH

DO $$
DECLARE
    -- Génération d'ID uniques
    uuid_208_noir UUID := gen_random_uuid();
    uuid_208_gris UUID := gen_random_uuid();
    uuid_logan_1 UUID := gen_random_uuid();
    uuid_logan_2 UUID := gen_random_uuid();
    uuid_sandero_1 UUID := gen_random_uuid();
    uuid_sandero_2 UUID := gen_random_uuid();
    uuid_sandero_3 UUID := gen_random_uuid();
BEGIN
    -- 0. NETTOYAGE COMPLET (Suppression totale de l'historique et des anciennes voitures)
    -- Remarque : Ceci supprimera toutes les réservations en cascade pour éviter les conflits
    DELETE FROM public.quotes;
    DELETE FROM public.infractions;
    DELETE FROM public.reservations;
    DELETE FROM public.vehicles;

    -- 1. Insertion des véhicules dans la table `vehicles`
    INSERT INTO public.vehicles (
        id, brand, model, year, plate_number, transmission, fuel_type, 
        seats, doors, color, traction, price_per_day, deposit_amount, status
    ) VALUES 
    (
        uuid_208_noir, 'Peugeot', '208', 2026, 'P-208-NOIR-1', 'Manuelle 6éme', 'Diesel', 
        5, 5, 'Noir', 'Traction avant', 300.00, 5000.00, 'available'
    ),
    (
        uuid_208_gris, 'Peugeot', '208', 2026, 'P-208-GRIS-1', 'Automatique 6éme', 'Hybride Essence', 
        5, 5, 'Gris', 'Traction avant', 300.00, 5000.00, 'available'
    ),
    (
        uuid_logan_1, 'Dacia', 'Logan', 2026, 'D-LOG-BLANC-1', 'Manuelle', 'Diesel', 
        5, 5, 'Blanc', 'Traction avant', 300.00, 3000.00, 'available'
    ),
    (
        uuid_logan_2, 'Dacia', 'Logan', 2026, 'D-LOG-GRIS-1', 'Manuelle', 'Diesel', 
        5, 5, 'Gris', 'Traction avant', 300.00, 3000.00, 'available'
    ),
    (
        uuid_sandero_1, 'Dacia', 'Sandero', 2026, 'D-SAN-BLANC-1', 'Manuelle', 'Diesel', 
        5, 5, 'Blanc', 'Traction avant', 300.00, 3000.00, 'available'
    ),
    (
        uuid_sandero_2, 'Dacia', 'Sandero', 2026, 'D-SAN-GRIS-1', 'Manuelle', 'Diesel', 
        5, 5, 'Gris', 'Traction avant', 300.00, 3000.00, 'available'
    ),
    (
        uuid_sandero_3, 'Dacia', 'Sandero', 2026, 'D-SAN-GRIS-2', 'Manuelle', 'Diesel', 
        5, 5, 'Gris', 'Traction avant', 300.00, 3000.00, 'available'
    )
    ON CONFLICT (plate_number) DO NOTHING;

    -- 2. Insertion des images correspondantes dans `vehicle_images`
    INSERT INTO public.vehicle_images (vehicle_id, image_url, is_cover) VALUES
    -- Images Peugeot 208 Noir
    (uuid_208_noir, '/images/cars/peugeot_208_noir.png', true),
    (uuid_208_noir, '/images/cars/peugeot_208_noir_front.png', false),
    (uuid_208_noir, '/images/cars/peugeot_208_noir_rear.png', false),
    (uuid_208_noir, '/images/cars/peugeot_208_noir_interior.png', false),

    -- Images Peugeot 208 Gris
    (uuid_208_gris, '/images/cars/peugeot_208_gris.png', true),
    (uuid_208_gris, '/images/cars/peugeot_208_gris_front.png', false),
    (uuid_208_gris, '/images/cars/peugeot_208_gris_rear.png', false),
    (uuid_208_gris, '/images/cars/peugeot_208_gris_interior.png', false),

    -- Images Dacia Logan 1 (Blanc)
    (uuid_logan_1, '/images/cars/dacia_logan_blanc.png', true),
    (uuid_logan_1, '/images/cars/dacia_logan_blanc_front.png', false),
    (uuid_logan_1, '/images/cars/dacia_logan_blanc_rear.png', false),
    (uuid_logan_1, '/images/cars/dacia_logan_blanc_interior.png', false),

    -- Images Dacia Logan 2 (Gris)
    (uuid_logan_2, '/images/cars/dacia_logan_gris.png', true),
    (uuid_logan_2, '/images/cars/dacia_logan_gris_front.png', false),
    (uuid_logan_2, '/images/cars/dacia_logan_gris_rear.png', false),
    (uuid_logan_2, '/images/cars/dacia_logan_gris_interior.png', false),

    -- Images Dacia Sandero 1 (Blanc)
    (uuid_sandero_1, '/images/cars/dacia_sandero_blanc.png', true),

    -- Images Dacia Sandero 2 et 3 (Gris)
    (uuid_sandero_2, '/images/cars/dacia_sandero_gris.png', true),
    (uuid_sandero_2, '/images/cars/dacia_sandero_gris_front.png', false),
    (uuid_sandero_2, '/images/cars/dacia_sandero_gris_rear.png', false),
    (uuid_sandero_2, '/images/cars/dacia_sandero_gris_interior.png', false),

    (uuid_sandero_3, '/images/cars/dacia_sandero_gris.png', true)
    
    ON CONFLICT DO NOTHING;

END $$;
