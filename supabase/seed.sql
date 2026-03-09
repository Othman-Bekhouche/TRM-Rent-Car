-- Nettoyage de la base
DELETE FROM public.infractions;
DELETE FROM public.maintenance;
DELETE FROM public.transactions;
DELETE FROM public.gps_tracking;
DELETE FROM public.customers;
DELETE FROM public.vehicle_images;
DELETE FROM public.reservations;
DELETE FROM public.vehicles;
DELETE FROM public.profiles;

-- 1. Insertion des comptes administrateurs (TOUTES les colonnes requises par GoTrue)
DELETE FROM auth.identities;
DELETE FROM auth.users;

INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, confirmation_sent_at, confirmation_token,
    recovery_token, email_change_token_new, email_change_token_current,
    email_change, phone, phone_change, phone_change_token,
    reauthentication_token, is_sso_user,
    raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at
)
VALUES 
(
    'd5d4d3d2-d1d0-4a9b-8c8d-7e6f5d4c3b2a', '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated', 'admin@trmrentcar.ma',
    crypt('AdminTRM2026!', gen_salt('bf')),
    NOW(), NOW(), '', '', '', '', '', NULL, '', '', '', false,
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Med Tahiri"}',
    NOW(), NOW()
),
(
    'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated', 'ahmed.t@trmrentcar.ma',
    crypt('AhmedTRM2026!', gen_salt('bf')),
    NOW(), NOW(), '', '', '', '', '', NULL, '', '', '', false,
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Ahmed Tahiri"}',
    NOW(), NOW()
),
(
    'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated', 'sara.b@trmrentcar.ma',
    crypt('SaraTRM2026!', gen_salt('bf')),
    NOW(), NOW(), '', '', '', '', '', NULL, '', '', '', false,
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Sara Bennani"}',
    NOW(), NOW()
);

-- Identités (obligatoire pour login GoTrue)
INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES
(
    'd5d4d3d2-d1d0-4a9b-8c8d-7e6f5d4c3b2a',
    'd5d4d3d2-d1d0-4a9b-8c8d-7e6f5d4c3b2a',
    '{"sub":"d5d4d3d2-d1d0-4a9b-8c8d-7e6f5d4c3b2a","email":"admin@trmrentcar.ma","email_verified":true}',
    'email', 'd5d4d3d2-d1d0-4a9b-8c8d-7e6f5d4c3b2a', NOW(), NOW(), NOW()
),
(
    'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
    'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
    '{"sub":"a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d","email":"ahmed.t@trmrentcar.ma","email_verified":true}',
    'email', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', NOW(), NOW(), NOW()
),
(
    'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
    'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
    '{"sub":"b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e","email":"sara.b@trmrentcar.ma","email_verified":true}',
    'email', 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', NOW(), NOW(), NOW()
);

INSERT INTO public.profiles (id, full_name, email, phone, role, created_at)
VALUES 
('d5d4d3d2-d1d0-4a9b-8c8d-7e6f5d4c3b2a', 'Med Tahiri', 'admin@trmrentcar.ma', '+212606066426', 'super_admin', NOW()),
('a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', 'Ahmed Tahiri', 'ahmed.t@trmrentcar.ma', '+212600112233', 'admin', NOW()),
('b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', 'Sara Bennani', 'sara.b@trmrentcar.ma', '+212600445566', 'admin', NOW())
ON CONFLICT (id) DO NOTHING;

-- 2. Insertion de la VRAIE flotte TRM Rent Car
DO $$
DECLARE
    v1 UUID := gen_random_uuid();
    v2 UUID := gen_random_uuid();
    v3 UUID := gen_random_uuid();
    v4 UUID := gen_random_uuid();
    v5 UUID := gen_random_uuid();
    v6 UUID := gen_random_uuid();
    v7 UUID := gen_random_uuid();
    c1 UUID := gen_random_uuid();
    c2 UUID := gen_random_uuid();
    c3 UUID := gen_random_uuid();
    c4 UUID := gen_random_uuid();
    c5 UUID := gen_random_uuid();
    c6 UUID := gen_random_uuid();
    r1 UUID := gen_random_uuid();
    r2 UUID := gen_random_uuid();
    r3 UUID := gen_random_uuid();
    r4 UUID := gen_random_uuid();
    r5 UUID := gen_random_uuid();
BEGIN
    -- Véhicules
    INSERT INTO public.vehicles (id, brand, model, color, fuel_type, transmission, seats, doors, traction, year, plate_number, price_per_day, deposit_amount, status, description)
    VALUES 
    (v1, 'Peugeot', '208', 'Noir', 'Diesel', 'Manuelle 6-vitesses', 5, 5, 'Traction avant', 2026, '208-A-001', 420.00, 5000.00, 'available', 'Superbe Peugeot 208 diesel. Confort de conduite exceptionnel, économique et maniable.'),
    (v2, 'Peugeot', '208', 'Gris', 'Hybride (Essence)', 'Automatique', 5, 5, 'Traction avant', 2026, '208-B-002', 520.00, 6000.00, 'available', 'Peugeot 208 Hybride dernière génération, idéale pour des déplacements écologiques.'),
    (v3, 'Dacia', 'Logan', 'Blanc', 'Diesel', 'Manuelle', 5, 5, 'Traction avant', 2026, 'LOG-C-003', 300.00, 3000.00, 'available', 'Véhicule très fiable, le choix parfait pour les longs trajets.'),
    (v4, 'Dacia', 'Logan', 'Gris', 'Diesel', 'Manuelle', 5, 5, 'Traction avant', 2026, 'LOG-C-004', 300.00, 3000.00, 'booked', 'Spacieuse et robuste, cette Dacia Logan répond à toutes vos exigences.'),
    (v5, 'Dacia', 'Sandero', 'Blanc', 'Essence', 'Manuelle', 5, 5, 'Traction avant', 2026, 'SND-D-005', 320.00, 3000.00, 'available', 'Citadine polyvalente avec un grand confort. Très maniable.'),
    (v6, 'Dacia', 'Sandero', 'Gris', 'Essence', 'Manuelle', 5, 5, 'Traction avant', 2026, 'SND-D-006', 320.00, 3000.00, 'available', 'Conduite souple et économique pour cette Dacia Sandero.'),
    (v7, 'Dacia', 'Sandero', 'Bleu', 'Essence', 'Manuelle', 5, 5, 'Traction avant', 2026, 'SND-D-007', 320.00, 3000.00, 'maintenance', 'Sandero élégante pour tous types de parcours.');

    -- Images
    INSERT INTO public.vehicle_images (vehicle_id, image_url, is_cover) VALUES
    (v1, '/images/cars/peugeot_208_noir.png', true),
    (v2, '/images/cars/peugeot_208_gris.png', true),
    (v3, '/images/cars/dacia_logan_blanc.png', true),
    (v4, '/images/cars/dacia_logan_gris.png', true),
    (v5, '/images/cars/dacia_sandero_blanc.png', true),
    (v6, '/images/cars/dacia_sandero_gris.png', true),
    (v7, '/images/cars/dacia_sandero_blanc.png', true);

    -- Clients
    INSERT INTO public.customers (id, full_name, email, phone, cin, address, city, total_spent, total_reservations, status)
    VALUES
    (c1, 'Mohammed Alaoui', 'alaoui.m@gmail.com', '06 12 34 56 78', 'BH123456', 'Rue Hassan II', 'Oujda', 6300, 5, 'Actif'),
    (c2, 'Sophie Martin', 'sophie.martin@gmail.com', '07 88 99 00 11', 'BE789012', 'Bd Anfa', 'Casablanca', 4160, 3, 'VIP'),
    (c3, 'Hassan Benali', 'hassan.b@gmail.com', '06 55 44 33 22', 'BJ345678', 'Av Mohammed V', 'Fès', 2100, 2, 'Actif'),
    (c4, 'Fatima El Ouardi', 'fatima.eo@gmail.com', '06 99 88 77 66', 'BK901234', 'Rue Liberté', 'Taourirt', 960, 1, 'Nouveau'),
    (c5, 'Youssef Ziani', 'y.ziani@gmail.com', '06 11 22 33 44', 'BL567890', 'Hay Salam', 'Nador', 1500, 2, 'Actif'),
    (c6, 'Amina Tazi', 'amina.tazi@gmail.com', '06 77 66 55 44', 'BM234567', 'Quartier Industriel', 'Tanger', 1260, 1, 'Nouveau');

    -- Réservations
    INSERT INTO public.reservations (id, customer_id, vehicle_id, start_date, end_date, pickup_location, return_location, total_price, status, payment_status)
    VALUES
    (r1, c1, v1, '2026-03-12', '2026-03-15', 'Agence Taourirt', 'Agence Taourirt', 1260, 'confirmed', 'paid'),
    (r2, c2, v2, '2026-03-10', '2026-03-14', 'Aéroport Oujda', 'Aéroport Oujda', 2080, 'confirmed', 'paid'),
    (r3, c3, v3, '2026-03-08', '2026-03-15', 'Agence Taourirt', 'Aéroport Fès', 2100, 'confirmed', 'paid'),
    (r4, c4, v6, '2026-03-05', '2026-03-08', 'Agence Taourirt', 'Agence Taourirt', 960, 'completed', 'paid'),
    (r5, c5, v4, '2026-03-01', '2026-03-06', 'Aéroport Oujda', 'Agence Taourirt', 1500, 'completed', 'paid');

    -- Infractions
    INSERT INTO public.infractions (vehicle_id, reservation_id, customer_id, infraction_type, infraction_date, infraction_time, city, location, authority_name, reference_number, fine_amount, description, admin_notes, status)
    VALUES
    (v3, r3, c3, 'radar_fixe', '2026-03-10', '14:32', 'Taza', 'Route N6 — PK 125', 'NARSA', 'NR-2026-08451', 400, 'Excès de vitesse détecté par radar fixe à 95 km/h en zone limitée à 60 km/h.', 'PV reçu par courrier le 12/03/2026.', 'matched'),
    (v1, r1, c1, 'stationnement_interdit', '2026-03-13', '09:15', 'Oujda', 'Boulevard Mohammed V — Centre Ville', 'Police Oujda', 'PO-2026-03892', 150, 'Stationnement sur trottoir en zone interdite.', '', 'transmitted'),
    (v5, NULL, NULL, 'feu_rouge', '2026-02-20', '18:45', 'Casablanca', 'Carrefour Bd Zerktouni / Bd Anfa', 'NARSA', 'NR-2026-07122', 700, 'Passage au feu rouge détecté par caméra de surveillance.', 'Aucune réservation trouvée. Véhicule en déplacement interne ?', 'unmatched');

    -- Maintenance
    INSERT INTO public.maintenance (vehicle_id, maintenance_type, maintenance_date, next_maintenance_date, mileage_at_maintenance, cost, status, description)
    VALUES
    (v7, 'Vidange + Filtres', '2026-03-09', '2026-06-09', 15000, 850, 'in_progress', 'Vidange moteur et remplacement des filtres huile/air/habitacle.'),
    (v1, 'Contrôle technique', '2026-03-01', '2027-03-01', 22000, 400, 'completed', 'Contrôle technique annuel réglementaire.'),
    (v3, 'Pneus (4x)', '2026-02-25', '2027-02-25', 18000, 2400, 'completed', 'Remplacement de 4 pneus toutes saisons.'),
    (v2, 'Plaquettes frein AV', '2026-02-15', '2026-08-15', 20000, 600, 'completed', 'Remplacement des plaquettes de frein avant.'),
    (v6, 'Vidange', '2026-02-10', '2026-05-10', 14500, 500, 'planned', 'Prochaine vidange planifiée.');

    -- Transactions
    INSERT INTO public.transactions (reservation_id, customer_id, transaction_type, amount, payment_method, description, status, transaction_date)
    VALUES
    (r1, c1, 'encaissement', 1260, 'Espèces', 'Paiement location Peugeot 208 Noir', 'Payé', '2026-03-12'),
    (r2, c2, 'encaissement', 2080, 'Virement', 'Paiement location Peugeot 208 Gris', 'Payé', '2026-03-10'),
    (r3, c3, 'caution', 3000, 'Espèces', 'Caution location Dacia Logan Blanc', 'En attente', '2026-03-08'),
    (r4, c4, 'remboursement', 960, 'Virement', 'Remboursement caution Dacia Sandero Gris', 'Remboursé', '2026-03-05'),
    (r5, c5, 'encaissement', 1500, 'Carte', 'Paiement location Dacia Logan Gris', 'Payé', '2026-03-01');

    -- GPS Tracking (latest positions)
    INSERT INTO public.gps_tracking (vehicle_id, latitude, longitude, speed, location_name, recorded_at)
    VALUES
    (v3, 34.6800000, -1.9100000, 95, 'Route N6 — Oujda → Fès', NOW() - INTERVAL '3 minutes'),
    (v4, 35.1700000, -2.9300000, 0, 'Nador Centre', NOW() - INTERVAL '12 minutes');

END $$;
