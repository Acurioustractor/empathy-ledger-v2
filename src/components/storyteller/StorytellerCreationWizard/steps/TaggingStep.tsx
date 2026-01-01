'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Folder, Image as ImageIcon, Loader2 } from 'lucide-react';
import type { StepProps, TaggingData } from '../types';

interface Project {
  id: string;
  name: string;
  description?: string;
}

interface Gallery {
  id: string;
  title: string;
  description?: string;
}

export function TaggingStep({
  data,
  onUpdate,
  onNext,
  onBack,
  organizationId,
}: StepProps) {
  const [tagging, setTagging] = useState<TaggingData>(
    data.taggingData || {
      projectIds: [],
      galleryIds: [],
    }
  );
  const [projects, setProjects] = useState<Project[]>([]);
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [projectsRes, galleriesRes] = await Promise.all([
          fetch(`/api/organisations/${organizationId}/projects`),
          fetch(`/api/organisations/${organizationId}/galleries`),
        ]);

        if (projectsRes.ok) {
          const projectsData = await projectsRes.json();
          setProjects(projectsData.projects || []);
        }

        if (galleriesRes.ok) {
          const galleriesData = await galleriesRes.json();
          setGalleries(galleriesData.galleries || []);
        }
      } catch (error) {
        console.error('Failed to fetch projects and galleries:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [organizationId]);

  const toggleProject = (projectId: string) => {
    setTagging((prev) => ({
      ...prev,
      projectIds: prev.projectIds.includes(projectId)
        ? prev.projectIds.filter((id) => id !== projectId)
        : [...prev.projectIds, projectId],
    }));
  };

  const toggleGallery = (galleryId: string) => {
    setTagging((prev) => ({
      ...prev,
      galleryIds: prev.galleryIds.includes(galleryId)
        ? prev.galleryIds.filter((id) => id !== galleryId)
        : [...prev.galleryIds, galleryId],
    }));
  };

  const handleNext = () => {
    onUpdate({ taggingData: tagging });
    onNext();
  };

  const handleSkip = () => {
    onUpdate({ taggingData: { projectIds: [], galleryIds: [] } });
    onNext();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-muted-foreground">
          Assign this storyteller to relevant projects and galleries to organize
          their content.
        </p>
      </div>

      {/* Projects */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Folder className="h-5 w-5 text-muted-foreground" />
          <Label className="text-base font-semibold">Projects</Label>
        </div>

        {projects.length > 0 ? (
          <div className="space-y-3 border rounded-lg p-4 max-h-64 overflow-y-auto">
            {projects.map((project) => (
              <div
                key={project.id}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <Checkbox
                  id={`project-${project.id}`}
                  checked={tagging.projectIds.includes(project.id)}
                  onCheckedChange={() => toggleProject(project.id)}
                />
                <label
                  htmlFor={`project-${project.id}`}
                  className="flex-1 cursor-pointer"
                >
                  <div className="font-medium">{project.name}</div>
                  {project.description && (
                    <p className="text-sm text-muted-foreground">
                      {project.description}
                    </p>
                  )}
                </label>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 border-2 border-dashed rounded-lg">
            <Folder className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              No projects available
            </p>
          </div>
        )}

        {tagging.projectIds.length > 0 && (
          <p className="text-sm text-muted-foreground">
            {tagging.projectIds.length} project
            {tagging.projectIds.length !== 1 ? 's' : ''} selected
          </p>
        )}
      </div>

      {/* Galleries */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-muted-foreground" />
          <Label className="text-base font-semibold">Galleries</Label>
        </div>

        {galleries.length > 0 ? (
          <div className="space-y-3 border rounded-lg p-4 max-h-64 overflow-y-auto">
            {galleries.map((gallery) => (
              <div
                key={gallery.id}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <Checkbox
                  id={`gallery-${gallery.id}`}
                  checked={tagging.galleryIds.includes(gallery.id)}
                  onCheckedChange={() => toggleGallery(gallery.id)}
                />
                <label
                  htmlFor={`gallery-${gallery.id}`}
                  className="flex-1 cursor-pointer"
                >
                  <div className="font-medium">{gallery.title}</div>
                  {gallery.description && (
                    <p className="text-sm text-muted-foreground">
                      {gallery.description}
                    </p>
                  )}
                </label>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 border-2 border-dashed rounded-lg">
            <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              No galleries available
            </p>
          </div>
        )}

        {tagging.galleryIds.length > 0 && (
          <p className="text-sm text-muted-foreground">
            {tagging.galleryIds.length} gallery
            {tagging.galleryIds.length !== 1 ? 's' : ''} selected
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-6 border-t">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={handleSkip}>
            Skip for Now
          </Button>
          <Button onClick={handleNext} size="lg">
            Continue to Review
          </Button>
        </div>
      </div>
    </div>
  );
}
