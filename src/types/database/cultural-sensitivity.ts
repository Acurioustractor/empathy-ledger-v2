import { Json } from './base'

export interface CulturalSensitivityTables {
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
}