/**
 * Organization Onboarding Page
 *
 * Self-service signup for new organizations.
 * Guides through the complete setup process.
 */

'use client';

import { useRouter } from 'next/navigation';
import OrganizationOnboardingWizard from '@/components/onboarding/OrganizationOnboardingWizard';

export default function OnboardingPage() {
  const router = useRouter();

  function handleComplete(data: any) {
    // Redirect to the new organization's dashboard
    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    router.push(`/organisations/${slug}/dashboard`);
  }

  function handleCancel() {
    router.push('/');
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Empathy Ledger
          </h1>
          <p className="text-lg text-muted-foreground">
            Set up your organization to start measuring impact through storytelling
          </p>
        </div>

        {/* Wizard */}
        <OrganizationOnboardingWizard
          onComplete={handleComplete}
          onCancel={handleCancel}
        />

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            By signing up, you agree to our{' '}
            <a href="/terms" className="text-purple-600 hover:underline">Terms of Service</a>
            {' '}and{' '}
            <a href="/privacy" className="text-purple-600 hover:underline">Privacy Policy</a>
          </p>
          <p className="mt-2">
            Questions? Contact us at{' '}
            <a href="mailto:hello@actforyouth.org.au" className="text-purple-600 hover:underline">
              hello@actforyouth.org.au
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
