/**
 * Organization Onboarding Wizard
 *
 * Step-by-step wizard for onboarding new organizations to Empathy Ledger.
 * Guides through: Profile → Protocols → Project → Invitations → Dashboard Tour
 *
 * Philosophy: Make onboarding educational, not just transactional.
 * Each step explains WHY we ask for this information.
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Building2,
  Shield,
  FolderOpen,
  Users,
  BarChart3,
  ArrowRight,
  ArrowLeft,
  Check,
  AlertCircle,
  Info,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

interface OnboardingData {
  // Step 1: Organization Profile
  name: string;
  slug: string;
  type: string;
  description: string;
  culturalFocus: string;
  geographicFocus: string;

  // Step 2: Cultural Protocols
  elderReviewRequired: boolean;
  reviewWorkflow: string;
  consentDuration: string;
  revocationAllowed: boolean;
  defaultVisibility: string;

  // Step 3: First Project
  projectName: string;
  projectDescription: string;
  projectStartDate: string;
  expectedOutcomes: string[];
  targetPopulation: string;

  // Step 4: Invitations
  adminEmails: string[];
  storytellerInviteMethod: string;
}

interface Props {
  onComplete?: (data: OnboardingData) => void;
  onCancel?: () => void;
}

const STEPS = [
  { id: 'profile', title: 'Organization Profile', icon: Building2 },
  { id: 'protocols', title: 'Cultural Protocols', icon: Shield },
  { id: 'project', title: 'First Project', icon: FolderOpen },
  { id: 'invitations', title: 'Team & Invitations', icon: Users },
  { id: 'complete', title: 'Ready to Go', icon: BarChart3 }
];

const ORG_TYPES = [
  { value: 'community_org', label: 'Community Organization' },
  { value: 'ngo', label: 'Non-profit / NGO' },
  { value: 'indigenous', label: 'Indigenous Corporation' },
  { value: 'research', label: 'Research Institution' },
  { value: 'government', label: 'Government Agency' },
  { value: 'social_enterprise', label: 'Social Enterprise' },
  { value: 'foundation', label: 'Foundation' }
];

const CULTURAL_FOCUS = [
  { value: 'indigenous', label: 'Indigenous Communities' },
  { value: 'multicultural', label: 'Multicultural' },
  { value: 'general', label: 'General Population' },
  { value: 'youth', label: 'Youth Focus' },
  { value: 'aged', label: 'Aged Care' }
];

export default function OrganizationOnboardingWizard({ onComplete, onCancel }: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    name: '',
    slug: '',
    type: '',
    description: '',
    culturalFocus: 'general',
    geographicFocus: '',
    elderReviewRequired: false,
    reviewWorkflow: 'standard',
    consentDuration: 'indefinite',
    revocationAllowed: true,
    defaultVisibility: 'organization',
    projectName: '',
    projectDescription: '',
    projectStartDate: new Date().toISOString().split('T')[0],
    expectedOutcomes: [],
    targetPopulation: '',
    adminEmails: [],
    storytellerInviteMethod: 'link'
  });
  const [newOutcome, setNewOutcome] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  function updateData(field: keyof OnboardingData, value: any) {
    setData(prev => ({ ...prev, [field]: value }));
  }

  function generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  function addOutcome() {
    if (newOutcome.trim()) {
      updateData('expectedOutcomes', [...data.expectedOutcomes, newOutcome.trim()]);
      setNewOutcome('');
    }
  }

  function removeOutcome(index: number) {
    updateData('expectedOutcomes', data.expectedOutcomes.filter((_, i) => i !== index));
  }

  function addAdminEmail() {
    if (newAdminEmail.trim() && newAdminEmail.includes('@')) {
      updateData('adminEmails', [...data.adminEmails, newAdminEmail.trim()]);
      setNewAdminEmail('');
    }
  }

  function removeAdminEmail(index: number) {
    updateData('adminEmails', data.adminEmails.filter((_, i) => i !== index));
  }

  function canProceed(): boolean {
    switch (currentStep) {
      case 0: // Profile
        return !!(data.name && data.type);
      case 1: // Protocols
        return true; // All have defaults
      case 2: // Project
        return !!(data.projectName);
      case 3: // Invitations
        return true; // Optional
      default:
        return true;
    }
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    try {
      // Create organization
      const orgResponse = await fetch('/api/admin/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          slug: data.slug || generateSlug(data.name),
          type: data.type,
          description: data.description,
          cultural_focus: data.culturalFocus,
          geographic_focus: data.geographicFocus,
          settings: {
            elder_review_required: data.elderReviewRequired,
            review_workflow: data.reviewWorkflow,
            consent_duration: data.consentDuration,
            revocation_allowed: data.revocationAllowed,
            default_visibility: data.defaultVisibility
          }
        })
      });

      const orgData = await orgResponse.json();

      if (!orgResponse.ok) {
        throw new Error(orgData.error || 'Failed to create organization');
      }

      // Create first project if provided
      if (data.projectName) {
        await fetch(`/api/admin/organizations/${orgData.id}/projects`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: data.projectName,
            description: data.projectDescription,
            start_date: data.projectStartDate,
            expected_outcomes: data.expectedOutcomes,
            target_population: data.targetPopulation,
            status: 'active'
          })
        });
      }

      toast.success('Organization created successfully!', {
        description: `${data.name} is ready to start collecting stories`
      });

      onComplete?.(data);

    } catch (error) {
      console.error('Onboarding error:', error);
      toast.error('Failed to complete onboarding', {
        description: error instanceof Error ? error.message : 'Please try again'
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {STEPS.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-center gap-2 ${
                index <= currentStep ? 'text-purple-600' : 'text-muted-foreground'
              }`}
            >
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                ${index < currentStep ? 'bg-purple-600 text-white' :
                  index === currentStep ? 'bg-purple-100 text-purple-600 ring-2 ring-purple-600' :
                  'bg-muted text-muted-foreground'}
              `}>
                {index < currentStep ? <Check className="h-4 w-4" /> : index + 1}
              </div>
              <span className="hidden sm:inline text-sm">{step.title}</span>
            </div>
          ))}
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            {(() => {
              const StepIcon = STEPS[currentStep].icon;
              return <StepIcon className="h-6 w-6 text-purple-600" />;
            })()}
            <div>
              <CardTitle>{STEPS[currentStep].title}</CardTitle>
              <CardDescription>
                {currentStep === 0 && "Tell us about your organization"}
                {currentStep === 1 && "Configure cultural safety and consent protocols"}
                {currentStep === 2 && "Set up your first storytelling project"}
                {currentStep === 3 && "Invite your team and storytellers"}
                {currentStep === 4 && "You're all set to start measuring impact"}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Step 1: Organization Profile */}
          {currentStep === 0 && (
            <>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Organization Name *</Label>
                  <Input
                    id="name"
                    value={data.name}
                    onChange={(e) => {
                      updateData('name', e.target.value);
                      updateData('slug', generateSlug(e.target.value));
                    }}
                    placeholder="e.g., Orange Sky Australia"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">URL Slug</Label>
                  <Input
                    id="slug"
                    value={data.slug}
                    onChange={(e) => updateData('slug', e.target.value)}
                    placeholder="e.g., orange-sky"
                  />
                  <p className="text-xs text-muted-foreground">
                    Your dashboard will be at: empathyledger.org/organisations/{data.slug || 'your-slug'}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Organization Type *</Label>
                  <Select value={data.type} onValueChange={(v) => updateData('type', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {ORG_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={data.description}
                    onChange={(e) => updateData('description', e.target.value)}
                    placeholder="Brief description of your organization's mission..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Cultural Focus</Label>
                    <Select value={data.culturalFocus} onValueChange={(v) => updateData('culturalFocus', v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CULTURAL_FOCUS.map(focus => (
                          <SelectItem key={focus.value} value={focus.value}>
                            {focus.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="geo">Geographic Focus</Label>
                    <Input
                      id="geo"
                      value={data.geographicFocus}
                      onChange={(e) => updateData('geographicFocus', e.target.value)}
                      placeholder="e.g., Queensland, Australia-wide"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Step 2: Cultural Protocols */}
          {currentStep === 1 && (
            <>
              <div className="p-4 bg-purple-50 rounded-lg mb-6">
                <div className="flex gap-3">
                  <Info className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-purple-800">
                    <p className="font-medium mb-1">Why Cultural Protocols Matter</p>
                    <p>These settings protect storytellers and ensure their narratives are handled with respect. You can adjust these later.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="elderReview"
                    checked={data.elderReviewRequired}
                    onCheckedChange={(checked) => updateData('elderReviewRequired', checked)}
                  />
                  <div className="space-y-1">
                    <Label htmlFor="elderReview" className="font-medium">
                      Require Elder/Cultural Review
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Stories will be reviewed for cultural safety before publication
                    </p>
                  </div>
                </div>

                {data.elderReviewRequired && (
                  <div className="ml-6 space-y-2">
                    <Label>Review Workflow</Label>
                    <Select value={data.reviewWorkflow} onValueChange={(v) => updateData('reviewWorkflow', v)}>
                      <SelectTrigger className="w-[200px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard (48h)</SelectItem>
                        <SelectItem value="expedited">Expedited (24h)</SelectItem>
                        <SelectItem value="thorough">Thorough (1 week)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Default Story Visibility</Label>
                  <Select value={data.defaultVisibility} onValueChange={(v) => updateData('defaultVisibility', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="private">Private (only storyteller)</SelectItem>
                      <SelectItem value="organization">Organization (team members)</SelectItem>
                      <SelectItem value="public">Public (everyone)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Storytellers can always change visibility on their individual stories
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Consent Duration</Label>
                  <Select value={data.consentDuration} onValueChange={(v) => updateData('consentDuration', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="indefinite">Indefinite (until revoked)</SelectItem>
                      <SelectItem value="1year">1 Year</SelectItem>
                      <SelectItem value="2years">2 Years</SelectItem>
                      <SelectItem value="project">Project Duration</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="revocation"
                    checked={data.revocationAllowed}
                    onCheckedChange={(checked) => updateData('revocationAllowed', checked)}
                  />
                  <div className="space-y-1">
                    <Label htmlFor="revocation" className="font-medium">
                      Allow Consent Revocation
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Storytellers can withdraw consent and have their data removed at any time (recommended)
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Step 3: First Project */}
          {currentStep === 2 && (
            <>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="projectName">Project Name *</Label>
                  <Input
                    id="projectName"
                    value={data.projectName}
                    onChange={(e) => updateData('projectName', e.target.value)}
                    placeholder="e.g., Community Voices 2026"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="projectDesc">Description</Label>
                  <Textarea
                    id="projectDesc"
                    value={data.projectDescription}
                    onChange={(e) => updateData('projectDescription', e.target.value)}
                    placeholder="What this project aims to achieve..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={data.projectStartDate}
                      onChange={(e) => updateData('projectStartDate', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="target">Target Population</Label>
                    <Input
                      id="target"
                      value={data.targetPopulation}
                      onChange={(e) => updateData('targetPopulation', e.target.value)}
                      placeholder="e.g., Youth aged 16-25"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Expected Outcomes</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newOutcome}
                      onChange={(e) => setNewOutcome(e.target.value)}
                      placeholder="Add an expected outcome"
                      onKeyPress={(e) => e.key === 'Enter' && addOutcome()}
                    />
                    <Button type="button" variant="outline" onClick={addOutcome}>
                      Add
                    </Button>
                  </div>
                  {data.expectedOutcomes.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {data.expectedOutcomes.map((outcome, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                          onClick={() => removeOutcome(index)}
                        >
                          {outcome} ×
                        </Badge>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Click an outcome to remove it
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Step 4: Invitations */}
          {currentStep === 3 && (
            <>
              <div className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-base">Invite Team Members</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Add email addresses for people who should have admin access
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="email"
                      value={newAdminEmail}
                      onChange={(e) => setNewAdminEmail(e.target.value)}
                      placeholder="admin@example.org"
                      onKeyPress={(e) => e.key === 'Enter' && addAdminEmail()}
                    />
                    <Button type="button" variant="outline" onClick={addAdminEmail}>
                      Add
                    </Button>
                  </div>
                  {data.adminEmails.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {data.adminEmails.map((email, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                          onClick={() => removeAdminEmail(index)}
                        >
                          {email} ×
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Storyteller Invitation Method</Label>
                  <Select value={data.storytellerInviteMethod} onValueChange={(v) => updateData('storytellerInviteMethod', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="link">Shareable Link</SelectItem>
                      <SelectItem value="email">Email Invitations</SelectItem>
                      <SelectItem value="qr">QR Code</SelectItem>
                      <SelectItem value="bulk">Bulk Import (CSV)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    You can change this later and use multiple methods
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Step 5: Complete */}
          {currentStep === 4 && (
            <>
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Ready to Measure Impact!</h3>
                <p className="text-muted-foreground mb-6">
                  Your organization "{data.name}" is ready to start collecting stories
                </p>

                <div className="bg-muted/50 rounded-lg p-4 text-left max-w-md mx-auto">
                  <h4 className="font-medium mb-3">What happens next:</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-600 mt-0.5" />
                      <span>Your organization and project will be created</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-600 mt-0.5" />
                      <span>Team invitations will be sent</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-600 mt-0.5" />
                      <span>You'll be taken to your ALMA dashboard</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-600 mt-0.5" />
                      <span>Start inviting storytellers to share their stories</span>
                    </li>
                  </ul>
                </div>
              </div>
            </>
          )}
        </CardContent>

        <CardFooter className="flex justify-between">
          <div>
            {currentStep > 0 && (
              <Button
                variant="outline"
                onClick={() => setCurrentStep(currentStep - 1)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}
            {currentStep === 0 && onCancel && (
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>

          <div>
            {currentStep < STEPS.length - 1 ? (
              <Button
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={!canProceed()}
              >
                Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? 'Creating...' : 'Complete Setup'}
                {!isSubmitting && <Check className="h-4 w-4 ml-2" />}
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
