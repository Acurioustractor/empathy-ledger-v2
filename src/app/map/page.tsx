import { MapPin } from 'lucide-react'
import ComingSoon from '@/components/layout/coming-soon'

export default function MapPage() {
  return (
    <ComingSoon
      title="Story Map"
      description="Explore stories from communities across the land. An interactive map connecting stories to the places and communities they come from."
      icon={<MapPin className="w-10 h-10" />}
    />
  )
}
