-- Fix project_storytellers foreign key to reference storytellers table instead of profiles
-- This allows storytellers created directly in the storytellers table (without a profiles entry)
-- to be assigned to projects

-- Step 1: Drop the existing foreign key constraint
ALTER TABLE project_storytellers
DROP CONSTRAINT IF EXISTS project_storytellers_storyteller_id_fkey;

-- Step 2: Add new foreign key constraint referencing storytellers table
-- Use ON DELETE CASCADE to automatically remove relationships when a storyteller is deleted
ALTER TABLE project_storytellers
ADD CONSTRAINT project_storytellers_storyteller_id_fkey
FOREIGN KEY (storyteller_id) REFERENCES storytellers(id) ON DELETE CASCADE;

-- Step 3: Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_project_storytellers_storyteller_id ON project_storytellers(storyteller_id);

-- Step 4: Add comment documenting the change
COMMENT ON CONSTRAINT project_storytellers_storyteller_id_fkey ON project_storytellers IS
'Foreign key referencing storytellers.id - Updated from profiles.id to support storytellers without profile entries';
