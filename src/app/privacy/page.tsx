export const dynamic = 'force-dynamic'

import { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Shield, Lock, Eye, UserCheck, Database, Globe } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Privacy Policy | Empathy Ledger',
  description: 'How we protect and handle your personal information',
}

export default function PrivacyPage() {
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
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-earth-800">Privacy Policy</h1>
            </div>
            
            <p className="text-grey-600 mb-8">Last updated: {new Date().toLocaleDateString()}</p>
            
            <div className="space-y-8 text-grey-700">
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Lock className="w-5 h-5 text-earth-600" />
                  <h2 className="text-xl font-semibold text-earth-700">1. Information We Collect</h2>
                </div>
                <ul className="list-disc pl-8 space-y-2">
                  <li>Personal information you provide when creating an account</li>
                  <li>Stories and content you choose to share</li>
                  <li>Usage data to improve our services</li>
                  <li>Communication preferences</li>
                </ul>
              </section>
              
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Eye className="w-5 h-5 text-earth-600" />
                  <h2 className="text-xl font-semibold text-earth-700">2. How We Use Your Information</h2>
                </div>
                <ul className="list-disc pl-8 space-y-2">
                  <li>To provide and maintain our platform</li>
                  <li>To notify you about changes to our service</li>
                  <li>To provide customer support</li>
                  <li>To gather analysis or valuable information to improve our service</li>
                  <li>To respect and implement cultural protocols</li>
                </ul>
              </section>
              
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <UserCheck className="w-5 h-5 text-earth-600" />
                  <h2 className="text-xl font-semibold text-earth-700">3. Cultural Sensitivity & Consent</h2>
                </div>
                <p className="mb-3">We are committed to respecting cultural protocols and sensitivities:</p>
                <ul className="list-disc pl-8 space-y-2">
                  <li>Stories marked as culturally sensitive require appropriate permissions</li>
                  <li>Elder approval processes are respected and enforced</li>
                  <li>Community-specific privacy settings are available</li>
                  <li>Cultural protocols override general privacy settings when applicable</li>
                </ul>
              </section>
              
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Database className="w-5 h-5 text-earth-600" />
                  <h2 className="text-xl font-semibold text-earth-700">4. Data Storage & Security</h2>
                </div>
                <p>We use industry-standard security measures to protect your personal information. Your stories are stored securely and are only accessible according to the privacy settings you choose.</p>
              </section>
              
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Globe className="w-5 h-5 text-earth-600" />
                  <h2 className="text-xl font-semibold text-earth-700">5. Sharing of Information</h2>
                </div>
                <p className="mb-3">We do not sell, trade, or rent your personal information. Information is shared only:</p>
                <ul className="list-disc pl-8 space-y-2">
                  <li>With your explicit consent</li>
                  <li>To comply with legal obligations</li>
                  <li>To protect and defend our rights or property</li>
                  <li>According to the visibility settings you choose for your stories</li>
                </ul>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3 text-earth-700">6. Your Rights</h2>
                <p className="mb-3">You have the right to:</p>
                <ul className="list-disc pl-8 space-y-2">
                  <li>Access your personal information</li>
                  <li>Correct inaccurate data</li>
                  <li>Request deletion of your data</li>
                  <li>Control the visibility of your stories</li>
                  <li>Withdraw consent at any time</li>
                </ul>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3 text-earth-700">7. Children's Privacy</h2>
                <p>Our platform requires parental consent for users under 18. Stories involving minors require additional privacy protections and approvals.</p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3 text-earth-700">8. Contact Us</h2>
                <p>If you have questions about this Privacy Policy, please contact us at:</p>
                <p className="mt-2">
                  Email: privacy@empathyledger.org<br />
                  Or through our platform's contact form
                </p>
              </section>
            </div>
            
            <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Our Commitment:</strong> We are committed to protecting your privacy while honouring cultural protocols and ensuring your stories are shared respectfully and appropriately.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}