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

export function useOrganizationContext() {
  const context = useContext(OrganizationContext)
  if (!context) {
    throw new Error('useOrganizationContext must be used within OrganizationContext.Provider')
  }
  return context
}
