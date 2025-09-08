# Photo Gallery System - Empathy Ledger

## Overview

The Photo Gallery System is a comprehensive, culturally-respectful photo management and display system built for the Empathy Ledger platform. It provides a complete solution for organizing, displaying, and managing visual content while honoring Indigenous cultural protocols and consent requirements.

## Key Features

### 🌱 Cultural Respect & Protocols
- **Cultural Sensitivity Levels**: Three-tier system (Low/Medium/High) with appropriate access controls
- **Elder Approval Workflows**: Built-in approval processes for culturally significant content
- **Ceremonial Content Protection**: Special handling for sacred and ceremonial imagery
- **Traditional Knowledge Safeguards**: Protection systems for culturally sensitive information

### 📸 Media Management
- **Multi-format Support**: Images (JPEG, PNG, WebP, GIF) and videos (MP4, WebM)
- **Intelligent Processing**: Automatic thumbnail generation and optimization
- **Storage Integration**: Seamless Supabase storage integration with CDN
- **Metadata Management**: Comprehensive EXIF and cultural metadata support

### 🎨 Gallery Organization
- **Cultural Theming**: Pre-defined themes (Ceremony, Community, Traditional Practices, etc.)
- **Flexible Visibility**: Public, Community, Organization, and Private access levels
- **Smart Associations**: Link galleries to stories, profiles, and cultural contexts
- **Drag-and-Drop Upload**: Modern, intuitive photo upload experience

### 🔒 Consent & Privacy
- **Granular Consent Management**: Individual photo and gallery consent tracking
- **Privacy Controls**: Multiple visibility levels with access restrictions
- **People Tagging**: Privacy-respectful person identification with consent protocols
- **Data Ownership**: Clear ownership and permission hierarchies

## Architecture

### Database Schema

#### Core Tables
- **`media_assets`**: Central table for all media files with cultural protocols
- **`galleries`**: Collections organized by theme and cultural significance
- **`gallery_media_associations`**: Many-to-many relationships between galleries and media
- **`cultural_tags`**: Cultural categorization system respecting Indigenous protocols
- **`media_cultural_tags`**: Tags applied to media with cultural validation
- **`photo_people`**: Privacy-respecting people identification
- **`cultural_locations`**: Culturally significant locations with access protocols

#### Cultural Safety Features
- Row Level Security (RLS) on all tables
- Cultural sensitivity indicators
- Elder approval tracking
- Consent status management
- Access restriction controls

### API Architecture

#### RESTful Endpoints
```
GET    /api/galleries              # List galleries with filtering
POST   /api/galleries              # Create new gallery
GET    /api/galleries/[id]         # Get gallery with media
PUT    /api/galleries/[id]         # Update gallery
DELETE /api/galleries/[id]         # Delete gallery

GET    /api/media                  # List media assets
POST   /api/media                  # Upload new media
GET    /api/media/[id]             # Get media details
PUT    /api/media/[id]             # Update media
DELETE /api/media/[id]             # Delete media

GET    /api/cultural-tags          # List cultural tags
POST   /api/cultural-tags          # Create cultural tag

POST   /api/galleries/[id]/media   # Add media to gallery
DELETE /api/galleries/[id]/media   # Remove media from gallery
```

#### Cultural Review Endpoints
```
GET    /api/admin/content/pending-review  # Get content needing review
PUT    /api/admin/cultural-review         # Submit cultural review
PUT    /api/admin/elder-approval          # Elder approval workflow
```

## Components

### Gallery Components
- **`GalleriesPage`**: Main gallery listing with cultural filtering
- **`GalleryDetailPage`**: Individual gallery display with photo grid
- **`GalleryCreatePage`**: Gallery creation with cultural context forms
- **`PhotoUploadManager`**: Drag-and-drop upload with cultural tagging
- **`PhotoViewer`**: Full-screen photo viewing with cultural indicators

### Cultural Components
- **`CulturalReviewWorkflow`**: Elder and cultural reviewer interface
- **`CulturalSensitivityIndicator`**: Visual sensitivity level display
- **`ConsentManager`**: Consent tracking and management interface
- **`ElderApprovalPanel`**: Elder-specific approval interface

### Integration Components
- **`StoryGalleryConnector`**: Connect galleries to stories
- **`ProfileGallerySection`**: Display user's galleries in profile
- **`MediaLibraryBrowser`**: Browse and select from media library

## User Flows

### Gallery Creation Flow
1. **Authentication**: Verify user login
2. **Basic Information**: Title, description, URL slug
3. **Cultural Context**: Theme, sensitivity level, ceremonial significance
4. **Privacy Settings**: Visibility, download permissions, comments
5. **Elder Approval**: Auto-request if high sensitivity content
6. **Creation**: Generate gallery with proper permissions

### Photo Upload Flow
1. **File Selection**: Drag-and-drop or file picker
2. **Metadata Entry**: Title, description, cultural context
3. **Cultural Tagging**: Apply relevant cultural categories
4. **Consent Verification**: Confirm upload permissions
5. **Processing**: Thumbnail generation and optimization
6. **Gallery Assignment**: Add to appropriate galleries

### Cultural Review Flow
1. **Content Submission**: Creator submits for review
2. **Sensitivity Assessment**: System flags high-sensitivity content
3. **Elder Notification**: Notify appropriate cultural reviewers
4. **Review Process**: Elder/reviewer examines content and context
5. **Decision Recording**: Approve, reject, or request changes
6. **Visibility Update**: Adjust access based on review outcome

## Cultural Protocols

### Sensitivity Levels

#### 🌱 Low (Community Open)
- General community activities
- Contemporary life
- Public events
- Educational content
- **Access**: All authenticated users
- **Review**: Optional community review

#### 🤝 Medium (Respectful Viewing)
- Cultural practices
- Community gatherings
- Seasonal activities
- Traditional crafts
- **Access**: Community members with cultural awareness
- **Review**: Cultural reviewer recommended

#### 🙏 High (Cultural Guidance)
- Ceremonial content
- Sacred sites
- Traditional knowledge
- Elder teachings
- **Access**: Elder approval required
- **Review**: Mandatory elder review and approval

### Elder Approval Process

1. **Automatic Triggering**
   - High sensitivity content
   - Ceremonial imagery
   - Traditional knowledge
   - Sacred locations

2. **Review Criteria**
   - Cultural appropriateness
   - Consent verification
   - Community benefit
   - Protocol adherence

3. **Decision Outcomes**
   - **Approved**: Full access granted
   - **Conditional**: Limited access with restrictions
   - **Rejected**: Content blocked from public view

## Technical Implementation

### Frontend Technologies
- **Next.js 15**: App Router with Server Components
- **React 19**: Modern hooks and concurrent features
- **TypeScript**: Full type safety
- **Tailwind CSS**: Utility-first styling with cultural design system
- **React Dropzone**: File upload with drag-and-drop

### Backend Technologies
- **Supabase**: Database, authentication, storage
- **PostgreSQL**: Relational database with JSON support
- **Row Level Security**: Database-level access control
- **Supabase Storage**: CDN-backed file storage with transformation

### Cultural Features Implementation

#### Access Control
```sql
-- Example RLS policy for cultural sensitivity
CREATE POLICY "Users can view appropriate content" ON media_assets
FOR SELECT USING (
  visibility = 'public' OR
  (visibility = 'community' AND auth.role() = 'authenticated') OR
  (cultural_sensitivity_level = 'high' AND elder_approval = true AND auth.uid() IN (
    SELECT id FROM profiles WHERE cultural_permissions->>'view_high_sensitivity' = 'true'
  ))
);
```

#### Elder Approval Workflow
```typescript
// Automatic elder approval triggering
const requiresElderApproval = (content: MediaAsset | Gallery) => {
  return content.cultural_sensitivity_level === 'high' ||
         content.ceremonial_content ||
         content.traditional_knowledge ||
         content.requires_elder_approval;
};
```

## Setup Instructions

### 1. Database Setup
```bash
# Execute the photo gallery schema
psql -d your_database -f database/photo-gallery-schema.sql
```

### 2. Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
```

### 3. Storage Buckets
Create the following Supabase storage buckets:
- `media-assets`: Main media storage
- `thumbnails`: Generated thumbnails
- `optimized`: Optimized images

### 4. RLS Policies
```sql
-- Enable RLS on all tables
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE galleries ENABLE ROW LEVEL SECURITY;
-- ... (see schema file for complete policies)
```

## Usage Examples

### Creating a Gallery
```typescript
const gallery = await fetch('/api/galleries', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Spring Ceremony 2024',
    cultural_theme: 'ceremony',
    cultural_sensitivity_level: 'high',
    requires_elder_approval: true,
    ceremonial_content: true,
    visibility: 'community'
  })
});
```

### Uploading Photos
```typescript
const formData = new FormData();
formData.append('file', file);
formData.append('cultural_sensitivity_level', 'medium');
formData.append('ceremonial_content', 'true');

const upload = await fetch('/api/media', {
  method: 'POST',
  body: formData
});
```

### Cultural Review
```typescript
const review = await fetch(`/api/galleries/${galleryId}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    cultural_review_status: 'approved',
    elder_approval_status: 'approved',
    cultural_review_notes: 'Appropriate for community sharing'
  })
});
```

## Best Practices

### Cultural Sensitivity
1. **Always ask permission** before photographing people or ceremonies
2. **Respect seasonal restrictions** and cultural protocols
3. **Consult elders** for guidance on appropriate sharing
4. **Use appropriate sensitivity levels** for all content
5. **Include cultural context** in descriptions

### Technical Best Practices
1. **Optimize images** before upload to reduce bandwidth
2. **Use appropriate alt text** for accessibility
3. **Include cultural metadata** for proper categorization
4. **Test consent workflows** regularly
5. **Monitor storage usage** and implement cleanup procedures

### Privacy Protection
1. **Default to private visibility** for new content
2. **Require explicit consent** for people identification
3. **Respect withdrawal of consent** immediately
4. **Implement data retention policies**
5. **Provide clear privacy controls**

## Future Enhancements

### Planned Features
- **AI-powered cultural tagging** with elder validation
- **Advanced face detection** with privacy-first implementation
- **Audio storytelling integration** with photo galleries
- **Mobile app** for field photography and upload
- **Collaborative gallery editing** with multiple contributors
- **Cultural calendar integration** for seasonal content
- **Advanced search** with cultural metadata
- **Export tools** for community archives

### Technical Improvements
- **WebP and AVIF support** for better compression
- **Progressive loading** for large galleries
- **Offline capability** for mobile users
- **Advanced caching** strategies
- **Performance monitoring** and optimization
- **Accessibility enhancements**
- **Internationalization** support

## Support and Maintenance

### Monitoring
- Gallery creation and usage metrics
- Cultural review queue monitoring
- Storage usage tracking
- Performance metrics
- Error tracking and resolution

### Regular Tasks
- Review and update cultural protocols
- Elder feedback collection and implementation
- Performance optimization
- Security updates
- Database maintenance
- Storage cleanup

---

## Contributing

When contributing to the Photo Gallery System:

1. **Understand cultural protocols** before making changes
2. **Consult with cultural advisors** for sensitivity-related features
3. **Test consent workflows** thoroughly
4. **Maintain accessibility standards**
5. **Follow existing code patterns** and documentation standards

## License

This system respects Indigenous intellectual property rights and follows community-guided development principles. Please consult with community elders and cultural advisors before implementing or modifying cultural features.

---

**Created with respect for Indigenous communities and cultural protocols** 🙏