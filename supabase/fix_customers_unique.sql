-- Fix for "no unique or exclusion constraint matching the ON CONFLICT specification"
-- The BookingCheckout page uses upsert on 'email' for the customers table.

-- Add a unique constraint to the email column
ALTER TABLE public.customers ADD CONSTRAINT customers_email_unique UNIQUE (email);

-- Optional: Add unique constraints for other identifying fields if they don't exist
-- but 'email' is the primary one used for matching clients.
-- ALTER TABLE public.customers ADD CONSTRAINT customers_phone_unique UNIQUE (phone);
-- ALTER TABLE public.customers ADD CONSTRAINT customers_cin_unique UNIQUE (cin);
