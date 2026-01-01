import { Json } from './base'

export interface ContentMediaTables {
  stories: {
    Row: {
      ai_generated_summary: string | null
      ai_processed: boolean | null
      ai_themes: string[] | null
      author_id: string | null
      consent_verified: boolean | null
      content: string | null
      created_at: string
      cultural_context: Json | null
      cultural_sensitivity_level: string | null
      cultural_themes: string[] | null
      description: string | null
      excerpt: string | null
      featured_media_id: string | null
      generated_themes: string[] | null
      has_consent: boolean | null
      has_explicit_consent: boolean | null
      id: string
      is_featured: boolean | null
      language: string | null
      location: string | null
      media_urls: string[] | null
      organization_id: string | null
      priority: string | null
      project_id: string | null
      publication_date: string | null
      published_at: string | null
      reading_time: number | null
      requires_elder_review: boolean | null
      review_notes: string | null
      review_status: string | null
      social_shares: number | null
      status: string | null
      story_image_url: string | null
      story_type: string | null
      storyteller_id: string | null
      tags: string[] | null
      tenant_id: string | null
      title: string | null
      updated_at: string
      video_story_link: string | null
      view_count: number | null
      visibility: string | null
    }
    Insert: {
      ai_generated_summary?: string | null
      ai_processed?: boolean | null
      ai_themes?: string[] | null
      author_id?: string | null
      consent_verified?: boolean | null
      content?: string | null
      created_at?: string
      cultural_context?: Json | null
      cultural_sensitivity_level?: string | null
      cultural_themes?: string[] | null
      description?: string | null
      excerpt?: string | null
      featured_media_id?: string | null
      generated_themes?: string[] | null
      has_consent?: boolean | null
      has_explicit_consent?: boolean | null
      id?: string
      is_featured?: boolean | null
      language?: string | null
      location?: string | null
      media_urls?: string[] | null
      organization_id?: string | null
      priority?: string | null
      project_id?: string | null
      publication_date?: string | null
      published_at?: string | null
      reading_time?: number | null
      requires_elder_review?: boolean | null
      review_notes?: string | null
      review_status?: string | null
      social_shares?: number | null
      status?: string | null
      story_image_url?: string | null
      story_type?: string | null
      storyteller_id?: string | null
      tags?: string[] | null
      tenant_id?: string | null
      title?: string | null
      updated_at?: string
      video_story_link?: string | null
      view_count?: number | null
      visibility?: string | null
    }
    Update: {
      ai_generated_summary?: string | null
      ai_processed?: boolean | null
      ai_themes?: string[] | null
      author_id?: string | null
      consent_verified?: boolean | null
      content?: string | null
      created_at?: string
      cultural_context?: Json | null
      cultural_sensitivity_level?: string | null
      cultural_themes?: string[] | null
      description?: string | null
      excerpt?: string | null
      featured_media_id?: string | null
      generated_themes?: string[] | null
      has_consent?: boolean | null
      has_explicit_consent?: boolean | null
      id?: string
      is_featured?: boolean | null
      language?: string | null
      location?: string | null
      media_urls?: string[] | null
      organization_id?: string | null
      priority?: string | null
      project_id?: string | null
      publication_date?: string | null
      published_at?: string | null
      reading_time?: number | null
      requires_elder_review?: boolean | null
      review_notes?: string | null
      review_status?: string | null
      social_shares?: number | null
      status?: string | null
      story_image_url?: string | null
      story_type?: string | null
      storyteller_id?: string | null
      tags?: string[] | null
      tenant_id?: string | null
      title?: string | null
      updated_at?: string
      video_story_link?: string | null
      view_count?: number | null
      visibility?: string | null
    }
    Relationships: [
      {
        foreignKeyName: "stories_author_id_fkey"
        columns: ["author_id"]
        isOneToOne: false
        referencedRelation: "profiles"
        referencedColumns: ["id"]
      },
      {
        foreignKeyName: "stories_featured_media_id_fkey"
        columns: ["featured_media_id"]
        isOneToOne: false
        referencedRelation: "media_assets"
        referencedColumns: ["id"]
      },
      {
        foreignKeyName: "stories_organization_id_fkey"
        columns: ["organization_id"]
        isOneToOne: false
        referencedRelation: "organisations"
        referencedColumns: ["id"]
      },
      {
        foreignKeyName: "stories_project_id_fkey"
        columns: ["project_id"]
        isOneToOne: false
        referencedRelation: "projects"
        referencedColumns: ["id"]
      },
      {
        foreignKeyName: "stories_storyteller_id_fkey"
        columns: ["storyteller_id"]
        isOneToOne: false
        referencedRelation: "profiles"
        referencedColumns: ["id"]
      },
      {
        foreignKeyName: "stories_tenant_id_fkey"
        columns: ["tenant_id"]
        isOneToOne: false
        referencedRelation: "tenant_analytics"
        referencedColumns: ["tenant_id"]
      },
      {
        foreignKeyName: "stories_tenant_id_fkey"
        columns: ["tenant_id"]
        isOneToOne: false
        referencedRelation: "tenants"
        referencedColumns: ["id"]
      },
    ]
  }
  transcripts: {
    Row: {
      ai_processing_status: string | null
      ai_summary: string | null
      content: string | null
      created_at: string
      cultural_context: Json | null
      cultural_sensitivity_level: string | null
      id: string
      key_quotes: string[] | null
      language: string | null
      location: string | null
      metadata: Json | null
      processing_notes: string | null
      status: string | null
      storyteller_id: string | null
      tags: string[] | null
      tenant_id: string | null
      themes: string[] | null
      title: string | null
      transcript_url: string | null
      updated_at: string
      video_url: string | null
      word_count: number | null
    }
    Insert: {
      ai_processing_status?: string | null
      ai_summary?: string | null
      content?: string | null
      created_at?: string
      cultural_context?: Json | null
      cultural_sensitivity_level?: string | null
      id?: string
      key_quotes?: string[] | null
      language?: string | null
      location?: string | null
      metadata?: Json | null
      processing_notes?: string | null
      status?: string | null
      storyteller_id?: string | null
      tags?: string[] | null
      tenant_id?: string | null
      themes?: string[] | null
      title?: string | null
      transcript_url?: string | null
      updated_at?: string
      video_url?: string | null
      word_count?: number | null
    }
    Update: {
      ai_processing_status?: string | null
      ai_summary?: string | null
      content?: string | null
      created_at?: string
      cultural_context?: Json | null
      cultural_sensitivity_level?: string | null
      id?: string
      key_quotes?: string[] | null
      language?: string | null
      location?: string | null
      metadata?: Json | null
      processing_notes?: string | null
      status?: string | null
      storyteller_id?: string | null
      tags?: string[] | null
      tenant_id?: string | null
      themes?: string[] | null
      title?: string | null
      transcript_url?: string | null
      updated_at?: string
      video_url?: string | null
      word_count?: number | null
    }
    Relationships: [
      {
        foreignKeyName: "transcripts_storyteller_id_fkey"
        columns: ["storyteller_id"]
        isOneToOne: false
        referencedRelation: "profiles"
        referencedColumns: ["id"]
      },
      {
        foreignKeyName: "transcripts_tenant_id_fkey"
        columns: ["tenant_id"]
        isOneToOne: false
        referencedRelation: "tenant_analytics"
        referencedColumns: ["tenant_id"]
      },
      {
        foreignKeyName: "transcripts_tenant_id_fkey"
        columns: ["tenant_id"]
        isOneToOne: false
        referencedRelation: "tenants"
        referencedColumns: ["id"]
      },
    ]
  }
  media_assets: {
    Row: {
      accessibility_metadata: Json | null
      ai_analysis_completed: boolean | null
      ai_generated_tags: string[] | null
      alt_text: string | null
      archive_status: string | null
      aws_transcribe_job: string | null
      bucket_name: string | null
      captions_url: string | null
      cdn_url: string | null
      checksum: string | null
      classification: string | null
      compressed_url: string | null
      compression_ratio: number | null
      consent_status: string | null
      content_type: string | null
      copyright_info: Json | null
      created_at: string
      cultural_context: Json | null
      cultural_sensitivity_level: string | null
      cultural_tags: string[] | null
      description: string | null
      duration: number | null
      encoding_job_id: string | null
      encoding_status: string | null
      file_path: string | null
      file_size: number | null
      filename: string | null
      gallery_id: string | null
      geographic_data: Json | null
      has_explicit_consent: boolean | null
      height: number | null
      id: string
      is_featured: boolean | null
      is_public: boolean | null
      language: string | null
      last_accessed: string | null
      last_modified: string | null
      location: string | null
      metadata: Json | null
      needs_review: boolean | null
      original_filename: string | null
      organization_id: string | null
      preview_url: string | null
      processing_status: string | null
      project_id: string | null
      public_url: string | null
      quality_score: number | null
      resolution: string | null
      requires_elder_approval: boolean | null
      requires_review: boolean | null
      review_notes: string | null
      storage_provider: string | null
      tags: string[] | null
      tenant_id: string | null
      thumbnail_url: string | null
      title: string | null
      transcription_job_id: string | null
      transcription_status: string | null
      transcription_url: string | null
      updated_at: string
      upload_session_id: string | null
      uploader_id: string | null
      usage_rights: Json | null
      version: number | null
      video_encoding_status: string | null
      width: number | null
    }
    Insert: {
      accessibility_metadata?: Json | null
      ai_analysis_completed?: boolean | null
      ai_generated_tags?: string[] | null
      alt_text?: string | null
      archive_status?: string | null
      aws_transcribe_job?: string | null
      bucket_name?: string | null
      captions_url?: string | null
      cdn_url?: string | null
      checksum?: string | null
      classification?: string | null
      compressed_url?: string | null
      compression_ratio?: number | null
      consent_status?: string | null
      content_type?: string | null
      copyright_info?: Json | null
      created_at?: string
      cultural_context?: Json | null
      cultural_sensitivity_level?: string | null
      cultural_tags?: string[] | null
      description?: string | null
      duration?: number | null
      encoding_job_id?: string | null
      encoding_status?: string | null
      file_path?: string | null
      file_size?: number | null
      filename?: string | null
      gallery_id?: string | null
      geographic_data?: Json | null
      has_explicit_consent?: boolean | null
      height?: number | null
      id?: string
      is_featured?: boolean | null
      is_public?: boolean | null
      language?: string | null
      last_accessed?: string | null
      last_modified?: string | null
      location?: string | null
      metadata?: Json | null
      needs_review?: boolean | null
      original_filename?: string | null
      organization_id?: string | null
      preview_url?: string | null
      processing_status?: string | null
      project_id?: string | null
      public_url?: string | null
      quality_score?: number | null
      resolution?: string | null
      requires_elder_approval?: boolean | null
      requires_review?: boolean | null
      review_notes?: string | null
      storage_provider?: string | null
      tags?: string[] | null
      tenant_id?: string | null
      thumbnail_url?: string | null
      title?: string | null
      transcription_job_id?: string | null
      transcription_status?: string | null
      transcription_url?: string | null
      updated_at?: string
      upload_session_id?: string | null
      uploader_id?: string | null
      usage_rights?: Json | null
      version?: number | null
      video_encoding_status?: string | null
      width?: number | null
    }
    Update: {
      accessibility_metadata?: Json | null
      ai_analysis_completed?: boolean | null
      ai_generated_tags?: string[] | null
      alt_text?: string | null
      archive_status?: string | null
      aws_transcribe_job?: string | null
      bucket_name?: string | null
      captions_url?: string | null
      cdn_url?: string | null
      checksum?: string | null
      classification?: string | null
      compressed_url?: string | null
      compression_ratio?: number | null
      consent_status?: string | null
      content_type?: string | null
      copyright_info?: Json | null
      created_at?: string
      cultural_context?: Json | null
      cultural_sensitivity_level?: string | null
      cultural_tags?: string[] | null
      description?: string | null
      duration?: number | null
      encoding_job_id?: string | null
      encoding_status?: string | null
      file_path?: string | null
      file_size?: number | null
      filename?: string | null
      gallery_id?: string | null
      geographic_data?: Json | null
      has_explicit_consent?: boolean | null
      height?: number | null
      id?: string
      is_featured?: boolean | null
      is_public?: boolean | null
      language?: string | null
      last_accessed?: string | null
      last_modified?: string | null
      location?: string | null
      metadata?: Json | null
      needs_review?: boolean | null
      original_filename?: string | null
      organization_id?: string | null
      preview_url?: string | null
      processing_status?: string | null
      project_id?: string | null
      public_url?: string | null
      quality_score?: number | null
      resolution?: string | null
      requires_elder_approval?: boolean | null
      requires_review?: boolean | null
      review_notes?: string | null
      storage_provider?: string | null
      tags?: string[] | null
      tenant_id?: string | null
      thumbnail_url?: string | null
      title?: string | null
      transcription_job_id?: string | null
      transcription_status?: string | null
      transcription_url?: string | null
      updated_at?: string
      upload_session_id?: string | null
      uploader_id?: string | null
      usage_rights?: Json | null
      version?: number | null
      video_encoding_status?: string | null
      width?: number | null
    }
    Relationships: [
      {
        foreignKeyName: "media_assets_gallery_id_fkey"
        columns: ["gallery_id"]
        isOneToOne: false
        referencedRelation: "galleries"
        referencedColumns: ["id"]
      },
      {
        foreignKeyName: "media_assets_organization_id_fkey"
        columns: ["organization_id"]
        isOneToOne: false
        referencedRelation: "organisations"
        referencedColumns: ["id"]
      },
      {
        foreignKeyName: "media_assets_project_id_fkey"
        columns: ["project_id"]
        isOneToOne: false
        referencedRelation: "projects"
        referencedColumns: ["id"]
      },
      {
        foreignKeyName: "media_assets_tenant_id_fkey"
        columns: ["tenant_id"]
        isOneToOne: false
        referencedRelation: "tenant_analytics"
        referencedColumns: ["tenant_id"]
      },
      {
        foreignKeyName: "media_assets_tenant_id_fkey"
        columns: ["tenant_id"]
        isOneToOne: false
        referencedRelation: "tenants"
        referencedColumns: ["id"]
      },
      {
        foreignKeyName: "media_assets_uploader_id_fkey"
        columns: ["uploader_id"]
        isOneToOne: false
        referencedRelation: "profiles"
        referencedColumns: ["id"]
      },
    ]
  }
  media_usage_tracking: {
    Row: {
      access_count: number | null
      access_duration: number | null
      created_at: string | null
      download_count: number | null
      id: string
      last_access: string | null
      media_id: string
      profile_id: string | null
      session_id: string | null
      tenant_id: string | null
      usage_context: string | null
      usage_type: string | null
    }
    Insert: {
      access_count?: number | null
      access_duration?: number | null
      created_at?: string | null
      download_count?: number | null
      id?: string
      last_access?: string | null
      media_id: string
      profile_id?: string | null
      session_id?: string | null
      tenant_id?: string | null
      usage_context?: string | null
      usage_type?: string | null
    }
    Update: {
      access_count?: number | null
      access_duration?: number | null
      created_at?: string | null
      download_count?: number | null
      id?: string
      last_access?: string | null
      media_id?: string
      profile_id?: string | null
      session_id?: string | null
      tenant_id?: string | null
      usage_context?: string | null
      usage_type?: string | null
    }
    Relationships: [
      {
        foreignKeyName: "media_usage_tracking_media_id_fkey"
        columns: ["media_id"]
        isOneToOne: false
        referencedRelation: "media_assets"
        referencedColumns: ["id"]
      },
      {
        foreignKeyName: "media_usage_tracking_profile_id_fkey"
        columns: ["profile_id"]
        isOneToOne: false
        referencedRelation: "profiles"
        referencedColumns: ["id"]
      },
      {
        foreignKeyName: "media_usage_tracking_tenant_id_fkey"
        columns: ["tenant_id"]
        isOneToOne: false
        referencedRelation: "tenant_analytics"
        referencedColumns: ["tenant_id"]
      },
      {
        foreignKeyName: "media_usage_tracking_tenant_id_fkey"
        columns: ["tenant_id"]
        isOneToOne: false
        referencedRelation: "tenants"
        referencedColumns: ["id"]
      },
    ]
  }
  extracted_quotes: {
    Row: {
      author_id: string | null
      author_name: string | null
      context: string | null
      created_at: string | null
      id: string
      impact_score: number | null
      organization_id: string | null
      project_id: string | null
      quote_text: string
      search_vector: unknown | null
      sentiment: string | null
      source_id: string | null
      source_type: string | null
      themes: string[] | null
    }
    Insert: {
      author_id?: string | null
      author_name?: string | null
      context?: string | null
      created_at?: string | null
      id?: string
      impact_score?: number | null
      organization_id?: string | null
      project_id?: string | null
      quote_text: string
      search_vector?: unknown | null
      sentiment?: string | null
      source_id?: string | null
      source_type?: string | null
      themes?: string[] | null
    }
    Update: {
      author_id?: string | null
      author_name?: string | null
      context?: string | null
      created_at?: string | null
      id?: string
      impact_score?: number | null
      organization_id?: string | null
      project_id?: string | null
      quote_text?: string
      search_vector?: unknown | null
      sentiment?: string | null
      source_id?: string | null
      source_type?: string | null
      themes?: string[] | null
    }
    Relationships: [
      {
        foreignKeyName: "extracted_quotes_author_id_fkey"
        columns: ["author_id"]
        isOneToOne: false
        referencedRelation: "profiles"
        referencedColumns: ["id"]
      },
      {
        foreignKeyName: "extracted_quotes_organization_id_fkey"
        columns: ["organization_id"]
        isOneToOne: false
        referencedRelation: "organisations"
        referencedColumns: ["id"]
      },
      {
        foreignKeyName: "extracted_quotes_project_id_fkey"
        columns: ["project_id"]
        isOneToOne: false
        referencedRelation: "projects"
        referencedColumns: ["id"]
      },
    ]
  }
}