import { Json } from './base'

export interface AnalysisSupportTables {
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
}