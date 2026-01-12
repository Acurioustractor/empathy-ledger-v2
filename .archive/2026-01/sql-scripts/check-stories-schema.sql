-- Check what columns actually exist in the stories table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'stories'
ORDER BY ordinal_position;
