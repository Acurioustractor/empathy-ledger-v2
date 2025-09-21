'use client'

import dynamic from 'next/dynamic'
import { AuthProvider } from '@/lib/context/auth.context'

// Dynamic import with ssr disabled to prevent hydration issues
const AuthProviderClient = dynamic(
  () => Promise.resolve(AuthProvider),
  { ssr: false }
)

export function ClientAuthProvider({ children }: { children: React.ReactNode }) {
  return <AuthProviderClient>{children}</AuthProviderClient>
}