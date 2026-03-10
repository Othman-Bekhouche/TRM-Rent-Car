-- =============================================
-- TRM Rent Car — Fix maintenance table and enum to match frontend
-- Renaming columns to match MaintenanceRecord interface in api.ts
-- Updating ENUM to match status labels in UI
-- =============================================

-- 1. ADD 'Annulé' to maintenance_status (and possibly other labels if we want to support both)
-- Note: PostgreSQL doesn't easily allow renaming ENUM labels or adding to existing enums within a transaction across many tables, 
-- but we can just add the new values.
ALTER TYPE maintenance_status ADD VALUE IF NOT EXISTS 'Planifié';
ALTER TYPE maintenance_status ADD VALUE IF NOT EXISTS 'En cours';
ALTER TYPE maintenance_status ADD VALUE IF NOT EXISTS 'Terminé';
ALTER TYPE maintenance_status ADD VALUE IF NOT EXISTS 'Annulé';

-- 2. Rename columns in vehicle_maintenance_records to match api.ts
ALTER TABLE public.vehicle_maintenance_records 
    RENAME COLUMN maintenance_date TO last_service_date;

ALTER TABLE public.vehicle_maintenance_records 
    RENAME COLUMN mileage_at_maintenance TO last_service_mileage;

-- 3. Also ensure common maintenance_type labels are supported if they were restricted (they weren't, it was TEXT)

-- 4. Update existing records if any (not likely on a dev project, but safe)
UPDATE public.vehicle_maintenance_records SET status = 'Planifié' WHERE status::text = 'planned';
UPDATE public.vehicle_maintenance_records SET status = 'En cours' WHERE status::text = 'in_progress';
UPDATE public.vehicle_maintenance_records SET status = 'Terminé' WHERE status::text = 'completed';
