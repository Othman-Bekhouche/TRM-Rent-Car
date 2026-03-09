-- Active extension for UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Custom Enums
CREATE TYPE user_role AS ENUM ('customer', 'admin', 'super_admin');
CREATE TYPE vehicle_status AS ENUM ('available', 'booked', 'maintenance', 'inactive');
CREATE TYPE reservation_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed', 'rejected');

-- 2. Tables & Relationships
-- Profiles (Links to Supabase Auth)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    role user_role DEFAULT 'customer'::user_role,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vehicles (Foundation for GPS/Maintenance later)
CREATE TABLE public.vehicles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    year INT NOT NULL,
    plate_number TEXT UNIQUE NOT NULL,
    transmission TEXT DEFAULT 'Automatic',
    fuel_type TEXT,
    seats INT DEFAULT 5,
    doors INT DEFAULT 5,
    color TEXT,
    traction TEXT DEFAULT 'Traction avant',
    mileage INT DEFAULT 0,
    price_per_day DECIMAL(10,2) NOT NULL,
    deposit_amount DECIMAL(10,2) NOT NULL,
    status vehicle_status DEFAULT 'available'::vehicle_status,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vehicle Images
CREATE TABLE public.vehicle_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    is_cover BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reservations (Foundation for Accounting later)
-- Note: customer_id will reference customers table (added in extended schema)
-- Using DEFERRABLE to allow creation order flexibility
CREATE TABLE public.reservations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID,  -- Will be linked to customers table via extended schema
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE RESTRICT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    pickup_location TEXT,
    return_location TEXT,
    total_price DECIMAL(10,2) NOT NULL,
    status reservation_status DEFAULT 'pending'::reservation_status,
    payment_status TEXT DEFAULT 'unpaid',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_dates CHECK (end_date >= start_date)
);

-- 3. Row Level Security (RLS) Rules
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- Profiles: Anyone can read profiles, users can update their own
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Vehicles: Everyone can see vehicles, only admins can manage
CREATE POLICY "Vehicles are viewable by everyone." ON public.vehicles FOR SELECT USING (true);
CREATE POLICY "Admins can manage vehicles." ON public.vehicles FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin'))
);

-- Vehicle Images: Same as vehicles
CREATE POLICY "Vehicle images are viewable by everyone." ON public.vehicle_images FOR SELECT USING (true);
CREATE POLICY "Admins can manage vehicle images." ON public.vehicle_images FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin'))
);

-- Reservations: Customers see their own, admins see everything
CREATE POLICY "Customers can view their own reservations." ON public.reservations FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Customers can create reservations." ON public.reservations FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Admins can manage all reservations." ON public.reservations FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin'))
);

-- Note: Functions for auto-updating updated_at will be set up subsequently.
