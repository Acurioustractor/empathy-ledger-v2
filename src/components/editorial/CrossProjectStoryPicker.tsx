/**
 * Cross-Project Story Picker
 *
 * Allows selecting stories from one project to share with another project
 * within the ACT ecosystem (internal syndication)
 *
 * Philosophy: Stories belong to storytellers, not projects.
 * This component enables broader visibility while maintaining sovereignty.
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Search,
  Share2,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  FolderOpen,
  FileText,
  User,
  Shield
} from 'lucide-react';
import { toast } from 'sonner';

interface Story {
  id: string;
  title: string;
  excerpt: string;
  storyteller_id: string;
  storyteller_name: string;
  project_id: string;
  project_name: string;
  syndication_enabled: boolean;
  themes: string[];
  created_at: string;
}

interface Project {
  id: string;
  name: string;
  organization_id: string;
}

interface Props {
  sourceOrganizationId: string;
  onShare?: (storyId: string, targetProjectId: string) => void;
}

export default function CrossProjectStoryPicker({ sourceOrganizationId, onShare }: Props) {
  const [stories, setStories] = useState<Story[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [selectedStories, setSelectedStories] = useState<Set<string>>(new Set());
  const [targetProject, setTargetProject] = useState<string>('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    fetchData();
  }, [sourceOrganizationId]);

  async function fetchData() {
    try {
      setLoading(true);

      // Fetch projects for this organization (uses [orgId] param)
      const projectsRes = await fetch(`/api/admin/organizations/${sourceOrganizationId}/projects`);
      const projectsData = await projectsRes.json();

      if (projectsData.projects) {
        setProjects(projectsData.projects);
      }

      // Fetch stories with storyteller info for this organization
      const storiesRes = await fetch(`/api/admin/organizations/${sourceOrganizationId}/stories?limit=200`);
      const storiesData = await storiesRes.json();

      if (storiesData.stories) {
        setStories(storiesData.stories.map((s: any) => ({
          id: s.id,
          title: s.title,
          excerpt: s.excerpt || s.syndication_excerpt || '',
          storyteller_id: s.storyteller_id,
          storyteller_name: s.storytellers?.display_name || 'Unknown',
          project_id: s.project_id,
          project_name: s.projects?.name || 'Unassigned',
          syndication_enabled: s.syndication_enabled ?? true,
          themes: s.themes || [],
          created_at: s.created_at
        })));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load stories');
    } finally {
      setLoading(false);
    }
  }

  const filteredStories = stories.filter(story => {
    const matchesSearch = story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         story.storyteller_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProject = selectedProject === 'all' || story.project_id === selectedProject;
    return matchesSearch && matchesProject;
  });

  const availableTargetProjects = projects.filter(p => {
    // Can't share to the same project(s) the stories are already in
    const selectedStoryProjects = new Set(
      Array.from(selectedStories).map(id => stories.find(s => s.id === id)?.project_id)
    );
    return !selectedStoryProjects.has(p.id);
  });

  function toggleStorySelection(storyId: string) {
    const newSelection = new Set(selectedStories);
    if (newSelection.has(storyId)) {
      newSelection.delete(storyId);
    } else {
      newSelection.add(storyId);
    }
    setSelectedStories(newSelection);
  }

  function selectAll() {
    const syndicatableIds = filteredStories
      .filter(s => s.syndication_enabled)
      .map(s => s.id);
    setSelectedStories(new Set(syndicatableIds));
  }

  function clearSelection() {
    setSelectedStories(new Set());
  }

  async function handleShare() {
    if (selectedStories.size === 0 || !targetProject) {
      toast.error('Please select stories and a target project');
      return;
    }

    setSharing(true);

    try {
      const storyIds = Array.from(selectedStories);

      const response = await fetch('/api/admin/editorial/syndicate-internal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyIds,
          targetProjectId: targetProject,
          sourceOrganizationId
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to share stories');
      }

      toast.success(`Successfully shared ${storyIds.length} stories`, {
        description: `Stories are now visible in ${projects.find(p => p.id === targetProject)?.name}`
      });

      // Callback
      storyIds.forEach(id => onShare?.(id, targetProject));

      // Reset
      setSelectedStories(new Set());
      setTargetProject('');
      setShowConfirmDialog(false);

    } catch (error) {
      console.error('Share error:', error);
      toast.error('Failed to share stories', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setSharing(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Cross-Project Story Sharing</h2>
          <p className="text-sm text-muted-foreground">
            Share stories between projects within your organization
          </p>
        </div>
        <Badge variant="outline" className="bg-purple-50">
          <Shield className="h-3 w-3 mr-1" />
          Sovereignty Protected
        </Badge>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title or storyteller..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedProject} onValueChange={setSelectedProject}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by project" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {projects.map(project => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Selection Actions */}
      {filteredStories.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={selectAll}>
              Select All Shareable
            </Button>
            <Button variant="outline" size="sm" onClick={clearSelection}>
              Clear Selection
            </Button>
          </div>
          <div className="text-sm text-muted-foreground">
            {selectedStories.size} of {filteredStories.length} selected
          </div>
        </div>
      )}

      {/* Story List */}
      <div className="space-y-3">
        {filteredStories.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No stories found matching your criteria</p>
            </CardContent>
          </Card>
        ) : (
          filteredStories.map(story => (
            <Card
              key={story.id}
              className={`cursor-pointer transition-all ${
                selectedStories.has(story.id) ? 'ring-2 ring-purple-500 bg-purple-50/50' : ''
              } ${!story.syndication_enabled ? 'opacity-60' : ''}`}
              onClick={() => story.syndication_enabled && toggleStorySelection(story.id)}
            >
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={selectedStories.has(story.id)}
                    disabled={!story.syndication_enabled}
                    onCheckedChange={() => story.syndication_enabled && toggleStorySelection(story.id)}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium truncate">{story.title}</h3>
                      {!story.syndication_enabled && (
                        <Badge variant="secondary" className="text-xs">
                          Sharing Disabled
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {story.excerpt || 'No excerpt available'}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {story.storyteller_name}
                      </span>
                      <span className="flex items-center gap-1">
                        <FolderOpen className="h-3 w-3" />
                        {story.project_name}
                      </span>
                      {story.themes.length > 0 && (
                        <div className="flex gap-1">
                          {story.themes.slice(0, 2).map((theme, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs py-0">
                              {theme}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Share Action */}
      {selectedStories.size > 0 && (
        <Card className="sticky bottom-4 border-purple-200 bg-white shadow-lg">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Badge className="bg-purple-100 text-purple-800">
                  {selectedStories.size} selected
                </Badge>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <Select value={targetProject} onValueChange={setTargetProject}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select target project" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTargetProjects.map(project => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={() => setShowConfirmDialog(true)}
                disabled={!targetProject}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share Stories
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Story Sharing</DialogTitle>
            <DialogDescription>
              You are about to share {selectedStories.size} stories to{' '}
              <strong>{projects.find(p => p.id === targetProject)?.name}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                <Shield className="h-4 w-4 text-purple-600" />
                Sovereignty Protection
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Storytellers retain full control over their content</li>
                <li>• Original attribution is always preserved</li>
                <li>• Storytellers can revoke sharing at any time</li>
                <li>• No changes to consent or privacy settings</li>
              </ul>
            </div>

            <div className="text-sm">
              <p className="font-medium mb-2">Stories to share:</p>
              <ul className="space-y-1 max-h-32 overflow-y-auto">
                {Array.from(selectedStories).map(id => {
                  const story = stories.find(s => s.id === id);
                  return story ? (
                    <li key={id} className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      {story.title}
                    </li>
                  ) : null;
                })}
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleShare}
              disabled={sharing}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {sharing ? 'Sharing...' : 'Confirm Share'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
