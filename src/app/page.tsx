'use client'

import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import { PublicHomepage } from '@/components/public/PublicHomepage'

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <PublicHomepage />
      <Footer />
    </div>
  )
}