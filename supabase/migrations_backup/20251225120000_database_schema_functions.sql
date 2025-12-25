-- Database Schema Introspection Functions
-- Provides functions to query and analyze the database schema

-- Function to get all tables with metadata
CREATE OR REPLACE FUNCTION get_database_schema()
RETURNS TABLE (
  table_name TEXT,
  column_count BIGINT,
  has_rls BOOLEAN,
  row_count BIGINT,
  table_size TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.tablename::TEXT as table_name,
    (
      SELECT COUNT(*)::BIGINT
      FROM information_schema.columns c
      WHERE c.table_schema = 'public'
        AND c.table_name = t.tablename
    ) as column_count,
    (
      SELECT COUNT(*) > 0
      FROM pg_policies p
      WHERE p.schemaname = 'public'
        AND p.tablename = t.tablename
    ) as has_rls,
    (
      SELECT COALESCE(reltuples::BIGINT, 0)
      FROM pg_class
      WHERE oid = ('public.' || t.tablename)::regclass
    ) as row_count,
    (
      SELECT pg_size_pretty(pg_total_relation_size(('public.' || t.tablename)::regclass))
      FROM pg_class
      WHERE oid = ('public.' || t.tablename)::regclass
      LIMIT 1
    ) as table_size
  FROM pg_tables t
  WHERE t.schemaname = 'public'
  ORDER BY t.tablename;
END;
$$;

-- Function to get table columns
CREATE OR REPLACE FUNCTION get_table_columns(p_table_name TEXT)
RETURNS TABLE (
  column_name TEXT,
  data_type TEXT,
  is_nullable TEXT,
  column_default TEXT,
  is_primary_key BOOLEAN,
  is_foreign_key BOOLEAN,
  foreign_table TEXT,
  foreign_column TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.column_name::TEXT,
    c.data_type::TEXT,
    c.is_nullable::TEXT,
    c.column_default::TEXT,
    EXISTS (
      SELECT 1
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
      WHERE tc.table_name = p_table_name
        AND tc.constraint_type = 'PRIMARY KEY'
        AND kcu.column_name = c.column_name
    ) as is_primary_key,
    EXISTS (
      SELECT 1
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
      WHERE tc.table_name = p_table_name
        AND tc.constraint_type = 'FOREIGN KEY'
        AND kcu.column_name = c.column_name
    ) as is_foreign_key,
    (
      SELECT ccu.table_name::TEXT
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage ccu
        ON tc.constraint_name = ccu.constraint_name
      WHERE tc.table_name = p_table_name
        AND tc.constraint_type = 'FOREIGN KEY'
        AND kcu.column_name = c.column_name
      LIMIT 1
    ) as foreign_table,
    (
      SELECT ccu.column_name::TEXT
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage ccu
        ON tc.constraint_name = ccu.constraint_name
      WHERE tc.table_name = p_table_name
        AND tc.constraint_type = 'FOREIGN KEY'
        AND kcu.column_name = c.column_name
      LIMIT 1
    ) as foreign_column
  FROM information_schema.columns c
  WHERE c.table_schema = 'public'
    AND c.table_name = p_table_name
  ORDER BY c.ordinal_position;
END;
$$;

-- Function to get table relationships
CREATE OR REPLACE FUNCTION get_table_relationships()
RETURNS TABLE (
  from_table TEXT,
  from_column TEXT,
  to_table TEXT,
  to_column TEXT,
  constraint_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    kcu.table_name::TEXT as from_table,
    kcu.column_name::TEXT as from_column,
    ccu.table_name::TEXT as to_table,
    ccu.column_name::TEXT as to_column,
    tc.constraint_name::TEXT
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
  JOIN information_schema.constraint_column_usage ccu
    ON tc.constraint_name = ccu.constraint_name
  WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
  ORDER BY kcu.table_name, kcu.column_name;
END;
$$;

-- Function to get RLS policies for a table
CREATE OR REPLACE FUNCTION get_table_policies(p_table_name TEXT)
RETURNS TABLE (
  policy_name TEXT,
  policy_command TEXT,
  policy_roles TEXT[],
  policy_qual TEXT,
  policy_check TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.policyname::TEXT as policy_name,
    p.cmd::TEXT as policy_command,
    p.roles::TEXT[] as policy_roles,
    p.qual::TEXT as policy_qual,
    p.with_check::TEXT as policy_check
  FROM pg_policies p
  WHERE p.schemaname = 'public'
    AND p.tablename = p_table_name
  ORDER BY p.policyname;
END;
$$;

-- Function to get database statistics
CREATE OR REPLACE FUNCTION get_database_stats()
RETURNS TABLE (
  total_tables BIGINT,
  total_columns BIGINT,
  total_indexes BIGINT,
  total_functions BIGINT,
  total_policies BIGINT,
  database_size TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*)::BIGINT FROM pg_tables WHERE schemaname = 'public') as total_tables,
    (SELECT COUNT(*)::BIGINT FROM information_schema.columns WHERE table_schema = 'public') as total_columns,
    (SELECT COUNT(*)::BIGINT FROM pg_indexes WHERE schemaname = 'public') as total_indexes,
    (SELECT COUNT(*)::BIGINT FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname = 'public') as total_functions,
    (SELECT COUNT(*)::BIGINT FROM pg_policies WHERE schemaname = 'public') as total_policies,
    (SELECT pg_size_pretty(pg_database_size(current_database()))) as database_size;
END;
$$;

-- Function to search tables and columns
CREATE OR REPLACE FUNCTION search_schema(p_search_term TEXT)
RETURNS TABLE (
  result_type TEXT,
  table_name TEXT,
  column_name TEXT,
  data_type TEXT,
  description TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  -- Search table names
  SELECT
    'table'::TEXT as result_type,
    t.tablename::TEXT as table_name,
    NULL::TEXT as column_name,
    NULL::TEXT as data_type,
    obj_description(('public.' || t.tablename)::regclass)::TEXT as description
  FROM pg_tables t
  WHERE t.schemaname = 'public'
    AND t.tablename ILIKE '%' || p_search_term || '%'

  UNION ALL

  -- Search column names
  SELECT
    'column'::TEXT as result_type,
    c.table_name::TEXT,
    c.column_name::TEXT,
    c.data_type::TEXT,
    col_description(('public.' || c.table_name)::regclass, c.ordinal_position::int)::TEXT as description
  FROM information_schema.columns c
  WHERE c.table_schema = 'public'
    AND c.column_name ILIKE '%' || p_search_term || '%'

  ORDER BY result_type, table_name, column_name;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_database_schema() TO authenticated;
GRANT EXECUTE ON FUNCTION get_table_columns(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_table_relationships() TO authenticated;
GRANT EXECUTE ON FUNCTION get_table_policies(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_database_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION search_schema(TEXT) TO authenticated;

-- Comments
COMMENT ON FUNCTION get_database_schema() IS 'Returns list of all tables with metadata (column count, RLS status, row count, size)';
COMMENT ON FUNCTION get_table_columns(TEXT) IS 'Returns detailed column information for a specific table';
COMMENT ON FUNCTION get_table_relationships() IS 'Returns all foreign key relationships in the database';
COMMENT ON FUNCTION get_table_policies(TEXT) IS 'Returns all RLS policies for a specific table';
COMMENT ON FUNCTION get_database_stats() IS 'Returns overall database statistics';
COMMENT ON FUNCTION search_schema(TEXT) IS 'Search for tables and columns by name';
