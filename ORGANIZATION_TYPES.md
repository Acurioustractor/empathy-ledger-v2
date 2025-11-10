# Organization Types in Empathy Ledger v2

## Allowed Organization Types

The Empathy Ledger v2 platform supports **three** organization types, as defined by the database schema:

### 1. Community (`community`)
General community organizations including:
- Local community groups
- Neighborhood associations
- Cultural centers
- Youth organizations
- Sports and recreation clubs
- General non-profit community services

### 2. Aboriginal Community (`aboriginal_community`)
Indigenous, Aboriginal, and First Nations community organizations including:
- Aboriginal community controlled organizations
- Indigenous land councils
- First Nations cultural centers
- Tribal councils and governance bodies
- Indigenous health and education services
- Native title representative bodies

This type includes enhanced cultural protocols and governance features specific to Indigenous community needs.

### 3. Philanthropy (`philanthropy`)
Philanthropic foundations and grant-making organizations including:
- Private foundations
- Community foundations
- Corporate foundations
- Family foundations
- Grant-making trusts
- Funding bodies

## Database Constraint

The organization types are enforced at the database level through a CHECK constraint:

```sql
CHECK (type IN ('community', 'aboriginal_community', 'philanthropy'))
```

## Historical Note

Previous iterations of the platform may have referenced other organization types such as:
- `nonprofit` ❌ (not allowed)
- `government` ❌ (not allowed)
- `tribal` ❌ (not allowed)
- `ngo` ❌ (not allowed)

These types are **not supported** in the current schema and will cause database constraint violations.

## Implementation Details

### API Validation
[src/app/api/admin/orgs/route.ts](src/app/api/admin/orgs/route.ts:98)

```typescript
const validTypes = ['community', 'aboriginal_community', 'philanthropy']
```

### UI Form Options
[src/app/admin/organisations/create/page.tsx](src/app/admin/organisations/create/page.tsx:120-124)

```typescript
<SelectContent>
  <SelectItem value="community">Community</SelectItem>
  <SelectItem value="aboriginal_community">Aboriginal Community</SelectItem>
  <SelectItem value="philanthropy">Philanthropy</SelectItem>
</SelectContent>
```

## Usage in Multi-Tenant System

Each organization type:
1. Creates a corresponding tenant record
2. Inherits cultural protocols and settings
3. Maintains data isolation from other organizations
4. Can have different subscription tiers
5. Has configurable governance structures

### Cultural Protocols by Type

**Community Organizations**:
- Standard consent protocols
- Community review periods
- Elder approval (optional)

**Aboriginal Community Organizations**:
- Enhanced cultural sensitivity protocols
- Mandatory consent requirements
- Elder approval requirements
- Traditional knowledge protection
- Community consultation processes

**Philanthropy Organizations**:
- Grant-making workflows
- Impact tracking
- Beneficiary privacy protection
- Public accountability settings

## Testing

To test organization type validation:

```bash
npx tsx scripts/find-allowed-org-types.ts
```

This script tests all possible organization types and reports which are allowed by the database constraint.

## Related Documentation

- [SUPER_ADMIN_IMPLEMENTATION_SUMMARY.md](docs/SUPER_ADMIN_IMPLEMENTATION_SUMMARY.md)
- [MULTI_TENANT_BEST_PRACTICES.md](docs/MULTI_TENANT_BEST_PRACTICES.md)
- [ORGANIZATION_E2E_TEST_GUIDE.md](ORGANIZATION_E2E_TEST_GUIDE.md)
