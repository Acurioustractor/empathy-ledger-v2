import { BookOpen } from 'lucide-react'
import ComingSoon from '@/components/layout/coming-soon'

export default function BlogPage() {
  return (
    <ComingSoon
      title="Blog"
      description="Stories, insights, and updates from our community. We're preparing a space where voices can share their wisdom and experiences."
      icon={<BookOpen className="w-10 h-10" />}
    />
  )
}
