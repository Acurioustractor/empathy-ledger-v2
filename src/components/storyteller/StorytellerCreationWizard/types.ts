// Shared types for the Storyteller Creation Wizard

export type WizardMode = 'new' | 'existing';

export type WizardStep =
  | 'basic-info'
  | 'photo-upload'
  | 'location'
  | 'transcript'
  | 'tagging'
  | 'review';

export interface BasicInfo {
  firstName: string;
  lastName: string;
  displayName: string;
  bio: string;
  email?: string;
  phone?: string;
}

export interface LocationData {
  locationId: string;
  locationType: 'birthplace' | 'current' | 'significant';
  locationName: string;
}

export interface TranscriptData {
  transcriptId?: string;
  content: string;
  title: string;
  recordedDate?: string;
  duration?: number;
}

export interface TaggingData {
  projectIds: string[];
  galleryIds: string[];
}

export interface WizardData {
  mode: WizardMode;

  // For existing profile mode
  existingProfileId?: string;

  // For new profile mode
  basicInfo?: BasicInfo;
  avatarMediaId?: string;
  coverMediaId?: string;
  locationData?: LocationData[];

  // Common to both modes
  transcriptData?: TranscriptData;
  taggingData?: TaggingData;
}

export interface StepProps {
  data: WizardData;
  onUpdate: (updates: Partial<WizardData>) => void;
  onNext: () => void;
  onBack: () => void;
  organizationId: string;
}
