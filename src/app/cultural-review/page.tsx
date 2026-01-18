import { Shield } from 'lucide-react'
import ComingSoon from '@/components/layout/coming-soon'

export default function CulturalReviewPage() {
  return (
    <ComingSoon
      title="Cultural Review"
      description="Our elder-guided review process ensures all content respects cultural protocols. This feature is being developed with community guidance."
      icon={<Shield className="w-10 h-10" />}
    />
  )
}
