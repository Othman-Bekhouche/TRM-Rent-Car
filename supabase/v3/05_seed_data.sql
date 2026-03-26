-- =============================================
-- 05_seed_data.sql
-- =============================================

-- COMPANY SETTINGS
INSERT INTO public.company_settings (company_name, phone, email, address, website)
VALUES ('TRM Rent Car', '+212 600-000000', 'contact@trmrentcar.ma', 'Nador, Morocco', 'www.trmrentcar.ma')
ON CONFLICT DO NOTHING;

-- TEST VEHICLES
INSERT INTO public.vehicles (brand, model, year, plate_number, price_per_day, deposit_amount, status, mileage, transmission, fuel_type)
VALUES 
('Dacia', 'Logan', 2024, '1234 A 72', 300, 3000, 'available', 1500, 'Manual', 'Diesel'),
('Peugeot', '208', 2024, '5678 B 72', 350, 4000, 'available', 800, 'Manual', 'Diesel'),
('Dacia', 'Sandero Stepway', 2024, '9012 C 72', 350, 3500, 'available', 2000, 'Manual', 'Diesel'),
('Volkswagen', 'Golf 8', 2024, '3456 D 72', 600, 8000, 'available', 100, 'Automatic', 'Diesel'),
('Hyundai', 'Tucson', 2024, '7890 E 72', 800, 10000, 'maintenance', 5000, 'Automatic', 'Hybrid')
ON CONFLICT (plate_number) DO NOTHING;

-- CREATE AN ADMIN PROFILE (Requires an Auth User manually created or via script)
-- Note: Replace UUID with actual user ID after signup
-- INSERT INTO public.profiles (id, full_name, email, role)
-- VALUES ('495d0382-7dc2-48f8-8097-f58694060855', 'Admin TRM', 'admin@trmrentcar.ma', 'super_admin')
-- ON CONFLICT (email) DO UPDATE SET role = 'super_admin';

-- TEST CUSTOMERS
INSERT INTO public.customers (full_name, email, phone, city, status)
VALUES 
('Siham Benani', 'siham@example.com', '0611223344', 'Nador', 'Actif'),
('Mohamed Tahiri', 'mohamed@example.com', '0655667788', 'Casablanca', 'Actif')
ON CONFLICT (email) DO NOTHING;
