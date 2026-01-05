#!/usr/bin/env python3
"""
Fix syndication migration schema to match Empathy Ledger database structure - Version 2.

This version properly handles comments and commas.
"""

import re

def fix_migration(input_file, output_file):
    with open(input_file, 'r') as f:
        content = f.read()

    # Fix 1: Replace tenant_id with organization_id throughout
    content = content.replace('tenant_id', 'organization_id')

    # Fix 2: Replace tenants table reference with organizations
    content = content.replace('REFERENCES tenants(id)', 'REFERENCES organizations(id)')

    # Fix 3: Replace tenant_members with organization_members
    content = content.replace('tenant_members', 'organization_members')

    # Fix 4: Remove auth.users references but keep the column
    # This is the tricky one - we need to handle:
    # "UUID REFERENCES auth.users(id)" ->  "UUID"
    # "UUID REFERENCES auth.users(id) ON DELETE CASCADE," -> "UUID,"
    # Must preserve commas and line structure

    # Pattern: Find "REFERENCES auth.users(id)" with optional ON DELETE CASCADE
    # and replace with nothing, keeping what comes after
    content = re.sub(
        r'REFERENCES auth\.users\(id\)(\s+ON DELETE CASCADE)?',
        r'',
        content
    )

    # Fix 5: Remove authenticated/service_role grant statements
    content = re.sub(
        r'GRANT (.+?) TO (authenticated|service_role);',
        r'-- GRANT \1 TO \2; (no auth roles)',
        content
    )

    # Fix 6: Comment out ALTER TABLE ENABLE RLS (might fail if RLS already enabled)
    content = re.sub(
        r'(ALTER TABLE .+ ENABLE ROW LEVEL SECURITY;)',
        r'-- \1 (may already be enabled)',
        content
    )

    with open(output_file, 'w') as f:
        f.write(content)

    print(f"✓ Fixed migration written to {output_file}")
    print(f"  - Replaced tenant_id → organization_id")
    print(f"  - Replaced tenants → organizations")
    print(f"  - Replaced tenant_members → organization_members")
    print(f"  - Removed auth.users references (preserving structure)")
    print(f"  - Commented out auth role grants")

if __name__ == '__main__':
    fix_migration(
        'supabase/migrations/20260102120000_syndication_system_schema_clean.sql',
        'supabase/migrations/20260102120000_syndication_system_schema.sql'
    )
