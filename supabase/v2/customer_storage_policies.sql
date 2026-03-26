-- Permettre à tout le monde de voir les fichiers du bucket 'customers'
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'customers');

-- Permettre aux utilisateurs authentifiés d'uploader dans le bucket 'customers'
CREATE POLICY "Authenticated Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'customers');

-- Permettre aux utilisateurs authentifiés de supprimer dans le bucket 'customers'
CREATE POLICY "Authenticated Delete" ON storage.objects FOR DELETE USING (bucket_id = 'customers');
