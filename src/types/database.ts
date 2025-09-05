export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          email: string
          first_name: string | null
          last_name: string | null
          display_name: string | null
          bio: string | null
          avatar_url: string | null
          phone: string | null
          date_of_birth: string | null
          address: Json | null
          cultural_affiliations: string[] | null
          languages_spoken: string[] | null
          preferred_name: string | null
          pronouns: string | null
          occupation: string | null
          interests: string[] | null
          cultural_background: string | null
          storytelling_experience: string | null
          consent_preferences: Json | null
          privacy_settings: Json | null
          onboarding_completed: boolean
          is_storyteller: boolean
          is_elder: boolean
          cultural_permissions: Json | null
          profile_visibility: 'public' | 'community' | 'private'
          social_links: Json | null
          emergency_contact: Json | null
          dietary_requirements: string[] | null
          accessibility_needs: string[] | null
          preferred_communication: string[] | null
          timezone: string | null
          notification_preferences: Json | null
          cultural_protocols: Json | null
          traditional_knowledge_keeper: boolean
          community_roles: string[] | null
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          email: string
          first_name?: string | null
          last_name?: string | null
          display_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          phone?: string | null
          date_of_birth?: string | null
          address?: Json | null
          cultural_affiliations?: string[] | null
          languages_spoken?: string[] | null
          preferred_name?: string | null
          pronouns?: string | null
          occupation?: string | null
          interests?: string[] | null
          cultural_background?: string | null
          storytelling_experience?: string | null
          consent_preferences?: Json | null
          privacy_settings?: Json | null
          onboarding_completed?: boolean
          is_storyteller?: boolean
          is_elder?: boolean
          cultural_permissions?: Json | null
          profile_visibility?: 'public' | 'community' | 'private'
          social_links?: Json | null
          emergency_contact?: Json | null
          dietary_requirements?: string[] | null
          accessibility_needs?: string[] | null
          preferred_communication?: string[] | null
          timezone?: string | null
          notification_preferences?: Json | null
          cultural_protocols?: Json | null
          traditional_knowledge_keeper?: boolean
          community_roles?: string[] | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          display_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          phone?: string | null
          date_of_birth?: string | null
          address?: Json | null
          cultural_affiliations?: string[] | null
          languages_spoken?: string[] | null
          preferred_name?: string | null
          pronouns?: string | null
          occupation?: string | null
          interests?: string[] | null
          cultural_background?: string | null
          storytelling_experience?: string | null
          consent_preferences?: Json | null
          privacy_settings?: Json | null
          onboarding_completed?: boolean
          is_storyteller?: boolean
          is_elder?: boolean
          cultural_permissions?: Json | null
          profile_visibility?: 'public' | 'community' | 'private'
          social_links?: Json | null
          emergency_contact?: Json | null
          dietary_requirements?: string[] | null
          accessibility_needs?: string[] | null
          preferred_communication?: string[] | null
          timezone?: string | null
          notification_preferences?: Json | null
          cultural_protocols?: Json | null
          traditional_knowledge_keeper?: boolean
          community_roles?: string[] | null
        }
        Relationships: []
      }
      storytellers: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          profile_id: string
          display_name: string
          bio: string | null
          cultural_background: string | null
          specialties: string[] | null
          years_of_experience: number | null
          preferred_topics: string[] | null
          story_count: number
          featured: boolean
          status: 'active' | 'inactive' | 'pending'
          availability: Json | null
          cultural_protocols: Json | null
          elder_status: boolean
          community_recognition: Json | null
          storytelling_style: string[] | null
          performance_preferences: Json | null
          compensation_preferences: Json | null
          travel_availability: Json | null
          technical_requirements: Json | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          profile_id: string
          display_name: string
          bio?: string | null
          cultural_background?: string | null
          specialties?: string[] | null
          years_of_experience?: number | null
          preferred_topics?: string[] | null
          story_count?: number
          featured?: boolean
          status?: 'active' | 'inactive' | 'pending'
          availability?: Json | null
          cultural_protocols?: Json | null
          elder_status?: boolean
          community_recognition?: Json | null
          storytelling_style?: string[] | null
          performance_preferences?: Json | null
          compensation_preferences?: Json | null
          travel_availability?: Json | null
          technical_requirements?: Json | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          profile_id?: string
          display_name?: string
          bio?: string | null
          cultural_background?: string | null
          specialties?: string[] | null
          years_of_experience?: number | null
          preferred_topics?: string[] | null
          story_count?: number
          featured?: boolean
          status?: 'active' | 'inactive' | 'pending'
          availability?: Json | null
          cultural_protocols?: Json | null
          elder_status?: boolean
          community_recognition?: Json | null
          storytelling_style?: string[] | null
          performance_preferences?: Json | null
          compensation_preferences?: Json | null
          travel_availability?: Json | null
          technical_requirements?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "storytellers_profile_id_fkey"
            columns: ["profile_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      stories: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          title: string
          content: string
          storyteller_id: string | null
          author_id: string
          status: 'draft' | 'review' | 'published' | 'archived'
          featured: boolean
          cultural_context: Json | null
          tags: string[] | null
          location: string | null
          story_type: 'traditional' | 'personal' | 'historical' | 'educational' | 'healing'
          audience: 'children' | 'youth' | 'adults' | 'elders' | 'all'
          cultural_permissions: Json | null
          consent_status: 'pending' | 'granted' | 'denied' | 'expired'
          media_attachments: Json | null
          transcript_id: string | null
          views_count: number
          likes_count: number
          shares_count: number
          reading_time_minutes: number | null
          language: string
          cultural_sensitivity_level: 'low' | 'medium' | 'high'
          elder_approval: boolean | null
          cultural_review_status: 'pending' | 'approved' | 'rejected' | 'needs_changes'
          publication_date: string | null
          archival_date: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          title: string
          content: string
          storyteller_id?: string | null
          author_id: string
          status?: 'draft' | 'review' | 'published' | 'archived'
          featured?: boolean
          cultural_context?: Json | null
          tags?: string[] | null
          location?: string | null
          story_type?: 'traditional' | 'personal' | 'historical' | 'educational' | 'healing'
          audience?: 'children' | 'youth' | 'adults' | 'elders' | 'all'
          cultural_permissions?: Json | null
          consent_status?: 'pending' | 'granted' | 'denied' | 'expired'
          media_attachments?: Json | null
          transcript_id?: string | null
          views_count?: number
          likes_count?: number
          shares_count?: number
          reading_time_minutes?: number | null
          language?: string
          cultural_sensitivity_level?: 'low' | 'medium' | 'high'
          elder_approval?: boolean | null
          cultural_review_status?: 'pending' | 'approved' | 'rejected' | 'needs_changes'
          publication_date?: string | null
          archival_date?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          title?: string
          content?: string
          storyteller_id?: string | null
          author_id?: string
          status?: 'draft' | 'review' | 'published' | 'archived'
          featured?: boolean
          cultural_context?: Json | null
          tags?: string[] | null
          location?: string | null
          story_type?: 'traditional' | 'personal' | 'historical' | 'educational' | 'healing'
          audience?: 'children' | 'youth' | 'adults' | 'elders' | 'all'
          cultural_permissions?: Json | null
          consent_status?: 'pending' | 'granted' | 'denied' | 'expired'
          media_attachments?: Json | null
          transcript_id?: string | null
          views_count?: number
          likes_count?: number
          shares_count?: number
          reading_time_minutes?: number | null
          language?: string
          cultural_sensitivity_level?: 'low' | 'medium' | 'high'
          elder_approval?: boolean | null
          cultural_review_status?: 'pending' | 'approved' | 'rejected' | 'needs_changes'
          publication_date?: string | null
          archival_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stories_storyteller_id_fkey"
            columns: ["storyteller_id"]
            referencedRelation: "storytellers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stories_author_id_fkey"
            columns: ["author_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      organizations: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          slug: string
          description: string | null
          website: string | null
          contact_email: string | null
          phone: string | null
          address: Json | null
          cultural_focus: string[] | null
          organization_type: 'cultural_center' | 'education' | 'museum' | 'community' | 'research' | 'government'
          status: 'active' | 'inactive' | 'pending'
          verification_status: 'unverified' | 'pending' | 'verified'
          cultural_protocols: Json | null
          logo_url: string | null
          banner_url: string | null
          social_links: Json | null
          member_count: number
          story_count: number
          storyteller_count: number
          settings: Json | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          slug: string
          description?: string | null
          website?: string | null
          contact_email?: string | null
          phone?: string | null
          address?: Json | null
          cultural_focus?: string[] | null
          organization_type?: 'cultural_center' | 'education' | 'museum' | 'community' | 'research' | 'government'
          status?: 'active' | 'inactive' | 'pending'
          verification_status?: 'unverified' | 'pending' | 'verified'
          cultural_protocols?: Json | null
          logo_url?: string | null
          banner_url?: string | null
          social_links?: Json | null
          member_count?: number
          story_count?: number
          storyteller_count?: number
          settings?: Json | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          slug?: string
          description?: string | null
          website?: string | null
          contact_email?: string | null
          phone?: string | null
          address?: Json | null
          cultural_focus?: string[] | null
          organization_type?: 'cultural_center' | 'education' | 'museum' | 'community' | 'research' | 'government'
          status?: 'active' | 'inactive' | 'pending'
          verification_status?: 'unverified' | 'pending' | 'verified'
          cultural_protocols?: Json | null
          logo_url?: string | null
          banner_url?: string | null
          social_links?: Json | null
          member_count?: number
          story_count?: number
          storyteller_count?: number
          settings?: Json | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Convenience types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Storyteller = Database['public']['Tables']['storytellers']['Row']
export type Story = Database['public']['Tables']['stories']['Row']
export type Organization = Database['public']['Tables']['organizations']['Row']

export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type StorytellerInsert = Database['public']['Tables']['storytellers']['Insert']
export type StoryInsert = Database['public']['Tables']['stories']['Insert']
export type OrganizationInsert = Database['public']['Tables']['organizations']['Insert']

export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
export type StorytellerUpdate = Database['public']['Tables']['storytellers']['Update']
export type StoryUpdate = Database['public']['Tables']['stories']['Update']
export type OrganizationUpdate = Database['public']['Tables']['organizations']['Update']

// Cultural and consent-specific types
export interface ConsentPreferences {
  storytelling: boolean
  photography: boolean
  video_recording: boolean
  audio_recording: boolean
  written_stories: boolean
  public_sharing: boolean
  commercial_use: boolean
  educational_use: boolean
  research_participation: boolean
  contact_preferences: {
    email: boolean
    phone: boolean
    postal: boolean
  }
  cultural_sharing_permissions: {
    traditional_knowledge: boolean
    cultural_practices: boolean
    ceremonial_content: boolean
    family_stories: boolean
  }
  data_retention_preference: 'indefinite' | 'limited' | 'request_deletion'
  third_party_sharing: boolean
  anonymization_preference: 'full_name' | 'first_name_only' | 'anonymous'
}

export interface PrivacySettings {
  profile_visibility: 'public' | 'community' | 'private'
  story_visibility: 'public' | 'community' | 'private'
  contact_visibility: 'public' | 'community' | 'private'
  cultural_info_visibility: 'public' | 'community' | 'private'
  show_real_name: boolean
  show_location: boolean
  show_cultural_background: boolean
  allow_story_comments: boolean
  allow_profile_messages: boolean
  allow_search_indexing: boolean
}

export interface CulturalPermissions {
  can_share_traditional_stories: boolean
  can_share_ceremonial_content: boolean
  can_represent_community: boolean
  elder_approval_required: boolean
  cultural_review_required: boolean
  restricted_audiences: string[]
  cultural_protocols: {
    gender_specific: boolean
    age_restricted: boolean
    community_specific: boolean
    seasonal_restrictions: boolean
  }
}