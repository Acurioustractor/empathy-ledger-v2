// Re-export base types
export * from './base'

// Import all domain table interfaces
import { UserProfileTables } from './user-profile'
import { OrganizationTenantTables } from './organisation-tenant'
import { ProjectManagementTables } from './project-management'
import { ContentMediaTables } from './content-media'
import { GalleryPhotoTables } from './gallery-photos'
import { CulturalSensitivityTables } from './cultural-sensitivity'
import { LocationEventsTables } from './location-events'
import { AnalysisSupportTables } from './analysis-support'

// Re-export all domain interfaces
export type {
  UserProfileTables,
  OrganizationTenantTables,
  ProjectManagementTables,
  ContentMediaTables,
  GalleryPhotoTables,
  CulturalSensitivityTables,
  LocationEventsTables,
  AnalysisSupportTables
}

// Combined Database interface
export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: UserProfileTables &
             OrganizationTenantTables &
             ProjectManagementTables &
             ContentMediaTables &
             GalleryPhotoTables &
             CulturalSensitivityTables &
             LocationEventsTables &
             AnalysisSupportTables
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