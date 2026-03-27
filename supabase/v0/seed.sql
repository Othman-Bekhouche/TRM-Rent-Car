-- Nettoyage de la base
DELETE FROM public.infractions;
DELETE FROM public.vehicle_maintenance_records;
DELETE FROM public.transactions;
DELETE FROM public.gps_tracking;
DELETE FROM public.customers;
DELETE FROM public.vehicle_images;
DELETE FROM public.reservations;
DELETE FROM public.vehicles;
DELETE FROM public.profiles;

-- 1. Insertion des comptes administrateurs
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
('b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', 'Sara Bennani', 'sara.b@trmrentcar.ma', '+212600445566', 'assistant', NOW())
ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role, full_name = EXCLUDED.full_name, phone = EXCLUDED.phone;

-- 2. Insertion Data 4 Mois (Décembre 2025 -> Mars 2026)
DO $$
DECLARE
    -- Véhicules (Identifiants fixes pour lier avec les images existantes)
    v_citadine1 UUID := '11111111-1111-1111-1111-111111111111';
    v_citadine2 UUID := '22222222-2222-2222-2222-222222222222';
    v_berline1 UUID := '33333333-3333-3333-3333-333333333333';
    v_berline2 UUID := '44444444-4444-4444-4444-444444444444';
    v_citadine3 UUID := '55555555-5555-5555-5555-555555555555';
    v_citadine4 UUID := '66666666-6666-6666-6666-666666666666';
    v_citadine5 UUID := '77777777-7777-7777-7777-777777777777';
    v_suv1 UUID := '88888888-8888-8888-8888-888888888888';
    v_suv2 UUID := gen_random_uuid();
    v_utilitaire1 UUID := gen_random_uuid();

    -- Clients
    c1 UUID := gen_random_uuid();
    c2 UUID := gen_random_uuid();
    c3 UUID := gen_random_uuid();
    c4 UUID := gen_random_uuid();
    c5 UUID := gen_random_uuid();
    c6 UUID := gen_random_uuid();
    c7 UUID := gen_random_uuid();
    c8 UUID := gen_random_uuid();

    -- Resas
    res_id UUID;
BEGIN
    -- Véhicules enrichis avec des catégories détectables
    INSERT INTO public.vehicles (id, brand, model, color, fuel_type, transmission, seats, doors, traction, year, plate_number, price_per_day, deposit_amount, status, description)
    VALUES 
    (v_citadine1, 'Peugeot', '208 (Citadine)', 'Noir', 'Diesel', 'Manuelle 6-vitesses', 5, 5, 'Traction', 2026, '208-A-001', 420.00, 5000.00, 'available', 'Economique'),
    (v_citadine2, 'Peugeot', '208 (Citadine)', 'Gris', 'Hybride', 'Automatique', 5, 5, 'Traction', 2026, '208-B-002', 520.00, 6000.00, 'available', 'Hybride'),
    (v_berline1, 'Dacia', 'Logan (Berline)', 'Blanc', 'Diesel', 'Manuelle', 5, 5, 'Traction', 2026, 'LOG-C-003', 300.00, 3000.00, 'available', 'Robuste'),
    (v_berline2, 'Dacia', 'Logan (Berline)', 'Gris', 'Diesel', 'Manuelle', 5, 5, 'Traction', 2026, 'LOG-C-004', 300.00, 3000.00, 'rented', 'Spacieuse'),
    (v_citadine3, 'Dacia', 'Sandero (Citadine)', 'Blanc', 'Essence', 'Manuelle', 5, 5, 'Traction', 2026, 'SND-D-005', 320.00, 3000.00, 'available', 'Ville'),
    (v_citadine4, 'Dacia', 'Sandero (Citadine)', 'Gris', 'Essence', 'Manuelle', 5, 5, 'Traction', 2026, 'SND-D-006', 320.00, 3000.00, 'rented', 'Ville'),
    (v_citadine5, 'Dacia', 'Sandero (Citadine)', 'Bleu', 'Essence', 'Manuelle', 5, 5, 'Traction', 2026, 'SND-D-007', 320.00, 3000.00, 'maintenance', 'Ville'),
    (v_suv1, 'Range Rover', 'Evoque (SUV)', 'Gris Métallisé', 'Diesel', 'Automatique', 5, 5, '4x4', 2026, 'RRE-E-008', 1200.00, 15000.00, 'available', 'Luxe'),
    (v_suv2, 'Hyundai', 'Tucson (SUV)', 'Noir', 'Diesel', 'Automatique', 5, 5, 'Traction', 2026, 'TUC-F-009', 800.00, 10000.00, 'rented', 'Confortable'),
    (v_utilitaire1, 'Renault', 'Kangoo (Utilitaire)', 'Blanc', 'Diesel', 'Manuelle', 5, 5, 'Traction', 2026, 'KNG-G-010', 400.00, 5000.00, 'available', 'Cargo');

    INSERT INTO public.vehicle_images (vehicle_id, image_url, is_cover) VALUES
    (v_citadine1, '/images/cars/peugeot_208_noir.png', true),
    (v_citadine1, '/images/cars/peugeot_208_noir_front.png', false),
    (v_citadine1, '/images/cars/peugeot_208_noir_rear.png', false),
    (v_citadine1, '/images/cars/peugeot_208_noir_interior.png', false),
    (v_citadine2, '/images/cars/peugeot_208_gris.png', true),
    (v_citadine2, '/images/cars/peugeot_208_gris_front.png', false),
    (v_citadine2, '/images/cars/peugeot_208_gris_rear.png', false),
    (v_citadine2, '/images/cars/peugeot_208_gris_interior.png', false),
    (v_berline1, '/images/cars/dacia_logan_blanc.png', true),
    (v_berline1, '/images/cars/dacia_logan_blanc_front.png', false),
    (v_berline1, '/images/cars/dacia_logan_blanc_rear.png', false),
    (v_berline1, '/images/cars/dacia_logan_blanc_interior.png', false),
    (v_berline2, '/images/cars/dacia_logan_gris.png', true),
    (v_berline2, '/images/cars/dacia_logan_gris_front.png', false),
    (v_berline2, '/images/cars/dacia_logan_gris_rear.png', false),
    (v_berline2, '/images/cars/dacia_logan_gris_interior.png', false),
    (v_citadine3, '/images/cars/dacia_sandero_blanc.png', true),
    (v_citadine3, '/images/cars/dacia_sandero_gris_front.png', false),
    (v_citadine3, '/images/cars/dacia_sandero_gris_rear.png', false),
    (v_citadine3, '/images/cars/dacia_sandero_gris_interior.png', false),
    (v_citadine4, '/images/cars/dacia_sandero_gris.png', true),
    (v_citadine4, '/images/cars/dacia_sandero_gris_front.png', false),
    (v_citadine4, '/images/cars/dacia_sandero_gris_rear.png', false),
    (v_citadine4, '/images/cars/dacia_sandero_gris_interior.png', false),
    (v_citadine5, '/images/cars/dacia_sandero_blanc.png', true),
    (v_citadine5, '/images/cars/dacia_sandero_gris_front.png', false),
    (v_citadine5, '/images/cars/dacia_sandero_gris_rear.png', false),
    (v_citadine5, '/images/cars/dacia_sandero_gris_interior.png', false),
    (v_suv1, '/images/cars/range_rover_evoque.png', true),
    (v_suv1, '/images/cars/range_rover_evoque_front.png', false),
    (v_suv1, '/images/cars/range_rover_evoque_rear.png', false),
    (v_suv1, '/images/cars/range_rover_evoque_interior.png', false);


    -- Clients plus nombreux et diversifiés
    INSERT INTO public.customers (id, full_name, email, phone, cin, address, city, total_spent, total_reservations, status)
    VALUES
    (c1, 'Mohammed Alaoui', 'alaoui.m@gmail.com', '06 12 34 56 78', 'BH123456', 'Rue Hassan II', 'Oujda', 25200, 8, 'VIP'),
    (c2, 'Sophie Martin', 'sophie.martin@gmail.com', '07 88 99 00 11', 'BE789012', 'Bd Anfa', 'Fès', 15600, 5, 'VIP'),
    (c3, 'Hassan Benali', 'hassan.b@gmail.com', '06 55 44 33 22', 'BJ345678', 'Av Mohammed V', 'Fès', 8500, 3, 'Actif'),
    (c4, 'Fatima El Ouardi', 'fatima.eo@gmail.com', '06 99 88 77 66', 'BK901234', 'Rue Liberté', 'Taourirt', 4800, 2, 'Actif'),
    (c5, 'Youssef Ziani', 'y.ziani@gmail.com', '06 11 22 33 44', 'BL567890', 'Hay Salam', 'Nador', 11400, 4, 'Actif'),
    (c6, 'Amina Tazi', 'amina.tazi@gmail.com', '06 77 66 55 44', 'BM234567', 'Q.I', 'Berkane', 5400, 2, 'Actif'),
    (c7, 'Omar Kabbaj', 'omar.k@test.com', '06 00 00 44 44', 'BN888888', 'Gare', 'Oujda', 12000, 1, 'Actif'),
    (c8, 'Leila Oufkir', 'leila.o@test.com', '06 22 11 44 66', 'BP222222', 'Centre', 'Nador', 3000, 1, 'Nouveau');

    -- Insertions Boucle (Décembre 2025 -> Mars 2026)
    
    -- MOIS DECEMBRE 2025 (Faible activité - Hiver)
    res_id := gen_random_uuid();
    INSERT INTO public.reservations (id, customer_id, vehicle_id, start_date, end_date, pickup_location, dropoff_location, total_price, status, payment_status, created_at)
    VALUES (res_id, c1, v_citadine1, '2025-12-05', '2025-12-15', 'Aéroport Oujda', 'Aéroport Oujda', 4200, 'completed', 'paid', '2025-12-01');
    INSERT INTO public.transactions (reservation_id, customer_id, transaction_type, amount, payment_method, status, transaction_date)
    VALUES (res_id, c1, 'encaissement', 4200, 'Carte Bancaire', 'Payé', '2025-12-05');

    res_id := gen_random_uuid();
    INSERT INTO public.reservations (id, customer_id, vehicle_id, start_date, end_date, pickup_location, dropoff_location, total_price, status, payment_status, created_at)
    VALUES (res_id, c3, v_berline1, '2025-12-10', '2025-12-15', 'Fès Centre', 'Fès Centre', 1500, 'completed', 'paid', '2025-12-05');
    INSERT INTO public.transactions (reservation_id, customer_id, transaction_type, amount, payment_method, status, transaction_date)
    VALUES (res_id, c3, 'encaissement', 1500, 'Espèces', 'Payé', '2025-12-10');

    res_id := gen_random_uuid();
    INSERT INTO public.reservations (id, customer_id, vehicle_id, start_date, end_date, pickup_location, dropoff_location, total_price, status, payment_status, created_at)
    VALUES (res_id, c5, v_citadine3, '2025-12-20', '2025-12-30', 'Aéroport Nador', 'Aéroport Nador', 3200, 'completed', 'paid', '2025-12-15');
    INSERT INTO public.transactions (reservation_id, customer_id, transaction_type, amount, payment_method, status, transaction_date)
    VALUES (res_id, c5, 'encaissement', 3200, 'Virement', 'Payé', '2025-12-20');

    res_id := gen_random_uuid();
    INSERT INTO public.reservations (id, customer_id, vehicle_id, start_date, end_date, pickup_location, dropoff_location, total_price, status, payment_status, created_at)
    VALUES (res_id, c7, v_suv1, '2025-12-25', '2026-01-04', 'Aéroport Oujda', 'Aéroport Oujda', 12000, 'completed', 'paid', '2025-12-20');
    INSERT INTO public.transactions (reservation_id, customer_id, transaction_type, amount, payment_method, status, transaction_date)
    VALUES (res_id, c7, 'encaissement', 12000, 'Carte Bancaire', 'Payé', '2025-12-25');

    -- MOIS JANVIER 2026 (Augmentation Activité)
    res_id := gen_random_uuid();
    INSERT INTO public.reservations (id, customer_id, vehicle_id, start_date, end_date, pickup_location, dropoff_location, total_price, status, payment_status, created_at)
    VALUES (res_id, c1, v_citadine1, '2026-01-05', '2026-01-15', 'Aéroport Oujda', 'Aéroport Oujda', 4200, 'completed', 'paid', '2026-01-01');
    INSERT INTO public.transactions (reservation_id, customer_id, transaction_type, amount, payment_method, status, transaction_date)
    VALUES (res_id, c1, 'encaissement', 4200, 'Carte Bancaire', 'Payé', '2026-01-05');

    res_id := gen_random_uuid();
    INSERT INTO public.reservations (id, customer_id, vehicle_id, start_date, end_date, pickup_location, dropoff_location, total_price, status, payment_status, created_at)
    VALUES (res_id, c2, v_citadine2, '2026-01-12', '2026-01-22', 'Fès Aéroport', 'Fès Aéroport', 5200, 'completed', 'paid', '2026-01-10');
    INSERT INTO public.transactions (reservation_id, customer_id, transaction_type, amount, payment_method, status, transaction_date)
    VALUES (res_id, c2, 'encaissement', 5200, 'Virement', 'Payé', '2026-01-12');

    res_id := gen_random_uuid();
    INSERT INTO public.reservations (id, customer_id, vehicle_id, start_date, end_date, pickup_location, dropoff_location, total_price, status, payment_status, created_at)
    VALUES (res_id, c3, v_berline1, '2026-01-20', '2026-01-28', 'Taourirt Centre', 'Aéroport Fès', 2400, 'completed', 'paid', '2026-01-15');
    INSERT INTO public.transactions (reservation_id, customer_id, transaction_type, amount, payment_method, status, transaction_date)
    VALUES (res_id, c3, 'encaissement', 2400, 'Espèces', 'Payé', '2026-01-20');

    res_id := gen_random_uuid();
    INSERT INTO public.reservations (id, customer_id, vehicle_id, start_date, end_date, pickup_location, dropoff_location, total_price, status, payment_status, created_at)
    VALUES (res_id, c4, v_citadine4, '2026-01-25', '2026-01-30', 'Oujda Aéroport', 'Berkane Centre', 1600, 'completed', 'paid', '2026-01-20');
    INSERT INTO public.transactions (reservation_id, customer_id, transaction_type, amount, payment_method, status, transaction_date)
    VALUES (res_id, c4, 'encaissement', 1600, 'Espèces', 'Payé', '2026-01-25');

    -- MOIS FEVRIER 2026 (Forte Hausse)
    res_id := gen_random_uuid();
    INSERT INTO public.reservations (id, customer_id, vehicle_id, start_date, end_date, pickup_location, dropoff_location, total_price, status, payment_status, created_at)
    VALUES (res_id, c5, v_berline2, '2026-02-01', '2026-02-11', 'Nador Aéroport', 'Taourirt Centre', 3000, 'completed', 'paid', '2026-01-25');
    INSERT INTO public.transactions (reservation_id, customer_id, transaction_type, amount, payment_method, status, transaction_date)
    VALUES (res_id, c5, 'encaissement', 3000, 'Carte Bancaire', 'Payé', '2026-02-01');

    res_id := gen_random_uuid();
    INSERT INTO public.reservations (id, customer_id, vehicle_id, start_date, end_date, pickup_location, dropoff_location, total_price, status, payment_status, created_at)
    VALUES (res_id, c6, v_citadine3, '2026-02-10', '2026-02-14', 'Berkane Centre', 'Berkane Centre', 1280, 'completed', 'paid', '2026-02-05');
    INSERT INTO public.transactions (reservation_id, customer_id, transaction_type, amount, payment_method, status, transaction_date)
    VALUES (res_id, c6, 'encaissement', 1280, 'Espèces', 'Payé', '2026-02-10');

    res_id := gen_random_uuid();
    INSERT INTO public.reservations (id, customer_id, vehicle_id, start_date, end_date, pickup_location, dropoff_location, total_price, status, payment_status, created_at)
    VALUES (res_id, c1, v_suv2, '2026-02-14', '2026-02-24', 'Aéroport Oujda', 'Aéroport Oujda', 8000, 'completed', 'paid', '2026-02-10');
    INSERT INTO public.transactions (reservation_id, customer_id, transaction_type, amount, payment_method, status, transaction_date)
    VALUES (res_id, c1, 'encaissement', 8000, 'Virement', 'Payé', '2026-02-14');

    res_id := gen_random_uuid();
    INSERT INTO public.reservations (id, customer_id, vehicle_id, start_date, end_date, pickup_location, dropoff_location, total_price, status, payment_status, created_at)
    VALUES (res_id, c2, v_citadine2, '2026-02-22', '2026-02-28', 'Fès Centre', 'Fès Centre', 3120, 'completed', 'paid', '2026-02-15');
    INSERT INTO public.transactions (reservation_id, customer_id, transaction_type, amount, payment_method, status, transaction_date)
    VALUES (res_id, c2, 'encaissement', 3120, 'Virement', 'Payé', '2026-02-22');

    -- MOIS MARS 2026 (En Cours - Haut Vol)
    res_id := gen_random_uuid();
    INSERT INTO public.reservations (id, customer_id, vehicle_id, start_date, end_date, pickup_location, dropoff_location, total_price, status, payment_status, created_at)
    VALUES (res_id, c3, v_berline1, '2026-03-02', '2026-03-08', 'Fès Centre', 'Aéroport Fès', 1800, 'returned', 'paid', '2026-02-25');
    INSERT INTO public.transactions (reservation_id, customer_id, transaction_type, amount, payment_method, status, transaction_date)
    VALUES (res_id, c3, 'encaissement', 1800, 'Carte Bancaire', 'Payé', '2026-03-02');

    res_id := gen_random_uuid();
    INSERT INTO public.reservations (id, customer_id, vehicle_id, start_date, end_date, pickup_location, dropoff_location, total_price, status, payment_status, created_at)
    VALUES (res_id, c4, v_citadine4, '2026-03-05', '2026-03-15', 'Aéroport Oujda', 'Aéroport Oujda', 3200, 'rented', 'paid', '2026-02-28');
    INSERT INTO public.transactions (reservation_id, customer_id, transaction_type, amount, payment_method, status, transaction_date)
    VALUES (res_id, c4, 'encaissement', 3200, 'Carte Bancaire', 'Payé', '2026-03-05');

    res_id := gen_random_uuid();
    INSERT INTO public.reservations (id, customer_id, vehicle_id, start_date, end_date, pickup_location, dropoff_location, total_price, status, payment_status, created_at)
    VALUES (res_id, c2, v_citadine2, '2026-03-10', '2026-03-24', 'Fès Aéroport', 'Fès Aéroport', 7280, 'rented', 'paid', '2026-03-01');
    INSERT INTO public.transactions (reservation_id, customer_id, transaction_type, amount, payment_method, status, transaction_date)
    VALUES (res_id, c2, 'encaissement', 7280, 'Virement', 'Payé', '2026-03-10');

    res_id := gen_random_uuid();
    INSERT INTO public.reservations (id, customer_id, vehicle_id, start_date, end_date, pickup_location, dropoff_location, total_price, status, payment_status, created_at)
    VALUES (res_id, c1, v_berline2, '2026-03-12', '2026-03-20', 'Oujda Centre', 'Oujda Centre', 2400, 'rented', 'paid', '2026-03-05');
    INSERT INTO public.transactions (reservation_id, customer_id, transaction_type, amount, payment_method, status, transaction_date)
    VALUES (res_id, c1, 'encaissement', 2400, 'Espèces', 'Payé', '2026-03-12');

    res_id := gen_random_uuid();
    INSERT INTO public.reservations (id, customer_id, vehicle_id, start_date, end_date, pickup_location, dropoff_location, total_price, status, payment_status, created_at)
    VALUES (res_id, c6, v_utilitaire1, '2026-03-15', '2026-03-25', 'Nador Centre', 'Nador Centre', 4000, 'confirmed', 'paid', '2026-03-10');
    INSERT INTO public.transactions (reservation_id, customer_id, transaction_type, amount, payment_method, status, transaction_date)
    VALUES (res_id, c6, 'encaissement', 4000, 'Virement', 'Payé', '2026-03-15');

    -- Factures impayées & Cautions
    INSERT INTO public.transactions (reservation_id, customer_id, transaction_type, amount, payment_method, description, status, transaction_date)
    VALUES
    (NULL, c8, 'encaissement', 3000, 'Espèces', 'Location Citadine (Berkane)', 'Impayé', '2026-03-08'),
    (NULL, c1, 'remboursement', -5000, 'Virement', 'Remboursement Caution Evoque', 'Remboursé', '2026-02-25'),
    (NULL, c1, 'caution', 5000, 'Carte Bancaire', 'Caution Berline Oujda', 'En attente', '2026-03-12');

END $$;

-- Company Settings Seed
INSERT INTO public.company_settings (company_name, phone, email, address, website, delivery_fee, discount_week, discount_month)
SELECT 'TRM Rent Car', '06 06 06 6426', 'trm.rentcar@gmail.com', 'Appt Sabrine 2éme Etage N°6 Bloc A, 65800 Taourirt', 'www.trmrentcar.ma', 0, 0, 0
WHERE NOT EXISTS (SELECT 1 FROM public.company_settings);
