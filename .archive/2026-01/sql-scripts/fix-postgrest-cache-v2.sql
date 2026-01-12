-- PostgREST Schema Cache Fix - Extended Delay Version
-- Run this in Supabase SQL Editor

-- Try with longer delay (3 seconds)
DO $$
BEGIN
  PERFORM pg_sleep(3);
  PERFORM pg_notify('pgrst', 'reload schema');
  PERFORM pg_sleep(1);
  PERFORM pg_notify('pgrst', 'reload schema');
END $$;

-- This sends the notification twice with delays
-- Wait 10 seconds after running this, then test story creation
