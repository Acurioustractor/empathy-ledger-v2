'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Users, 
  BookOpen, 
  Shield, 
  Settings, 
  BarChart3, 
  Flag, 
  Eye, 
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Crown,
  Building2,
  Globe,
  UserCheck,
  FileText,
  MessageSquare,
  Heart,
  Filter,
  Search,
  Plus,
  Database,
  Activity,
  TrendingUp,
  Zap
} from 'lucide-react'
import { useAuth } from '@/lib/context/auth.context'
import { supabase } from '@/lib/supabase/client'
import StoryReviewModal from './StoryReviewModal'
import UserManagement from './UserManagement'
import OrganizationManagement from './OrganizationManagement'
import ProjectManagement from './ProjectManagement'
import AnalyticsDashboard from './AnalyticsDashboard'
import ContentModeration from './ContentModeration'
import StorytellerManagement from './StorytellerManagement'
import MediaGalleryManagement from './MediaGalleryManagement'

// Admin access level types
type AdminLevel = 'super_admin' | 'tenant_admin' | 'content_moderator' | 'community_elder'

interface AdminStats {
  totalUsers: number
  activeUsers: number
  totalStories: number
  pendingReviews: number
  totalOrganizations: number
  flaggedContent: number
  elderApprovals: number
  recentActivity: number
}

interface PendingReview {
  id: string
  type: 'story' | 'profile' | 'comment' | 'media'
  title: string
  author: string
  submittedAt: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  culturalSensitive: boolean
  requiresElderReview: boolean
  status: 'pending' | 'in_review' | 'approved' | 'rejected'
}

const AdminDashboard: React.FC = () => {
  const { user, profile } = useAuth()
  const [adminLevel, setAdminLevel] = useState<AdminLevel>('content_moderator')
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalStories: 0,
    pendingReviews: 0,
    totalOrganizations: 0,
    flaggedContent: 0,
    elderApprovals: 0,
    recentActivity: 0
  })
  const [isLoadingStats, setIsLoadingStats] = useState(true)
  const [pendingReviews, setPendingReviews] = useState<PendingReview[]>([])
  const [isLoadingReviews, setIsLoadingReviews] = useState(true)

  // Fetch real admin statistics
  const fetchAdminStats = async () => {
    try {
      setIsLoadingStats(true)
      
      // Fetch users count
      const usersResponse = await fetch('/api/admin/stats/users')
      const usersData = await usersResponse.json()
      
      // Fetch stories count  
      const storiesResponse = await fetch('/api/admin/stats/stories')
      const storiesData = await storiesResponse.json()
      
      // Fetch pending reviews count
      const reviewsResponse = await fetch('/api/admin/stats/reviews')
      const reviewsData = await reviewsResponse.json()
      
      // Fetch organizations count
      const orgsResponse = await fetch('/api/admin/stats/organizations')
      const orgsData = await orgsResponse.json()

      setStats({
        totalUsers: usersData.total || 0,
        activeUsers: usersData.active || 0,
        totalStories: storiesData.total || 0,
        pendingReviews: reviewsData.pending || 0,
        totalOrganizations: orgsData.total || 0,
        flaggedContent: reviewsData.flagged || 0,
        elderApprovals: reviewsData.elderApprovals || 0,
        recentActivity: usersData.recentActivity || 0
      })
    } catch (error) {
      console.error('Failed to fetch admin stats:', error)
      // Keep stats at 0 if fetch fails
    } finally {
      setIsLoadingStats(false)
    }
  }

  // Fetch pending reviews
  const fetchPendingReviews = async () => {
    try {
      setIsLoadingReviews(true)
      const response = await fetch('/api/admin/reviews/pending')
      const data = await response.json()
      setPendingReviews(data.reviews || [])
    } catch (error) {
      console.error('Failed to fetch pending reviews:', error)
      setPendingReviews([])
    } finally {
      setIsLoadingReviews(false)
    }
  }

  // Check user's admin level and fetch data
  useEffect(() => {
    if (user) {
      // Determine admin level based on profile or email
      if (user.email === 'benjamin@act.place') {
        setAdminLevel('super_admin')
      } else if (profile?.is_elder) {
        setAdminLevel('community_elder')
      } else {
        setAdminLevel('content_moderator')
      }
      
      // Fetch real data
      fetchAdminStats()
      fetchPendingReviews()
    }
  }, [user, profile])

  const getAdminLevelBadge = (level: AdminLevel) => {
    switch (level) {
      case 'super_admin':
        return <Badge variant="destructive" className="gap-1"><Crown className="w-3 h-3" />Super Admin</Badge>
      case 'tenant_admin':
        return <Badge variant="secondary" className="gap-1"><Building2 className="w-3 h-3" />Tenant Admin</Badge>
      case 'content_moderator':
        return <Badge variant="outline" className="gap-1"><Shield className="w-3 h-3" />Content Moderator</Badge>
      case 'community_elder':
        return <Badge variant="sage-soft" className="gap-1"><Heart className="w-3 h-3" />Community Elder</Badge>
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 dark:text-red-400'
      case 'high': return 'text-orange-600 dark:text-orange-400'
      case 'medium': return 'text-yellow-600 dark:text-yellow-400'
      case 'low': return 'text-green-600 dark:text-green-400'
      default: return 'text-stone-600 dark:text-stone-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />
      case 'in_review': return <Eye className="w-4 h-4 text-blue-500" />
      case 'approved': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'rejected': return <XCircle className="w-4 h-4 text-red-500" />
      default: return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const hasAccess = (requiredLevel: AdminLevel[]) => {
    const levelHierarchy = {
      super_admin: 4,
      tenant_admin: 3,
      content_moderator: 2,
      community_elder: 1
    }
    
    const currentLevelValue = levelHierarchy[adminLevel]
    return requiredLevel.some(level => currentLevelValue >= levelHierarchy[level])
  }

  if (!user) {
    return (
      <Alert>
        <AlertTriangle className="w-4 h-4" />
        <AlertDescription>
          You must be logged in to access the admin dashboard.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-8">
      {/* Admin Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold">Welcome, {profile?.display_name || user.email}</h2>
            {getAdminLevelBadge(adminLevel)}
          </div>
          <p className="text-stone-600 dark:text-stone-400">
            Managing platform operations and community safety protocols
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Activity className="w-4 h-4 mr-2" />
            System Status
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="w-4 h-4 text-clay-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingStats ? '...' : stats.totalUsers.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.activeUsers > 0 && `${stats.activeUsers} active this month`}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Total Stories</CardTitle>
              <BookOpen className="w-4 h-4 text-sage-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingStats ? '...' : stats.totalStories.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Published stories
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
              <Flag className="w-4 h-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingStats ? '...' : stats.pendingReviews}
            </div>
            <p className="text-xs text-orange-600">
              {stats.elderApprovals > 0 ? `${stats.elderApprovals} require elder review` : 'No urgent reviews'}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Organizations</CardTitle>
              <Building2 className="w-4 h-4 text-sky-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingStats ? '...' : stats.totalOrganizations}
            </div>
            <p className="text-xs text-muted-foreground">
              Active tenants
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Admin Interface */}
      <Tabs defaultValue="reviews" className="space-y-6">
        <TabsList className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-9 w-full min-h-[100px] md:min-h-[80px] xl:min-h-[60px]">
          <TabsTrigger value="reviews" className="gap-1 text-xs whitespace-nowrap p-2 h-auto flex-col sm:flex-row">
            <Flag className="w-3 h-3" />
            <span className="hidden sm:inline">Reviews</span>
            <span className="sm:hidden text-[10px]">Rev</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-1 text-xs whitespace-nowrap p-2 h-auto flex-col sm:flex-row" disabled={!hasAccess(['tenant_admin', 'super_admin'])}>
            <Users className="w-3 h-3" />
            <span className="hidden sm:inline">Users</span>
            <span className="sm:hidden text-[10px]">Usr</span>
          </TabsTrigger>
          <TabsTrigger value="storytellers" className="gap-1 text-xs whitespace-nowrap p-2 h-auto flex-col sm:flex-row">
            <UserCheck className="w-3 h-3" />
            <span className="hidden sm:inline">Storytellers</span>
            <span className="sm:hidden text-[10px]">Stry</span>
          </TabsTrigger>
          <TabsTrigger value="content" className="gap-1 text-xs whitespace-nowrap p-2 h-auto flex-col sm:flex-row">
            <BookOpen className="w-3 h-3" />
            <span className="hidden sm:inline">Content</span>
            <span className="sm:hidden text-[10px]">Con</span>
          </TabsTrigger>
          <TabsTrigger value="media" className="gap-1 text-xs whitespace-nowrap p-2 h-auto flex-col sm:flex-row">
            <Zap className="w-3 h-3" />
            <span className="hidden sm:inline">Media</span>
            <span className="sm:hidden text-[10px]">Med</span>
          </TabsTrigger>
          <TabsTrigger value="organizations" className="gap-1 text-xs whitespace-nowrap p-2 h-auto flex-col sm:flex-row" disabled={!hasAccess(['super_admin'])}>
            <Building2 className="w-3 h-3" />
            <span className="hidden sm:inline">Orgs</span>
            <span className="sm:hidden text-[10px]">Org</span>
          </TabsTrigger>
          <TabsTrigger value="projects" className="gap-1 text-xs whitespace-nowrap p-2 h-auto flex-col sm:flex-row">
            <Activity className="w-3 h-3" />
            <span className="hidden sm:inline">Projects</span>
            <span className="sm:hidden text-[10px]">Prj</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-1 text-xs whitespace-nowrap p-2 h-auto flex-col sm:flex-row">
            <BarChart3 className="w-3 h-3" />
            <span className="hidden sm:inline">Analytics</span>
            <span className="sm:hidden text-[10px]">Ana</span>
          </TabsTrigger>
          <TabsTrigger value="system" className="gap-1 text-xs whitespace-nowrap p-2 h-auto flex-col sm:flex-row" disabled={!hasAccess(['super_admin'])}>
            <Database className="w-3 h-3" />
            <span className="hidden sm:inline">System</span>
            <span className="sm:hidden text-[10px]">Sys</span>
          </TabsTrigger>
        </TabsList>

        {/* Content Reviews Tab */}
        <TabsContent value="reviews" className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-xl font-semibold mb-2">Content Reviews</h3>
              <p className="text-stone-600 dark:text-stone-400">
                Review and moderate stories, profiles, and other content submissions
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {pendingReviews.map((review) => (
              <Card key={review.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-lg">{review.title}</CardTitle>
                        <Badge variant="outline" className={`text-xs ${getPriorityColor(review.priority)}`}>
                          {review.priority.toUpperCase()}
                        </Badge>
                        {review.culturalSensitive && (
                          <Badge variant="sage-soft" className="text-xs">
                            <Shield className="w-3 h-3 mr-1" />
                            Cultural
                          </Badge>
                        )}
                        {review.requiresElderReview && (
                          <Badge variant="clay-soft" className="text-xs">
                            <Heart className="w-3 h-3 mr-1" />
                            Elder Review
                          </Badge>
                        )}
                      </div>
                      <CardDescription>
                        By {review.author} • {new Date(review.submittedAt).toLocaleDateString()} • 
                        Type: {review.type}
                      </CardDescription>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {getStatusIcon(review.status)}
                      <span className="text-sm capitalize">{review.status.replace('_', ' ')}</span>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    <StoryReviewModal 
                      story={{
                        id: review.id,
                        title: review.title,
                        content: '',
                        author: {
                          name: review.author,
                          id: 'mock_id',
                          isElder: review.requiresElderReview
                        },
                        submittedAt: review.submittedAt,
                        type: 'cultural',
                        tags: [],
                        culturalSensitive: review.culturalSensitive,
                        requiresElderReview: review.requiresElderReview,
                        status: review.status,
                        priority: review.priority,
                        language: 'English',
                        visibility: 'public'
                      }}
                      onReviewComplete={(action) => {
                        console.log('Review completed:', action)
                        // Handle review completion
                      }}
                    >
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-2" />
                        Review
                      </Button>
                    </StoryReviewModal>
                    
                    <Button size="sm" variant="outline">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" className="text-green-600 hover:text-green-700">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                    {review.requiresElderReview && adminLevel === 'community_elder' && (
                      <Button size="sm" variant="sage-soft">
                        <Heart className="w-4 h-4 mr-2" />
                        Elder Approval
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Users Management Tab */}
        <TabsContent value="users" className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-2">User Management</h3>
            <p className="text-stone-600 dark:text-stone-400">
              Manage user accounts, roles, and permissions across the platform
            </p>
          </div>

          <UserManagement 
            adminLevel={adminLevel === 'super_admin' || adminLevel === 'tenant_admin' ? adminLevel : 'content_moderator'} 
          />
        </TabsContent>

        {/* Storyteller Management Tab */}
        <TabsContent value="storytellers" className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-2">Storyteller Management</h3>
            <p className="text-stone-600 dark:text-stone-400">
              Manage storytellers, their profiles, verification status, and engagement
            </p>
          </div>
          <StorytellerManagement />
        </TabsContent>

        {/* Content Management Tab */}
        <TabsContent value="content" className="space-y-6">
          <ContentModeration />
        </TabsContent>

        {/* Media Gallery Management Tab */}
        <TabsContent value="media" className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-2">Media Gallery Management</h3>
            <p className="text-stone-600 dark:text-stone-400">
              Manage media assets, galleries, cultural sensitivity, and consent status
            </p>
          </div>
          <MediaGalleryManagement />
        </TabsContent>

        {/* Organizations Tab */}
        <TabsContent value="organizations" className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-2">Organization Management</h3>
            <p className="text-stone-600 dark:text-stone-400">
              Manage tenant organizations, their settings, and billing information
            </p>
          </div>

          <OrganizationManagement 
            adminLevel={adminLevel === 'super_admin' ? 'super_admin' : 'tenant_admin'} 
          />
        </TabsContent>

        {/* Projects Tab */}
        <TabsContent value="projects" className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-2">Project Management</h3>
            <p className="text-stone-600 dark:text-stone-400">
              Manage community projects, initiatives, and their associated stories
            </p>
          </div>

          <ProjectManagement 
            adminLevel={adminLevel === 'super_admin' ? 'super_admin' : 'tenant_admin'} 
          />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <AnalyticsDashboard />
        </TabsContent>

        {/* System Management Tab */}
        <TabsContent value="system" className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-2">System Management</h3>
            <p className="text-stone-600 dark:text-stone-400">
              Configure platform settings, security, and infrastructure
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>System Configuration</CardTitle>
              <CardDescription>
                Platform-wide settings, security, and technical configuration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-stone-600 dark:text-stone-400">
                System management interface will be implemented here
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default AdminDashboard