import { Json } from './base'

export interface ProjectManagementTables {
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
}