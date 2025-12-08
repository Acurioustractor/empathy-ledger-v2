-- Add missing onboarding_completed column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

-- Update Benjamin's profile to be fully onboarded
UPDATE public.profiles 
SET 
  onboarding_completed = true,
  is_storyteller = true,
  tenant_roles = ARRAY['admin', 'storyteller']
WHERE email = 'benjamin@act.place';

-- Verify the update
SELECT id, email, display_name, tenant_roles, is_storyteller, onboarding_completed 
FROM public.profiles 
WHERE email = 'benjamin@act.place';