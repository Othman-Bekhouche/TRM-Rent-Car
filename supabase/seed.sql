-- Nettoyage de la base
DELETE FROM public.vehicles;

-- Insertion de véhicules de gamme économique
DO $$
DECLARE
    v1 UUID := gen_random_uuid();
    v2 UUID := gen_random_uuid();
BEGIN
    -- Véhicules
    INSERT INTO public.vehicles (id, brand, model, year, plate_number, transmission, fuel_type, seats, mileage, price_per_day, deposit_amount, status, description)
    VALUES 
    (v1, 'Dacia', 'Logan', 2026, '12345-A-1', 'Manuelle', 'Diesel', 5, 1200, 300.00, 5000.00, 'available', 'Le choix économique par excellence. La nouvelle Dacia Logan 2026 offre un espace généreux, une consommation de carburant très faible et un confort optimal pour vos trajets en ville comme sur autoroute.'),
    
    (v2, 'Peugeot', '208', 2024, '67890-B-2', 'Manuelle', 'Essence', 5, 8400, 300.00, 5000.00, 'available', 'Citadine moderne au design audacieux. La Peugeot 208 est parfaite pour se faufiler en ville. Elle allie technologie, confort de conduite et agilité.');

    -- Images factices (Veuillez utiliser de vraies photos plus tard, ici ce sont des images génériques)
    INSERT INTO public.vehicle_images (vehicle_id, image_url, is_cover) VALUES
    (v1, 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80', true),
    (v2, 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&q=80', true);

END $$;
