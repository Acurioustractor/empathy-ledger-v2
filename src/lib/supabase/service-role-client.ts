/**
 * Service Role Client for Super Admin
 *
 * This is an alias to the admin client that bypasses Row Level Security (RLS)
 * Used exclusively by super admin endpoints for platform-wide access
 */

export { createAdminClient as createServiceRoleClient } from './server'
