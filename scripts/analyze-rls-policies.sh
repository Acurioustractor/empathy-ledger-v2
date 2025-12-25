#!/bin/bash

echo "=== RLS Policy Analysis ==="
echo ""

echo "Total CREATE POLICY statements:"
grep -h "CREATE POLICY" supabase/migrations/*.sql | wc -l

echo ""
echo "=== Tables with Most Policies ==="
grep -h "CREATE POLICY" supabase/migrations/*.sql | \
  grep -oE "ON [a-z_]+" | \
  sort | uniq -c | sort -rn | head -20

echo ""
echo "=== Most Common Policy Names ==="
grep -h "CREATE POLICY" supabase/migrations/*.sql | \
  sed 's/CREATE POLICY "//' | \
  sed 's/" ON.*//' | \
  sort | uniq -c | sort -rn | head -15

echo ""
echo "=== Breakdown by Operation Type ==="
echo "SELECT policies:"
grep -h "CREATE POLICY" supabase/migrations/*.sql | grep -i "FOR SELECT" | wc -l

echo "INSERT policies:"
grep -h "CREATE POLICY" supabase/migrations/*.sql | grep -i "FOR INSERT" | wc -l

echo "UPDATE policies:"
grep -h "CREATE POLICY" supabase/migrations/*.sql | grep -i "FOR UPDATE" | wc -l

echo "DELETE policies:"
grep -h "CREATE POLICY" supabase/migrations/*.sql | grep -i "FOR DELETE" | wc -l

echo "ALL operations policies:"
grep -h "CREATE POLICY" supabase/migrations/*.sql | grep -i "FOR ALL" | wc -l

echo ""
echo "=== Potential Issues ==="
echo "Policies using 'public' check (potential over-permissive):"
grep -h "CREATE POLICY" supabase/migrations/*.sql | grep -i "true" | wc -l

echo ""
echo "Policies with complex checks (> 100 chars):"
grep -h "CREATE POLICY" supabase/migrations/*.sql | \
  while read line; do
    if [ ${#line} -gt 200 ]; then
      echo "$line" | cut -c1-100
    fi
  done | wc -l

echo ""
echo "=== Files with Most Policies ==="
for file in supabase/migrations/*.sql; do
  count=$(grep -c "CREATE POLICY" "$file" 2>/dev/null || echo 0)
  if [ $count -gt 0 ]; then
    echo "$count $(basename $file)"
  fi
done | sort -rn | head -15
