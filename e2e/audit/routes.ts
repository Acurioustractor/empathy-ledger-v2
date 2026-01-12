/**
 * Complete route inventory for Empathy Ledger visual audit
 * Organized by category for systematic screenshot capture
 */

export interface RouteConfig {
  path: string;
  name: string;
  category: 'public' | 'auth' | 'admin' | 'organisation' | 'storyteller' | 'analytics' | 'other';
  requiresAuth: boolean;
  requiresData?: boolean;
  dynamicId?: string;
  description: string;
}

// Sample IDs for dynamic routes (will need real data from DB)
export const SAMPLE_IDS = {
  storyteller: 'sample-storyteller-id',
  story: 'sample-story-id',
  organisation: 'sample-org-id',
  project: 'sample-project-id',
  gallery: 'sample-gallery-id',
  transcript: 'sample-transcript-id',
  photo: 'sample-photo-id',
};

export const ALL_ROUTES: RouteConfig[] = [
  // ==================== PUBLIC PAGES ====================
  { path: '/', name: 'homepage', category: 'public', requiresAuth: false, description: 'Main landing page' },
  { path: '/about', name: 'about', category: 'public', requiresAuth: false, description: 'About Empathy Ledger' },
  { path: '/stories', name: 'stories-list', category: 'public', requiresAuth: false, description: 'Browse all stories' },
  { path: '/storytellers', name: 'storytellers-list', category: 'public', requiresAuth: false, description: 'Browse all storytellers' },
  { path: '/browse', name: 'browse', category: 'public', requiresAuth: false, description: 'Browse content' },
  { path: '/how-it-works', name: 'how-it-works', category: 'public', requiresAuth: false, description: 'How platform works' },
  { path: '/guidelines', name: 'guidelines', category: 'public', requiresAuth: false, description: 'Community guidelines' },
  { path: '/privacy', name: 'privacy', category: 'public', requiresAuth: false, description: 'Privacy policy' },
  { path: '/projects', name: 'projects-list', category: 'public', requiresAuth: false, description: 'Public projects' },
  { path: '/galleries', name: 'galleries-list', category: 'public', requiresAuth: false, description: 'Photo galleries' },

  // ==================== AUTH PAGES ====================
  { path: '/auth/signin', name: 'signin', category: 'auth', requiresAuth: false, description: 'Sign in page' },
  { path: '/auth/signup', name: 'signup', category: 'auth', requiresAuth: false, description: 'Sign up page' },
  { path: '/auth/forgot-password', name: 'forgot-password', category: 'auth', requiresAuth: false, description: 'Password reset' },

  // ==================== ADMIN PAGES ====================
  { path: '/admin', name: 'admin-dashboard', category: 'admin', requiresAuth: true, description: 'Admin dashboard' },
  { path: '/admin/analytics', name: 'admin-analytics', category: 'admin', requiresAuth: true, description: 'Platform analytics' },
  { path: '/admin/storytellers', name: 'admin-storytellers', category: 'admin', requiresAuth: true, description: 'Manage storytellers' },
  { path: '/admin/stories', name: 'admin-stories', category: 'admin', requiresAuth: true, description: 'Manage stories' },
  { path: '/admin/projects', name: 'admin-projects', category: 'admin', requiresAuth: true, description: 'Manage projects' },
  { path: '/admin/organisations', name: 'admin-organisations', category: 'admin', requiresAuth: true, description: 'Manage organisations' },
  { path: '/admin/transcripts', name: 'admin-transcripts', category: 'admin', requiresAuth: true, description: 'Manage transcripts' },
  { path: '/admin/reviews', name: 'admin-reviews', category: 'admin', requiresAuth: true, description: 'Content reviews' },
  { path: '/admin/workflow', name: 'admin-workflow', category: 'admin', requiresAuth: true, description: 'Workflow management' },
  { path: '/admin/settings', name: 'admin-settings', category: 'admin', requiresAuth: true, description: 'Platform settings' },
  { path: '/admin/photos', name: 'admin-photos', category: 'admin', requiresAuth: true, description: 'Photo management' },
  { path: '/admin/galleries', name: 'admin-galleries', category: 'admin', requiresAuth: true, description: 'Gallery management' },
  { path: '/admin/locations', name: 'admin-locations', category: 'admin', requiresAuth: true, description: 'Location management' },
  { path: '/admin/bulk-edit', name: 'admin-bulk-edit', category: 'admin', requiresAuth: true, description: 'Bulk editing' },
  { path: '/admin/cleanup', name: 'admin-cleanup', category: 'admin', requiresAuth: true, description: 'Data cleanup' },
  { path: '/admin/media-review', name: 'admin-media-review', category: 'admin', requiresAuth: true, description: 'Media review queue' },
  { path: '/admin/member-management', name: 'admin-members', category: 'admin', requiresAuth: true, description: 'Member management' },
  { path: '/admin/platform-value', name: 'admin-platform-value', category: 'admin', requiresAuth: true, description: 'Platform value metrics' },
  { path: '/admin/quick-add', name: 'admin-quick-add', category: 'admin', requiresAuth: true, description: 'Quick add content' },
  { path: '/admin/testing', name: 'admin-testing', category: 'admin', requiresAuth: true, description: 'Testing tools' },
  { path: '/admin/modern', name: 'admin-modern', category: 'admin', requiresAuth: true, description: 'Modern admin UI' },
  { path: '/admin/modern/storytellers', name: 'admin-modern-storytellers', category: 'admin', requiresAuth: true, description: 'Modern storyteller management' },

  // ==================== ANALYTICS PAGES ====================
  { path: '/analytics', name: 'analytics-dashboard', category: 'analytics', requiresAuth: true, description: 'Analytics overview' },
  { path: '/analytics/themes', name: 'analytics-themes', category: 'analytics', requiresAuth: true, description: 'Theme analytics' },
  { path: '/analytics/quotes', name: 'analytics-quotes', category: 'analytics', requiresAuth: true, description: 'Quote analytics' },
  { path: '/analytics/demographics', name: 'analytics-demographics', category: 'analytics', requiresAuth: true, description: 'Demographic insights' },
  { path: '/analytics/geographic', name: 'analytics-geographic', category: 'analytics', requiresAuth: true, description: 'Geographic distribution' },
  { path: '/analytics/community-impact', name: 'analytics-community-impact', category: 'analytics', requiresAuth: true, description: 'Community impact metrics' },
  { path: '/analytics/storyteller-network', name: 'analytics-network', category: 'analytics', requiresAuth: true, description: 'Storyteller network visualization' },

  // ==================== STORYTELLER PAGES ====================
  { path: '/storytellers/dashboard', name: 'storyteller-dashboard', category: 'storyteller', requiresAuth: true, description: 'Storyteller dashboard' },
  { path: '/storytellers/create', name: 'storyteller-create', category: 'storyteller', requiresAuth: true, description: 'Create storyteller profile' },
  { path: '/storyteller/dashboard', name: 'my-storyteller-dashboard', category: 'storyteller', requiresAuth: true, description: 'My storyteller dashboard' },
  { path: '/storytellers/modern/dashboard', name: 'storyteller-modern-dashboard', category: 'storyteller', requiresAuth: true, description: 'Modern storyteller dashboard' },
  { path: '/profile', name: 'user-profile', category: 'storyteller', requiresAuth: true, description: 'User profile settings' },
  { path: '/my-analytics', name: 'my-analytics', category: 'storyteller', requiresAuth: true, description: 'Personal analytics' },

  // ==================== STORY CREATION ====================
  { path: '/stories/create', name: 'story-create', category: 'other', requiresAuth: true, description: 'Create story (classic)' },
  { path: '/stories/create-modern', name: 'story-create-modern', category: 'other', requiresAuth: true, description: 'Create story (modern)' },
  { path: '/stories/create-ai', name: 'story-create-ai', category: 'other', requiresAuth: true, description: 'Create story (AI-assisted)' },

  // ==================== ORGANISATION PAGES ====================
  { path: '/organisations', name: 'organisations-list', category: 'organisation', requiresAuth: true, description: 'Organisation list' },
  { path: '/organisations/create', name: 'organisation-create', category: 'organisation', requiresAuth: true, description: 'Create organisation' },
  { path: '/organisations/simple-dashboard', name: 'org-simple-dashboard', category: 'organisation', requiresAuth: true, description: 'Simple org dashboard' },
  { path: '/organisations/snow-foundation', name: 'org-snow-foundation', category: 'organisation', requiresAuth: true, description: 'Snow Foundation page' },
];

// Dynamic routes that need sample data
export const DYNAMIC_ROUTES: RouteConfig[] = [
  // Storyteller detail pages
  { path: '/storytellers/[id]', name: 'storyteller-profile', category: 'storyteller', requiresAuth: false, dynamicId: 'storyteller', description: 'Storyteller public profile' },
  { path: '/storytellers/[id]/stories', name: 'storyteller-stories', category: 'storyteller', requiresAuth: false, dynamicId: 'storyteller', description: 'Storyteller stories list' },
  { path: '/storytellers/[id]/dashboard', name: 'storyteller-detail-dashboard', category: 'storyteller', requiresAuth: true, dynamicId: 'storyteller', description: 'Storyteller detail dashboard' },
  { path: '/storytellers/[id]/analytics', name: 'storyteller-analytics', category: 'storyteller', requiresAuth: true, dynamicId: 'storyteller', description: 'Storyteller analytics' },
  { path: '/storytellers/[id]/galleries', name: 'storyteller-galleries', category: 'storyteller', requiresAuth: false, dynamicId: 'storyteller', description: 'Storyteller galleries' },
  { path: '/storytellers/[id]/impact', name: 'storyteller-impact', category: 'storyteller', requiresAuth: false, dynamicId: 'storyteller', description: 'Storyteller impact metrics' },
  { path: '/storytellers/[id]/insights', name: 'storyteller-insights', category: 'storyteller', requiresAuth: true, dynamicId: 'storyteller', description: 'Storyteller insights' },
  { path: '/storytellers/[id]/opportunities', name: 'storyteller-opportunities', category: 'storyteller', requiresAuth: true, dynamicId: 'storyteller', description: 'Storyteller opportunities' },
  { path: '/storytellers/[id]/skills', name: 'storyteller-skills', category: 'storyteller', requiresAuth: false, dynamicId: 'storyteller', description: 'Storyteller skills' },
  { path: '/storytellers/[id]/syndication', name: 'storyteller-syndication', category: 'storyteller', requiresAuth: true, dynamicId: 'storyteller', description: 'Storyteller syndication' },
  { path: '/storytellers/[id]/media-hub', name: 'storyteller-media-hub', category: 'storyteller', requiresAuth: true, dynamicId: 'storyteller', description: 'Storyteller media hub' },
  { path: '/storytellers/[id]/enhanced', name: 'storyteller-enhanced', category: 'storyteller', requiresAuth: false, dynamicId: 'storyteller', description: 'Enhanced storyteller view' },
  { path: '/storytellers/[id]/immersive', name: 'storyteller-immersive', category: 'storyteller', requiresAuth: false, dynamicId: 'storyteller', description: 'Immersive storyteller view' },
  { path: '/storytellers/[id]/edit', name: 'storyteller-edit', category: 'storyteller', requiresAuth: true, dynamicId: 'storyteller', description: 'Edit storyteller profile' },

  // Story detail pages
  { path: '/stories/[id]', name: 'story-detail', category: 'public', requiresAuth: false, dynamicId: 'story', description: 'Story detail page' },

  // Organisation detail pages
  { path: '/organisations/[id]', name: 'org-detail', category: 'organisation', requiresAuth: true, dynamicId: 'organisation', description: 'Organisation overview' },
  { path: '/organisations/[id]/dashboard', name: 'org-dashboard', category: 'organisation', requiresAuth: true, dynamicId: 'organisation', description: 'Organisation dashboard' },
  { path: '/organisations/[id]/storytellers', name: 'org-storytellers', category: 'organisation', requiresAuth: true, dynamicId: 'organisation', description: 'Organisation storytellers' },
  { path: '/organisations/[id]/stories', name: 'org-stories', category: 'organisation', requiresAuth: true, dynamicId: 'organisation', description: 'Organisation stories' },
  { path: '/organisations/[id]/projects', name: 'org-projects', category: 'organisation', requiresAuth: true, dynamicId: 'organisation', description: 'Organisation projects' },
  { path: '/organisations/[id]/analytics', name: 'org-analytics', category: 'organisation', requiresAuth: true, dynamicId: 'organisation', description: 'Organisation analytics' },
  { path: '/organisations/[id]/members', name: 'org-members', category: 'organisation', requiresAuth: true, dynamicId: 'organisation', description: 'Organisation members' },
  { path: '/organisations/[id]/settings', name: 'org-settings', category: 'organisation', requiresAuth: true, dynamicId: 'organisation', description: 'Organisation settings' },
  { path: '/organisations/[id]/galleries', name: 'org-galleries', category: 'organisation', requiresAuth: true, dynamicId: 'organisation', description: 'Organisation galleries' },
  { path: '/organisations/[id]/transcripts', name: 'org-transcripts', category: 'organisation', requiresAuth: true, dynamicId: 'organisation', description: 'Organisation transcripts' },
  { path: '/organisations/[id]/impact-analytics', name: 'org-impact', category: 'organisation', requiresAuth: true, dynamicId: 'organisation', description: 'Organisation impact' },
  { path: '/organisations/[id]/analysis', name: 'org-analysis', category: 'organisation', requiresAuth: true, dynamicId: 'organisation', description: 'Organisation analysis' },

  // Project detail pages
  { path: '/projects/[id]', name: 'project-detail', category: 'public', requiresAuth: false, dynamicId: 'project', description: 'Project detail page' },
  { path: '/projects/[id]/analysis', name: 'project-analysis', category: 'other', requiresAuth: true, dynamicId: 'project', description: 'Project analysis' },

  // Gallery detail pages
  { path: '/galleries/[id]', name: 'gallery-detail', category: 'public', requiresAuth: false, dynamicId: 'gallery', description: 'Gallery detail page' },
  { path: '/galleries/[id]/edit', name: 'gallery-edit', category: 'other', requiresAuth: true, dynamicId: 'gallery', description: 'Edit gallery' },
  { path: '/galleries/create', name: 'gallery-create', category: 'other', requiresAuth: true, description: 'Create gallery' },

  // Admin detail pages
  { path: '/admin/storytellers/[id]/edit', name: 'admin-storyteller-edit', category: 'admin', requiresAuth: true, dynamicId: 'storyteller', description: 'Admin edit storyteller' },
  { path: '/admin/storytellers/create', name: 'admin-storyteller-create', category: 'admin', requiresAuth: true, description: 'Admin create storyteller' },
  { path: '/admin/organisations/[id]', name: 'admin-org-detail', category: 'admin', requiresAuth: true, dynamicId: 'organisation', description: 'Admin org detail' },
  { path: '/admin/organisations/[id]/edit', name: 'admin-org-edit', category: 'admin', requiresAuth: true, dynamicId: 'organisation', description: 'Admin edit org' },
  { path: '/admin/transcripts/[id]', name: 'admin-transcript-detail', category: 'admin', requiresAuth: true, dynamicId: 'transcript', description: 'Admin transcript detail' },
  { path: '/admin/transcripts/[id]/edit', name: 'admin-transcript-edit', category: 'admin', requiresAuth: true, dynamicId: 'transcript', description: 'Admin edit transcript' },
];

// Get public routes (no auth required)
export const PUBLIC_ROUTES = ALL_ROUTES.filter(r => !r.requiresAuth);

// Get routes by category
export const getRoutesByCategory = (category: RouteConfig['category']) =>
  ALL_ROUTES.filter(r => r.category === category);

// Total route count
export const TOTAL_ROUTES = ALL_ROUTES.length + DYNAMIC_ROUTES.length;
