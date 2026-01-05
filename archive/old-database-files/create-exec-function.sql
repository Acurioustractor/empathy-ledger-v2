-- Custom SQL Execution Function for Supabase
-- This enables programmatic schema deployment
-- Run this first in Supabase SQL Editor to enable the deployment scripts

-- Create a custom exec function that can execute dynamic SQL
CREATE OR REPLACE FUNCTION public.exec(sql text)
RETURNS void AS $$
BEGIN
    EXECUTE sql;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Alternative version that returns result info
CREATE OR REPLACE FUNCTION public.exec_sql(sql text)
RETURNS jsonb AS $$
DECLARE
    result_info jsonb;
BEGIN
    EXECUTE sql;
    result_info := jsonb_build_object(
        'status', 'success',
        'message', 'SQL executed successfully',
        'executed_at', now()
    );
    RETURN result_info;
EXCEPTION WHEN OTHERS THEN
    result_info := jsonb_build_object(
        'status', 'error',
        'message', SQLERRM,
        'error_code', SQLSTATE,
        'executed_at', now()
    );
    RETURN result_info;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.exec(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO service_role;

-- Add comment for documentation
COMMENT ON FUNCTION public.exec(text) IS 'Custom function to execute dynamic SQL for schema deployment';
COMMENT ON FUNCTION public.exec_sql(text) IS 'Custom function to execute dynamic SQL with error handling and result info';