import { Heart } from 'lucide-react'
import ComingSoon from '@/components/layout/coming-soon'

export default function CulturalProtocolsPage() {
  return (
    <ComingSoon
      title="Cultural Protocols"
      description="Learn about the cultural safety principles that guide our platform. Elder wisdom and community protocols shape how we handle stories."
      icon={<Heart className="w-10 h-10" />}
    />
  )
}
