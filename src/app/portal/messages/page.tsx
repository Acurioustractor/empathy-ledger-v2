'use client'

import { PartnerMessages } from '@/components/partner-portal'

export default function MessagesPage() {
  // In production, this would come from auth context
  const appId = 'act-place-001'

  return <PartnerMessages appId={appId} />
}
