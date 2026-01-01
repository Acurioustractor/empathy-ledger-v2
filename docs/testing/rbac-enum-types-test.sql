-- Test Suite: RBAC Enum Types Validation
-- Created: 2025-09-13
-- Description: Comprehensive tests for all RBAC enum types created in migration
-- Usage: Run these tests against the database after applying the RBAC enums migration

-- ============================================================================
-- TEST SETUP
-- ============================================================================

-- Begin test transaction (can be rolled back if needed)
BEGIN;

-- Test status tracking
CREATE TEMP TABLE test_results (
    test_name TEXT,
    status TEXT,
    details TEXT
);

-- ============================================================================
-- ORGANIZATION ROLE ENUM TESTS
-- ============================================================================

DO $$
DECLARE
    test_role organization_role;
    role_count INTEGER;
BEGIN
    -- Test 1: Verify organization_role enum exists and has correct values
    BEGIN
        SELECT COUNT(*) INTO role_count 
        FROM pg_enum 
        WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'organization_role');
        
        IF role_count = 10 THEN
            INSERT INTO test_results VALUES ('organization_role_count', 'PASS', 'Found 10 role values as expected');
        ELSE
            INSERT INTO test_results VALUES ('organization_role_count', 'FAIL', 'Expected 10 roles, found ' || role_count);
        END IF;
    EXCEPTION WHEN OTHERS THEN
        INSERT INTO test_results VALUES ('organization_role_count', 'FAIL', 'Error: ' || SQLERRM);
    END;

    -- Test 2: Test each role value can be assigned
    BEGIN
        test_role := 'elder';
        test_role := 'cultural_keeper';
        test_role := 'knowledge_holder';
        test_role := 'admin';
        test_role := 'project_leader';
        test_role := 'storyteller';
        test_role := 'community_member';
        test_role := 'guest';
        test_role := 'cultural_liaison';
        test_role := 'archivist';
        
        INSERT INTO test_results VALUES ('organization_role_values', 'PASS', 'All role values can be assigned');
    EXCEPTION WHEN OTHERS THEN
        INSERT INTO test_results VALUES ('organization_role_values', 'FAIL', 'Error assigning role: ' || SQLERRM);
    END;

    -- Test 3: Test role hierarchy validation function
    BEGIN
        -- Elder can assign any role
        IF validate_role_hierarchy('elder', 'cultural_keeper') THEN
            INSERT INTO test_results VALUES ('role_hierarchy_elder', 'PASS', 'Elder can assign cultural_keeper');
        ELSE
            INSERT INTO test_results VALUES ('role_hierarchy_elder', 'FAIL', 'Elder should be able to assign any role');
        END IF;
        
        -- Cultural keeper cannot assign elder
        IF NOT validate_role_hierarchy('cultural_keeper', 'elder') THEN
            INSERT INTO test_results VALUES ('role_hierarchy_keeper', 'PASS', 'Cultural keeper cannot assign elder role');
        ELSE
            INSERT INTO test_results VALUES ('role_hierarchy_keeper', 'FAIL', 'Cultural keeper should not assign elder role');
        END IF;
        
        -- Guest cannot assign any roles
        IF NOT validate_role_hierarchy('guest', 'storyteller') THEN
            INSERT INTO test_results VALUES ('role_hierarchy_guest', 'PASS', 'Guest cannot assign roles');
        ELSE
            INSERT INTO test_results VALUES ('role_hierarchy_guest', 'FAIL', 'Guest should not be able to assign roles');
        END IF;
        
    EXCEPTION WHEN OTHERS THEN
        INSERT INTO test_results VALUES ('role_hierarchy_validation', 'FAIL', 'Error in hierarchy validation: ' || SQLERRM);
    END;
END
$$;

-- ============================================================================
-- CULTURAL PERMISSION LEVEL ENUM TESTS
-- ============================================================================

DO $$
DECLARE
    test_permission cultural_permission_level;
    permission_count INTEGER;
BEGIN
    -- Test 1: Verify cultural_permission_level enum exists
    BEGIN
        SELECT COUNT(*) INTO permission_count 
        FROM pg_enum 
        WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'cultural_permission_level');
        
        IF permission_count = 5 THEN
            INSERT INTO test_results VALUES ('cultural_permission_count', 'PASS', 'Found 5 permission levels as expected');
        ELSE
            INSERT INTO test_results VALUES ('cultural_permission_count', 'FAIL', 'Expected 5 levels, found ' || permission_count);
        END IF;
    EXCEPTION WHEN OTHERS THEN
        INSERT INTO test_results VALUES ('cultural_permission_count', 'FAIL', 'Error: ' || SQLERRM);
    END;

    -- Test 2: Test each permission level can be assigned
    BEGIN
        test_permission := 'sacred';
        test_permission := 'restricted';
        test_permission := 'community_only';
        test_permission := 'educational';
        test_permission := 'public';
        
        INSERT INTO test_results VALUES ('cultural_permission_values', 'PASS', 'All permission levels can be assigned');
    EXCEPTION WHEN OTHERS THEN
        INSERT INTO test_results VALUES ('cultural_permission_values', 'FAIL', 'Error assigning permission: ' || SQLERRM);
    END;
END
$$;

-- ============================================================================
-- COLLABORATION TYPE ENUM TESTS
-- ============================================================================

DO $$
DECLARE
    test_collaboration collaboration_type;
    collaboration_count INTEGER;
BEGIN
    -- Test 1: Verify collaboration_type enum exists
    BEGIN
        SELECT COUNT(*) INTO collaboration_count 
        FROM pg_enum 
        WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'collaboration_type');
        
        IF collaboration_count = 7 THEN
            INSERT INTO test_results VALUES ('collaboration_type_count', 'PASS', 'Found 7 collaboration types as expected');
        ELSE
            INSERT INTO test_results VALUES ('collaboration_type_count', 'FAIL', 'Expected 7 types, found ' || collaboration_count);
        END IF;
    EXCEPTION WHEN OTHERS THEN
        INSERT INTO test_results VALUES ('collaboration_type_count', 'FAIL', 'Error: ' || SQLERRM);
    END;

    -- Test 2: Test each collaboration type can be assigned
    BEGIN
        test_collaboration := 'shared_project';
        test_collaboration := 'knowledge_exchange';
        test_collaboration := 'ceremonial_partnership';
        test_collaboration := 'educational_alliance';
        test_collaboration := 'cultural_preservation';
        test_collaboration := 'research_partnership';
        test_collaboration := 'language_revitalization';
        
        INSERT INTO test_results VALUES ('collaboration_type_values', 'PASS', 'All collaboration types can be assigned');
    EXCEPTION WHEN OTHERS THEN
        INSERT INTO test_results VALUES ('collaboration_type_values', 'FAIL', 'Error assigning collaboration type: ' || SQLERRM);
    END;
END
$$;

-- ============================================================================
-- TAG CATEGORY ENUM TESTS
-- ============================================================================

DO $$
DECLARE
    test_tag_category tag_category;
    category_count INTEGER;
BEGIN
    -- Test 1: Verify tag_category enum exists
    BEGIN
        SELECT COUNT(*) INTO category_count 
        FROM pg_enum 
        WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'tag_category');
        
        IF category_count = 12 THEN
            INSERT INTO test_results VALUES ('tag_category_count', 'PASS', 'Found 12 tag categories as expected');
        ELSE
            INSERT INTO test_results VALUES ('tag_category_count', 'FAIL', 'Expected 12 categories, found ' || category_count);
        END IF;
    EXCEPTION WHEN OTHERS THEN
        INSERT INTO test_results VALUES ('tag_category_count', 'FAIL', 'Error: ' || SQLERRM);
    END;

    -- Test 2: Test each tag category can be assigned
    BEGIN
        test_tag_category := 'traditional_knowledge';
        test_tag_category := 'ceremonial';
        test_tag_category := 'ecological_knowledge';
        test_tag_category := 'medicinal_knowledge';
        test_tag_category := 'language_preservation';
        test_tag_category := 'cultural_practice';
        test_tag_category := 'historical_event';
        test_tag_category := 'geographical_place';
        test_tag_category := 'family_clan';
        test_tag_category := 'seasonal_activity';
        test_tag_category := 'artistic_tradition';
        test_tag_category := 'spiritual_practice';
        
        INSERT INTO test_results VALUES ('tag_category_values', 'PASS', 'All tag categories can be assigned');
    EXCEPTION WHEN OTHERS THEN
        INSERT INTO test_results VALUES ('tag_category_values', 'FAIL', 'Error assigning tag category: ' || SQLERRM);
    END;
END
$$;

-- ============================================================================
-- TAG SOURCE ENUM TESTS
-- ============================================================================

DO $$
DECLARE
    test_tag_source tag_source;
    source_count INTEGER;
BEGIN
    -- Test 1: Verify tag_source enum exists
    BEGIN
        SELECT COUNT(*) INTO source_count 
        FROM pg_enum 
        WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'tag_source');
        
        IF source_count = 5 THEN
            INSERT INTO test_results VALUES ('tag_source_count', 'PASS', 'Found 5 tag sources as expected');
        ELSE
            INSERT INTO test_results VALUES ('tag_source_count', 'FAIL', 'Expected 5 sources, found ' || source_count);
        END IF;
    EXCEPTION WHEN OTHERS THEN
        INSERT INTO test_results VALUES ('tag_source_count', 'FAIL', 'Error: ' || SQLERRM);
    END;

    -- Test 2: Test each tag source can be assigned
    BEGIN
        test_tag_source := 'manual';
        test_tag_source := 'ai_generated';
        test_tag_source := 'community_suggested';
        test_tag_source := 'elder_designated';
        test_tag_source := 'imported';
        
        INSERT INTO test_results VALUES ('tag_source_values', 'PASS', 'All tag sources can be assigned');
    EXCEPTION WHEN OTHERS THEN
        INSERT INTO test_results VALUES ('tag_source_values', 'FAIL', 'Error assigning tag source: ' || SQLERRM);
    END;
END
$$;

-- ============================================================================
-- SHARING POLICY ENUM TESTS
-- ============================================================================

DO $$
DECLARE
    test_sharing sharing_policy;
    sharing_count INTEGER;
BEGIN
    -- Test 1: Verify sharing_policy enum exists
    BEGIN
        SELECT COUNT(*) INTO sharing_count 
        FROM pg_enum 
        WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'sharing_policy');
        
        IF sharing_count = 5 THEN
            INSERT INTO test_results VALUES ('sharing_policy_count', 'PASS', 'Found 5 sharing policies as expected');
        ELSE
            INSERT INTO test_results VALUES ('sharing_policy_count', 'FAIL', 'Expected 5 policies, found ' || sharing_count);
        END IF;
    EXCEPTION WHEN OTHERS THEN
        INSERT INTO test_results VALUES ('sharing_policy_count', 'FAIL', 'Error: ' || SQLERRM);
    END;

    -- Test 2: Test each sharing policy can be assigned
    BEGIN
        test_sharing := 'open';
        test_sharing := 'request_based';
        test_sharing := 'elder_approved';
        test_sharing := 'restricted';
        test_sharing := 'never';
        
        INSERT INTO test_results VALUES ('sharing_policy_values', 'PASS', 'All sharing policies can be assigned');
    EXCEPTION WHEN OTHERS THEN
        INSERT INTO test_results VALUES ('sharing_policy_values', 'FAIL', 'Error assigning sharing policy: ' || SQLERRM);
    END;
END
$$;

-- ============================================================================
-- CONTENT TYPE ENUM TESTS
-- ============================================================================

DO $$
DECLARE
    test_content content_type;
    content_count INTEGER;
BEGIN
    -- Test 1: Verify content_type enum exists
    BEGIN
        SELECT COUNT(*) INTO content_count 
        FROM pg_enum 
        WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'content_type');
        
        IF content_count = 5 THEN
            INSERT INTO test_results VALUES ('content_type_count', 'PASS', 'Found 5 content types as expected');
        ELSE
            INSERT INTO test_results VALUES ('content_type_count', 'FAIL', 'Expected 5 types, found ' || content_count);
        END IF;
    EXCEPTION WHEN OTHERS THEN
        INSERT INTO test_results VALUES ('content_type_count', 'FAIL', 'Error: ' || SQLERRM);
    END;

    -- Test 2: Test each content type can be assigned
    BEGIN
        test_content := 'story';
        test_content := 'transcript';
        test_content := 'media_asset';
        test_content := 'gallery';
        test_content := 'project';
        
        INSERT INTO test_results VALUES ('content_type_values', 'PASS', 'All content types can be assigned');
    EXCEPTION WHEN OTHERS THEN
        INSERT INTO test_results VALUES ('content_type_values', 'FAIL', 'Error assigning content type: ' || SQLERRM);
    END;
END
$$;

-- ============================================================================
-- INTEGRATION TESTS
-- ============================================================================

DO $$
DECLARE
    total_enums INTEGER;
    passed_tests INTEGER;
    total_tests INTEGER;
BEGIN
    -- Test: Count total enum types created
    SELECT COUNT(*) INTO total_enums 
    FROM pg_type 
    WHERE typname IN (
        'organization_role',
        'cultural_permission_level', 
        'collaboration_type',
        'tag_category',
        'tag_source',
        'sharing_policy',
        'content_type'
    );
    
    IF total_enums = 7 THEN
        INSERT INTO test_results VALUES ('total_enum_types', 'PASS', 'All 7 enum types created successfully');
    ELSE
        INSERT INTO test_results VALUES ('total_enum_types', 'FAIL', 'Expected 7 enum types, found ' || total_enums);
    END IF;
    
    -- Test: Verify hierarchy validation function exists
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'validate_role_hierarchy') THEN
        INSERT INTO test_results VALUES ('hierarchy_function', 'PASS', 'validate_role_hierarchy function created');
    ELSE
        INSERT INTO test_results VALUES ('hierarchy_function', 'FAIL', 'validate_role_hierarchy function missing');
    END IF;
END
$$;

-- ============================================================================
-- TEST RESULTS SUMMARY
-- ============================================================================

-- Display all test results
SELECT 
    test_name,
    status,
    details
FROM test_results
ORDER BY 
    CASE status 
        WHEN 'FAIL' THEN 1 
        WHEN 'PASS' THEN 2 
        ELSE 3 
    END,
    test_name;

-- Summary statistics
SELECT 
    status,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM test_results), 2) as percentage
FROM test_results 
GROUP BY status
ORDER BY status;

-- Overall result
DO $$
DECLARE
    failed_tests INTEGER;
    total_tests INTEGER;
BEGIN
    SELECT COUNT(*) INTO failed_tests FROM test_results WHERE status = 'FAIL';
    SELECT COUNT(*) INTO total_tests FROM test_results;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'RBAC ENUM TYPES TEST RESULTS';
    RAISE NOTICE '========================================';
    
    IF failed_tests = 0 THEN
        RAISE NOTICE 'SUCCESS: All % tests passed! ✓', total_tests;
        RAISE NOTICE 'RBAC enum types migration is working correctly.';
    ELSE
        RAISE NOTICE 'FAILURE: % out of % tests failed! ✗', failed_tests, total_tests;
        RAISE NOTICE 'Please review the failing tests above.';
    END IF;
    
    RAISE NOTICE '========================================';
END
$$;

-- Clean up test data
DROP TABLE test_results;

-- Commit transaction if all tests pass, rollback if you want to clean up
COMMIT;