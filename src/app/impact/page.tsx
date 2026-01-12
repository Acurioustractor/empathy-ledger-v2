/**
 * Global ALMA Impact Page
 *
 * Platform-wide impact intelligence dashboard
 * Shows aggregate patterns across all organizations
 */

import { Suspense } from 'react';
import GlobalALMADashboard from '@/components/impact/GlobalALMADashboard';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';

export default function GlobalImpactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-purple-50/20 to-stone-50">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <Suspense
          fallback={
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-sm text-muted-foreground">Loading global impact intelligence...</p>
              </div>
            </div>
          }
        >
          <GlobalALMADashboard />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}

export const metadata = {
  title: 'Global ALMA Impact | Empathy Ledger',
  description: 'Platform-wide ALMA-aligned impact intelligence across all communities'
};
