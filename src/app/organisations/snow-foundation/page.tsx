import { redirect } from 'next/navigation'

export default function SnowFoundationPage() {
  // Direct redirect to Snow Foundation dashboard
  redirect('/organisations/4a1c31e8-89b7-476d-a74b-0c8b37efc850/dashboard')
}