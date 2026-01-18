import { UserPlus } from 'lucide-react'
import ComingSoon from '@/components/layout/coming-soon'

export default function StorytellerApplyPage() {
  return (
    <ComingSoon
      title="Become a Storyteller"
      description="Join our community of storytellers. We're building a thoughtful application process that respects cultural protocols and community needs."
      icon={<UserPlus className="w-10 h-10" />}
    />
  )
}
