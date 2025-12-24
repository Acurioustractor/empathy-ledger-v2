'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, X } from 'lucide-react';
import type { WizardData, WizardMode, WizardStep } from './types';

// Step components (to be created)
import { ModeSelectionStep } from './steps/ModeSelectionStep';
import { BasicInfoStep } from './steps/BasicInfoStep';
import { PhotoUploadStep } from './steps/PhotoUploadStep';
import { LocationStep } from './steps/LocationStep';
import { TranscriptStep } from './steps/TranscriptStep';
import { TaggingStep } from './steps/TaggingStep';
import { ReviewStep } from './steps/ReviewStep';

interface StorytellerCreationWizardProps {
  organizationId: string;
  onComplete: (storytellerId: string) => void;
  onCancel: () => void;
}

const STEP_TITLES: Record<WizardStep | 'mode-selection', string> = {
  'mode-selection': 'Choose How to Add Storyteller',
  'basic-info': 'Basic Information',
  'photo-upload': 'Profile Photos',
  'location': 'Locations',
  'transcript': 'Upload Transcript',
  'tagging': 'Assign to Projects & Galleries',
  'review': 'Review & Confirm',
};

export function StorytellerCreationWizard({
  organizationId,
  onComplete,
  onCancel,
}: StorytellerCreationWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep | 'mode-selection'>(
    'mode-selection'
  );
  const [wizardData, setWizardData] = useState<WizardData>({
    mode: 'new',
  });

  // Step navigation based on mode
  const getStepSequence = (mode: WizardMode): (WizardStep | 'mode-selection')[] => {
    if (mode === 'new') {
      return [
        'mode-selection',
        'basic-info',
        'photo-upload',
        'location',
        'transcript',
        'tagging',
        'review',
      ];
    } else {
      // existing mode: skip profile creation steps
      return ['mode-selection', 'transcript', 'tagging', 'review'];
    }
  };

  const stepSequence = getStepSequence(wizardData.mode);
  const currentStepIndex = stepSequence.indexOf(currentStep);
  const totalSteps = stepSequence.length - 1; // Exclude mode-selection from count

  const handleUpdate = (updates: Partial<WizardData>) => {
    setWizardData((prev) => ({ ...prev, ...updates }));
  };

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < stepSequence.length) {
      setCurrentStep(stepSequence[nextIndex]);
    }
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(stepSequence[prevIndex]);
    }
  };

  const handleModeSelect = (mode: WizardMode) => {
    setWizardData({ mode });
    setCurrentStep('basic-info'); // Will be adjusted by step sequence
    handleNext();
  };

  // Common step props
  const stepProps = {
    data: wizardData,
    onUpdate: handleUpdate,
    onNext: handleNext,
    onBack: handleBack,
    organizationId,
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {currentStep !== 'mode-selection' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            )}
            <div>
              <h2 className="text-2xl font-bold">
                {STEP_TITLES[currentStep]}
              </h2>
              {currentStep !== 'mode-selection' && (
                <p className="text-sm text-muted-foreground mt-1">
                  Step {currentStepIndex} of {totalSteps}
                </p>
              )}
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Progress bar */}
        {currentStep !== 'mode-selection' && (
          <div className="h-2 bg-stone-100">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{
                width: `${(currentStepIndex / totalSteps) * 100}%`,
              }}
            />
          </div>
        )}

        {/* Step content */}
        <div className="p-6">
          {currentStep === 'mode-selection' && (
            <ModeSelectionStep onSelect={handleModeSelect} />
          )}
          {currentStep === 'basic-info' && <BasicInfoStep {...stepProps} />}
          {currentStep === 'photo-upload' && <PhotoUploadStep {...stepProps} />}
          {currentStep === 'location' && <LocationStep {...stepProps} />}
          {currentStep === 'transcript' && <TranscriptStep {...stepProps} />}
          {currentStep === 'tagging' && <TaggingStep {...stepProps} />}
          {currentStep === 'review' && (
            <ReviewStep {...stepProps} onComplete={onComplete} />
          )}
        </div>
      </Card>
    </div>
  );
}
