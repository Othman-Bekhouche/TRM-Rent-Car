-- =============================================
-- TRM Rent Car — System Notifications & Company Settings
-- =============================================

-- 1. Notifications Table
CREATE TABLE IF NOT EXISTS public.system_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE, -- NULL means broadcast to all staff
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info', -- info, success, warning, error
    is_read BOOLEAN DEFAULT FALSE,
    link TEXT, -- Optional URL to redirect when clicked
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Company Settings Table (Singleton)
CREATE TABLE IF NOT EXISTS public.company_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_name TEXT NOT NULL DEFAULT 'TRM Rent Car',
    phone TEXT,
    email TEXT,
    address TEXT,
    website TEXT,
    base_deposit NUMERIC(10,2) DEFAULT 3000,
    delivery_fee NUMERIC(10,2) DEFAULT 100,
    discount_week NUMERIC(5,2) DEFAULT 10,
    discount_month NUMERIC(5,2) DEFAULT 20,
    notifications_email BOOLEAN DEFAULT TRUE,
    notifications_sms BOOLEAN DEFAULT FALSE,
    updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Insert default settings
INSERT INTO public.company_settings (company_name, phone, email, address, website)
VALUES ('TRM Rent Car', '06 06 06 6426', 'trm.rentcar@gmail.com', 'Appt Sabrine 2éme Etage N°6 Bloc A, 65800 Taourirt', 'www.trmrentcar.ma');

-- 4. RLS & Policies
ALTER TABLE public.system_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;

-- Notifications: Staff can see their own or broadcast (profile_id is null)
CREATE POLICY "Staff can view their notifications" ON public.system_notifications FOR SELECT USING (
    profile_id = auth.uid() OR profile_id IS NULL
);
CREATE POLICY "Staff can update their notifications" ON public.system_notifications FOR UPDATE USING (
    profile_id = auth.uid()
);
-- Staff can create notifications (e.g. system triggers)
CREATE POLICY "Staff can insert notifications" ON public.system_notifications FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin', 'gestionnaire', 'assistant'))
);

-- Settings: Only admins and super_admins can modify, anyone can read
CREATE POLICY "Settings are viewable by everyone" ON public.company_settings FOR SELECT USING (true);
CREATE POLICY "Only admins can update settings" ON public.company_settings FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin'))
);
CREATE POLICY "Only admins can insert settings" ON public.company_settings FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin'))
);

-- 5. Auto updated_at for Settings
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.company_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 6. Trigger: Create notification on new reservation
CREATE OR REPLACE FUNCTION notify_new_reservation()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.system_notifications (title, message, type, link)
    VALUES (
        'Nouvelle Réservation', 
        'Une nouvelle réservation a été créée. En attente de validation.', 
        'success', 
        '/admin/reservations'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_new_reservation
    AFTER INSERT ON public.reservations
    FOR EACH ROW
    EXECUTE FUNCTION notify_new_reservation();
