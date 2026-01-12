-- PostgREST Schema Cache Fix - Delayed NOTIFY Workaround
-- Run this in Supabase SQL Editor

-- Solution 2: Delayed NOTIFY command
-- This workaround addresses the Postgres notification delivery bug
DO $$
BEGIN
  PERFORM pg_sleep(1);
  PERFORM pg_notify('pgrst', 'reload schema');
END $$;

-- Wait 5 seconds after running this, then test story creation
