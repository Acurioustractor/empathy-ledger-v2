/**
 * Organization ALMA Impact Page
 *
 * Displays ALMA-aligned impact intelligence dashboard for an organization
 * Data flows from the 4-tier rollup hierarchy:
 * transcript_analysis → storyteller_master → project_impact → org_impact
 */

import { Suspense } from 'react';
import OrganizationALMADashboard from '@/components/impact/OrganizationALMADashboard';

interface ImpactPageProps {
  params: Promise<{ id: string }>;
}

export default async function ImpactPage({ params }: ImpactPageProps) {
  const { id: organizationId } = await params;

  return (
    <div className="space-y-6">
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-sm text-muted-foreground">Loading ALMA impact intelligence...</p>
            </div>
          </div>
        }
      >
        <OrganizationALMADashboard organizationId={organizationId} />
      </Suspense>
    </div>
  );
}

export const metadata = {
  title: 'ALMA Impact Dashboard',
  description: 'ALMA-aligned impact intelligence and measurement for organization storytelling'
};
