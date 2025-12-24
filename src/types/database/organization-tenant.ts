import { Json } from './base'

export interface OrganizationTenantTables {
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
      tenant_id: string | null
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
      tenant_id?: string | null
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
      tenant_id?: string | null
      type?: string | null
      website_url?: string | null
    }
    Relationships: []
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
  tenant_members: {
    Row: {
      created_at: string | null
      id: string
      is_active: boolean | null
      profile_id: string
      role: string | null
      tenant_id: string
      updated_at: string | null
    }
    Insert: {
      created_at?: string | null
      id?: string
      is_active?: boolean | null
      profile_id: string
      role?: string | null
      tenant_id: string
      updated_at?: string | null
    }
    Update: {
      created_at?: string | null
      id?: string
      is_active?: boolean | null
      profile_id?: string
      role?: string | null
      tenant_id?: string
      updated_at?: string | null
    }
    Relationships: [
      {
        foreignKeyName: "tenant_members_tenant_id_fkey"
        columns: ["tenant_id"]
        isOneToOne: false
        referencedRelation: "tenants"
        referencedColumns: ["id"]
      },
      {
        foreignKeyName: "tenant_members_profile_id_fkey"
        columns: ["profile_id"]
        isOneToOne: false
        referencedRelation: "profiles"
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
      data_region: string | null
      description: string | null
      id: string
      is_default: boolean | null
      location: string | null
      name: string
      organization_id: string | null
      slug: string | null
      status: string | null
      subscription_level: string | null
      updated_at: string | null
      contact_email: string | null
      website_url: string | null
    }
    Insert: {
      api_key_hash?: string | null
      billing_contact_email?: string | null
      created_at?: string | null
      cultural_protocols?: Json | null
      data_region?: string | null
      description?: string | null
      id?: string
      is_default?: boolean | null
      location?: string | null
      name: string
      organization_id?: string | null
      slug?: string | null
      status?: string | null
      subscription_level?: string | null
      updated_at?: string | null
      contact_email?: string | null
      website_url?: string | null
    }
    Update: {
      api_key_hash?: string | null
      billing_contact_email?: string | null
      created_at?: string | null
      cultural_protocols?: Json | null
      data_region?: string | null
      description?: string | null
      id?: string
      is_default?: boolean | null
      location?: string | null
      name?: string
      organization_id?: string | null
      slug?: string | null
      status?: string | null
      subscription_level?: string | null
      updated_at?: string | null
      contact_email?: string | null
      website_url?: string | null
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
}

export interface OrganizationTenantViews {
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

export interface OrganizationTenantFunctions {
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
}
