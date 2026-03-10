-- =============================================
-- TRM Rent Car — Add Storage Bucket for Vehicles
-- =============================================

INSERT INTO storage.buckets (id, name, public) 
VALUES ('vehicles', 'vehicles', true)
ON CONFLICT (id) DO NOTHING;

-- RLS for storage.objects
CREATE POLICY "Public Access for Vehicle Images" ON storage.objects FOR SELECT USING (bucket_id = 'vehicles');
CREATE POLICY "Admins can upload Vehicle Images" ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'vehicles' AND 
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin', 'gestionnaire', 'assistant'))
);
CREATE POLICY "Admins can update Vehicle Images" ON storage.objects FOR UPDATE USING (
    bucket_id = 'vehicles' AND 
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin', 'gestionnaire', 'assistant'))
);
CREATE POLICY "Admins can delete Vehicle Images" ON storage.objects FOR DELETE USING (
    bucket_id = 'vehicles' AND 
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin', 'gestionnaire', 'assistant'))
);
