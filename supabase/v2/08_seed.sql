-- =============================================
-- 08_seed.sql
-- Données de test et configuration initiale TRM
-- =============================================

DO $$
DECLARE
    -- Utilisation d'IDs fixes
    v1 UUID := '62e7d409-0ee6-4ea9-b05d-2e7cdcc1be18';
    v2 UUID := '72e7d409-0ee6-4ea9-b05d-2e7cdcc1be19';
    v3 UUID := '82e7d409-0ee6-4ea9-b05d-2e7cdcc1be20';
BEGIN
    -- Insertion des Véhicules (Gestion des conflits sur ID et Plate Number)
    INSERT INTO public.vehicles (id, brand, model, color, fuel_type, transmission, year, plate_number, price_per_day, deposit_amount, status)
    VALUES 
    (v1, 'Peugeot', '208 (Citadine)', 'Noir', 'Diesel', 'Manuelle', 2026, '208-A-001', 420.00, 5000.00, 'available'),
    (v2, 'Peugeot', '208 (Citadine)', 'Gris', 'Hybride', 'Automatique', 2026, '208-B-002', 520.00, 6000.00, 'available'),
    (v3, 'Dacia', 'Logan (Berline)', 'Blanc', 'Diesel', 'Manuelle', 2026, 'LOG-C-003', 300.00, 3000.00, 'available')
    ON CONFLICT (id) DO UPDATE SET 
        plate_number = EXCLUDED.plate_number,
        status = EXCLUDED.status;

    -- Insertion des Images
    INSERT INTO public.vehicle_images (vehicle_id, image_url, is_cover) VALUES
    (v1, '/images/cars/peugeot_208_noir.png', true),
    (v1, '/images/cars/peugeot_208_noir_front.png', false),
    (v2, '/images/cars/peugeot_208_gris.png', true),
    (v3, '/images/cars/dacia_logan_blanc.png', true)
    ON CONFLICT DO NOTHING;

    -- Paramètres de l'entreprise
    INSERT INTO public.company_settings (company_name, phone, email, address, website, delivery_fee, discount_week, discount_month)
    VALUES ('TRM Rent Car', '06 06 06 6426', 'trm.rentcar@gmail.com', 'Appt Sabrine 2éme Etage N°6 Bloc A, 65800 Taourirt', 'www.trmrentcar.ma', 0, 0, 0)
    ON CONFLICT DO NOTHING;

END $$;
