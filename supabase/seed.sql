-- Clean existing vehicles (Cascades to vehicle_images)
DELETE FROM public.vehicles;

-- Temporary UUIDs for our seed vehicles
DO $$
DECLARE
    v1 UUID := gen_random_uuid();
    v2 UUID := gen_random_uuid();
    v3 UUID := gen_random_uuid();
    v4 UUID := gen_random_uuid();
BEGIN
    -- Insert Mock Vehicles
    INSERT INTO public.vehicles (id, brand, model, year, plate_number, transmission, fuel_type, seats, mileage, price_per_day, deposit_amount, status, description)
    VALUES 
    (v1, 'Mercedes-Benz', 'S-Class S500', 2024, 'TRM-1001', 'Automatic', 'Hybrid', 5, 1200, 2500.00, 10000.00, 'available', 'The ultimate luxury sedan combining supreme comfort, advanced technology, and powerful hybrid performance. Perfect for VIP transport and special events.'),
    
    (v2, 'Range Rover', 'Sport HSE', 2023, 'TRM-1022', 'Automatic', 'Diesel', 5, 8400, 2200.00, 15000.00, 'available', 'Premium luxury SUV designed for absolute commanding presence on the road. Features panoramic roof, air suspension, and premium leather interior.'),
    
    (v3, 'Porsche', 'Cayenne Coupe', 2024, 'TRM-1045', 'Automatic', 'Petrol', 5, 3100, 3000.00, 20000.00, 'booked', 'Stunning fusion of sports car performance and SUV versatility. This elegant dark grey coupe delivers an unforgettable driving experience.'),
    
    (v4, 'BMW', 'M4 Competition', 2024, 'TRM-1088', 'Automatic', 'Petrol', 4, 1500, 2800.00, 25000.00, 'maintenance', 'High-performance sports coupe designed for adrenaline. Aggressive styling, carbon fiber accents, and a thrilling exhaust note.');

    -- Insert Mock Images (Using Unsplash placeholders for luxurious cars just for visual testing)
    INSERT INTO public.vehicle_images (vehicle_id, image_url, is_cover) VALUES
    (v1, 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80', true),
    (v2, 'https://images.unsplash.com/photo-1606016159991-e44b8ee7bc6d?auto=format&fit=crop&q=80', true),
    (v3, 'https://images.unsplash.com/photo-1503376710356-748af20b66b7?auto=format&fit=crop&q=80', true),
    (v4, 'https://images.unsplash.com/photo-1617814076367-b77134882df5?auto=format&fit=crop&q=80', true);

END $$;
