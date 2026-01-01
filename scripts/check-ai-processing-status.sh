#!/bin/bash
# Check AI Processing Status
# Shows how many transcripts are in each processing state

set -e

echo "📊 AI Processing Status Report"
echo ""

# Source environment variables
if [ -f .env.local ]; then
    export $(grep -v '^#' .env.local | grep SUPABASE | xargs)
fi

# Check database connection
echo "🔌 Verifying database connection..."
./scripts/psql-supabase.sh -c "SELECT current_database() as database, COUNT(*) as profiles FROM profiles;" | grep -E "postgres.*251" > /dev/null

if [ $? -ne 0 ]; then
    echo "❌ Wrong database! Expected 251 profiles on Supabase production."
    exit 1
fi
echo "  ✅ Connected to Supabase production"
echo ""

# Processing status breakdown
echo "1️⃣ Processing Status Breakdown:"
./scripts/psql-supabase.sh -c "
SELECT
    COALESCE(ai_processing_status, 'null') as status,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM transcripts WHERE ai_processing_consent = true), 1) as percent
FROM transcripts
WHERE ai_processing_consent = true
GROUP BY ai_processing_status
ORDER BY count DESC;
"
echo ""

# AI data completeness
echo "2️⃣ AI Data Completeness:"
./scripts/psql-supabase.sh -c "
SELECT
    COUNT(*) as total_consented,
    COUNT(*) FILTER (WHERE ai_summary IS NOT NULL AND ai_summary != '') as with_summary,
    COUNT(*) FILTER (WHERE themes IS NOT NULL AND array_length(themes, 1) > 0) as with_themes,
    COUNT(*) FILTER (WHERE key_quotes IS NOT NULL AND array_length(key_quotes, 1) > 0) as with_quotes,
    ROUND(COUNT(*) FILTER (WHERE ai_summary IS NOT NULL AND ai_summary != '') * 100.0 / COUNT(*), 1) as summary_percent
FROM transcripts
WHERE ai_processing_consent = true;
"
echo ""

# Recent processing activity
echo "3️⃣ Recent Processing Activity (last 10):"
./scripts/psql-supabase.sh -c "
SELECT
    LEFT(title, 50) as title,
    ai_processing_status as status,
    CASE
        WHEN ai_summary IS NOT NULL THEN '✓'
        ELSE '✗'
    END as has_summary,
    updated_at::date as last_updated
FROM transcripts
WHERE ai_processing_consent = true
ORDER BY updated_at DESC
LIMIT 10;
"
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📈 Summary:"
./scripts/psql-supabase.sh -c "
SELECT
    CASE
        WHEN summary_count >= 200 THEN '✅ READY: >200 transcripts have summaries'
        WHEN summary_count >= 100 THEN '⚠️  PARTIAL: ' || summary_count || ' transcripts have summaries'
        ELSE '❌ INCOMPLETE: Only ' || summary_count || ' transcripts have summaries'
    END as status
FROM (
    SELECT COUNT(*) FILTER (WHERE ai_summary IS NOT NULL AND ai_summary != '') as summary_count
    FROM transcripts
    WHERE ai_processing_consent = true
) sub;
"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
