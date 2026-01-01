import { Json } from './base'

export interface UserProfileTables {
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