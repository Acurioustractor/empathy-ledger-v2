/**
 * Editorial Dashboard
 *
 * Central hub for editorial workflows within the ACT ecosystem:
 * - Cross-project story sharing
 * - Pending review queue
 * - Syndication status
 *
 * Philosophy: Stories belong to storytellers, not projects.
 * Editorial workflow enables broader visibility while maintaining sovereignty.
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Share2,
  CheckCircle,
  Clock,
  AlertCircle,
  Building2,
  FileText,
  Users,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';
import CrossProjectStoryPicker from '@/components/editorial/CrossProjectStoryPicker';

interface Organization {
  id: string;
  name: string;
  slug: string;
}

interface SyndicationStats {
  total: number;
  active: number;
}

interface PendingReview {
  id: string;
  title: string;
  storyteller_name: string;
  project_name: string;
  submitted_at: string;
  status: string;
}

export default function EditorialDashboard() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<string>('');
  const [syndicationStats, setSyndicationStats] = useState<SyndicationStats>({ total: 0, active: 0 });
  const [pendingReviews, setPendingReviews] = useState<PendingReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('share');

  // ACT Organization ID
  const ACT_ORG_ID = 'db0de7bd-eb10-446b-99e9-0f3b7c199b8a';

  useEffect(() => {
    fetchOrganizations();
  }, []);

  useEffect(() => {
    if (selectedOrg) {
      fetchSyndicationStats();
      fetchPendingReviews();
    }
  }, [selectedOrg]);

  async function fetchOrganizations() {
    try {
      const response = await fetch('/api/admin/organizations');
      const data = await response.json();

      if (data.organizations) {
        setOrganizations(data.organizations);
        // Default to ACT if available
        const actOrg = data.organizations.find((o: Organization) => o.id === ACT_ORG_ID);
        if (actOrg) {
          setSelectedOrg(actOrg.id);
        } else if (data.organizations.length > 0) {
          setSelectedOrg(data.organizations[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching organizations:', error);
      toast.error('Failed to load organizations');
    } finally {
      setLoading(false);
    }
  }

  async function fetchSyndicationStats() {
    try {
      const response = await fetch(`/api/admin/editorial/syndicate-internal?organizationId=${selectedOrg}`);
      const data = await response.json();
      setSyndicationStats(data.stats || { total: 0, active: 0 });
    } catch (error) {
      console.error('Error fetching syndication stats:', error);
    }
  }

  async function fetchPendingReviews() {
    try {
      const response = await fetch('/api/admin/reviews/pending');
      const data = await response.json();
      setPendingReviews(data.reviews || []);
    } catch (error) {
      console.error('Error fetching pending reviews:', error);
    }
  }

  function handleShare(storyId: string, targetProjectId: string) {
    // Refresh stats after sharing
    fetchSyndicationStats();
    toast.success('Story shared successfully');
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const selectedOrgName = organizations.find(o => o.id === selectedOrg)?.name || 'Select Organization';

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Editorial Dashboard</h1>
          <p className="text-muted-foreground">
            Manage cross-project story sharing and editorial workflows
          </p>
        </div>
        <Select value={selectedOrg} onValueChange={setSelectedOrg}>
          <SelectTrigger className="w-[250px]">
            <Building2 className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Select organization" />
          </SelectTrigger>
          <SelectContent>
            {organizations.map(org => (
              <SelectItem key={org.id} value={org.id}>
                {org.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-100">
                <Share2 className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{syndicationStats.active}</p>
                <p className="text-sm text-muted-foreground">Active Shares</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-amber-100">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingReviews.length}</p>
                <p className="text-sm text-muted-foreground">Pending Reviews</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{syndicationStats.total}</p>
                <p className="text-sm text-muted-foreground">Total Syndications</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-100">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{organizations.length}</p>
                <p className="text-sm text-muted-foreground">Organizations</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="share">
            <Share2 className="h-4 w-4 mr-2" />
            Cross-Project Sharing
          </TabsTrigger>
          <TabsTrigger value="pending">
            <Clock className="h-4 w-4 mr-2" />
            Pending Reviews
            {pendingReviews.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {pendingReviews.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="history">
            <FileText className="h-4 w-4 mr-2" />
            Syndication History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="share" className="mt-6">
          {selectedOrg ? (
            <CrossProjectStoryPicker
              sourceOrganizationId={selectedOrg}
              onShare={handleShare}
            />
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">Select an organization to view stories</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="pending" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Pending Elder Reviews</CardTitle>
              <CardDescription>
                Stories awaiting cultural review before publication
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingReviews.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No pending reviews</p>
                  <p className="text-sm">All stories have been reviewed</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingReviews.map(review => (
                    <div
                      key={review.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div>
                        <h4 className="font-medium">{review.title}</h4>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {review.storyteller_name}
                          </span>
                          <span>{review.project_name}</span>
                          <span>
                            {new Date(review.submitted_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-amber-50">
                          <Clock className="h-3 w-3 mr-1" />
                          Pending
                        </Badge>
                        <Button variant="outline" size="sm">
                          Review
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Syndication History</CardTitle>
              <CardDescription>
                Track cross-project story sharing activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Share2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Syndication tracking coming soon</p>
                <p className="text-sm mt-2">
                  View history of stories shared between projects
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Sovereignty Notice */}
      <Card className="border-purple-200 bg-purple-50/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-purple-100">
              <AlertCircle className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h4 className="font-medium text-purple-900">Storyteller Sovereignty</h4>
              <p className="text-sm text-purple-700 mt-1">
                Cross-project sharing creates links, not copies. Storytellers retain full control
                over their content and can revoke sharing at any time. Original attribution is
                always preserved.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
