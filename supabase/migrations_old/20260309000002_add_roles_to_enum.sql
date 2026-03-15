-- =============================================
-- TRM Rent Car — Assistant Role Fix
-- This script fixes the 'assistant' role error
-- by adding it to the user_role ENUM type.
-- =============================================

-- Add 'assistant' to user_role ENUM if it doesn't exist
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'assistant';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'gestionnaire';
