-- =============================================
-- 07_seed.sql
-- =============================================

-- Vehicles Seed
DO $$
DECLARE
    v1 UUID := gen_random_uuid();
    v2 UUID := gen_random_uuid();
    v3 UUID := gen_random_uuid();
BEGIN
    INSERT INTO public.vehicles (id, brand, model, color, fuel_type, transmission, year, plate_number, price_per_day, deposit_amount, status)
    VALUES 
    (v1, 'Peugeot', '208 (Citadine)', 'Noir', 'Diesel', 'Manuelle', 2026, '208-A-001', 420.00, 5000.00, 'available'),
    (v2, 'Peugeot', '208 (Citadine)', 'Gris', 'Hybride', 'Automatique', 2026, '208-B-002', 520.00, 6000.00, 'available'),
    (v3, 'Dacia', 'Logan (Berline)', 'Blanc', 'Diesel', 'Manuelle', 2026, 'LOG-C-003', 300.00, 3000.00, 'available')
    ON CONFLICT (plate_number) DO NOTHING;

    INSERT INTO public.vehicle_images (vehicle_id, image_url, is_cover) VALUES
    (v1, '/images/cars/peugeot_208_noir.png', true),
    (v1, '/images/cars/peugeot_208_noir_front.png', false),
    (v2, '/images/cars/peugeot_208_gris.png', true),
    (v3, '/images/cars/dacia_logan_blanc.png', true)
    ON CONFLICT DO NOTHING;
END $$;
