-- =============================================
-- TRM Rent Car — Update Vehicle Gallery
-- This script adds the 3 new views (Front, Rear, Interior)
-- to the corresponding vehicles in the database.
-- =============================================

-- 1. Peugeot 208 Noir (Plate: 208-A-001)
INSERT INTO public.vehicle_images (vehicle_id, image_url, is_cover)
SELECT id, '/images/cars/peugeot_208_noir_front.png', false FROM public.vehicles WHERE plate_number = '208-A-001';

INSERT INTO public.vehicle_images (vehicle_id, image_url, is_cover)
SELECT id, '/images/cars/peugeot_208_noir_rear.png', false FROM public.vehicles WHERE plate_number = '208-A-001';

INSERT INTO public.vehicle_images (vehicle_id, image_url, is_cover)
SELECT id, '/images/cars/peugeot_208_noir_interior.png', false FROM public.vehicles WHERE plate_number = '208-A-001';

-- 2. Dacia Logan Blanc (Plate: LOG-C-003)
INSERT INTO public.vehicle_images (vehicle_id, image_url, is_cover)
SELECT id, '/images/cars/dacia_logan_blanc_front.png', false FROM public.vehicles WHERE plate_number = 'LOG-C-003';

INSERT INTO public.vehicle_images (vehicle_id, image_url, is_cover)
SELECT id, '/images/cars/dacia_logan_blanc_rear.png', false FROM public.vehicles WHERE plate_number = 'LOG-C-003';

INSERT INTO public.vehicle_images (vehicle_id, image_url, is_cover)
SELECT id, '/images/cars/dacia_logan_blanc_interior.png', false FROM public.vehicles WHERE plate_number = 'LOG-C-003';

-- 3. Dacia Sandero Gris (Plate: SND-D-006)
INSERT INTO public.vehicle_images (vehicle_id, image_url, is_cover)
SELECT id, '/images/cars/dacia_sandero_gris_front.png', false FROM public.vehicles WHERE plate_number = 'SND-D-006';

INSERT INTO public.vehicle_images (vehicle_id, image_url, is_cover)
SELECT id, '/images/cars/dacia_sandero_gris_rear.png', false FROM public.vehicles WHERE plate_number = 'SND-D-006';

INSERT INTO public.vehicle_images (vehicle_id, image_url, is_cover)
SELECT id, '/images/cars/dacia_sandero_gris_interior.png', false FROM public.vehicles WHERE plate_number = 'SND-D-006';
