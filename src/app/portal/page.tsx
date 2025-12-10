'use client'

import { PartnerDashboard } from '@/components/partner-portal'

export default function PortalDashboardPage() {
  // In production, this would come from auth context
  const appId = 'act-place-001'
  const appName = 'act.place'

  return <PartnerDashboard appId={appId} appName={appName} />
}
