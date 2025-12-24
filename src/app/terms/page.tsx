export const dynamic = 'force-dynamic'

import { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Terms of Service | Empathy Ledger',
  description: 'Terms and conditions for using the Empathy Ledger platform',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 to-earth-50">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" asChild className="mb-6">
            <Link href="/auth/signup">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Sign Up
            </Link>
          </Button>
          
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold mb-6 text-earth-800">Terms of Service</h1>
            <p className="text-stone-600 mb-8">Last updated: {new Date().toLocaleDateString()}</p>
            
            <div className="space-y-6 text-stone-700">
              <section>
                <h2 className="text-xl font-semibold mb-3 text-earth-700">1. Acceptance of Terms</h2>
                <p>By accessing and using Empathy Ledger, you accept and agree to be bound by the terms and provision of this agreement.</p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3 text-earth-700">2. Use License</h2>
                <p>Permission is granted to temporarily download one copy of the materials on Empathy Ledger for personal, non-commercial transitory viewing only.</p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3 text-earth-700">3. Cultural Respect</h2>
                <p>Users agree to respect cultural sensitivities and protocols when sharing or viewing stories. Content that is culturally sensitive will be marked accordingly.</p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3 text-earth-700">4. User Content</h2>
                <p>Users retain ownership of their stories but grant Empathy Ledger a license to display and share content according to the privacy settings selected.</p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3 text-earth-700">5. Privacy</h2>
                <p>Your use of our platform is also governed by our <Link href="/privacy" className="text-sage-600 hover:underline">Privacy Policy</Link>.</p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3 text-earth-700">6. Modifications</h2>
                <p>Empathy Ledger may revise these terms of service at any time without notice. By using this platform, you agree to be bound by the current version of these terms.</p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3 text-earth-700">7. Contact Information</h2>
                <p>If you have any questions about these Terms, please contact us at support@empathyledger.org</p>
              </section>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}