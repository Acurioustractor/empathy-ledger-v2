import { HelpCircle } from 'lucide-react'
import ComingSoon from '@/components/layout/coming-soon'

export default function HelpPage() {
  return (
    <ComingSoon
      title="Help Center"
      description="Guides, tutorials, and support resources to help you navigate the platform. We're creating comprehensive documentation for our community."
      icon={<HelpCircle className="w-10 h-10" />}
    />
  )
}
