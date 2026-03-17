-- =============================================
-- 02_tables.sql
-- =============================================

-- Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY, -- References auth.users(id), but we create the table first
    full_name TEXT,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    role public.user_role DEFAULT 'customer'::public.user_role,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vehicles
CREATE TABLE IF NOT EXISTS public.vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
    status public.vehicle_status DEFAULT 'available'::public.vehicle_status,
    description TEXT,
    last_oil_change_mileage INTEGER DEFAULT 0,
    next_oil_change_mileage INTEGER DEFAULT 0,
    last_service_mileage INTEGER DEFAULT 0,
    next_service_mileage INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customers
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT NOT NULL,
    cin TEXT,
    passport TEXT,
    address TEXT,
    city TEXT,
    total_spent DECIMAL(10,2) DEFAULT 0,
    total_reservations INT DEFAULT 0,
    status TEXT DEFAULT 'Actif',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reservations
CREATE TABLE IF NOT EXISTS public.reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE RESTRICT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    pickup_location TEXT,
    return_location TEXT,
    total_price DECIMAL(10,2) NOT NULL,
    status public.reservation_status DEFAULT 'pending'::public.reservation_status,
    payment_status TEXT DEFAULT 'unpaid',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_dates CHECK (end_date >= start_date)
);

-- Maintenance records
CREATE TABLE IF NOT EXISTS public.vehicle_maintenance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
    maintenance_type TEXT NOT NULL,
    status TEXT DEFAULT 'Planifié',
    last_service_date DATE NOT NULL DEFAULT CURRENT_DATE,
    last_service_mileage INTEGER DEFAULT 0,
    next_service_date DATE,
    next_service_mileage INTEGER DEFAULT 0,
    estimated_cost DECIMAL(10,2) DEFAULT 0,
    actual_cost DECIMAL(10,2) DEFAULT 0,
    vendor_name TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mileage logs
CREATE TABLE IF NOT EXISTS public.vehicle_mileage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
    mileage_value INTEGER NOT NULL,
    recorded_at TIMESTAMPTZ DEFAULT NOW(),
    recorded_by UUID, -- References profiles/users
    notes TEXT
);

-- Maintenance alerts
CREATE TABLE IF NOT EXISTS public.maintenance_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
    maintenance_record_id UUID REFERENCES public.vehicle_maintenance_records(id) ON DELETE CASCADE,
    alert_type TEXT NOT NULL,
    alert_message TEXT NOT NULL,
    priority TEXT DEFAULT 'low',
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Infractions
CREATE TABLE IF NOT EXISTS public.infractions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
    reservation_id UUID REFERENCES public.reservations(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    infraction_type public.infraction_type NOT NULL DEFAULT 'autre',
    infraction_date DATE NOT NULL,
    infraction_time TIME,
    city TEXT,
    location TEXT,
    authority_name TEXT,
    reference_number TEXT,
    fine_amount DECIMAL(10,2) DEFAULT 0,
    description TEXT,
    admin_notes TEXT,
    document_url TEXT,
    status public.infraction_status DEFAULT 'pending'::public.infraction_status,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reservation_id UUID REFERENCES public.reservations(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    transaction_type public.transaction_type NOT NULL DEFAULT 'encaissement',
    amount DECIMAL(10,2) NOT NULL,
    payment_method TEXT,
    description TEXT,
    status TEXT DEFAULT 'Payé',
    transaction_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoices
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reservation_id UUID REFERENCES public.reservations(id) ON DELETE CASCADE,
    invoice_number TEXT UNIQUE NOT NULL,
    invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
    deposit_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    extras_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    payment_status TEXT DEFAULT 'unpaid',
    pdf_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rental Contracts
CREATE TABLE IF NOT EXISTS public.rental_contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reservation_id UUID REFERENCES public.reservations(id) ON DELETE CASCADE,
    contract_number TEXT UNIQUE NOT NULL,
    customer_id UUID REFERENCES public.customers(id),
    vehicle_id UUID REFERENCES public.vehicles(id),
    contract_status TEXT DEFAULT 'draft',
    total_amount DECIMAL(10,2) DEFAULT 0,
    deposit_amount DECIMAL(10,2) DEFAULT 0,
    contract_date TIMESTAMPTZ DEFAULT NOW(),
    signed_at TIMESTAMPTZ,
    pdf_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rental Handover Records
CREATE TABLE IF NOT EXISTS public.rental_handover_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reservation_id UUID REFERENCES public.reservations(id) ON DELETE CASCADE,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    handover_date TIMESTAMPTZ DEFAULT NOW(),
    return_date TIMESTAMPTZ,
    mileage_out INT,
    mileage_in INT,
    fuel_level_out TEXT,
    fuel_level_in TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quotes
CREATE TABLE IF NOT EXISTS public.quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_number TEXT UNIQUE NOT NULL,
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status public.quote_status DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vehicle Images
CREATE TABLE IF NOT EXISTS public.vehicle_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    is_cover BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Company Settings
CREATE TABLE IF NOT EXISTS public.company_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT NOT NULL DEFAULT 'TRM Rent Car',
    phone TEXT,
    email TEXT,
    address TEXT,
    website TEXT,
    delivery_fee DECIMAL(10,2) DEFAULT 0,
    discount_week DECIMAL(5,2) DEFAULT 0,
    discount_month DECIMAL(5,2) DEFAULT 0,
    notifications_email BOOLEAN DEFAULT TRUE,
    notifications_sms BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- System Notifications
CREATE TABLE IF NOT EXISTS public.system_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    user_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_veh_plate ON public.vehicles(plate_number);
CREATE INDEX IF NOT EXISTS idx_res_dates ON public.reservations(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_res_status ON public.reservations(status);
CREATE INDEX IF NOT EXISTS idx_cust_email ON public.customers(email);
CREATE INDEX IF NOT EXISTS idx_maint_veh ON public.vehicle_maintenance_records(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_inf_res ON public.infractions(reservation_id);
