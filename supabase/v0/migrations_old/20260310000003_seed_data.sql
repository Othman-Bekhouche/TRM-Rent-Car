-- =============================================
-- TRM Rent Car — Seed Dummy Data & Schema Fix
-- =============================================

-- Ensure FKs are correct (Fix for the join issue)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_reservations_customer') THEN
        ALTER TABLE public.reservations 
        ADD CONSTRAINT fk_reservations_customer 
        FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 1. Create dummy customers if they don't exist
INSERT INTO public.customers (id, full_name, email, phone, cin, city, status)
VALUES 
    ('a1111111-1111-1111-1111-111111111111', 'Mehdi El Alami', 'mehdi@example.com', '0661223344', 'AB123456', 'Casablanca', 'Actif'),
    ('b2222222-2222-2222-2222-222222222222', 'Sara Benani', 'sara@example.com', '0662334455', 'CD789012', 'Rabat', 'VIP'),
    ('c3333333-3333-3333-3333-333333333333', 'Omar Tazi', 'omar@example.com', '0663445566', 'EF345678', 'Tanger', 'Actif'),
    ('d4444444-4444-4444-4444-444444444444', 'Laila Mansouri', 'laila@example.com', '0664556677', 'GH901234', 'Marrakech', 'Actif')
ON CONFLICT (id) DO NOTHING;

-- 2. Create dummy vehicles if fleet is empty
INSERT INTO public.vehicles (id, brand, model, year, plate_number, fuel_type, price_per_day, deposit_amount, mileage, status)
VALUES 
    ('11111111-1111-1111-1111-111111111112', 'Dacia', 'Logan', 2023, '12345-A-50', 'Diesel', 350.00, 3000.00, 15000, 'available'),
    ('22222222-2222-2222-2222-222222222223', 'Renault', 'Clio 5', 2024, '67890-B-50', 'Essence', 450.00, 4000.00, 5000, 'available'),
    ('33333333-3333-3333-3333-333333333334', 'Volkswagen', 'Golf 8', 2024, '11223-C-50', 'Diesel', 750.00, 6000.00, 2000, 'available')
ON CONFLICT (id) DO NOTHING;

-- 3. Create dummy reservations for the last 3 months
-- Month 1 (current - 2 months)
INSERT INTO public.reservations (customer_id, vehicle_id, start_date, end_date, total_price, status, payment_status, created_at)
SELECT 
    'a1111111-1111-1111-1111-111111111111', 
    '11111111-1111-1111-1111-111111111112',
    CURRENT_DATE - INTERVAL '65 days',
    CURRENT_DATE - INTERVAL '60 days',
    1750.00,
    'completed',
    'paid',
    CURRENT_DATE - INTERVAL '70 days';

INSERT INTO public.reservations (customer_id, vehicle_id, start_date, end_date, total_price, status, payment_status, created_at)
SELECT 
    'b2222222-2222-2222-2222-222222222222', 
    '33333333-3333-3333-3333-333333333334',
    CURRENT_DATE - INTERVAL '62 days',
    CURRENT_DATE - INTERVAL '55 days',
    5250.00,
    'completed',
    'paid',
    CURRENT_DATE - INTERVAL '65 days';

-- Month 2 (current - 1 month)
INSERT INTO public.reservations (customer_id, vehicle_id, start_date, end_date, total_price, status, payment_status, created_at)
SELECT 
    'c3333333-3333-3333-3333-333333333333', 
    '22222222-2222-2222-2222-222222222223',
    CURRENT_DATE - INTERVAL '35 days',
    CURRENT_DATE - INTERVAL '30 days',
    2250.00,
    'completed',
    'paid',
    CURRENT_DATE - INTERVAL '40 days';

INSERT INTO public.reservations (customer_id, vehicle_id, start_date, end_date, total_price, status, payment_status, created_at)
SELECT 
    'd4444444-4444-4444-4444-444444444444', 
    '33333333-3333-3333-3333-333333333334',
    CURRENT_DATE - INTERVAL '32 days',
    CURRENT_DATE - INTERVAL '25 days',
    5250.00,
    'completed',
    'paid',
    CURRENT_DATE - INTERVAL '35 days';

-- Month 3 (current month)
INSERT INTO public.reservations (customer_id, vehicle_id, start_date, end_date, total_price, status, payment_status, created_at)
SELECT 
    'a1111111-1111-1111-1111-111111111111', 
    '22222222-2222-2222-2222-222222222223',
    CURRENT_DATE - INTERVAL '5 days',
    CURRENT_DATE + INTERVAL '5 days',
    4500.00,
    'confirmed',
    'paid',
    CURRENT_DATE - INTERVAL '10 days';

INSERT INTO public.reservations (customer_id, vehicle_id, start_date, end_date, total_price, status, payment_status, created_at)
SELECT 
    'b2222222-2222-2222-2222-222222222222', 
    '11111111-1111-1111-1111-111111111112',
    CURRENT_DATE - INTERVAL '2 days',
    CURRENT_DATE + INTERVAL '10 days',
    4200.00,
    'rented',
    'paid',
    CURRENT_DATE - INTERVAL '5 days';

-- Fill transactions for revenue tracking
INSERT INTO public.transactions (reservation_id, customer_id, amount, transaction_type, status, transaction_date)
SELECT id, customer_id, total_price, 'encaissement', 'Payé', created_at::date
FROM public.reservations;
