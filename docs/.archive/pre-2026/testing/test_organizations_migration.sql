-- Test file for Phase 2 Task 1.1: Enhanced Organizations Migration
-- This file contains tests to verify the migration was successful

-- Test 1: Verify organization_status enum exists
DO $$
BEGIN
  ASSERT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'organization_status'
  ), 'organization_status enum type should exist';
  
  RAISE NOTICE 'Test 1 PASSED: organization_status enum type exists';
END $$;

-- Test 2: Verify all new columns exist in organizations table
DO $$
BEGIN
  -- Check cultural_identity column
  ASSERT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'organizations' 
    AND column_name = 'cultural_identity'
    AND table_schema = 'public'
  ), 'cultural_identity column should exist';

  -- Check governance_structure column
  ASSERT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'organizations' 
    AND column_name = 'governance_structure'
    AND table_schema = 'public'
  ), 'governance_structure column should exist';

  -- Check cultural_protocols column
  ASSERT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'organizations' 
    AND column_name = 'cultural_protocols'
    AND table_schema = 'public'
  ), 'cultural_protocols column should exist';

  -- Check default_permissions column
  ASSERT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'organizations' 
    AND column_name = 'default_permissions'
    AND table_schema = 'public'
  ), 'default_permissions column should exist';

  -- Check elder_oversight_required column
  ASSERT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'organizations' 
    AND column_name = 'elder_oversight_required'
    AND table_schema = 'public'
  ), 'elder_oversight_required column should exist';

  -- Check community_approval_required column
  ASSERT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'organizations' 
    AND column_name = 'community_approval_required'
    AND table_schema = 'public'
  ), 'community_approval_required column should exist';

  -- Check collaboration_settings column
  ASSERT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'organizations' 
    AND column_name = 'collaboration_settings'
    AND table_schema = 'public'
  ), 'collaboration_settings column should exist';

  -- Check shared_vocabularies column
  ASSERT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'organizations' 
    AND column_name = 'shared_vocabularies'
    AND table_schema = 'public'
  ), 'shared_vocabularies column should exist';

  -- Check status column is using enum type
  ASSERT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'organizations' 
    AND column_name = 'status'
    AND table_schema = 'public'
    AND data_type = 'USER-DEFINED'
  ), 'status column should use enum type';

  RAISE NOTICE 'Test 2 PASSED: All required columns exist';
END $$;

-- Test 3: Verify indexes were created
DO $$
BEGIN
  ASSERT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'organizations' 
    AND indexname = 'idx_organizations_status'
  ), 'idx_organizations_status index should exist';

  ASSERT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'organizations' 
    AND indexname = 'idx_organizations_cultural_identity'
  ), 'idx_organizations_cultural_identity index should exist';

  ASSERT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'organizations' 
    AND indexname = 'idx_organizations_elder_oversight'
  ), 'idx_organizations_elder_oversight index should exist';

  RAISE NOTICE 'Test 3 PASSED: Required indexes exist';
END $$;

-- Test 4: Verify validation functions exist
DO $$
BEGIN
  ASSERT EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'validate_cultural_identity'
  ), 'validate_cultural_identity function should exist';

  ASSERT EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'validate_governance_structure'
  ), 'validate_governance_structure function should exist';

  ASSERT EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'validate_cultural_protocols'
  ), 'validate_cultural_protocols function should exist';

  ASSERT EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'validate_default_permissions'
  ), 'validate_default_permissions function should exist';

  ASSERT EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'validate_collaboration_settings'
  ), 'validate_collaboration_settings function should exist';

  RAISE NOTICE 'Test 4 PASSED: Validation functions exist';
END $$;

-- Test 5: Test data insertion with new schema
DO $$
DECLARE
  test_org_id UUID;
BEGIN
  -- Insert test organization
  INSERT INTO public.organizations (
    name,
    slug,
    cultural_identity,
    governance_structure,
    cultural_protocols,
    default_permissions,
    elder_oversight_required,
    community_approval_required,
    collaboration_settings,
    shared_vocabularies,
    status
  ) VALUES (
    'Test Cultural Organization',
    'test-cultural-org-' || extract(epoch from now())::text,
    '{"traditions": ["storytelling", "ceremony"], "values": ["respect", "harmony"], "language": "indigenous"}',
    '{"type": "elder_council", "decision_making": "consensus", "leadership": ["chief", "elders"]}',
    '{"sacred_items": "restricted", "ceremonies": "elder_approval", "stories": "community_approval"}',
    '{"members": {"read": true, "write": false}, "elders": {"read": true, "write": true, "approve": true}}',
    true,
    true,
    '{"external_partnerships": true, "resource_sharing": false, "joint_ceremonies": "conditional"}',
    ARRAY['wisdom', 'tradition', 'ceremony', 'ancestors', 'sacred'],
    'active'
  ) RETURNING id INTO test_org_id;

  -- Verify the organization was inserted successfully
  ASSERT test_org_id IS NOT NULL, 'Test organization should be inserted successfully';

  -- Verify data can be queried
  ASSERT EXISTS (
    SELECT 1 FROM public.organizations 
    WHERE id = test_org_id 
    AND cultural_identity ? 'traditions'
    AND elder_oversight_required = true
  ), 'Test organization data should be queryable';

  -- Clean up test data
  DELETE FROM public.organizations WHERE id = test_org_id;

  RAISE NOTICE 'Test 5 PASSED: Data insertion and querying works';
END $$;

-- Test 6: Test JSONB validation constraints
DO $$
DECLARE
  test_failed BOOLEAN := false;
BEGIN
  -- Test invalid cultural_identity (should fail)
  BEGIN
    INSERT INTO public.organizations (
      name, slug, cultural_identity
    ) VALUES (
      'Invalid Test', 'invalid-test-' || extract(epoch from now())::text, '"invalid_json_structure"'
    );
  EXCEPTION 
    WHEN check_violation THEN
      test_failed := true;
  END;

  -- If we got here without exception, the constraint isn't working
  IF NOT test_failed THEN
    RAISE EXCEPTION 'JSONB validation constraint should have prevented invalid data';
  END IF;

  RAISE NOTICE 'Test 6 PASSED: JSONB validation constraints work';
END $$;

-- Test 7: Test enum values
DO $$
DECLARE
  test_org_id UUID;
BEGIN
  -- Test valid enum values
  INSERT INTO public.organizations (
    name, slug, status
  ) VALUES (
    'Enum Test Active', 'enum-test-active-' || extract(epoch from now())::text, 'active'
  ) RETURNING id INTO test_org_id;
  
  DELETE FROM public.organizations WHERE id = test_org_id;

  INSERT INTO public.organizations (
    name, slug, status
  ) VALUES (
    'Enum Test Inactive', 'enum-test-inactive-' || extract(epoch from now())::text, 'inactive'
  ) RETURNING id INTO test_org_id;
  
  DELETE FROM public.organizations WHERE id = test_org_id;

  RAISE NOTICE 'Test 7 PASSED: Enum values work correctly';
END $$;

-- Test 8: Test array column functionality
DO $$
DECLARE
  test_org_id UUID;
  vocab_array TEXT[];
BEGIN
  INSERT INTO public.organizations (
    name, slug, shared_vocabularies
  ) VALUES (
    'Array Test Org', 
    'array-test-' || extract(epoch from now())::text, 
    ARRAY['tradition', 'ceremony', 'elder', 'wisdom', 'sacred']
  ) RETURNING id INTO test_org_id;

  -- Query the array data
  SELECT shared_vocabularies INTO vocab_array 
  FROM public.organizations 
  WHERE id = test_org_id;

  ASSERT array_length(vocab_array, 1) = 5, 'Shared vocabularies array should have 5 elements';
  ASSERT 'tradition' = ANY(vocab_array), 'Array should contain tradition';

  -- Clean up
  DELETE FROM public.organizations WHERE id = test_org_id;

  RAISE NOTICE 'Test 8 PASSED: Array column functionality works';
END $$;

-- Test completion message
DO $$
BEGIN
  RAISE NOTICE '============================================';
  RAISE NOTICE 'ALL TESTS PASSED: Organizations migration successful!';
  RAISE NOTICE 'Enhanced organizations table is ready for Phase 2';
  RAISE NOTICE '============================================';
END $$;