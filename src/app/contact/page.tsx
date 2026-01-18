import { Mail } from 'lucide-react'
import ComingSoon from '@/components/layout/coming-soon'

export default function ContactPage() {
  return (
    <ComingSoon
      title="Contact Us"
      description="Get in touch with our team. We're building a way for you to reach out with questions, feedback, and partnership opportunities."
      icon={<Mail className="w-10 h-10" />}
    />
  )
}
