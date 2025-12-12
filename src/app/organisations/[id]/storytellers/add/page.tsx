'use client'

export const dynamic = 'force-dynamic';

import { useParams, useRouter } from 'next/navigation';
import { StorytellerCreationWizard } from '@/components/storyteller/StorytellerCreationWizard';

export default function AddStorytellerPage() {
  const params = useParams();
  const router = useRouter();
  const organizationId = params.id as string;

  return (
    <div className="min-h-screen bg-background">
      <StorytellerCreationWizard
        organizationId={organizationId}
        onComplete={(storytellerId) => {
          // Navigate to the storyteller's profile page
          router.push(`/storytellers/${storytellerId}`);
        }}
        onCancel={() => {
          // Navigate back to the storytellers list
          router.push(`/organisations/${organizationId}/storytellers`);
        }}
      />
    </div>
  );
}
