import { redirect } from 'next/navigation'

interface OrganizationPageProps {
  params: Promise<{ id: string }>
}

export default function OrganizationPage({ params }: OrganizationPageProps) {
  // Redirect to dashboard as the default organization view
  redirect(`/organizations/${params.id}/dashboard`)
}