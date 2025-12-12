'use client'

import { createContext, useContext } from 'react'

/**
 * Organization Context for Super Admin
 *
 * Provides the currently selected organization ID for viewing/editing
 * Used in admin dashboard to switch between organizations
 */

export interface OrganizationContextType {
  selectedOrgId: string | 'all'
  setSelectedOrgId?: (orgId: string | 'all') => void
}

export const OrganizationContext = createContext<OrganizationContextType>({
  selectedOrgId: 'all'
})

// Default SSR-safe values for when context is not available during static generation
const defaultOrgContext: OrganizationContextType = {
  selectedOrgId: 'all',
  setSelectedOrgId: () => {},
}

export function useOrganizationContext() {
  try {
    const context = useContext(OrganizationContext)
    // Return default during SSR/SSG when provider isn't mounted
    if (!context) {
      return defaultOrgContext
    }
    return context
  } catch {
    // Return default when React context dispatcher is null (SSG)
    return defaultOrgContext
  }
}
