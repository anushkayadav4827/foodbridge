-- Add 'in_progress' to listing_status enum
-- This must be run in a separate transaction before the main migration

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'in_progress' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'listing_status')
  ) THEN
    ALTER TYPE listing_status ADD VALUE 'in_progress' AFTER 'claimed';
  END IF;
END $$;
