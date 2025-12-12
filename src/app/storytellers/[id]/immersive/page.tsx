'use client'

export const dynamic = 'force-dynamic'

import { ImmersiveStorytellerProfile } from '@/components/profile/ImmersiveStorytellerProfile'
import { useParams } from 'next/navigation'

export default function ImmersiveStorytellerPage() {
  const params = useParams()
  const storytellerId = params.id as string

  return (
    <div className="min-h-screen">
      <ImmersiveStorytellerProfile storytellerId={storytellerId} />
    </div>
  )
}