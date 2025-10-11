'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, User, FileText, MapPin, Folder, CheckCircle } from 'lucide-react';
import type { StepProps } from '../types';

interface ReviewStepProps extends StepProps {
  onComplete: (storytellerId: string) => void;
}

export function ReviewStep({
  data,
  onBack,
  organizationId,
  onComplete,
}: ReviewStepProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Step 1: Create or use existing profile
      let profileId = data.existingProfileId;

      if (data.mode === 'new' && data.basicInfo) {
        // Create new profile with enhanced schema
        const fullName = `${data.basicInfo.firstName} ${data.basicInfo.lastName}`;

        const profileRes = await fetch('/api/profiles/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            display_name: data.basicInfo.displayName,
            full_name: fullName,
            first_name: data.basicInfo.firstName,
            last_name: data.basicInfo.lastName,
            bio: data.basicInfo.bio,
            email: data.basicInfo.email,
            phone_number: data.basicInfo.phone,
            avatar_media_id: data.avatarMediaId,
            cover_media_id: data.coverMediaId,
            is_storyteller: true,
            organization_id: organizationId,
          }),
        });

        if (!profileRes.ok) {
          throw new Error('Failed to create profile');
        }

        const profileData = await profileRes.json();
        profileId = profileData.profile.id;

        // Attach locations if any were selected
        if (data.locationData && data.locationData.length > 0) {
          const locationsPayload = data.locationData
            .filter(location => Boolean(location.locationId))
            .map((location, index) => ({
              location_id: location.locationId,
              location_type: location.locationType,
              is_primary: index === 0 || location.locationType === 'current'
            }));

          if (locationsPayload.length > 0) {
            const locationRes = await fetch(`/api/profiles/${profileId}/locations`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ locations: locationsPayload })
            });

            if (!locationRes.ok) {
              const errorData = await locationRes.json();
              console.error('Failed to attach locations:', errorData);
            }
          }
        }
      }

      if (!profileId) {
        throw new Error('No profile ID available');
      }

      // Step 2: Create transcript
      let transcriptId: string | undefined;
      if (data.transcriptData) {
        const transcriptRes = await fetch('/api/transcripts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: data.transcriptData.title,
            text: data.transcriptData.content,
            createdBy: profileId,
          }),
        });

        if (!transcriptRes.ok) {
          const errorData = await transcriptRes.json();
          throw new Error(errorData.error || 'Failed to create transcript');
        }

        const transcriptData = await transcriptRes.json();
        transcriptId = transcriptData.transcript.id;
      }

      // Step 3: Create storyteller association with organization
      const storytellerRes = await fetch(
        `/api/organisations/${organizationId}/storytellers`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: profileId,
          }),
        }
      );

      if (!storytellerRes.ok) {
        const errorData = await storytellerRes.json();
        throw new Error(errorData.error || 'Failed to create storyteller association');
      }

      // The storyteller ID is the profile ID
      const storytellerId = profileId;

      // Step 4: Add to projects (TODO: Implement project-storyteller relationships)
      // Currently project assignment is not implemented in the backend
      // This will be handled separately through the organization's project management

      // Success!
      onComplete(storytellerId);
    } catch (err) {
      console.error('Failed to create storyteller:', err);
      setError(
        err instanceof Error ? err.message : 'An unexpected error occurred'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-muted-foreground">
          Review the information below before creating the storyteller profile.
        </p>
      </div>

      <div className="space-y-4">
        {/* Basic Info */}
        {data.mode === 'new' && data.basicInfo && (
          <Card className="p-4">
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold mb-2">Basic Information</h3>
                <dl className="space-y-2 text-sm">
                  <div>
                    <dt className="text-muted-foreground inline">Name:</dt>{' '}
                    <dd className="inline font-medium">
                      {data.basicInfo.firstName} {data.basicInfo.lastName}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground inline">
                      Display Name:
                    </dt>{' '}
                    <dd className="inline font-medium">
                      {data.basicInfo.displayName}
                    </dd>
                  </div>
                  {data.basicInfo.bio && (
                    <div>
                      <dt className="text-muted-foreground">Biography:</dt>
                      <dd className="mt-1">{data.basicInfo.bio}</dd>
                    </div>
                  )}
                  {data.basicInfo.email && (
                    <div>
                      <dt className="text-muted-foreground inline">Email:</dt>{' '}
                      <dd className="inline">{data.basicInfo.email}</dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          </Card>
        )}

        {/* Photos */}
        {(data.avatarMediaId || data.coverMediaId) && (
          <Card className="p-4">
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold mb-2">Photos</h3>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  {data.avatarMediaId && <span>✓ Profile photo</span>}
                  {data.coverMediaId && <span>✓ Cover photo</span>}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Locations */}
        {data.locationData && data.locationData.length > 0 && (
          <Card className="p-4">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold mb-2">Locations</h3>
                <ul className="space-y-2 text-sm">
                  {data.locationData.map((location, idx) => (
                    <li key={idx}>
                      <span className="font-medium capitalize">
                        {location.locationType}:
                      </span>{' '}
                      {location.locationName}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        )}

        {/* Transcript */}
        {data.transcriptData && (
          <Card className="p-4">
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold mb-2">Transcript</h3>
                <dl className="space-y-2 text-sm">
                  <div>
                    <dt className="text-muted-foreground inline">Title:</dt>{' '}
                    <dd className="inline font-medium">
                      {data.transcriptData.title}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground inline">Length:</dt>{' '}
                    <dd className="inline">
                      {data.transcriptData.content.length} characters
                    </dd>
                  </div>
                  {data.transcriptData.recordedDate && (
                    <div>
                      <dt className="text-muted-foreground inline">Date:</dt>{' '}
                      <dd className="inline">
                        {new Date(
                          data.transcriptData.recordedDate
                        ).toLocaleDateString()}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          </Card>
        )}

        {/* Tagging */}
        {data.taggingData &&
          (data.taggingData.projectIds.length > 0 ||
            data.taggingData.galleryIds.length > 0) && (
            <Card className="p-4">
              <div className="flex items-start gap-3">
                <Folder className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold mb-2">Organization</h3>
                  <div className="space-y-2 text-sm">
                    {data.taggingData.projectIds.length > 0 && (
                      <div>
                        <span className="text-muted-foreground">
                          {data.taggingData.projectIds.length} project
                          {data.taggingData.projectIds.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                    {data.taggingData.galleryIds.length > 0 && (
                      <div>
                        <span className="text-muted-foreground">
                          {data.taggingData.galleryIds.length} gallery
                          {data.taggingData.galleryIds.length !== 1
                            ? 's'
                            : ''}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg">
          <p className="font-medium">Error creating storyteller</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between pt-6 border-t">
        <Button variant="outline" onClick={onBack} disabled={isSubmitting}>
          Back
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          size="lg"
          className="gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating Storyteller...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4" />
              Create Storyteller
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
