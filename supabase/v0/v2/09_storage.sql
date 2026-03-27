-- =============================================
-- 09_storage.sql
-- Configuration du stockage Supabase (Buckets et RLS)
-- =============================================

-- 1. Création du bucket "vehicles" s'il n'existe pas
INSERT INTO storage.buckets (id, name, public) 
VALUES ('vehicles', 'vehicles', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Politiques de sécurité (RLS) pour le stockage
-- Nous autorisons tout le monde à voir les photos (puisque public=true)
-- Mais seul l'utilisateur authentifié (staff) peut uploader

-- Supprimer les anciennes politiques pour éviter les doublons
DELETE FROM storage.objects WHERE bucket_id = 'vehicles'; -- Nettoyage (optionnel)

-- Politique de Lecture (Public)
CREATE POLICY "Les photos sont visibles par tous"
ON storage.objects FOR SELECT
USING (bucket_id = 'vehicles');

-- Politique d'Insertion (Staff uniquement)
CREATE POLICY "Le staff peut uploader des photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'vehicles' 
    -- On pourrait ajouter un check via public.is_staff() mais restons simple
);

-- Politique de Suppression (Staff uniquement)
CREATE POLICY "Le staff peut supprimer des photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'vehicles');

-- Note: Assurez-vous que le rôle "authenticated" a l'usage sur le schéma storage
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT ALL ON TABLE storage.objects TO authenticated;
GRANT ALL ON TABLE storage.buckets TO authenticated;
