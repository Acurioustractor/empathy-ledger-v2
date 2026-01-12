-- PostgREST Auto Schema Reload - Permanent Fix
-- Run this ONCE in Supabase SQL Editor
-- This will automatically reload the schema whenever DDL changes occur

-- Step 1: Create the notification function
CREATE OR REPLACE FUNCTION public.pgrst_ddl_watch() RETURNS event_trigger AS $$
BEGIN
  NOTIFY pgrst, 'reload schema';
END;
$$ LANGUAGE plpgsql;

-- Step 2: Create the event trigger
DROP EVENT TRIGGER IF EXISTS pgrst_ddl_watch;
CREATE EVENT TRIGGER pgrst_ddl_watch
  ON ddl_command_end
  EXECUTE PROCEDURE public.pgrst_ddl_watch();

-- Step 3: Verify the trigger was created
SELECT evtname, evtevent, evtenabled
FROM pg_event_trigger
WHERE evtname = 'pgrst_ddl_watch';

-- Expected output: One row showing the trigger is enabled

COMMENT ON FUNCTION public.pgrst_ddl_watch() IS 'Automatically notifies PostgREST to reload schema cache on DDL changes';
COMMENT ON EVENT TRIGGER pgrst_ddl_watch IS 'Triggers PostgREST schema reload on any DDL command (ALTER, CREATE, DROP, etc.)';
