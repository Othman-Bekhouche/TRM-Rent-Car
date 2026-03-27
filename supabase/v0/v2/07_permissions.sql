-- =============================================
-- 06_permissions.sql
-- =============================================

-- Grant Usage on schemas
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT USAGE ON SCHEMA storage TO anon, authenticated, service_role;
GRANT USAGE ON SCHEMA extensions TO anon, authenticated, service_role;

-- Grant permissions on all tables/sequences/functions in public
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;

-- Special permissions for auth.users if needed (usually handled by Supabase)
-- But on VPS we might need to be explicit
ALTER TABLE auth.users ALTER COLUMN role SET DEFAULT 'authenticated';
UPDATE auth.users SET role = 'authenticated' WHERE role IS NULL OR role = '';
