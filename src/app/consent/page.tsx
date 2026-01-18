import { FileCheck } from 'lucide-react'
import ComingSoon from '@/components/layout/coming-soon'

export default function ConsentPage() {
  return (
    <ComingSoon
      title="Consent Management"
      description="Control how your data and stories are used. We're building comprehensive consent tools that respect your autonomy and cultural protocols."
      icon={<FileCheck className="w-10 h-10" />}
    />
  )
}
