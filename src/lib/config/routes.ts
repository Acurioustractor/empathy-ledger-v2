// Centralized route configuration for the entire application
// This ensures consistency across all navigation links and redirects

export const routes = {
  // Public Routes
  home: '/',
  about: '/about',
  howItWorks: '/how-it-works',
  guidelines: '/guidelines',
  privacy: '/privacy',
  terms: '/terms',
  
  // Authentication
  auth: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
    forgotPassword: '/auth/forgot-password',
    signOut: '/api/auth/signout', 
  },
  
  // Stories
  stories: {
    list: '/stories',
    create: '/stories/create',
    createModern: '/stories/create-modern',
    createAI: '/stories/create-ai',
    detail: (id: string) => `/stories/${id}`,
    edit: (id: string) => `/stories/${id}/edit`,
  },
  
  // Storytellers
  storytellers: {
    list: '/storytellers',
    create: '/storytellers/create',
    detail: (id: string) => `/storytellers/${id}`,
    edit: (id: string) => `/storytellers/${id}/edit`,
    dashboard: (id: string) => `/storytellers/${id}/dashboard`,
    analytics: (id: string) => `/storytellers/${id}/analytics`,
    insights: (id: string) => `/storytellers/${id}/insights`,
    impact: (id: string) => `/storytellers/${id}/impact`,
    stories: (id: string) => `/storytellers/${id}/stories`,
    galleries: (id: string) => `/storytellers/${id}/galleries`,
    mediaHub: (id: string) => `/storytellers/${id}/media-hub`,
    skills: (id: string) => `/storytellers/${id}/skills`,
    opportunities: (id: string) => `/storytellers/${id}/opportunities`,
    modernDashboard: '/storytellers/modern/dashboard',
  },
  
  // Organizations
  organizations: {
    list: '/organisations',
    create: '/organisations/create',
    detail: (id: string) => `/organisations/${id}`,
    dashboard: (id: string) => `/organisations/${id}/dashboard`,
    analytics: (id: string) => `/organisations/${id}/analytics`,
    members: (id: string) => `/organisations/${id}/members`,
    projects: (id: string) => `/organisations/${id}/projects`,
    stories: (id: string) => `/organisations/${id}/stories`,
    storytellers: (id: string) => `/organisations/${id}/storytellers`,
    galleries: (id: string) => `/organisations/${id}/galleries`,
    transcripts: (id: string) => `/organisations/${id}/transcripts`,
    settings: (id: string) => `/organisations/${id}/settings`,
  },
  
  // Projects
  projects: {
    list: '/projects',
    detail: (id: string) => `/projects/${id}`,
  },
  
  // Galleries
  galleries: {
    list: '/galleries',
    create: '/galleries/create',
    detail: (id: string) => `/galleries/${id}`,
    edit: (id: string) => `/galleries/${id}/edit`,
  },
  
  // Analytics
  analytics: {
    overview: '/analytics',
    demographics: '/analytics/demographics',
    geographic: '/analytics/geographic',
    themes: '/analytics/themes',
    communityImpact: '/analytics/community-impact',
    storytellerNetwork: '/analytics/storyteller-network',
    quotes: '/analytics/quotes',
  },
  
  // Admin
  admin: {
    dashboard: '/admin',
    modernDashboard: '/admin/modern',
    modernStorytellers: '/admin/modern/storytellers',
    stories: '/admin/stories',
    organizations: {
      list: '/admin/organisations',
      create: '/admin/organisations/create',
      detail: (id: string) => `/admin/organisations/${id}`,
      edit: (id: string) => `/admin/organisations/${id}/edit`,
    },
    galleries: '/admin/galleries',
    mediaReview: '/admin/media-review',
    settings: '/admin/settings',
    cleanup: '/admin/cleanup',
  },
  
  // Profile
  profile: '/profile',
  
  // API Routes
  api: {
    // Admin API
    admin: {
      storytellers: '/api/admin/storytellers',
      stories: '/api/admin/stories',
      organizations: '/api/admin/orgs',
      projects: {
        list: '/api/admin/projects',
        detail: (id: string) => `/api/admin/projects/${id}`,
        media: (id: string) => `/api/admin/projects/${id}/media`,
        stories: (id: string) => `/api/admin/projects/${id}/stories`,
        transcripts: (id: string) => `/api/admin/projects/${id}/transcripts`,
      },
      reviews: {
        pending: '/api/admin/reviews/pending',
      },
      transcripts: '/api/admin/transcripts',
      analytics: {
        overview: '/api/admin/analytics/overview',
      },
      content: {
        stories: '/api/admin/content/stories',
      },
      media: {
        review: (id: string) => `/api/admin/media/${id}/review`,
      },
    },
    
    // Public API
    stories: '/api/stories',
    storytellers: {
      list: '/api/storytellers',
      detail: (id: string) => `/api/storytellers/${id}`,
      dashboard: (id: string) => `/api/storytellers/${id}/dashboard`,
    },
    organizations: {
      list: '/api/organisations',
      detail: (id: string) => `/api/organisations/${id}`,
    },
    projects: {
      list: '/api/projects',
      detail: (id: string) => `/api/projects/${id}`,
    },
    galleries: {
      list: '/api/galleries',
      detail: (id: string) => `/api/galleries/${id}`,
    },
    transcripts: {
      list: '/api/transcripts',
      detail: (id: string) => `/api/transcripts/${id}`,
    },
    media: {
      upload: '/api/media/upload',
      transcribe: '/api/media/transcribe',
    },
    ai: {
      analyzeTranscript: '/api/ai/analyse-transcript',
    },
    debug: '/api/debug',
  },
} as const

// Helper function to check if a route requires authentication
export const requiresAuth = (path: string): boolean => {
  const publicPaths = [
    routes.home,
    routes.about,
    routes.howItWorks,
    routes.guidelines,
    routes.privacy,
    routes.terms,
    routes.auth.signIn,
    routes.auth.signUp,
    routes.auth.forgotPassword,
    routes.stories.list,
    routes.storytellers.list,
    routes.projects.list,
    routes.galleries.list,
    routes.organizations.list,
  ]
  
  return !publicPaths.includes(path) && !path.startsWith('/api')
}

// Helper function to check if a route is admin-only
export const isAdminRoute = (path: string): boolean => {
  return path.startsWith('/admin') || path.startsWith('/api/admin')
}

// Helper function to get breadcrumbs for a path
export const getBreadcrumbs = (pathname: string): { label: string; href: string }[] => {
  const segments = pathname.split('/').filter(Boolean)
  const breadcrumbs: { label: string; href: string }[] = [
    { label: 'Home', href: routes.home }
  ]
  
  let currentPath = ''
  for (const segment of segments) {
    currentPath += `/${segment}`
    
    // Skip IDs and special segments
    if (segment.match(/^[a-f0-9-]{36}$/i) || segment === 'edit' || segment === 'create') {
      continue
    }
    
    // Format the label
    const label = segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
    
    breadcrumbs.push({ label, href: currentPath })
  }
  
  return breadcrumbs
}

// Export type for TypeScript
export type Routes = typeof routes