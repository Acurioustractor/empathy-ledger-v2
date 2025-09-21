'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProjectStorytellersTab } from './ProjectStorytellersTab'
import { ProjectStoriesTab } from './ProjectStoriesTab'
import { ProjectTranscriptsTab } from './ProjectTranscriptsTab'
import { ProjectMediaTab } from './ProjectMediaTab'
import { ProjectDetailsViewProps } from './types'

export const ProjectDetailsView: React.FC<ProjectDetailsViewProps> = ({ project }) => {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="storytellers">Storytellers</TabsTrigger>
          <TabsTrigger value="stories">Stories</TabsTrigger>
          <TabsTrigger value="transcripts">Transcripts</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Project Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="mt-1">{project.status}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Location</Label>
                  <div className="mt-1">{project.location || 'Not specified'}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Description</Label>
                  <div className="mt-1 text-sm">{project.description}</div>
                </div>
                {project.organisation && (
                  <div>
                    <Label className="text-sm font-medium">Organization</Label>
                    <div className="mt-1">{project.organisation.name}</div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">Start Date</Label>
                  <div className="mt-1">{project.startDate ? new Date(project.startDate).toLocaleDateString() : 'Not set'}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">End Date</Label>
                  <div className="mt-1">{project.endDate ? new Date(project.endDate).toLocaleDateString() : 'Not set'}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Created</Label>
                  <div className="mt-1">{new Date(project.createdAt).toLocaleDateString()}</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="storytellers">
          <ProjectStorytellersTab projectId={project.id} />
        </TabsContent>

        <TabsContent value="stories">
          <ProjectStoriesTab projectId={project.id} />
        </TabsContent>

        <TabsContent value="transcripts">
          <ProjectTranscriptsTab projectId={project.id} />
        </TabsContent>

        <TabsContent value="media">
          <ProjectMediaTab projectId={project.id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}