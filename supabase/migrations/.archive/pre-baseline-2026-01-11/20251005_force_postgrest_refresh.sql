-- Force PostgREST cache refresh by making a trivial schema change
-- This migration does nothing meaningful but triggers Supabase to reload the schema cache

-- Add a harmless comment to trigger cache refresh
COMMENT ON TABLE profiles IS 'Storyteller and user profiles - cache refresh trigger';

-- Notify PostgREST to reload
NOTIFY pgrst, 'reload schema';
