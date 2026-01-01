import { Json } from './base'

export interface LocationEventsTables {
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
}