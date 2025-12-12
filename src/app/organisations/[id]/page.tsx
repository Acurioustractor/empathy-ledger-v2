export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'

interface OrganizationPageProps {
  params: Promise<{ id: string }>
}

export default async function OrganizationPage({ params }: OrganizationPageProps) {
  // Redirect to dashboard as the default organisation view  
  const { id } = await params
  redirect(`/organisations/${id}/dashboard`)
}