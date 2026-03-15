-- =============================================
-- 01_enums.sql
-- =============================================

CREATE TYPE public.user_role AS ENUM ('customer', 'admin', 'super_admin', 'gestionnaire', 'assistant');
CREATE TYPE public.vehicle_status AS ENUM ('available', 'booked', 'maintenance', 'inactive', 'rented');
CREATE TYPE public.reservation_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed', 'rejected', 'rented', 'returned');
CREATE TYPE public.infraction_status AS ENUM ('pending', 'matched', 'transmitted', 'resolved', 'unmatched');
CREATE TYPE public.infraction_type AS ENUM ('radar_fixe', 'exces_vitesse', 'stationnement_interdit', 'feu_rouge', 'controle_routier', 'autre');
CREATE TYPE public.maintenance_status AS ENUM ('planned', 'in_progress', 'completed');
CREATE TYPE public.transaction_type AS ENUM ('encaissement', 'caution', 'remboursement', 'charge');
CREATE TYPE public.quote_status AS ENUM ('draft', 'sent', 'accepted', 'rejected', 'expired');
