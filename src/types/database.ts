export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      analysis_jobs: {
        Row: {
          ai_model_used: string | null
          completed_at: string | null
          created_at: string | null
          error_message: string | null
          id: string
          job_type: string | null
          processing_time_seconds: number | null
          profile_id: string | null
          results_data: Json | null
          started_at: string | null
          status: string | null
          transcript_ids: string[] | null
        }
        Insert: {
          ai_model_used?: string | null
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          job_type?: string | null
          processing_time_seconds?: number | null
          profile_id?: string | null
          results_data?: Json | null
          started_at?: string | null
          status?: string | null
          transcript_ids?: string[] | null
        }
        Update: {
          ai_model_used?: string | null
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          job_type?: string | null
          processing_time_seconds?: number | null
          profile_id?: string | null
          results_data?: Json | null
          started_at?: string | null
          status?: string | null
          transcript_ids?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "analysis_jobs_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cultural_protocols: {
        Row: {
          approved_by: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          effective_date: string | null
          enforcement_level: string | null
          expiry_date: string | null
          id: string
          legacy_project_id: string | null
          organization_id: string | null
          protocol_name: string
          protocol_type: string
          rules: Json
          status: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          approved_by?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          effective_date?: string | null
          enforcement_level?: string | null
          expiry_date?: string | null
          id?: string
          legacy_project_id?: string | null
          organization_id?: string | null
          protocol_name: string
          protocol_type: string
          rules: Json
          status?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          approved_by?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          effective_date?: string | null
          enforcement_level?: string | null
          expiry_date?: string | null
          id?: string
          legacy_project_id?: string | null
          organization_id?: string | null
          protocol_name?: string
          protocol_type?: string
          rules?: Json
          status?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cultural_protocols_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cultural_protocols_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cultural_protocols_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_analytics"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "cultural_protocols_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      cultural_tags: {
        Row: {
          category: string
          created_at: string
          cultural_sensitivity_level: string | null
          description: string | null
          id: string
          name: string
          slug: string
          usage_count: number | null
        }
        Insert: {
          category: string
          created_at?: string
          cultural_sensitivity_level?: string | null
          description?: string | null
          id?: string
          name: string
          slug: string
          usage_count?: number | null
        }
        Update: {
          category?: string
          created_at?: string
          cultural_sensitivity_level?: string | null
          description?: string | null
          id?: string
          name?: string
          slug?: string
          usage_count?: number | null
        }
        Relationships: []
      }
      development_plans: {
        Row: {
          community_engagement_opportunities: string[] | null
          created_at: string | null
          cultural_preservation_activities: string[] | null
          id: string
          long_term_goals: string[] | null
          mentorship_suggestions: string[] | null
          milestones: Json | null
          networking_opportunities: string[] | null
          next_review_date: string | null
          plan_duration: string | null
          profile_id: string | null
          progress_indicators: string[] | null
          recommended_courses: string[] | null
          short_term_goals: string[] | null
          skill_development_priorities: string[] | null
          success_metrics: string[] | null
          traditional_knowledge_development: string[] | null
          updated_at: string | null
        }
        Insert: {
          community_engagement_opportunities?: string[] | null
          created_at?: string | null
          cultural_preservation_activities?: string[] | null
          id?: string
          long_term_goals?: string[] | null
          mentorship_suggestions?: string[] | null
          milestones?: Json | null
          networking_opportunities?: string[] | null
          next_review_date?: string | null
          plan_duration?: string | null
          profile_id?: string | null
          progress_indicators?: string[] | null
          recommended_courses?: string[] | null
          short_term_goals?: string[] | null
          skill_development_priorities?: string[] | null
          success_metrics?: string[] | null
          traditional_knowledge_development?: string[] | null
          updated_at?: string | null
        }
        Update: {
          community_engagement_opportunities?: string[] | null
          created_at?: string | null
          cultural_preservation_activities?: string[] | null
          id?: string
          long_term_goals?: string[] | null
          mentorship_suggestions?: string[] | null
          milestones?: Json | null
          networking_opportunities?: string[] | null
          next_review_date?: string | null
          plan_duration?: string | null
          profile_id?: string | null
          progress_indicators?: string[] | null
          recommended_courses?: string[] | null
          short_term_goals?: string[] | null
          skill_development_priorities?: string[] | null
          success_metrics?: string[] | null
          traditional_knowledge_development?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "development_plans_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          anonymized: boolean | null
          created_at: string
          event_data: Json | null
          event_type: string
          id: string
          ip_address: unknown | null
          resource_id: string | null
          resource_type: string | null
          retention_expires_at: string | null
          session_id: string | null
          tenant_id: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          anonymized?: boolean | null
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type?: string | null
          retention_expires_at?: string | null
          session_id?: string | null
          tenant_id: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          anonymized?: boolean | null
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type?: string | null
          retention_expires_at?: string | null
          session_id?: string | null
          tenant_id?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_analytics"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "events_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      events_2024_01: {
        Row: {
          anonymized: boolean | null
          created_at: string
          event_data: Json | null
          event_type: string
          id: string
          ip_address: unknown | null
          resource_id: string | null
          resource_type: string | null
          retention_expires_at: string | null
          session_id: string | null
          tenant_id: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          anonymized?: boolean | null
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type?: string | null
          retention_expires_at?: string | null
          session_id?: string | null
          tenant_id: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          anonymized?: boolean | null
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type?: string | null
          retention_expires_at?: string | null
          session_id?: string | null
          tenant_id?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      events_2025_08: {
        Row: {
          anonymized: boolean | null
          created_at: string
          event_data: Json | null
          event_type: string
          id: string
          ip_address: unknown | null
          resource_id: string | null
          resource_type: string | null
          retention_expires_at: string | null
          session_id: string | null
          tenant_id: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          anonymized?: boolean | null
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type?: string | null
          retention_expires_at?: string | null
          session_id?: string | null
          tenant_id: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          anonymized?: boolean | null
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type?: string | null
          retention_expires_at?: string | null
          session_id?: string | null
          tenant_id?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      events_2025_09: {
        Row: {
          anonymized: boolean | null
          created_at: string
          event_data: Json | null
          event_type: string
          id: string
          ip_address: unknown | null
          resource_id: string | null
          resource_type: string | null
          retention_expires_at: string | null
          session_id: string | null
          tenant_id: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          anonymized?: boolean | null
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type?: string | null
          retention_expires_at?: string | null
          session_id?: string | null
          tenant_id: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          anonymized?: boolean | null
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type?: string | null
          retention_expires_at?: string | null
          session_id?: string | null
          tenant_id?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
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
      galleries: {
        Row: {
          cover_image: string | null
          cover_image_id: string | null
          created_at: string
          created_by: string
          cultural_context: Json | null
          cultural_sensitivity_level: string | null
          cultural_significance: string | null
          cultural_theme: string | null
          description: string | null
          featured: boolean | null
          id: string
          is_public: boolean | null
          organization_id: string | null
          photo_count: number | null
          slug: string
          status: string | null
          title: string
          updated_at: string
          view_count: number | null
          visibility: string | null
        }
        Insert: {
          cover_image?: string | null
          cover_image_id?: string | null
          created_at?: string
          created_by: string
          cultural_context?: Json | null
          cultural_sensitivity_level?: string | null
          cultural_significance?: string | null
          cultural_theme?: string | null
          description?: string | null
          featured?: boolean | null
          id?: string
          is_public?: boolean | null
          organization_id?: string | null
          photo_count?: number | null
          slug: string
          status?: string | null
          title: string
          updated_at?: string
          view_count?: number | null
          visibility?: string | null
        }
        Update: {
          cover_image?: string | null
          cover_image_id?: string | null
          created_at?: string
          created_by?: string
          cultural_context?: Json | null
          cultural_sensitivity_level?: string | null
          cultural_significance?: string | null
          cultural_theme?: string | null
          description?: string | null
          featured?: boolean | null
          id?: string
          is_public?: boolean | null
          organization_id?: string | null
          photo_count?: number | null
          slug?: string
          status?: string | null
          title?: string
          updated_at?: string
          view_count?: number | null
          visibility?: string | null
        }
        Relationships: []
      }
      gallery_media_associations: {
        Row: {
          caption: string | null
          created_at: string
          cultural_context: string | null
          gallery_id: string
          id: string
          is_cover_image: boolean | null
          media_asset_id: string
          sort_order: number | null
        }
        Insert: {
          caption?: string | null
          created_at?: string
          cultural_context?: string | null
          gallery_id: string
          id?: string
          is_cover_image?: boolean | null
          media_asset_id: string
          sort_order?: number | null
        }
        Update: {
          caption?: string | null
          created_at?: string
          cultural_context?: string | null
          gallery_id?: string
          id?: string
          is_cover_image?: boolean | null
          media_asset_id?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      gallery_photos: {
        Row: {
          caption: string | null
          created_at: string | null
          gallery_id: string
          id: string
          order_index: number | null
          photo_url: string
          photographer: string | null
          uploaded_by: string | null
        }
        Insert: {
          caption?: string | null
          created_at?: string | null
          gallery_id: string
          id?: string
          order_index?: number | null
          photo_url: string
          photographer?: string | null
          uploaded_by?: string | null
        }
        Update: {
          caption?: string | null
          created_at?: string | null
          gallery_id?: string
          id?: string
          order_index?: number | null
          photo_url?: string
          photographer?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gallery_photos_gallery_id_fkey"
            columns: ["gallery_id"]
            isOneToOne: false
            referencedRelation: "galleries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gallery_photos_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      impact_stories: {
        Row: {
          beneficiaries: string[] | null
          community_approval_required: boolean | null
          context: string | null
          created_at: string | null
          cultural_significance: string | null
          id: string
          key_achievements: string[] | null
          measurable_outcomes: string[] | null
          narrative: string
          professional_summary: string | null
          profile_id: string | null
          scale_of_impact: string | null
          suitable_for: string[] | null
          timeframe: string | null
          title: string
          traditional_knowledge_involved: boolean | null
          updated_at: string | null
        }
        Insert: {
          beneficiaries?: string[] | null
          community_approval_required?: boolean | null
          context?: string | null
          created_at?: string | null
          cultural_significance?: string | null
          id?: string
          key_achievements?: string[] | null
          measurable_outcomes?: string[] | null
          narrative: string
          professional_summary?: string | null
          profile_id?: string | null
          scale_of_impact?: string | null
          suitable_for?: string[] | null
          timeframe?: string | null
          title: string
          traditional_knowledge_involved?: boolean | null
          updated_at?: string | null
        }
        Update: {
          beneficiaries?: string[] | null
          community_approval_required?: boolean | null
          context?: string | null
          created_at?: string | null
          cultural_significance?: string | null
          id?: string
          key_achievements?: string[] | null
          measurable_outcomes?: string[] | null
          narrative?: string
          professional_summary?: string | null
          profile_id?: string | null
          scale_of_impact?: string | null
          suitable_for?: string[] | null
          timeframe?: string | null
          title?: string
          traditional_knowledge_involved?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "impact_stories_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          city: string | null
          country: string | null
          created_at: string | null
          id: string
          latitude: number | null
          longitude: number | null
          name: string
          postal_code: string | null
          state: string | null
          updated_at: string | null
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name: string
          postal_code?: string | null
          state?: string | null
          updated_at?: string | null
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          postal_code?: string | null
          state?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      media_assets: {
        Row: {
          alt_text: string | null
          bitrate: number | null
          cdn_url: string | null
          collection_id: string | null
          consent_granted: boolean | null
          consent_granted_at: string | null
          consent_granted_by: string | null
          created_at: string | null
          cultural_sensitivity_level: string
          description: string | null
          display_name: string | null
          download_count: number | null
          duration: number | null
          file_path: string | null
          file_size: number
          file_type: string
          filename: string | null
          fps: number | null
          height: number | null
          id: string
          large_url: string | null
          last_accessed_at: string | null
          latitude: number | null
          location_name: string | null
          longitude: number | null
          media_type: string | null
          medium_url: string | null
          metadata: Json | null
          mime_type: string | null
          organization_id: string | null
          original_filename: string
          privacy_level: string
          processing_metadata: Json | null
          processing_status: string | null
          project_id: string | null
          requires_consent: boolean | null
          search_vector: unknown | null
          storage_bucket: string
          storage_path: string
          story_id: string | null
          taken_at: string | null
          tenant_id: string
          thumbnail_url: string | null
          title: string | null
          transcript_id: string | null
          updated_at: string | null
          uploaded_at: string | null
          uploaded_by: string | null
          uploader_id: string
          url: string | null
          view_count: number | null
          width: number | null
        }
        Insert: {
          alt_text?: string | null
          bitrate?: number | null
          cdn_url?: string | null
          collection_id?: string | null
          consent_granted?: boolean | null
          consent_granted_at?: string | null
          consent_granted_by?: string | null
          created_at?: string | null
          cultural_sensitivity_level?: string
          description?: string | null
          display_name?: string | null
          download_count?: number | null
          duration?: number | null
          file_path?: string | null
          file_size: number
          file_type: string
          filename?: string | null
          fps?: number | null
          height?: number | null
          id?: string
          large_url?: string | null
          last_accessed_at?: string | null
          latitude?: number | null
          location_name?: string | null
          longitude?: number | null
          media_type?: string | null
          medium_url?: string | null
          metadata?: Json | null
          mime_type?: string | null
          organization_id?: string | null
          original_filename: string
          privacy_level?: string
          processing_metadata?: Json | null
          processing_status?: string | null
          project_id?: string | null
          requires_consent?: boolean | null
          search_vector?: unknown | null
          storage_bucket: string
          storage_path: string
          story_id?: string | null
          taken_at?: string | null
          tenant_id: string
          thumbnail_url?: string | null
          title?: string | null
          transcript_id?: string | null
          updated_at?: string | null
          uploaded_at?: string | null
          uploaded_by?: string | null
          uploader_id: string
          url?: string | null
          view_count?: number | null
          width?: number | null
        }
        Update: {
          alt_text?: string | null
          bitrate?: number | null
          cdn_url?: string | null
          collection_id?: string | null
          consent_granted?: boolean | null
          consent_granted_at?: string | null
          consent_granted_by?: string | null
          created_at?: string | null
          cultural_sensitivity_level?: string
          description?: string | null
          display_name?: string | null
          download_count?: number | null
          duration?: number | null
          file_path?: string | null
          file_size?: number
          file_type?: string
          filename?: string | null
          fps?: number | null
          height?: number | null
          id?: string
          large_url?: string | null
          last_accessed_at?: string | null
          latitude?: number | null
          location_name?: string | null
          longitude?: number | null
          media_type?: string | null
          medium_url?: string | null
          metadata?: Json | null
          mime_type?: string | null
          organization_id?: string | null
          original_filename?: string
          privacy_level?: string
          processing_metadata?: Json | null
          processing_status?: string | null
          project_id?: string | null
          requires_consent?: boolean | null
          search_vector?: unknown | null
          storage_bucket?: string
          storage_path?: string
          story_id?: string | null
          taken_at?: string | null
          tenant_id?: string
          thumbnail_url?: string | null
          title?: string | null
          transcript_id?: string | null
          updated_at?: string | null
          uploaded_at?: string | null
          uploaded_by?: string | null
          uploader_id?: string
          url?: string | null
          view_count?: number | null
          width?: number | null
        }
        Relationships: [
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
            foreignKeyName: "media_assets_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
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
            foreignKeyName: "media_assets_transcript_id_fkey"
            columns: ["transcript_id"]
            isOneToOne: false
            referencedRelation: "transcripts"
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
          created_at: string | null
          id: string
          media_asset_id: string
          ordinal_position: number | null
          used_in_id: string
          used_in_type: string
          usage_context: string | null
          usage_role: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          media_asset_id: string
          ordinal_position?: number | null
          used_in_id: string
          used_in_type: string
          usage_context?: string | null
          usage_role?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          media_asset_id?: string
          ordinal_position?: number | null
          used_in_id?: string
          used_in_type?: string
          usage_context?: string | null
          usage_role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "media_usage_tracking_media_asset_id_fkey"
            columns: ["media_asset_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_logs: {
        Row: {
          auto_resolved: boolean | null
          created_at: string | null
          description: string | null
          id: string
          impact_level: string | null
          notification_type: string
          profile_id: string
          project_id: string | null
          read_at: string | null
          resolved_at: string | null
          resolved_by: string | null
          tenant_id: string
          title: string
        }
        Insert: {
          auto_resolved?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          impact_level?: string | null
          notification_type: string
          profile_id: string
          project_id?: string | null
          read_at?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          tenant_id: string
          title: string
        }
        Update: {
          auto_resolved?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          impact_level?: string | null
          notification_type?: string
          profile_id?: string
          project_id?: string | null
          read_at?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          tenant_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_logs_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_logs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_logs_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_analytics"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "notification_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          joined_at: string | null
          organization_id: string
          profile_id: string
          role: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          joined_at?: string | null
          organization_id: string
          profile_id: string
          role?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          joined_at?: string | null
          organization_id?: string
          profile_id?: string
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organisations: {
        Row: {
          contact_email: string | null
          contact_person: string | null
          contact_phone: string | null
          created_at: string
          cultural_significance: string | null
          description: string | null
          id: string
          location: string | null
          logo_url: string | null
          member_count: number | null
          name: string
          organization_type: string | null
          slug: string
          status: string | null
          type: string | null
          website_url: string | null
        }
        Insert: {
          contact_email?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string
          cultural_significance?: string | null
          description?: string | null
          id?: string
          location?: string | null
          logo_url?: string | null
          member_count?: number | null
          name: string
          organization_type?: string | null
          slug: string
          status?: string | null
          type?: string | null
          website_url?: string | null
        }
        Update: {
          contact_email?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string
          cultural_significance?: string | null
          description?: string | null
          id?: string
          location?: string | null
          logo_url?: string | null
          member_count?: number | null
          name?: string
          organization_type?: string | null
          slug?: string
          status?: string | null
          type?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      photo_gallery_items: {
        Row: {
          alt_text: string | null
          caption: string | null
          created_at: string | null
          cultural_context: string | null
          gallery_id: string
          id: string
          is_cover_image: boolean | null
          photographer: string | null
          sort_order: number | null
          url: string
        }
        Insert: {
          alt_text?: string | null
          caption?: string | null
          created_at?: string | null
          cultural_context?: string | null
          gallery_id: string
          id?: string
          is_cover_image?: boolean | null
          photographer?: string | null
          sort_order?: number | null
          url: string
        }
        Update: {
          alt_text?: string | null
          caption?: string | null
          created_at?: string | null
          cultural_context?: string | null
          gallery_id?: string
          id?: string
          is_cover_image?: boolean | null
          photographer?: string | null
          sort_order?: number | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "photo_gallery_items_gallery_id_fkey"
            columns: ["gallery_id"]
            isOneToOne: false
            referencedRelation: "galleries"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_locations: {
        Row: {
          created_at: string | null
          id: string
          is_primary: boolean | null
          location_id: string
          location_type: string | null
          profile_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          location_id: string
          location_type?: string | null
          profile_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          location_id?: string
          location_type?: string | null
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_locations_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_locations_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_organizations: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          joined_at: string | null
          organization_id: string
          profile_id: string
          role: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          joined_at?: string | null
          organization_id: string
          profile_id: string
          role?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          joined_at?: string | null
          organization_id?: string
          profile_id?: string
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_organizations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_organizations_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_projects: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          joined_at: string | null
          profile_id: string
          project_id: string
          role: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          joined_at?: string | null
          profile_id: string
          project_id: string
          role?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          joined_at?: string | null
          profile_id?: string
          project_id?: string
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_projects_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_projects_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          accessibility_needs: string[] | null
          address: Json | null
          avatar_url: string | null
          bio: string | null
          consent_preferences: Json | null
          created_at: string
          cultural_affiliations: string[] | null
          cultural_background: string | null
          cultural_permissions: Json | null
          date_of_birth: string | null
          dietary_requirements: string[] | null
          display_name: string | null
          email: string
          emergency_contact: Json | null
          first_name: string | null
          full_name: string | null
          id: string
          interests: string[] | null
          is_elder: boolean
          is_featured: boolean | null
          is_storyteller: boolean
          languages_spoken: string[] | null
          last_name: string | null
          notification_preferences: Json | null
          occupation: string | null
          onboarding_completed: boolean
          phone: string | null
          preferences: Json | null
          preferred_communication: string[] | null
          preferred_name: string | null
          privacy_settings: Json | null
          profile_image_url: string | null
          profile_visibility: string
          pronouns: string | null
          social_links: Json | null
          storytelling_experience: string | null
          super_admin: boolean | null
          tenant_id: string | null
          timezone: string | null
          updated_at: string
          verification_status: string | null
          video_intro_url: string | null
          // Enhanced storyteller properties
          impact_focus_areas: string[] | null
          expertise_areas: string[] | null
          collaboration_preferences: Json | null
          storytelling_methods: string[] | null
          community_roles: string[] | null
          change_maker_type: string | null
          geographic_scope: string | null
          years_of_community_work: number | null
          mentor_availability: boolean | null
          speaking_availability: boolean | null
        }
        Insert: {
          accessibility_needs?: string[] | null
          address?: Json | null
          avatar_url?: string | null
          bio?: string | null
          consent_preferences?: Json | null
          created_at?: string
          cultural_affiliations?: string[] | null
          cultural_background?: string | null
          cultural_permissions?: Json | null
          date_of_birth?: string | null
          dietary_requirements?: string[] | null
          display_name?: string | null
          email: string
          emergency_contact?: Json | null
          first_name?: string | null
          full_name?: string | null
          id?: string
          interests?: string[] | null
          is_elder?: boolean
          is_featured?: boolean | null
          is_storyteller?: boolean
          languages_spoken?: string[] | null
          last_name?: string | null
          notification_preferences?: Json | null
          occupation?: string | null
          onboarding_completed?: boolean
          phone?: string | null
          preferences?: Json | null
          preferred_communication?: string[] | null
          preferred_name?: string | null
          privacy_settings?: Json | null
          profile_image_url?: string | null
          profile_visibility?: string
          pronouns?: string | null
          social_links?: Json | null
          storytelling_experience?: string | null
          super_admin?: boolean | null
          tenant_id?: string | null
          timezone?: string | null
          updated_at?: string
          verification_status?: string | null
          video_intro_url?: string | null
          // Enhanced storyteller properties
          impact_focus_areas?: string[] | null
          expertise_areas?: string[] | null
          collaboration_preferences?: Json | null
          storytelling_methods?: string[] | null
          community_roles?: string[] | null
          change_maker_type?: string | null
          geographic_scope?: string | null
          years_of_community_work?: number | null
          mentor_availability?: boolean | null
          speaking_availability?: boolean | null
        }
        Update: {
          accessibility_needs?: string[] | null
          address?: Json | null
          avatar_url?: string | null
          bio?: string | null
          consent_preferences?: Json | null
          created_at?: string
          cultural_affiliations?: string[] | null
          cultural_background?: string | null
          cultural_permissions?: Json | null
          date_of_birth?: string | null
          dietary_requirements?: string[] | null
          display_name?: string | null
          email?: string
          emergency_contact?: Json | null
          first_name?: string | null
          full_name?: string | null
          id?: string
          interests?: string[] | null
          is_elder?: boolean
          is_featured?: boolean | null
          is_storyteller?: boolean
          languages_spoken?: string[] | null
          last_name?: string | null
          notification_preferences?: Json | null
          occupation?: string | null
          onboarding_completed?: boolean
          phone?: string | null
          preferences?: Json | null
          preferred_communication?: string[] | null
          preferred_name?: string | null
          privacy_settings?: Json | null
          profile_image_url?: string | null
          profile_visibility?: string
          pronouns?: string | null
          social_links?: Json | null
          storytelling_experience?: string | null
          super_admin?: boolean | null
          tenant_id?: string | null
          timezone?: string | null
          updated_at?: string
          verification_status?: string | null
          video_intro_url?: string | null
          // Enhanced storyteller properties
          impact_focus_areas?: string[] | null
          expertise_areas?: string[] | null
          collaboration_preferences?: Json | null
          storytelling_methods?: string[] | null
          community_roles?: string[] | null
          change_maker_type?: string | null
          geographic_scope?: string | null
          years_of_community_work?: number | null
          mentor_availability?: boolean | null
          speaking_availability?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_analytics"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "profiles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      storyteller_impact_metrics: {
        Row: {
          id: string
          storyteller_id: string
          tenant_id: string
          community_engagement_score: number | null
          cultural_preservation_score: number | null
          system_change_influence_score: number | null
          mentorship_impact_score: number | null
          cross_sector_collaboration_score: number | null
          stories_created_count: number | null
          transcripts_analyzed_count: number | null
          communities_reached_count: number | null
          organizations_collaborated_count: number | null
          mentees_supported_count: number | null
          speaking_engagements_count: number | null
          documented_outcomes: string[] | null
          policy_influences: string[] | null
          community_feedback: Json | null
          measurement_period_start: string
          measurement_period_end: string
          calculated_at: string | null
          calculation_method: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          storyteller_id: string
          tenant_id: string
          community_engagement_score?: number | null
          cultural_preservation_score?: number | null
          system_change_influence_score?: number | null
          mentorship_impact_score?: number | null
          cross_sector_collaboration_score?: number | null
          stories_created_count?: number | null
          transcripts_analyzed_count?: number | null
          communities_reached_count?: number | null
          organizations_collaborated_count?: number | null
          mentees_supported_count?: number | null
          speaking_engagements_count?: number | null
          documented_outcomes?: string[] | null
          policy_influences?: string[] | null
          community_feedback?: Json | null
          measurement_period_start: string
          measurement_period_end: string
          calculated_at?: string | null
          calculation_method?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          storyteller_id?: string
          tenant_id?: string
          community_engagement_score?: number | null
          cultural_preservation_score?: number | null
          system_change_influence_score?: number | null
          mentorship_impact_score?: number | null
          cross_sector_collaboration_score?: number | null
          stories_created_count?: number | null
          transcripts_analyzed_count?: number | null
          communities_reached_count?: number | null
          organizations_collaborated_count?: number | null
          mentees_supported_count?: number | null
          speaking_engagements_count?: number | null
          documented_outcomes?: string[] | null
          policy_influences?: string[] | null
          community_feedback?: Json | null
          measurement_period_start?: string
          measurement_period_end?: string
          calculated_at?: string | null
          calculation_method?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "storyteller_impact_metrics_storyteller_id_fkey"
            columns: ["storyteller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      cross_sector_insights: {
        Row: {
          id: string
          tenant_id: string
          primary_sector: string
          secondary_sector: string
          storyteller_connections: Json | null
          shared_themes: string[] | null
          collaboration_opportunities: string[] | null
          combined_impact_potential: number | null
          resource_sharing_opportunities: string[] | null
          policy_change_potential: string[] | null
          supporting_stories: string[] | null
          ai_confidence_score: number | null
          human_verified: boolean | null
          verification_notes: string | null
          geographic_regions: string[] | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          primary_sector: string
          secondary_sector: string
          storyteller_connections?: Json | null
          shared_themes?: string[] | null
          collaboration_opportunities?: string[] | null
          combined_impact_potential?: number | null
          resource_sharing_opportunities?: string[] | null
          policy_change_potential?: string[] | null
          supporting_stories?: string[] | null
          ai_confidence_score?: number | null
          human_verified?: boolean | null
          verification_notes?: string | null
          geographic_regions?: string[] | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string
          primary_sector?: string
          secondary_sector?: string
          storyteller_connections?: Json | null
          shared_themes?: string[] | null
          collaboration_opportunities?: string[] | null
          combined_impact_potential?: number | null
          resource_sharing_opportunities?: string[] | null
          policy_change_potential?: string[] | null
          supporting_stories?: string[] | null
          ai_confidence_score?: number | null
          human_verified?: boolean | null
          verification_notes?: string | null
          geographic_regions?: string[] | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      geographic_impact_patterns: {
        Row: {
          id: string
          tenant_id: string
          location_id: string | null
          geographic_scope: string
          region_name: string
          primary_themes: string[] | null
          storyteller_density: number | null
          community_engagement_level: string | null
          emerging_issues: string[] | null
          success_patterns: string[] | null
          resource_needs: string[] | null
          collaboration_networks: Json | null
          theme_evolution_data: Json | null
          impact_trajectory: string | null
          supporting_storytellers: string[] | null
          key_stories: string[] | null
          ai_analysis_confidence: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          location_id?: string | null
          geographic_scope: string
          region_name: string
          primary_themes?: string[] | null
          storyteller_density?: number | null
          community_engagement_level?: string | null
          emerging_issues?: string[] | null
          success_patterns?: string[] | null
          resource_needs?: string[] | null
          collaboration_networks?: Json | null
          theme_evolution_data?: Json | null
          impact_trajectory?: string | null
          supporting_storytellers?: string[] | null
          key_stories?: string[] | null
          ai_analysis_confidence?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string
          location_id?: string | null
          geographic_scope?: string
          region_name?: string
          primary_themes?: string[] | null
          storyteller_density?: number | null
          community_engagement_level?: string | null
          emerging_issues?: string[] | null
          success_patterns?: string[] | null
          resource_needs?: string[] | null
          collaboration_networks?: Json | null
          theme_evolution_data?: Json | null
          impact_trajectory?: string | null
          supporting_storytellers?: string[] | null
          key_stories?: string[] | null
          ai_analysis_confidence?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "geographic_impact_patterns_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          }
        ]
      }
      theme_evolution_tracking: {
        Row: {
          id: string
          tenant_id: string
          theme_name: string
          theme_category: string | null
          first_appearance: string
          peak_prominence_date: string | null
          current_frequency_score: number | null
          trend_direction: string | null
          related_themes: string[] | null
          storyteller_contributors: string[] | null
          geographic_distribution: Json | null
          community_response_indicators: string[] | null
          policy_influence_events: string[] | null
          resource_mobilization_evidence: string[] | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          theme_name: string
          theme_category?: string | null
          first_appearance: string
          peak_prominence_date?: string | null
          current_frequency_score?: number | null
          trend_direction?: string | null
          related_themes?: string[] | null
          storyteller_contributors?: string[] | null
          geographic_distribution?: Json | null
          community_response_indicators?: string[] | null
          policy_influence_events?: string[] | null
          resource_mobilization_evidence?: string[] | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string
          theme_name?: string
          theme_category?: string | null
          first_appearance?: string
          peak_prominence_date?: string | null
          current_frequency_score?: number | null
          trend_direction?: string | null
          related_themes?: string[] | null
          storyteller_contributors?: string[] | null
          geographic_distribution?: Json | null
          community_response_indicators?: string[] | null
          policy_influence_events?: string[] | null
          resource_mobilization_evidence?: string[] | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      project_participants: {
        Row: {
          created_at: string | null
          id: string
          joined_at: string | null
          project_id: string
          role: string | null
          storyteller_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          joined_at?: string | null
          project_id: string
          role?: string | null
          storyteller_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          joined_at?: string | null
          project_id?: string
          role?: string | null
          storyteller_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_participants_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_participants_storyteller_id_fkey"
            columns: ["storyteller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string
          name: string
          organization_id: string | null
          start_date: string | null
          status: string | null
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          organization_id?: string | null
          start_date?: string | null
          status?: string | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          organization_id?: string | null
          start_date?: string | null
          status?: string | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_analytics"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "projects_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      stories: {
        Row: {
          audio_url: string | null
          co_authors: string[] | null
          consent_verified: boolean | null
          consent_verified_at: string | null
          content: string
          created_at: string
          cultural_context: Json | null
          cultural_permissions: Json | null
          cultural_sensitivity_level: string | null
          cultural_tags: string[] | null
          description: string | null
          file_size: number | null
          gallery_id: string | null
          has_consent: boolean | null
          id: string
          is_featured: boolean | null
          is_public: boolean | null
          keywords: string[] | null
          language: string | null
          length: number | null
          linked_media: string[] | null
          location: Json | null
          organization_id: string | null
          privacy_level: string | null
          project_id: string | null
          published_at: string | null
          slug: string
          status: string | null
          story_image_url: string | null
          storyteller_id: string
          storytelling_session_location: string | null
          subtitle: string | null
          summary: string | null
          tenant_id: string | null
          themes: string[] | null
          title: string
          transcript_id: string | null
          updated_at: string
          video_story_link: string | null
          visibility: string | null
        }
        Insert: {
          audio_url?: string | null
          co_authors?: string[] | null
          consent_verified?: boolean | null
          consent_verified_at?: string | null
          content: string
          created_at?: string
          cultural_context?: Json | null
          cultural_permissions?: Json | null
          cultural_sensitivity_level?: string | null
          cultural_tags?: string[] | null
          description?: string | null
          file_size?: number | null
          gallery_id?: string | null
          has_consent?: boolean | null
          id?: string
          is_featured?: boolean | null
          is_public?: boolean | null
          keywords?: string[] | null
          language?: string | null
          length?: number | null
          linked_media?: string[] | null
          location?: Json | null
          organization_id?: string | null
          privacy_level?: string | null
          project_id?: string | null
          published_at?: string | null
          slug: string
          status?: string | null
          story_image_url?: string | null
          storyteller_id: string
          storytelling_session_location?: string | null
          subtitle?: string | null
          summary?: string | null
          tenant_id?: string | null
          themes?: string[] | null
          title: string
          transcript_id?: string | null
          updated_at?: string
          video_story_link?: string | null
          visibility?: string | null
        }
        Update: {
          audio_url?: string | null
          co_authors?: string[] | null
          consent_verified?: boolean | null
          consent_verified_at?: string | null
          content?: string
          created_at?: string
          cultural_context?: Json | null
          cultural_permissions?: Json | null
          cultural_sensitivity_level?: string | null
          cultural_tags?: string[] | null
          description?: string | null
          file_size?: number | null
          gallery_id?: string | null
          has_consent?: boolean | null
          id?: string
          is_featured?: boolean | null
          is_public?: boolean | null
          keywords?: string[] | null
          language?: string | null
          length?: number | null
          linked_media?: string[] | null
          location?: Json | null
          organization_id?: string | null
          privacy_level?: string | null
          project_id?: string | null
          published_at?: string | null
          slug?: string
          status?: string | null
          story_image_url?: string | null
          storyteller_id?: string
          storytelling_session_location?: string | null
          subtitle?: string | null
          summary?: string | null
          tenant_id?: string | null
          themes?: string[] | null
          title?: string
          transcript_id?: string | null
          updated_at?: string
          video_story_link?: string | null
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stories_gallery_id_fkey"
            columns: ["gallery_id"]
            isOneToOne: false
            referencedRelation: "galleries"
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
          {
            foreignKeyName: "stories_transcript_id_fkey"
            columns: ["transcript_id"]
            isOneToOne: false
            referencedRelation: "transcripts"
            referencedColumns: ["id"]
          },
        ]
      }
      storytellers: {
        Row: {
          bio: string | null
          created_at: string
          cultural_background: string | null
          date_of_birth: string | null
          email: string
          first_name: string
          is_elder: boolean | null
          is_featured: boolean | null
          last_name: string
          languages_spoken: string[] | null
          location: string | null
          profile_image_url: string | null
          specialties: string[] | null
          updated_at: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          cultural_background?: string | null
          date_of_birth?: string | null
          email: string
          first_name: string
          is_elder?: boolean | null
          is_featured?: boolean | null
          last_name: string
          languages_spoken?: string[] | null
          location?: string | null
          profile_image_url?: string | null
          specialties?: string[] | null
          updated_at?: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          cultural_background?: string | null
          date_of_birth?: string | null
          email?: string
          first_name?: string
          is_elder?: boolean | null
          is_featured?: boolean | null
          last_name?: string
          languages_spoken?: string[] | null
          location?: string | null
          profile_image_url?: string | null
          specialties?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          attachment_url: string | null
          created_at: string | null
          description: string
          id: string
          priority: string | null
          profile_id: string
          resolved_at: string | null
          resolved_by: string | null
          status: string | null
          subject: string
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          attachment_url?: string | null
          created_at?: string | null
          description: string
          id?: string
          priority?: string | null
          profile_id: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string | null
          subject: string
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          attachment_url?: string | null
          created_at?: string | null
          description?: string
          id?: string
          priority?: string | null
          profile_id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string | null
          subject?: string
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_analytics"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "support_tickets_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          api_key_hash: string | null
          billing_contact_email: string | null
          created_at: string | null
          cultural_protocols: Json | null
          id: string
          name: string
          organization_id: string | null
          status: string | null
          subscription_level: string | null
          updated_at: string | null
        }
        Insert: {
          api_key_hash?: string | null
          billing_contact_email?: string | null
          created_at?: string | null
          cultural_protocols?: Json | null
          id?: string
          name: string
          organization_id?: string | null
          status?: string | null
          subscription_level?: string | null
          updated_at?: string | null
        }
        Update: {
          api_key_hash?: string | null
          billing_contact_email?: string | null
          created_at?: string | null
          cultural_protocols?: Json | null
          id?: string
          name?: string
          organization_id?: string | null
          status?: string | null
          subscription_level?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenants_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      transcripts: {
        Row: {
          audio_url: string | null
          created_at: string
          cultural_context: Json | null
          cultural_sensitivity_level: string | null
          description: string | null
          duration: number | null
          file_size: number | null
          id: string
          interviewer: string | null
          is_ai_processed: boolean | null
          is_transcribed: boolean | null
          language: string | null
          location: string | null
          organization_id: string | null
          processed_at: string | null
          project_id: string | null
          session_date: string | null
          status: string | null
          storyteller_id: string
          tenant_id: string | null
          title: string
          transcript_text: string | null
          updated_at: string
        }
        Insert: {
          audio_url?: string | null
          created_at?: string
          cultural_context?: Json | null
          cultural_sensitivity_level?: string | null
          description?: string | null
          duration?: number | null
          file_size?: number | null
          id?: string
          interviewer?: string | null
          is_ai_processed?: boolean | null
          is_transcribed?: boolean | null
          language?: string | null
          location?: string | null
          organization_id?: string | null
          processed_at?: string | null
          project_id?: string | null
          session_date?: string | null
          status?: string | null
          storyteller_id: string
          tenant_id?: string | null
          title: string
          transcript_text?: string | null
          updated_at?: string
        }
        Update: {
          audio_url?: string | null
          created_at?: string
          cultural_context?: Json | null
          cultural_sensitivity_level?: string | null
          description?: string | null
          duration?: number | null
          file_size?: number | null
          id?: string
          interviewer?: string | null
          is_ai_processed?: boolean | null
          is_transcribed?: boolean | null
          language?: string | null
          location?: string | null
          organization_id?: string | null
          processed_at?: string | null
          project_id?: string | null
          session_date?: string | null
          status?: string | null
          storyteller_id?: string
          tenant_id?: string | null
          title?: string
          transcript_text?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transcripts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transcripts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
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
      user_reports: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          profile_id: string
          reason: string
          reported_by: string
          resolved_at: string | null
          resolved_by: string | null
          severity: string | null
          status: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          profile_id: string
          reason: string
          reported_by: string
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string | null
          status?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          profile_id?: string
          reason?: string
          reported_by?: string
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string | null
          status?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_reports_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_reports_reported_by_fkey"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_reports_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_reports_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_analytics"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "user_reports_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      user_sessions: {
        Row: {
          activity_data: Json | null
          browser_info: string | null
          created_at: string | null
          ended_at: string | null
          id: string
          ip_address: unknown | null
          last_activity: string | null
          profile_id: string
          session_duration: number | null
          tenant_id: string
        }
        Insert: {
          activity_data?: Json | null
          browser_info?: string | null
          created_at?: string | null
          ended_at?: string | null
          id?: string
          ip_address?: unknown | null
          last_activity?: string | null
          profile_id: string
          session_duration?: number | null
          tenant_id: string
        }
        Update: {
          activity_data?: Json | null
          browser_info?: string | null
          created_at?: string | null
          ended_at?: string | null
          id?: string
          ip_address?: unknown | null
          last_activity?: string | null
          profile_id?: string
          session_duration?: number | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_sessions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_analytics"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "user_sessions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      tenant_analytics: {
        Row: {
          active_users: number | null
          organizations_count: number | null
          projects_count: number | null
          stories_count: number | null
          tenant_id: string | null
          tenant_name: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_tenant_analytics: {
        Args: {
          tenant_uuid: string
        }
        Returns: {
          active_users: number
          organizations_count: number
          projects_count: number
          stories_count: number
        }[]
      }
      get_media_usage_details: {
        Args: Record<PropertyKey, never>
        Returns: {
          media_asset_id: string
          filename: string
          used_in_type: string
          used_in_id: string
          usage_context: string
          usage_role: string
        }[]
      }
      get_organization_stats: {
        Args: {
          org_id: string
        }
        Returns: {
          total_members: number
          active_projects: number
          total_stories: number
          total_media: number
        }[]
      }
      search_media: {
        Args: {
          query: string
        }
        Returns: {
          id: string
          title: string
          description: string
          media_type: string
          url: string
          rank: number
        }[]
      }
      search_quotes: {
        Args: {
          query: string
        }
        Returns: {
          id: string
          quote_text: string
          author_name: string
          context: string
          themes: string[]
          rank: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never