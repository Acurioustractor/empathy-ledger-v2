'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus, Users } from 'lucide-react';
import type { WizardMode } from '../types';

interface ModeSelectionStepProps {
  onSelect: (mode: WizardMode) => void;
}

export function ModeSelectionStep({ onSelect }: ModeSelectionStepProps) {
  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Choose whether you want to create a new storyteller profile or add a
        transcript to an existing profile.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        {/* New Storyteller */}
        <Card
          className="p-6 hover:border-primary transition-colors cursor-pointer group"
          onClick={() => onSelect('new')}
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
              <UserPlus className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">
                Create New Storyteller
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create a brand new profile for someone who hasn't shared their
                story yet. You'll set up their profile, upload photos, and add
                their first transcript.
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Set up basic profile information</li>
                <li>• Upload profile photo</li>
                <li>• Add location details</li>
                <li>• Upload their first transcript</li>
              </ul>
            </div>
          </div>
          <div className="w-full mt-6">
            <Button className="w-full" size="lg">
              Create New Profile
            </Button>
          </div>
        </Card>

        {/* Existing Storyteller */}
        <Card
          className="p-6 hover:border-primary transition-colors cursor-pointer group"
          onClick={() => onSelect('existing')}
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">
                Add to Existing Storyteller
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Add a new transcript to someone who already has a profile.
                Perfect for adding additional stories or interviews.
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Select from existing profiles</li>
                <li>• Upload new transcript</li>
                <li>• Tag with projects & galleries</li>
                <li>• Quick and streamlined process</li>
              </ul>
            </div>
          </div>
          <div className="w-full mt-6">
            <Button className="w-full" variant="outline" size="lg">
              Select Existing Profile
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
