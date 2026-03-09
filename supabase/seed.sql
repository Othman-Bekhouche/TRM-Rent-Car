-- Nettoyage de la base
DELETE FROM public.profiles;
DELETE FROM public.vehicles;

-- 1. Insertion du compte administrateur (DEMO SEED)
-- ATTENTION: Ceci est pour le développement local uniquement.
-- En production, les mots de passe et comptes doivent être gérés via Supabase Auth sécurisé.
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES 
('d5d4d3d2-d1d0-4a9b-8c8d-7e6f5d4c3b2a', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin@trmrentcar.ma', crypt('AdminTRM2026!', gen_salt('bf')), NOW(), NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, full_name, email, phone, role, created_at)
VALUES 
('d5d4d3d2-d1d0-4a9b-8c8d-7e6f5d4c3b2a', 'Admin TRM', 'admin@trmrentcar.ma', '+212600000000', 'super_admin', NOW())
ON CONFLICT (id) DO NOTHING;


-- 2. Insertion de véhicules adaptés au marché marocain
DO $$
DECLARE
    v1 UUID := gen_random_uuid();
    v2 UUID := gen_random_uuid();
    v3 UUID := gen_random_uuid();
    v4 UUID := gen_random_uuid();
    v5 UUID := gen_random_uuid();
    v6 UUID := gen_random_uuid();
BEGIN
    -- Véhicules
    INSERT INTO public.vehicles (id, brand, model, year, plate_number, transmission, fuel_type, seats, price_per_day, deposit_amount, status, description)
    VALUES 
    (v1, 'Dacia', 'Logan', 2024, '12345-A-1', 'Manuelle', 'Diesel', 5, 250.00, 3000.00, 'available', 'Véhicule économique et robuste, idéal pour les trajets quotidiens et longs trajets au Maroc.'),
    (v2, 'Peugeot', '208', 2024, '23456-B-2', 'Automatique', 'Essence', 5, 300.00, 5000.00, 'available', 'Citadine moderne avec un design audacieux et un confort remarquable, parfaite pour la ville.'),
    (v3, 'Renault', 'Clio 5', 2025, '34567-C-3', 'Automatique', 'Diesel', 5, 350.00, 5000.00, 'booked', 'Le compromis parfait entre économie et élégance pour vos déplacements professionnels et touristiques.'),
    (v4, 'Dacia', 'Duster', 2025, '45678-D-4', 'Manuelle', 'Diesel', 5, 450.00, 6000.00, 'available', 'Le SUV idéal pour allier confort et capacité à explorer tous les types de routes marocaines en famille.'),
    (v5, 'Hyundai', 'Tucson', 2024, '56789-E-5', 'Automatique', 'Diesel', 5, 800.00, 10000.00, 'maintenance', 'SUV Premium au design sophistiqué et technologies embarquées pour une sécurité et un confort inégalés.'),
    (v6, 'Mercedes-Benz', 'Classe C', 2025, '67890-F-6', 'Automatique', 'Diesel', 5, 1500.00, 20000.00, 'available', 'Berline de luxe par excellence. Offrez-vous le summum du confort et du prestige pour vos voyages d''affaires.');

    -- Images
    INSERT INTO public.vehicle_images (vehicle_id, image_url, is_cover) VALUES
    (v1, 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80', true),
    (v2, 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&q=80', true),
    (v3, 'https://images.unsplash.com/photo-1542318858-a5796a5af520?auto=format&fit=crop&q=80', true),
    (v4, 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80', true),
    (v5, 'https://images.unsplash.com/photo-1627454819213-f56f18b52a92?auto=format&fit=crop&q=80', true),
    (v6, 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80', true);
END $$;
