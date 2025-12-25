Initialising login role...
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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      act_admin_permissions: {
        Row: {
          can_approve_stories: boolean | null
          can_approve_storytellers: boolean | null
          can_manage_admins: boolean | null
          can_manage_projects: boolean | null
          can_view_analytics: boolean | null
          created_at: string | null
          granted_at: string | null
          granted_by: string | null
          id: string
          is_active: boolean | null
          notes: string | null
          permission_level: string | null
          project_ids: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          can_approve_stories?: boolean | null
          can_approve_storytellers?: boolean | null
          can_manage_admins?: boolean | null
          can_manage_projects?: boolean | null
          can_view_analytics?: boolean | null
          created_at?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          permission_level?: string | null
          project_ids?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          can_approve_stories?: boolean | null
          can_approve_storytellers?: boolean | null
          can_manage_admins?: boolean | null
          can_manage_projects?: boolean | null
          can_view_analytics?: boolean | null
          created_at?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          permission_level?: string | null
          project_ids?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      act_admins: {
        Row: {
          can_approve_stories: boolean | null
          can_approve_storytellers: boolean | null
          can_manage_projects: boolean | null
          granted_at: string | null
          granted_by: string | null
          id: string
          revoked_at: string | null
          role: string
          user_id: string
        }
        Insert: {
          can_approve_stories?: boolean | null
          can_approve_storytellers?: boolean | null
          can_manage_projects?: boolean | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          revoked_at?: string | null
          role?: string
          user_id: string
        }
        Update: {
          can_approve_stories?: boolean | null
          can_approve_storytellers?: boolean | null
          can_manage_projects?: boolean | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          revoked_at?: string | null
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      act_feature_requests: {
        Row: {
          act_project_id: string
          alignment_notes: string | null
          decline_reason: string | null
          id: string
          relevant_experience: string | null
          request_type: string | null
          requested_at: string | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          storyteller_id: string
          updated_at: string | null
          why_feature_me: string | null
        }
        Insert: {
          act_project_id: string
          alignment_notes?: string | null
          decline_reason?: string | null
          id?: string
          relevant_experience?: string | null
          request_type?: string | null
          requested_at?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          storyteller_id: string
          updated_at?: string | null
          why_feature_me?: string | null
        }
        Update: {
          act_project_id?: string
          alignment_notes?: string | null
          decline_reason?: string | null
          id?: string
          relevant_experience?: string | null
          request_type?: string | null
          requested_at?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          storyteller_id?: string
          updated_at?: string | null
          why_feature_me?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "act_feature_requests_act_project_id_fkey"
            columns: ["act_project_id"]
            isOneToOne: false
            referencedRelation: "act_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      act_projects: {
        Row: {
          allows_story_featuring: boolean | null
          allows_storyteller_optin: boolean | null
          created_at: string | null
          description: string | null
          display_config: Json | null
          focus_areas: string[] | null
          id: string
          is_active: boolean | null
          organization_id: string | null
          organization_name: string | null
          project_site_url: string | null
          slug: string
          themes: string[] | null
          title: string
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          allows_story_featuring?: boolean | null
          allows_storyteller_optin?: boolean | null
          created_at?: string | null
          description?: string | null
          display_config?: Json | null
          focus_areas?: string[] | null
          id?: string
          is_active?: boolean | null
          organization_id?: string | null
          organization_name?: string | null
          project_site_url?: string | null
          slug: string
          themes?: string[] | null
          title: string
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          allows_story_featuring?: boolean | null
          allows_storyteller_optin?: boolean | null
          created_at?: string | null
          description?: string | null
          display_config?: Json | null
          focus_areas?: string[] | null
          id?: string
          is_active?: boolean | null
          organization_id?: string | null
          organization_name?: string | null
          project_site_url?: string | null
          slug?: string
          themes?: string[] | null
          title?: string
          updated_at?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      activities: {
        Row: {
          activity_date: string
          activity_type: string
          actual_cost: number | null
          budget_allocated: number | null
          communities_represented: string[] | null
          created_at: string | null
          cultural_authority_present: boolean | null
          cultural_materials_used: string[] | null
          cultural_protocols_followed: boolean | null
          description: string | null
          duration_minutes: number | null
          elder_involvement: boolean | null
          elders_involved: string[] | null
          end_time: string | null
          facilitator_reflections: string | null
          facilitators: string[] | null
          follow_up_date: string | null
          follow_up_notes: string | null
          follow_up_required: boolean | null
          id: string
          knowledge_topics: string[] | null
          language_groups: string[] | null
          language_use: string[] | null
          location: string | null
          meals_provided: boolean | null
          media_ids: string[] | null
          on_country: boolean | null
          organization_id: string
          outcomes_observed: string[] | null
          outputs: string[] | null
          participant_age_range: string | null
          participant_count: number | null
          participant_feedback: string[] | null
          participant_gender_breakdown: Json | null
          partners_involved: string[] | null
          photos_taken: number | null
          project_id: string | null
          recorded_by: string | null
          related_outcome_ids: string[] | null
          service_area: string
          source_document_id: string | null
          start_time: string | null
          tenant_id: string
          title: string
          traditional_knowledge_shared: boolean | null
          transport_provided: boolean | null
          updated_at: string | null
          verification_date: string | null
          verified_by: string | null
          videos_recorded: number | null
        }
        Insert: {
          activity_date: string
          activity_type: string
          actual_cost?: number | null
          budget_allocated?: number | null
          communities_represented?: string[] | null
          created_at?: string | null
          cultural_authority_present?: boolean | null
          cultural_materials_used?: string[] | null
          cultural_protocols_followed?: boolean | null
          description?: string | null
          duration_minutes?: number | null
          elder_involvement?: boolean | null
          elders_involved?: string[] | null
          end_time?: string | null
          facilitator_reflections?: string | null
          facilitators?: string[] | null
          follow_up_date?: string | null
          follow_up_notes?: string | null
          follow_up_required?: boolean | null
          id?: string
          knowledge_topics?: string[] | null
          language_groups?: string[] | null
          language_use?: string[] | null
          location?: string | null
          meals_provided?: boolean | null
          media_ids?: string[] | null
          on_country?: boolean | null
          organization_id: string
          outcomes_observed?: string[] | null
          outputs?: string[] | null
          participant_age_range?: string | null
          participant_count?: number | null
          participant_feedback?: string[] | null
          participant_gender_breakdown?: Json | null
          partners_involved?: string[] | null
          photos_taken?: number | null
          project_id?: string | null
          recorded_by?: string | null
          related_outcome_ids?: string[] | null
          service_area: string
          source_document_id?: string | null
          start_time?: string | null
          tenant_id: string
          title: string
          traditional_knowledge_shared?: boolean | null
          transport_provided?: boolean | null
          updated_at?: string | null
          verification_date?: string | null
          verified_by?: string | null
          videos_recorded?: number | null
        }
        Update: {
          activity_date?: string
          activity_type?: string
          actual_cost?: number | null
          budget_allocated?: number | null
          communities_represented?: string[] | null
          created_at?: string | null
          cultural_authority_present?: boolean | null
          cultural_materials_used?: string[] | null
          cultural_protocols_followed?: boolean | null
          description?: string | null
          duration_minutes?: number | null
          elder_involvement?: boolean | null
          elders_involved?: string[] | null
          end_time?: string | null
          facilitator_reflections?: string | null
          facilitators?: string[] | null
          follow_up_date?: string | null
          follow_up_notes?: string | null
          follow_up_required?: boolean | null
          id?: string
          knowledge_topics?: string[] | null
          language_groups?: string[] | null
          language_use?: string[] | null
          location?: string | null
          meals_provided?: boolean | null
          media_ids?: string[] | null
          on_country?: boolean | null
          organization_id?: string
          outcomes_observed?: string[] | null
          outputs?: string[] | null
          participant_age_range?: string | null
          participant_count?: number | null
          participant_feedback?: string[] | null
          participant_gender_breakdown?: Json | null
          partners_involved?: string[] | null
          photos_taken?: number | null
          project_id?: string | null
          recorded_by?: string | null
          related_outcome_ids?: string[] | null
          service_area?: string
          source_document_id?: string | null
          start_time?: string | null
          tenant_id?: string
          title?: string
          traditional_knowledge_shared?: boolean | null
          transport_provided?: boolean | null
          updated_at?: string | null
          verification_date?: string | null
          verified_by?: string | null
          videos_recorded?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "activities_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_log: {
        Row: {
          action: string
          action_category: string
          attention_resolved_at: string | null
          attention_resolved_by: string | null
          changes: Json | null
          created_at: string | null
          details: Json | null
          entity_id: string | null
          entity_title: string | null
          entity_type: string
          id: string
          is_system_action: boolean | null
          organization_id: string | null
          requires_attention: boolean | null
          user_id: string | null
          user_name: string | null
          user_role: string | null
        }
        Insert: {
          action: string
          action_category: string
          attention_resolved_at?: string | null
          attention_resolved_by?: string | null
          changes?: Json | null
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_title?: string | null
          entity_type: string
          id?: string
          is_system_action?: boolean | null
          organization_id?: string | null
          requires_attention?: boolean | null
          user_id?: string | null
          user_name?: string | null
          user_role?: string | null
        }
        Update: {
          action?: string
          action_category?: string
          attention_resolved_at?: string | null
          attention_resolved_by?: string | null
          changes?: Json | null
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_title?: string | null
          entity_type?: string
          id?: string
          is_system_action?: boolean | null
          organization_id?: string | null
          requires_attention?: boolean | null
          user_id?: string | null
          user_name?: string | null
          user_role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_log_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_log_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_messages: {
        Row: {
          body: string
          channels: string[] | null
          created_at: string | null
          delivered_count: number | null
          id: string
          message_type: string
          read_count: number | null
          recipient_count: number | null
          scheduled_at: string | null
          sender_id: string | null
          sender_name: string | null
          sent_at: string | null
          status: string | null
          subject: string
          target_filter: Json | null
          target_organization_id: string | null
          target_project_id: string | null
          target_type: string
          target_user_ids: string[] | null
          template_vars: Json | null
          updated_at: string | null
        }
        Insert: {
          body: string
          channels?: string[] | null
          created_at?: string | null
          delivered_count?: number | null
          id?: string
          message_type?: string
          read_count?: number | null
          recipient_count?: number | null
          scheduled_at?: string | null
          sender_id?: string | null
          sender_name?: string | null
          sent_at?: string | null
          status?: string | null
          subject: string
          target_filter?: Json | null
          target_organization_id?: string | null
          target_project_id?: string | null
          target_type: string
          target_user_ids?: string[] | null
          template_vars?: Json | null
          updated_at?: string | null
        }
        Update: {
          body?: string
          channels?: string[] | null
          created_at?: string | null
          delivered_count?: number | null
          id?: string
          message_type?: string
          read_count?: number | null
          recipient_count?: number | null
          scheduled_at?: string | null
          sender_id?: string | null
          sender_name?: string | null
          sent_at?: string | null
          status?: string | null
          subject?: string
          target_filter?: Json | null
          target_organization_id?: string | null
          target_project_id?: string | null
          target_type?: string
          target_user_ids?: string[] | null
          template_vars?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_messages_target_organization_id_fkey"
            columns: ["target_organization_id"]
            isOneToOne: false
            referencedRelation: "organization_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_messages_target_organization_id_fkey"
            columns: ["target_organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_agent_registry: {
        Row: {
          agent_type: string
          avg_completion_tokens: number | null
          avg_cost_usd: number | null
          avg_prompt_tokens: number | null
          config: Json | null
          created_at: string | null
          cultural_sensitivity_level: string | null
          default_model: string | null
          description: string | null
          display_name: string
          fallback_model: string | null
          id: string
          is_active: boolean | null
          is_beta: boolean | null
          max_tokens: number | null
          name: string
          requires_elder_review: boolean | null
          requires_safety_check: boolean | null
          temperature: number | null
          updated_at: string | null
          version: string | null
        }
        Insert: {
          agent_type: string
          avg_completion_tokens?: number | null
          avg_cost_usd?: number | null
          avg_prompt_tokens?: number | null
          config?: Json | null
          created_at?: string | null
          cultural_sensitivity_level?: string | null
          default_model?: string | null
          description?: string | null
          display_name: string
          fallback_model?: string | null
          id?: string
          is_active?: boolean | null
          is_beta?: boolean | null
          max_tokens?: number | null
          name: string
          requires_elder_review?: boolean | null
          requires_safety_check?: boolean | null
          temperature?: number | null
          updated_at?: string | null
          version?: string | null
        }
        Update: {
          agent_type?: string
          avg_completion_tokens?: number | null
          avg_cost_usd?: number | null
          avg_prompt_tokens?: number | null
          config?: Json | null
          created_at?: string | null
          cultural_sensitivity_level?: string | null
          default_model?: string | null
          description?: string | null
          display_name?: string
          fallback_model?: string | null
          id?: string
          is_active?: boolean | null
          is_beta?: boolean | null
          max_tokens?: number | null
          name?: string
          requires_elder_review?: boolean | null
          requires_safety_check?: boolean | null
          temperature?: number | null
          updated_at?: string | null
          version?: string | null
        }
        Relationships: []
      }
      ai_analysis_jobs: {
        Row: {
          completed_at: string | null
          created_at: string | null
          entity_id: string | null
          entity_type: string | null
          error_message: string | null
          id: string
          job_type: string
          max_retries: number | null
          priority: number | null
          result: Json | null
          retry_count: number | null
          scheduled_for: string | null
          started_at: string | null
          status: string | null
          trigger_reason: string | null
          triggered_by: string | null
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          error_message?: string | null
          id?: string
          job_type: string
          max_retries?: number | null
          priority?: number | null
          result?: Json | null
          retry_count?: number | null
          scheduled_for?: string | null
          started_at?: string | null
          status?: string | null
          trigger_reason?: string | null
          triggered_by?: string | null
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          error_message?: string | null
          id?: string
          job_type?: string
          max_retries?: number | null
          priority?: number | null
          result?: Json | null
          retry_count?: number | null
          scheduled_for?: string | null
          started_at?: string | null
          status?: string | null
          trigger_reason?: string | null
          triggered_by?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      ai_moderation_logs: {
        Row: {
          author_id: string | null
          content_id: string
          content_type: string
          created_at: string | null
          cultural_issues_detected: number | null
          elder_conditions: string[] | null
          elder_decision: string | null
          elder_id: string | null
          elder_notes: string | null
          elder_review_required: boolean | null
          id: string
          moderated_at: string | null
          moderation_status: string | null
          reviewed_at: string | null
        }
        Insert: {
          author_id?: string | null
          content_id: string
          content_type: string
          created_at?: string | null
          cultural_issues_detected?: number | null
          elder_conditions?: string[] | null
          elder_decision?: string | null
          elder_id?: string | null
          elder_notes?: string | null
          elder_review_required?: boolean | null
          id?: string
          moderated_at?: string | null
          moderation_status?: string | null
          reviewed_at?: string | null
        }
        Update: {
          author_id?: string | null
          content_id?: string
          content_type?: string
          created_at?: string | null
          cultural_issues_detected?: number | null
          elder_conditions?: string[] | null
          elder_decision?: string | null
          elder_id?: string | null
          elder_notes?: string | null
          elder_review_required?: boolean | null
          id?: string
          moderated_at?: string | null
          moderation_status?: string | null
          reviewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_moderation_logs_elder_id_fkey"
            columns: ["elder_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_processing_logs: {
        Row: {
          ai_model_used: string
          confidence_scores: Json | null
          created_at: string | null
          error_message: string | null
          extracted_data: Json | null
          id: string
          input_content_hash: string | null
          organization_id: string | null
          processing_time_ms: number | null
          processing_timestamp: string | null
          prompt_hash: string | null
          quality_flags: Json | null
          request_id: string
          token_usage: Json | null
        }
        Insert: {
          ai_model_used: string
          confidence_scores?: Json | null
          created_at?: string | null
          error_message?: string | null
          extracted_data?: Json | null
          id?: string
          input_content_hash?: string | null
          organization_id?: string | null
          processing_time_ms?: number | null
          processing_timestamp?: string | null
          prompt_hash?: string | null
          quality_flags?: Json | null
          request_id: string
          token_usage?: Json | null
        }
        Update: {
          ai_model_used?: string
          confidence_scores?: Json | null
          created_at?: string | null
          error_message?: string | null
          extracted_data?: Json | null
          id?: string
          input_content_hash?: string | null
          organization_id?: string | null
          processing_time_ms?: number | null
          processing_timestamp?: string | null
          prompt_hash?: string | null
          quality_flags?: Json | null
          request_id?: string
          token_usage?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_processing_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_processing_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_safety_logs: {
        Row: {
          content_preview: string | null
          context_type: string | null
          created_at: string | null
          id: string
          operation: string
          safety_level: string | null
          safety_result: Json
          user_id: string | null
        }
        Insert: {
          content_preview?: string | null
          context_type?: string | null
          created_at?: string | null
          id?: string
          operation: string
          safety_level?: string | null
          safety_result?: Json
          user_id?: string | null
        }
        Update: {
          content_preview?: string | null
          context_type?: string | null
          created_at?: string | null
          id?: string
          operation?: string
          safety_level?: string | null
          safety_result?: Json
          user_id?: string | null
        }
        Relationships: []
      }
      ai_usage_daily: {
        Row: {
          agent_name: string
          avg_duration_ms: number | null
          blocked_count: number | null
          created_at: string | null
          date: string
          failure_count: number | null
          flagged_count: number | null
          id: string
          model: string
          organization_id: string | null
          p95_duration_ms: number | null
          request_count: number | null
          success_count: number | null
          tenant_id: string | null
          total_completion_tokens: number | null
          total_cost_usd: number | null
          total_duration_ms: number | null
          total_prompt_tokens: number | null
          total_tokens: number | null
          updated_at: string | null
        }
        Insert: {
          agent_name: string
          avg_duration_ms?: number | null
          blocked_count?: number | null
          created_at?: string | null
          date: string
          failure_count?: number | null
          flagged_count?: number | null
          id?: string
          model: string
          organization_id?: string | null
          p95_duration_ms?: number | null
          request_count?: number | null
          success_count?: number | null
          tenant_id?: string | null
          total_completion_tokens?: number | null
          total_cost_usd?: number | null
          total_duration_ms?: number | null
          total_prompt_tokens?: number | null
          total_tokens?: number | null
          updated_at?: string | null
        }
        Update: {
          agent_name?: string
          avg_duration_ms?: number | null
          blocked_count?: number | null
          created_at?: string | null
          date?: string
          failure_count?: number | null
          flagged_count?: number | null
          id?: string
          model?: string
          organization_id?: string | null
          p95_duration_ms?: number | null
          request_count?: number | null
          success_count?: number | null
          tenant_id?: string | null
          total_completion_tokens?: number | null
          total_cost_usd?: number | null
          total_duration_ms?: number | null
          total_prompt_tokens?: number | null
          total_tokens?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_usage_daily_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_usage_daily_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_usage_daily_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_analytics"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "ai_usage_daily_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_usage_daily_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_ai_usage_summary"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      ai_usage_events: {
        Row: {
          agent_name: string
          agent_version: string | null
          completed_at: string | null
          completion_tokens: number | null
          cost_usd_est: number | null
          created_at: string | null
          duration_ms: number | null
          error_code: string | null
          error_message: string | null
          id: string
          input_preview: string | null
          metadata: Json | null
          model: string
          model_provider: string
          organization_id: string | null
          output_preview: string | null
          parent_request_id: string | null
          prompt_tokens: number | null
          request_id: string | null
          safety_flags: Json | null
          safety_status: string | null
          started_at: string | null
          status: string
          tenant_id: string | null
          time_to_first_token_ms: number | null
          total_tokens: number | null
          user_id: string | null
        }
        Insert: {
          agent_name: string
          agent_version?: string | null
          completed_at?: string | null
          completion_tokens?: number | null
          cost_usd_est?: number | null
          created_at?: string | null
          duration_ms?: number | null
          error_code?: string | null
          error_message?: string | null
          id?: string
          input_preview?: string | null
          metadata?: Json | null
          model: string
          model_provider: string
          organization_id?: string | null
          output_preview?: string | null
          parent_request_id?: string | null
          prompt_tokens?: number | null
          request_id?: string | null
          safety_flags?: Json | null
          safety_status?: string | null
          started_at?: string | null
          status?: string
          tenant_id?: string | null
          time_to_first_token_ms?: number | null
          total_tokens?: number | null
          user_id?: string | null
        }
        Update: {
          agent_name?: string
          agent_version?: string | null
          completed_at?: string | null
          completion_tokens?: number | null
          cost_usd_est?: number | null
          created_at?: string | null
          duration_ms?: number | null
          error_code?: string | null
          error_message?: string | null
          id?: string
          input_preview?: string | null
          metadata?: Json | null
          model?: string
          model_provider?: string
          organization_id?: string | null
          output_preview?: string | null
          parent_request_id?: string | null
          prompt_tokens?: number | null
          request_id?: string | null
          safety_flags?: Json | null
          safety_status?: string | null
          started_at?: string | null
          status?: string
          tenant_id?: string | null
          time_to_first_token_ms?: number | null
          total_tokens?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_usage_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_usage_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_usage_events_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_analytics"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "ai_usage_events_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_usage_events_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_ai_usage_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "ai_usage_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
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
      analytics_processing_jobs: {
        Row: {
          ai_model_used: string | null
          ai_model_version: string | null
          ai_processing_cost: number | null
          completed_at: string | null
          created_at: string | null
          entity_ids: string[] | null
          entity_types: string[] | null
          error_details: string | null
          failed_items: number | null
          id: string
          job_status: string | null
          job_type: string
          max_retries: number | null
          output_data: Json | null
          priority: number | null
          processed_items: number | null
          processing_time_seconds: number | null
          results_summary: Json | null
          retry_count: number | null
          scheduled_for: string | null
          started_at: string | null
          storyteller_id: string | null
          success_rate: number | null
          tenant_id: string
          total_items: number | null
          updated_at: string | null
          warnings: string[] | null
        }
        Insert: {
          ai_model_used?: string | null
          ai_model_version?: string | null
          ai_processing_cost?: number | null
          completed_at?: string | null
          created_at?: string | null
          entity_ids?: string[] | null
          entity_types?: string[] | null
          error_details?: string | null
          failed_items?: number | null
          id?: string
          job_status?: string | null
          job_type: string
          max_retries?: number | null
          output_data?: Json | null
          priority?: number | null
          processed_items?: number | null
          processing_time_seconds?: number | null
          results_summary?: Json | null
          retry_count?: number | null
          scheduled_for?: string | null
          started_at?: string | null
          storyteller_id?: string | null
          success_rate?: number | null
          tenant_id: string
          total_items?: number | null
          updated_at?: string | null
          warnings?: string[] | null
        }
        Update: {
          ai_model_used?: string | null
          ai_model_version?: string | null
          ai_processing_cost?: number | null
          completed_at?: string | null
          created_at?: string | null
          entity_ids?: string[] | null
          entity_types?: string[] | null
          error_details?: string | null
          failed_items?: number | null
          id?: string
          job_status?: string | null
          job_type?: string
          max_retries?: number | null
          output_data?: Json | null
          priority?: number | null
          processed_items?: number | null
          processing_time_seconds?: number | null
          results_summary?: Json | null
          retry_count?: number | null
          scheduled_for?: string | null
          started_at?: string | null
          storyteller_id?: string | null
          success_rate?: number | null
          tenant_id?: string
          total_items?: number | null
          updated_at?: string | null
          warnings?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_processing_jobs_storyteller_id_fkey"
            columns: ["storyteller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      annual_report_stories: {
        Row: {
          added_at: string | null
          added_by: string | null
          custom_excerpt: string | null
          custom_title: string | null
          display_order: number | null
          id: string
          include_full_text: boolean | null
          inclusion_reason: string | null
          is_featured: boolean | null
          metadata: Json | null
          report_id: string
          section_placement: string | null
          selected_media_ids: string[] | null
          story_id: string
        }
        Insert: {
          added_at?: string | null
          added_by?: string | null
          custom_excerpt?: string | null
          custom_title?: string | null
          display_order?: number | null
          id?: string
          include_full_text?: boolean | null
          inclusion_reason?: string | null
          is_featured?: boolean | null
          metadata?: Json | null
          report_id: string
          section_placement?: string | null
          selected_media_ids?: string[] | null
          story_id: string
        }
        Update: {
          added_at?: string | null
          added_by?: string | null
          custom_excerpt?: string | null
          custom_title?: string | null
          display_order?: number | null
          id?: string
          include_full_text?: boolean | null
          inclusion_reason?: string | null
          is_featured?: boolean | null
          metadata?: Json | null
          report_id?: string
          section_placement?: string | null
          selected_media_ids?: string[] | null
          story_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "annual_report_stories_added_by_fkey"
            columns: ["added_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "annual_report_stories_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "annual_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "annual_report_stories_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "annual_reports_with_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "annual_report_stories_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "annual_report_stories_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories_with_trust_indicators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "annual_report_stories_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "syndicated_stories"
            referencedColumns: ["story_id"]
          },
        ]
      }
      annual_reports: {
        Row: {
          acknowledgments: string | null
          auto_generated: boolean | null
          auto_include_criteria: Json | null
          cover_image_url: string | null
          created_at: string | null
          created_by: string | null
          cultural_advisor_review: boolean | null
          cultural_notes: string | null
          distribution_date: string | null
          distribution_list: string[] | null
          downloads: number | null
          elder_approval_date: string | null
          elder_approval_required: boolean | null
          elder_approvals: string[] | null
          exclude_story_ids: string[] | null
          executive_summary: string | null
          featured_story_ids: string[] | null
          generated_by: string | null
          generation_date: string | null
          id: string
          leadership_message: string | null
          leadership_message_author: string | null
          looking_forward: string | null
          metadata: Json | null
          organization_id: string
          pdf_url: string | null
          published_by: string | null
          published_date: string | null
          report_year: number
          reporting_period_end: string
          reporting_period_start: string
          sections_config: Json | null
          statistics: Json | null
          status: string | null
          subtitle: string | null
          template_name: string | null
          theme: string | null
          title: string
          updated_at: string | null
          views: number | null
          web_version_url: string | null
          year_highlights: string[] | null
        }
        Insert: {
          acknowledgments?: string | null
          auto_generated?: boolean | null
          auto_include_criteria?: Json | null
          cover_image_url?: string | null
          created_at?: string | null
          created_by?: string | null
          cultural_advisor_review?: boolean | null
          cultural_notes?: string | null
          distribution_date?: string | null
          distribution_list?: string[] | null
          downloads?: number | null
          elder_approval_date?: string | null
          elder_approval_required?: boolean | null
          elder_approvals?: string[] | null
          exclude_story_ids?: string[] | null
          executive_summary?: string | null
          featured_story_ids?: string[] | null
          generated_by?: string | null
          generation_date?: string | null
          id?: string
          leadership_message?: string | null
          leadership_message_author?: string | null
          looking_forward?: string | null
          metadata?: Json | null
          organization_id: string
          pdf_url?: string | null
          published_by?: string | null
          published_date?: string | null
          report_year: number
          reporting_period_end: string
          reporting_period_start: string
          sections_config?: Json | null
          statistics?: Json | null
          status?: string | null
          subtitle?: string | null
          template_name?: string | null
          theme?: string | null
          title: string
          updated_at?: string | null
          views?: number | null
          web_version_url?: string | null
          year_highlights?: string[] | null
        }
        Update: {
          acknowledgments?: string | null
          auto_generated?: boolean | null
          auto_include_criteria?: Json | null
          cover_image_url?: string | null
          created_at?: string | null
          created_by?: string | null
          cultural_advisor_review?: boolean | null
          cultural_notes?: string | null
          distribution_date?: string | null
          distribution_list?: string[] | null
          downloads?: number | null
          elder_approval_date?: string | null
          elder_approval_required?: boolean | null
          elder_approvals?: string[] | null
          exclude_story_ids?: string[] | null
          executive_summary?: string | null
          featured_story_ids?: string[] | null
          generated_by?: string | null
          generation_date?: string | null
          id?: string
          leadership_message?: string | null
          leadership_message_author?: string | null
          looking_forward?: string | null
          metadata?: Json | null
          organization_id?: string
          pdf_url?: string | null
          published_by?: string | null
          published_date?: string | null
          report_year?: number
          reporting_period_end?: string
          reporting_period_start?: string
          sections_config?: Json | null
          statistics?: Json | null
          status?: string | null
          subtitle?: string | null
          template_name?: string | null
          theme?: string | null
          title?: string
          updated_at?: string | null
          views?: number | null
          web_version_url?: string | null
          year_highlights?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "annual_reports_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "annual_reports_generated_by_fkey"
            columns: ["generated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "annual_reports_leadership_message_author_fkey"
            columns: ["leadership_message_author"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "annual_reports_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "annual_reports_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "annual_reports_published_by_fkey"
            columns: ["published_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audio_emotion_analysis: {
        Row: {
          analysis_method: string | null
          arousal: number | null
          audio_id: string
          confidence: number | null
          created_at: string | null
          culturally_validated: boolean | null
          emotion_label: string | null
          id: string
          model_version: string | null
          story_id: string | null
          temporal_segments: Json | null
          valence: number | null
        }
        Insert: {
          analysis_method?: string | null
          arousal?: number | null
          audio_id: string
          confidence?: number | null
          created_at?: string | null
          culturally_validated?: boolean | null
          emotion_label?: string | null
          id?: string
          model_version?: string | null
          story_id?: string | null
          temporal_segments?: Json | null
          valence?: number | null
        }
        Update: {
          analysis_method?: string | null
          arousal?: number | null
          audio_id?: string
          confidence?: number | null
          created_at?: string | null
          culturally_validated?: boolean | null
          emotion_label?: string | null
          id?: string
          model_version?: string | null
          story_id?: string | null
          temporal_segments?: Json | null
          valence?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "audio_emotion_analysis_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audio_emotion_analysis_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories_with_trust_indicators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audio_emotion_analysis_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "syndicated_stories"
            referencedColumns: ["story_id"]
          },
        ]
      }
      audio_prosodic_analysis: {
        Row: {
          analysis_method: string | null
          analysis_version: string | null
          articulation_rate_sps: number | null
          audio_id: string
          created_at: string | null
          hnr_db: number | null
          id: string
          intensity_range_db: number | null
          intensity_std_db: number | null
          jitter: number | null
          mean_intensity_db: number | null
          mean_pause_duration_s: number | null
          mean_pitch_hz: number | null
          pause_count: number | null
          pitch_range_hz: number | null
          pitch_range_semitones: number | null
          pitch_std_hz: number | null
          shimmer: number | null
          speaking_time_s: number | null
          speech_rate_sps: number | null
          story_id: string | null
          total_duration_s: number | null
          voiced_fraction: number | null
        }
        Insert: {
          analysis_method?: string | null
          analysis_version?: string | null
          articulation_rate_sps?: number | null
          audio_id: string
          created_at?: string | null
          hnr_db?: number | null
          id?: string
          intensity_range_db?: number | null
          intensity_std_db?: number | null
          jitter?: number | null
          mean_intensity_db?: number | null
          mean_pause_duration_s?: number | null
          mean_pitch_hz?: number | null
          pause_count?: number | null
          pitch_range_hz?: number | null
          pitch_range_semitones?: number | null
          pitch_std_hz?: number | null
          shimmer?: number | null
          speaking_time_s?: number | null
          speech_rate_sps?: number | null
          story_id?: string | null
          total_duration_s?: number | null
          voiced_fraction?: number | null
        }
        Update: {
          analysis_method?: string | null
          analysis_version?: string | null
          articulation_rate_sps?: number | null
          audio_id?: string
          created_at?: string | null
          hnr_db?: number | null
          id?: string
          intensity_range_db?: number | null
          intensity_std_db?: number | null
          jitter?: number | null
          mean_intensity_db?: number | null
          mean_pause_duration_s?: number | null
          mean_pitch_hz?: number | null
          pause_count?: number | null
          pitch_range_hz?: number | null
          pitch_range_semitones?: number | null
          pitch_std_hz?: number | null
          shimmer?: number | null
          speaking_time_s?: number | null
          speech_rate_sps?: number | null
          story_id?: string | null
          total_duration_s?: number | null
          voiced_fraction?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "audio_prosodic_analysis_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audio_prosodic_analysis_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories_with_trust_indicators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audio_prosodic_analysis_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "syndicated_stories"
            referencedColumns: ["story_id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          action_category: string | null
          actor_id: string | null
          actor_ip: unknown
          actor_type: string | null
          actor_user_agent: string | null
          change_diff: Json | null
          change_summary: string | null
          created_at: string | null
          entity_id: string
          entity_type: string
          id: string
          metadata: Json | null
          new_state: Json | null
          previous_state: Json | null
          related_entity_id: string | null
          related_entity_type: string | null
          request_id: string | null
          session_id: string | null
          tenant_id: string
        }
        Insert: {
          action: string
          action_category?: string | null
          actor_id?: string | null
          actor_ip?: unknown
          actor_type?: string | null
          actor_user_agent?: string | null
          change_diff?: Json | null
          change_summary?: string | null
          created_at?: string | null
          entity_id: string
          entity_type: string
          id?: string
          metadata?: Json | null
          new_state?: Json | null
          previous_state?: Json | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          request_id?: string | null
          session_id?: string | null
          tenant_id: string
        }
        Update: {
          action?: string
          action_category?: string | null
          actor_id?: string | null
          actor_ip?: unknown
          actor_type?: string | null
          actor_user_agent?: string | null
          change_diff?: Json | null
          change_summary?: string | null
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          metadata?: Json | null
          new_state?: Json | null
          previous_state?: Json | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          request_id?: string | null
          session_id?: string | null
          tenant_id?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          author: string | null
          content: string
          created_at: string | null
          cultural_review: string | null
          curated_by: string | null
          elder_approved: boolean | null
          excerpt: string
          gallery: string[] | null
          hero_image: string | null
          id: string
          project_id: string | null
          published_at: string | null
          read_time: number | null
          source_notion_page_id: string | null
          status: string
          storyteller_id: string | null
          tags: string[] | null
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          author?: string | null
          content: string
          created_at?: string | null
          cultural_review?: string | null
          curated_by?: string | null
          elder_approved?: boolean | null
          excerpt: string
          gallery?: string[] | null
          hero_image?: string | null
          id?: string
          project_id?: string | null
          published_at?: string | null
          read_time?: number | null
          source_notion_page_id?: string | null
          status?: string
          storyteller_id?: string | null
          tags?: string[] | null
          title: string
          type: string
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          author?: string | null
          content?: string
          created_at?: string | null
          cultural_review?: string | null
          curated_by?: string | null
          elder_approved?: boolean | null
          excerpt?: string
          gallery?: string[] | null
          hero_image?: string | null
          id?: string
          project_id?: string | null
          published_at?: string | null
          read_time?: number | null
          source_notion_page_id?: string | null
          status?: string
          storyteller_id?: string | null
          tags?: string[] | null
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      community_interpretation_sessions: {
        Row: {
          consensus_points: string[] | null
          created_at: string | null
          cultural_context: string | null
          divergent_views: string[] | null
          facilitator_id: string | null
          id: string
          interpretation_type: string | null
          key_interpretations: string[] | null
          participant_count: number | null
          recommendations: string[] | null
          session_date: string
          session_notes: string | null
          story_id: string | null
          theme_id: string | null
        }
        Insert: {
          consensus_points?: string[] | null
          created_at?: string | null
          cultural_context?: string | null
          divergent_views?: string[] | null
          facilitator_id?: string | null
          id?: string
          interpretation_type?: string | null
          key_interpretations?: string[] | null
          participant_count?: number | null
          recommendations?: string[] | null
          session_date: string
          session_notes?: string | null
          story_id?: string | null
          theme_id?: string | null
        }
        Update: {
          consensus_points?: string[] | null
          created_at?: string | null
          cultural_context?: string | null
          divergent_views?: string[] | null
          facilitator_id?: string | null
          id?: string
          interpretation_type?: string | null
          key_interpretations?: string[] | null
          participant_count?: number | null
          recommendations?: string[] | null
          session_date?: string
          session_notes?: string | null
          story_id?: string | null
          theme_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "community_interpretation_sessions_facilitator_id_fkey"
            columns: ["facilitator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_interpretation_sessions_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_interpretation_sessions_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories_with_trust_indicators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_interpretation_sessions_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "syndicated_stories"
            referencedColumns: ["story_id"]
          },
          {
            foreignKeyName: "community_interpretation_sessions_theme_id_fkey"
            columns: ["theme_id"]
            isOneToOne: false
            referencedRelation: "themes"
            referencedColumns: ["id"]
          },
        ]
      }
      community_story_responses: {
        Row: {
          action_inspired: string | null
          created_at: string | null
          emotional_reaction: string | null
          id: string
          personal_connection: string | null
          responder_id: string | null
          response_date: string | null
          response_text: string | null
          response_type: string | null
          shared_with_others: boolean | null
          story_id: string
        }
        Insert: {
          action_inspired?: string | null
          created_at?: string | null
          emotional_reaction?: string | null
          id?: string
          personal_connection?: string | null
          responder_id?: string | null
          response_date?: string | null
          response_text?: string | null
          response_type?: string | null
          shared_with_others?: boolean | null
          story_id: string
        }
        Update: {
          action_inspired?: string | null
          created_at?: string | null
          emotional_reaction?: string | null
          id?: string
          personal_connection?: string | null
          responder_id?: string | null
          response_date?: string | null
          response_text?: string | null
          response_type?: string | null
          shared_with_others?: boolean | null
          story_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_story_responses_responder_id_fkey"
            columns: ["responder_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_story_responses_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_story_responses_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories_with_trust_indicators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_story_responses_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "syndicated_stories"
            referencedColumns: ["story_id"]
          },
        ]
      }
      consent_change_log: {
        Row: {
          app_id: string
          change_reason: string | null
          change_type: string
          changed_by: string | null
          consent_id: string
          created_at: string | null
          id: string
          new_state: Json | null
          previous_state: Json | null
          story_id: string
          storyteller_id: string
          webhooks_delivered_at: string | null
          webhooks_triggered: boolean | null
        }
        Insert: {
          app_id: string
          change_reason?: string | null
          change_type: string
          changed_by?: string | null
          consent_id: string
          created_at?: string | null
          id?: string
          new_state?: Json | null
          previous_state?: Json | null
          story_id: string
          storyteller_id: string
          webhooks_delivered_at?: string | null
          webhooks_triggered?: boolean | null
        }
        Update: {
          app_id?: string
          change_reason?: string | null
          change_type?: string
          changed_by?: string | null
          consent_id?: string
          created_at?: string | null
          id?: string
          new_state?: Json | null
          previous_state?: Json | null
          story_id?: string
          storyteller_id?: string
          webhooks_delivered_at?: string | null
          webhooks_triggered?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "consent_change_log_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "external_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consent_change_log_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "syndicated_stories"
            referencedColumns: ["app_id"]
          },
          {
            foreignKeyName: "consent_change_log_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consent_change_log_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consent_change_log_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories_with_trust_indicators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consent_change_log_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "syndicated_stories"
            referencedColumns: ["story_id"]
          },
          {
            foreignKeyName: "consent_change_log_storyteller_id_fkey"
            columns: ["storyteller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      content_approval_queue: {
        Row: {
          content_preview: string | null
          content_type: string
          created_at: string | null
          cultural_approved: boolean | null
          cultural_review_notes: string | null
          cultural_review_required: boolean | null
          cultural_reviewer_id: string | null
          elder_approved: boolean | null
          elder_review_notes: string | null
          elder_review_required: boolean | null
          elder_reviewer_id: string | null
          empathy_entry_id: string | null
          id: string
          privacy_level: string | null
          publish_to_website: boolean | null
          published_at: string | null
          published_url: string | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          submitted_at: string | null
          submitted_by: string | null
          summary: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          content_preview?: string | null
          content_type: string
          created_at?: string | null
          cultural_approved?: boolean | null
          cultural_review_notes?: string | null
          cultural_review_required?: boolean | null
          cultural_reviewer_id?: string | null
          elder_approved?: boolean | null
          elder_review_notes?: string | null
          elder_review_required?: boolean | null
          elder_reviewer_id?: string | null
          empathy_entry_id?: string | null
          id?: string
          privacy_level?: string | null
          publish_to_website?: boolean | null
          published_at?: string | null
          published_url?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          submitted_at?: string | null
          submitted_by?: string | null
          summary?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          content_preview?: string | null
          content_type?: string
          created_at?: string | null
          cultural_approved?: boolean | null
          cultural_review_notes?: string | null
          cultural_review_required?: boolean | null
          cultural_reviewer_id?: string | null
          elder_approved?: boolean | null
          elder_review_notes?: string | null
          elder_review_required?: boolean | null
          elder_reviewer_id?: string | null
          empathy_entry_id?: string | null
          id?: string
          privacy_level?: string | null
          publish_to_website?: boolean | null
          published_at?: string | null
          published_url?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          submitted_at?: string | null
          submitted_by?: string | null
          summary?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_approval_queue_empathy_entry_id_fkey"
            columns: ["empathy_entry_id"]
            isOneToOne: false
            referencedRelation: "empathy_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      content_cache: {
        Row: {
          access_count: number | null
          cache_timestamp: string | null
          compression_used: boolean | null
          content_hash: string
          content_size_bytes: number | null
          content_type: string | null
          expiry_timestamp: string | null
          extraction_metadata: Json | null
          id: string
          last_accessed: string | null
          processed_content: Json | null
          raw_content: string | null
          url: string
          url_hash: string
        }
        Insert: {
          access_count?: number | null
          cache_timestamp?: string | null
          compression_used?: boolean | null
          content_hash: string
          content_size_bytes?: number | null
          content_type?: string | null
          expiry_timestamp?: string | null
          extraction_metadata?: Json | null
          id?: string
          last_accessed?: string | null
          processed_content?: Json | null
          raw_content?: string | null
          url: string
          url_hash: string
        }
        Update: {
          access_count?: number | null
          cache_timestamp?: string | null
          compression_used?: boolean | null
          content_hash?: string
          content_size_bytes?: number | null
          content_type?: string | null
          expiry_timestamp?: string | null
          extraction_metadata?: Json | null
          id?: string
          last_accessed?: string | null
          processed_content?: Json | null
          raw_content?: string | null
          url?: string
          url_hash?: string
        }
        Relationships: []
      }
      cross_narrative_insights: {
        Row: {
          actionability_score: number | null
          affected_storytellers: string[] | null
          ai_model_version: string | null
          confidence_level: number | null
          created_at: string | null
          data_sources: string[] | null
          demographic_scope: string[] | null
          description: string
          geographic_scope: string[] | null
          id: string
          implications: string | null
          insight_category: string | null
          insight_type: string
          peer_reviewed: boolean | null
          potential_reach: number | null
          recommendations: string | null
          significance: string | null
          statistical_evidence: Json | null
          status: string | null
          storyteller_count: number | null
          supporting_connections: string[] | null
          supporting_quotes: string[] | null
          supporting_themes: string[] | null
          tenant_id: string
          time_period_end: string | null
          time_period_start: string | null
          title: string
          trend_direction: string | null
          updated_at: string | null
          urgency_level: string | null
          validation_method: string | null
          velocity_score: number | null
          visibility_level: string | null
        }
        Insert: {
          actionability_score?: number | null
          affected_storytellers?: string[] | null
          ai_model_version?: string | null
          confidence_level?: number | null
          created_at?: string | null
          data_sources?: string[] | null
          demographic_scope?: string[] | null
          description: string
          geographic_scope?: string[] | null
          id?: string
          implications?: string | null
          insight_category?: string | null
          insight_type: string
          peer_reviewed?: boolean | null
          potential_reach?: number | null
          recommendations?: string | null
          significance?: string | null
          statistical_evidence?: Json | null
          status?: string | null
          storyteller_count?: number | null
          supporting_connections?: string[] | null
          supporting_quotes?: string[] | null
          supporting_themes?: string[] | null
          tenant_id: string
          time_period_end?: string | null
          time_period_start?: string | null
          title: string
          trend_direction?: string | null
          updated_at?: string | null
          urgency_level?: string | null
          validation_method?: string | null
          velocity_score?: number | null
          visibility_level?: string | null
        }
        Update: {
          actionability_score?: number | null
          affected_storytellers?: string[] | null
          ai_model_version?: string | null
          confidence_level?: number | null
          created_at?: string | null
          data_sources?: string[] | null
          demographic_scope?: string[] | null
          description?: string
          geographic_scope?: string[] | null
          id?: string
          implications?: string | null
          insight_category?: string | null
          insight_type?: string
          peer_reviewed?: boolean | null
          potential_reach?: number | null
          recommendations?: string | null
          significance?: string | null
          statistical_evidence?: Json | null
          status?: string | null
          storyteller_count?: number | null
          supporting_connections?: string[] | null
          supporting_quotes?: string[] | null
          supporting_themes?: string[] | null
          tenant_id?: string
          time_period_end?: string | null
          time_period_start?: string | null
          title?: string
          trend_direction?: string | null
          updated_at?: string | null
          urgency_level?: string | null
          validation_method?: string | null
          velocity_score?: number | null
          visibility_level?: string | null
        }
        Relationships: []
      }
      cross_sector_insights: {
        Row: {
          ai_confidence_score: number | null
          collaboration_opportunities: string[] | null
          combined_impact_potential: number | null
          created_at: string | null
          geographic_regions: string[] | null
          human_verified: boolean | null
          id: string
          policy_change_potential: string[] | null
          primary_sector: string
          resource_sharing_opportunities: string[] | null
          secondary_sector: string
          shared_themes: string[] | null
          storyteller_connections: Json | null
          supporting_stories: string[] | null
          tenant_id: string
          updated_at: string | null
          verification_notes: string | null
        }
        Insert: {
          ai_confidence_score?: number | null
          collaboration_opportunities?: string[] | null
          combined_impact_potential?: number | null
          created_at?: string | null
          geographic_regions?: string[] | null
          human_verified?: boolean | null
          id?: string
          policy_change_potential?: string[] | null
          primary_sector: string
          resource_sharing_opportunities?: string[] | null
          secondary_sector: string
          shared_themes?: string[] | null
          storyteller_connections?: Json | null
          supporting_stories?: string[] | null
          tenant_id: string
          updated_at?: string | null
          verification_notes?: string | null
        }
        Update: {
          ai_confidence_score?: number | null
          collaboration_opportunities?: string[] | null
          combined_impact_potential?: number | null
          created_at?: string | null
          geographic_regions?: string[] | null
          human_verified?: boolean | null
          id?: string
          policy_change_potential?: string[] | null
          primary_sector?: string
          resource_sharing_opportunities?: string[] | null
          secondary_sector?: string
          shared_themes?: string[] | null
          storyteller_connections?: Json | null
          supporting_stories?: string[] | null
          tenant_id?: string
          updated_at?: string | null
          verification_notes?: string | null
        }
        Relationships: []
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
          {
            foreignKeyName: "cultural_protocols_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_ai_usage_summary"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      cultural_speech_patterns: {
        Row: {
          audio_id: string
          confidence: number | null
          created_at: string | null
          cultural_context: string | null
          description: string | null
          detected_by: string | null
          id: string
          pattern_type: string | null
          story_id: string | null
          time_end: number | null
          time_start: number | null
          validated_by_community: boolean | null
        }
        Insert: {
          audio_id: string
          confidence?: number | null
          created_at?: string | null
          cultural_context?: string | null
          description?: string | null
          detected_by?: string | null
          id?: string
          pattern_type?: string | null
          story_id?: string | null
          time_end?: number | null
          time_start?: number | null
          validated_by_community?: boolean | null
        }
        Update: {
          audio_id?: string
          confidence?: number | null
          created_at?: string | null
          cultural_context?: string | null
          description?: string | null
          detected_by?: string | null
          id?: string
          pattern_type?: string | null
          story_id?: string | null
          time_end?: number | null
          time_start?: number | null
          validated_by_community?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "cultural_speech_patterns_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cultural_speech_patterns_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories_with_trust_indicators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cultural_speech_patterns_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "syndicated_stories"
            referencedColumns: ["story_id"]
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
      data_quality_metrics: {
        Row: {
          benchmark_comparison: Json | null
          created_at: string | null
          data_source: string | null
          id: string
          improvement_suggestions: string[] | null
          measurement_date: string | null
          metric_details: Json | null
          metric_type: string
          metric_value: number
          organization_id: string | null
        }
        Insert: {
          benchmark_comparison?: Json | null
          created_at?: string | null
          data_source?: string | null
          id?: string
          improvement_suggestions?: string[] | null
          measurement_date?: string | null
          metric_details?: Json | null
          metric_type: string
          metric_value: number
          organization_id?: string | null
        }
        Update: {
          benchmark_comparison?: Json | null
          created_at?: string | null
          data_source?: string | null
          id?: string
          improvement_suggestions?: string[] | null
          measurement_date?: string | null
          metric_details?: Json | null
          metric_type?: string
          metric_value?: number
          organization_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "data_quality_metrics_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "data_quality_metrics_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      data_sources: {
        Row: {
          active: boolean | null
          api_endpoint: string | null
          base_url: string
          created_at: string | null
          discovery_patterns: Json | null
          id: string
          last_error_message: string | null
          last_successful_scrape: string | null
          max_concurrent_requests: number | null
          name: string
          rate_limit_ms: number | null
          reliability_score: number | null
          respect_robots_txt: boolean | null
          scraping_config: Json
          type: string
          update_frequency: string | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          api_endpoint?: string | null
          base_url: string
          created_at?: string | null
          discovery_patterns?: Json | null
          id?: string
          last_error_message?: string | null
          last_successful_scrape?: string | null
          max_concurrent_requests?: number | null
          name: string
          rate_limit_ms?: number | null
          reliability_score?: number | null
          respect_robots_txt?: boolean | null
          scraping_config?: Json
          type: string
          update_frequency?: string | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          api_endpoint?: string | null
          base_url?: string
          created_at?: string | null
          discovery_patterns?: Json | null
          id?: string
          last_error_message?: string | null
          last_successful_scrape?: string | null
          max_concurrent_requests?: number | null
          name?: string
          rate_limit_ms?: number | null
          reliability_score?: number | null
          respect_robots_txt?: boolean | null
          scraping_config?: Json
          type?: string
          update_frequency?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      deletion_requests: {
        Row: {
          admin_notes: string | null
          completed_at: string | null
          completion_report: Json | null
          data_export_expires_at: string | null
          data_export_url: string | null
          error_message: string | null
          id: string
          items_failed: number | null
          items_processed: number | null
          items_total: number | null
          processed_by: string | null
          processing_log: Json | null
          processing_started_at: string | null
          reason: string | null
          request_type: string
          requested_at: string | null
          scope: Json | null
          status: string | null
          tenant_id: string
          updated_at: string | null
          user_id: string
          verification_attempts: number | null
          verification_expires_at: string | null
          verification_token: string | null
          verified_at: string | null
        }
        Insert: {
          admin_notes?: string | null
          completed_at?: string | null
          completion_report?: Json | null
          data_export_expires_at?: string | null
          data_export_url?: string | null
          error_message?: string | null
          id?: string
          items_failed?: number | null
          items_processed?: number | null
          items_total?: number | null
          processed_by?: string | null
          processing_log?: Json | null
          processing_started_at?: string | null
          reason?: string | null
          request_type: string
          requested_at?: string | null
          scope?: Json | null
          status?: string | null
          tenant_id: string
          updated_at?: string | null
          user_id: string
          verification_attempts?: number | null
          verification_expires_at?: string | null
          verification_token?: string | null
          verified_at?: string | null
        }
        Update: {
          admin_notes?: string | null
          completed_at?: string | null
          completion_report?: Json | null
          data_export_expires_at?: string | null
          data_export_url?: string | null
          error_message?: string | null
          id?: string
          items_failed?: number | null
          items_processed?: number | null
          items_total?: number | null
          processed_by?: string | null
          processing_log?: Json | null
          processing_started_at?: string | null
          reason?: string | null
          request_type?: string
          requested_at?: string | null
          scope?: Json | null
          status?: string | null
          tenant_id?: string
          updated_at?: string | null
          user_id?: string
          verification_attempts?: number | null
          verification_expires_at?: string | null
          verification_token?: string | null
          verified_at?: string | null
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
      document_outcomes: {
        Row: {
          confidence_score: number | null
          document_id: string
          evidence_page: number | null
          evidence_text: string | null
          evidence_type: string | null
          extracted_at: string | null
          extracted_by: string | null
          extraction_method: string | null
          id: string
          outcome_id: string
          relevance_score: number | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          confidence_score?: number | null
          document_id: string
          evidence_page?: number | null
          evidence_text?: string | null
          evidence_type?: string | null
          extracted_at?: string | null
          extracted_by?: string | null
          extraction_method?: string | null
          id?: string
          outcome_id: string
          relevance_score?: number | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          confidence_score?: number | null
          document_id?: string
          evidence_page?: number | null
          evidence_text?: string | null
          evidence_type?: string | null
          extracted_at?: string | null
          extracted_by?: string | null
          extraction_method?: string | null
          id?: string
          outcome_id?: string
          relevance_score?: number | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_outcomes_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "transcripts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_outcomes_outcome_id_fkey"
            columns: ["outcome_id"]
            isOneToOne: false
            referencedRelation: "outcomes"
            referencedColumns: ["id"]
          },
        ]
      }
      dream_organizations: {
        Row: {
          category: string
          city: string | null
          contact_notes: string | null
          contact_status: string | null
          country: string | null
          created_at: string | null
          description: string
          id: string
          latitude: number | null
          location_text: string | null
          logo_url: string | null
          longitude: number | null
          name: string
          priority: number | null
          updated_at: string | null
          website_url: string | null
          why_connect: string
        }
        Insert: {
          category: string
          city?: string | null
          contact_notes?: string | null
          contact_status?: string | null
          country?: string | null
          created_at?: string | null
          description: string
          id?: string
          latitude?: number | null
          location_text?: string | null
          logo_url?: string | null
          longitude?: number | null
          name: string
          priority?: number | null
          updated_at?: string | null
          website_url?: string | null
          why_connect: string
        }
        Update: {
          category?: string
          city?: string | null
          contact_notes?: string | null
          contact_status?: string | null
          country?: string | null
          created_at?: string | null
          description?: string
          id?: string
          latitude?: number | null
          location_text?: string | null
          logo_url?: string | null
          longitude?: number | null
          name?: string
          priority?: number | null
          updated_at?: string | null
          website_url?: string | null
          why_connect?: string
        }
        Relationships: []
      }
      elder_review_queue: {
        Row: {
          assigned_at: string | null
          assigned_elder_id: string | null
          community_input_required: boolean | null
          content_id: string
          content_type: string
          created_at: string | null
          cultural_issues: Json | null
          due_date: string | null
          id: string
          priority: string
          review_conditions: string[] | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          assigned_at?: string | null
          assigned_elder_id?: string | null
          community_input_required?: boolean | null
          content_id: string
          content_type: string
          created_at?: string | null
          cultural_issues?: Json | null
          due_date?: string | null
          id?: string
          priority?: string
          review_conditions?: string[] | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          assigned_at?: string | null
          assigned_elder_id?: string | null
          community_input_required?: boolean | null
          content_id?: string
          content_type?: string
          created_at?: string | null
          cultural_issues?: Json | null
          due_date?: string | null
          id?: string
          priority?: string
          review_conditions?: string[] | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "elder_review_queue_assigned_elder_id_fkey"
            columns: ["assigned_elder_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "elder_review_queue_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      embed_tokens: {
        Row: {
          allow_analytics: boolean | null
          allowed_domains: string[] | null
          created_at: string | null
          created_by: string | null
          custom_styles: Json | null
          distribution_id: string | null
          expires_at: string | null
          id: string
          last_used_at: string | null
          last_used_domain: string | null
          last_used_ip: unknown
          revocation_reason: string | null
          revoked_at: string | null
          revoked_by: string | null
          show_attribution: boolean | null
          status: string | null
          story_id: string
          tenant_id: string
          token: string
          token_hash: string
          updated_at: string | null
          usage_count: number | null
        }
        Insert: {
          allow_analytics?: boolean | null
          allowed_domains?: string[] | null
          created_at?: string | null
          created_by?: string | null
          custom_styles?: Json | null
          distribution_id?: string | null
          expires_at?: string | null
          id?: string
          last_used_at?: string | null
          last_used_domain?: string | null
          last_used_ip?: unknown
          revocation_reason?: string | null
          revoked_at?: string | null
          revoked_by?: string | null
          show_attribution?: boolean | null
          status?: string | null
          story_id: string
          tenant_id: string
          token: string
          token_hash: string
          updated_at?: string | null
          usage_count?: number | null
        }
        Update: {
          allow_analytics?: boolean | null
          allowed_domains?: string[] | null
          created_at?: string | null
          created_by?: string | null
          custom_styles?: Json | null
          distribution_id?: string | null
          expires_at?: string | null
          id?: string
          last_used_at?: string | null
          last_used_domain?: string | null
          last_used_ip?: unknown
          revocation_reason?: string | null
          revoked_at?: string | null
          revoked_by?: string | null
          show_attribution?: boolean | null
          status?: string | null
          story_id?: string
          tenant_id?: string
          token?: string
          token_hash?: string
          updated_at?: string | null
          usage_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "embed_tokens_distribution_id_fkey"
            columns: ["distribution_id"]
            isOneToOne: false
            referencedRelation: "story_distributions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "embed_tokens_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "embed_tokens_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories_with_trust_indicators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "embed_tokens_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "syndicated_stories"
            referencedColumns: ["story_id"]
          },
        ]
      }
      empathy_entries: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          change_pathway: string | null
          created_at: string | null
          created_by: string | null
          document_urls: string[] | null
          id: string
          impact_indicator: string | null
          linked_outcome_id: string | null
          linked_story_id: string | null
          linked_transcript_id: string | null
          media_urls: string[] | null
          narrative: string
          organization_id: string
          outcome_level: string | null
          privacy_level: string | null
          publish_status: string | null
          ready_to_publish: boolean | null
          rejection_reason: string | null
          service_area: string | null
          storyteller_consent: boolean | null
          storyteller_name: string | null
          sync_date: string | null
          synced_to_oonchiumpa: boolean | null
          target_group: string | null
          timeframe: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          change_pathway?: string | null
          created_at?: string | null
          created_by?: string | null
          document_urls?: string[] | null
          id?: string
          impact_indicator?: string | null
          linked_outcome_id?: string | null
          linked_story_id?: string | null
          linked_transcript_id?: string | null
          media_urls?: string[] | null
          narrative: string
          organization_id: string
          outcome_level?: string | null
          privacy_level?: string | null
          publish_status?: string | null
          ready_to_publish?: boolean | null
          rejection_reason?: string | null
          service_area?: string | null
          storyteller_consent?: boolean | null
          storyteller_name?: string | null
          sync_date?: string | null
          synced_to_oonchiumpa?: boolean | null
          target_group?: string | null
          timeframe?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          change_pathway?: string | null
          created_at?: string | null
          created_by?: string | null
          document_urls?: string[] | null
          id?: string
          impact_indicator?: string | null
          linked_outcome_id?: string | null
          linked_story_id?: string | null
          linked_transcript_id?: string | null
          media_urls?: string[] | null
          narrative?: string
          organization_id?: string
          outcome_level?: string | null
          privacy_level?: string | null
          publish_status?: string | null
          ready_to_publish?: boolean | null
          rejection_reason?: string | null
          service_area?: string | null
          storyteller_consent?: boolean | null
          storyteller_name?: string | null
          sync_date?: string | null
          synced_to_oonchiumpa?: boolean | null
          target_group?: string | null
          timeframe?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      empathy_sync_log: {
        Row: {
          created_media_ids: string[] | null
          created_outcome_id: string | null
          created_story_id: string | null
          created_transcript_id: string | null
          empathy_entry_id: string | null
          error_details: Json | null
          error_message: string | null
          id: string
          source_data: Json | null
          sync_status: string
          sync_type: string
          synced_at: string | null
          synced_by: string | null
        }
        Insert: {
          created_media_ids?: string[] | null
          created_outcome_id?: string | null
          created_story_id?: string | null
          created_transcript_id?: string | null
          empathy_entry_id?: string | null
          error_details?: Json | null
          error_message?: string | null
          id?: string
          source_data?: Json | null
          sync_status: string
          sync_type: string
          synced_at?: string | null
          synced_by?: string | null
        }
        Update: {
          created_media_ids?: string[] | null
          created_outcome_id?: string | null
          created_story_id?: string | null
          created_transcript_id?: string | null
          empathy_entry_id?: string | null
          error_details?: Json | null
          error_message?: string | null
          id?: string
          source_data?: Json | null
          sync_status?: string
          sync_type?: string
          synced_at?: string | null
          synced_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "empathy_sync_log_empathy_entry_id_fkey"
            columns: ["empathy_entry_id"]
            isOneToOne: false
            referencedRelation: "empathy_entries"
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
          ip_address: unknown
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
          ip_address?: unknown
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
          ip_address?: unknown
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
            foreignKeyName: "events_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_ai_usage_summary"
            referencedColumns: ["tenant_id"]
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
          ip_address: unknown
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
          ip_address?: unknown
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
          ip_address?: unknown
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
          ip_address: unknown
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
          ip_address?: unknown
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
          ip_address?: unknown
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
          ip_address: unknown
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
          ip_address?: unknown
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
          ip_address?: unknown
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
      external_applications: {
        Row: {
          allowed_story_types: string[] | null
          api_key_hash: string
          app_description: string | null
          app_display_name: string
          app_name: string
          created_at: string | null
          id: string
          is_active: boolean | null
          onboarding_completed_at: string | null
          portal_enabled: boolean | null
          portal_settings: Json | null
          updated_at: string | null
        }
        Insert: {
          allowed_story_types?: string[] | null
          api_key_hash: string
          app_description?: string | null
          app_display_name: string
          app_name: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          onboarding_completed_at?: string | null
          portal_enabled?: boolean | null
          portal_settings?: Json | null
          updated_at?: string | null
        }
        Update: {
          allowed_story_types?: string[] | null
          api_key_hash?: string
          app_description?: string | null
          app_display_name?: string
          app_name?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          onboarding_completed_at?: string | null
          portal_enabled?: boolean | null
          portal_settings?: Json | null
          updated_at?: string | null
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
          search_vector: unknown
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
          search_vector?: unknown
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
          search_vector?: unknown
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
            referencedRelation: "organization_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "extracted_quotes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
      gallery_media: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          media_type: string
          tenant_id: string
          title: string
          updated_at: string | null
          url: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          media_type: string
          tenant_id: string
          title: string
          updated_at?: string | null
          url: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          media_type?: string
          tenant_id?: string
          title?: string
          updated_at?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "gallery_media_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_analytics"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "gallery_media_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gallery_media_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_ai_usage_summary"
            referencedColumns: ["tenant_id"]
          },
        ]
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
          privacy_level: string | null
          source_empathy_entry_id: string | null
          sync_date: string | null
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
          privacy_level?: string | null
          source_empathy_entry_id?: string | null
          sync_date?: string | null
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
          privacy_level?: string | null
          source_empathy_entry_id?: string | null
          sync_date?: string | null
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
      geographic_impact_patterns: {
        Row: {
          ai_analysis_confidence: number | null
          collaboration_networks: Json | null
          community_engagement_level: string | null
          created_at: string | null
          emerging_issues: string[] | null
          geographic_scope: string
          id: string
          impact_trajectory: string | null
          key_stories: string[] | null
          location_id: string | null
          primary_themes: string[] | null
          region_name: string
          resource_needs: string[] | null
          storyteller_density: number | null
          success_patterns: string[] | null
          supporting_storytellers: string[] | null
          tenant_id: string
          theme_evolution_data: Json | null
          updated_at: string | null
        }
        Insert: {
          ai_analysis_confidence?: number | null
          collaboration_networks?: Json | null
          community_engagement_level?: string | null
          created_at?: string | null
          emerging_issues?: string[] | null
          geographic_scope: string
          id?: string
          impact_trajectory?: string | null
          key_stories?: string[] | null
          location_id?: string | null
          primary_themes?: string[] | null
          region_name: string
          resource_needs?: string[] | null
          storyteller_density?: number | null
          success_patterns?: string[] | null
          supporting_storytellers?: string[] | null
          tenant_id: string
          theme_evolution_data?: Json | null
          updated_at?: string | null
        }
        Update: {
          ai_analysis_confidence?: number | null
          collaboration_networks?: Json | null
          community_engagement_level?: string | null
          created_at?: string | null
          emerging_issues?: string[] | null
          geographic_scope?: string
          id?: string
          impact_trajectory?: string | null
          key_stories?: string[] | null
          location_id?: string | null
          primary_themes?: string[] | null
          region_name?: string
          resource_needs?: string[] | null
          storyteller_density?: number | null
          success_patterns?: string[] | null
          supporting_storytellers?: string[] | null
          tenant_id?: string
          theme_evolution_data?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "geographic_impact_patterns_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      harvested_outcomes: {
        Row: {
          change_type: string | null
          community_validated: boolean | null
          contribution_narrative: string | null
          created_at: string | null
          evidence_quotes: string[] | null
          evidence_source: string | null
          harvested_by: string | null
          harvested_date: string | null
          how_much_changed: string | null
          id: string
          is_unexpected: boolean | null
          outcome_description: string
          project_id: string | null
          significance_level: string | null
          story_id: string | null
          validated_by: string | null
          validated_date: string | null
          what_changed: string | null
          who_changed: string | null
        }
        Insert: {
          change_type?: string | null
          community_validated?: boolean | null
          contribution_narrative?: string | null
          created_at?: string | null
          evidence_quotes?: string[] | null
          evidence_source?: string | null
          harvested_by?: string | null
          harvested_date?: string | null
          how_much_changed?: string | null
          id?: string
          is_unexpected?: boolean | null
          outcome_description: string
          project_id?: string | null
          significance_level?: string | null
          story_id?: string | null
          validated_by?: string | null
          validated_date?: string | null
          what_changed?: string | null
          who_changed?: string | null
        }
        Update: {
          change_type?: string | null
          community_validated?: boolean | null
          contribution_narrative?: string | null
          created_at?: string | null
          evidence_quotes?: string[] | null
          evidence_source?: string | null
          harvested_by?: string | null
          harvested_date?: string | null
          how_much_changed?: string | null
          id?: string
          is_unexpected?: boolean | null
          outcome_description?: string
          project_id?: string | null
          significance_level?: string | null
          story_id?: string | null
          validated_by?: string | null
          validated_date?: string | null
          what_changed?: string | null
          who_changed?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "harvested_outcomes_harvested_by_fkey"
            columns: ["harvested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "harvested_outcomes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "harvested_outcomes_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "harvested_outcomes_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories_with_trust_indicators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "harvested_outcomes_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "syndicated_stories"
            referencedColumns: ["story_id"]
          },
          {
            foreignKeyName: "harvested_outcomes_validated_by_fkey"
            columns: ["validated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      impact_stats: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_visible: boolean | null
          label: string
          number: string
          section: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_visible?: boolean | null
          label: string
          number: string
          section?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_visible?: boolean | null
          label?: string
          number?: string
          section?: string | null
          updated_at?: string | null
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
      media_assets: {
        Row: {
          alt_text: string | null
          bitrate: number | null
          cdn_url: string | null
          checksum: string | null
          collection_id: string | null
          consent_granted: boolean | null
          consent_granted_at: string | null
          consent_granted_by: string | null
          consent_obtained: boolean | null
          created_at: string | null
          cultural_sensitivity: string | null
          cultural_sensitivity_level: string
          description: string | null
          display_name: string | null
          download_count: number | null
          downloads_count: number | null
          duration: number | null
          elder_approved: boolean | null
          file_hash: string | null
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
          search_vector: unknown
          source_type: string | null
          source_url: string | null
          status: string | null
          storage_bucket: string
          storage_path: string
          story_id: string | null
          taken_at: string | null
          tenant_id: string
          thumbnail_url: string | null
          title: string | null
          transcript_file_path: string | null
          transcript_format: string | null
          transcript_id: string | null
          updated_at: string | null
          uploaded_at: string | null
          uploaded_by: string | null
          uploader_id: string
          url: string | null
          usage_rights: string | null
          view_count: number | null
          views_count: number | null
          visibility: string | null
          width: number | null
        }
        Insert: {
          alt_text?: string | null
          bitrate?: number | null
          cdn_url?: string | null
          checksum?: string | null
          collection_id?: string | null
          consent_granted?: boolean | null
          consent_granted_at?: string | null
          consent_granted_by?: string | null
          consent_obtained?: boolean | null
          created_at?: string | null
          cultural_sensitivity?: string | null
          cultural_sensitivity_level?: string
          description?: string | null
          display_name?: string | null
          download_count?: number | null
          downloads_count?: number | null
          duration?: number | null
          elder_approved?: boolean | null
          file_hash?: string | null
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
          search_vector?: unknown
          source_type?: string | null
          source_url?: string | null
          status?: string | null
          storage_bucket: string
          storage_path: string
          story_id?: string | null
          taken_at?: string | null
          tenant_id: string
          thumbnail_url?: string | null
          title?: string | null
          transcript_file_path?: string | null
          transcript_format?: string | null
          transcript_id?: string | null
          updated_at?: string | null
          uploaded_at?: string | null
          uploaded_by?: string | null
          uploader_id: string
          url?: string | null
          usage_rights?: string | null
          view_count?: number | null
          views_count?: number | null
          visibility?: string | null
          width?: number | null
        }
        Update: {
          alt_text?: string | null
          bitrate?: number | null
          cdn_url?: string | null
          checksum?: string | null
          collection_id?: string | null
          consent_granted?: boolean | null
          consent_granted_at?: string | null
          consent_granted_by?: string | null
          consent_obtained?: boolean | null
          created_at?: string | null
          cultural_sensitivity?: string | null
          cultural_sensitivity_level?: string
          description?: string | null
          display_name?: string | null
          download_count?: number | null
          downloads_count?: number | null
          duration?: number | null
          elder_approved?: boolean | null
          file_hash?: string | null
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
          search_vector?: unknown
          source_type?: string | null
          source_url?: string | null
          status?: string | null
          storage_bucket?: string
          storage_path?: string
          story_id?: string | null
          taken_at?: string | null
          tenant_id?: string
          thumbnail_url?: string | null
          title?: string | null
          transcript_file_path?: string | null
          transcript_format?: string | null
          transcript_id?: string | null
          updated_at?: string | null
          uploaded_at?: string | null
          uploaded_by?: string | null
          uploader_id?: string
          url?: string | null
          usage_rights?: string | null
          view_count?: number | null
          views_count?: number | null
          visibility?: string | null
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "media_assets_consent_granted_by_fkey"
            columns: ["consent_granted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_assets_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_assets_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
            foreignKeyName: "media_assets_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_ai_usage_summary"
            referencedColumns: ["tenant_id"]
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
      media_files: {
        Row: {
          category: string
          created_at: string | null
          created_by: string
          cultural_sensitivity: string
          description: string | null
          dimensions: Json | null
          duration: number | null
          elder_approved: boolean | null
          file_size: number
          id: string
          project_id: string | null
          story_id: string | null
          storyteller_id: string | null
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          type: string
          updated_at: string | null
          url: string
        }
        Insert: {
          category: string
          created_at?: string | null
          created_by: string
          cultural_sensitivity?: string
          description?: string | null
          dimensions?: Json | null
          duration?: number | null
          elder_approved?: boolean | null
          file_size: number
          id?: string
          project_id?: string | null
          story_id?: string | null
          storyteller_id?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          type: string
          updated_at?: string | null
          url: string
        }
        Update: {
          category?: string
          created_at?: string | null
          created_by?: string
          cultural_sensitivity?: string
          description?: string | null
          dimensions?: Json | null
          duration?: number | null
          elder_approved?: boolean | null
          file_size?: number
          id?: string
          project_id?: string | null
          story_id?: string | null
          storyteller_id?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          type?: string
          updated_at?: string | null
          url?: string
        }
        Relationships: []
      }
      media_import_sessions: {
        Row: {
          created_at: string | null
          errors: Json | null
          files: Json | null
          grouped_stories: Json | null
          id: string
          media_linked: number | null
          organization_id: string | null
          status: string | null
          stories_created: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          errors?: Json | null
          files?: Json | null
          grouped_stories?: Json | null
          id?: string
          media_linked?: number | null
          organization_id?: string | null
          status?: string | null
          stories_created?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          errors?: Json | null
          files?: Json | null
          grouped_stories?: Json | null
          id?: string
          media_linked?: number | null
          organization_id?: string | null
          status?: string | null
          stories_created?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_import_sessions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_import_sessions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      media_usage_tracking: {
        Row: {
          added_by: string | null
          created_at: string | null
          id: string
          media_asset_id: string | null
          ordinal_position: number | null
          usage_context: string | null
          usage_role: string | null
          used_in_id: string | null
          used_in_type: string | null
        }
        Insert: {
          added_by?: string | null
          created_at?: string | null
          id?: string
          media_asset_id?: string | null
          ordinal_position?: number | null
          usage_context?: string | null
          usage_role?: string | null
          used_in_id?: string | null
          used_in_type?: string | null
        }
        Update: {
          added_by?: string | null
          created_at?: string | null
          id?: string
          media_asset_id?: string | null
          ordinal_position?: number | null
          usage_context?: string | null
          usage_role?: string | null
          used_in_id?: string | null
          used_in_type?: string | null
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
      message_recipients: {
        Row: {
          created_at: string | null
          delivery_error: string | null
          email_opened_at: string | null
          email_sent_at: string | null
          id: string
          in_app_delivered_at: string | null
          in_app_read_at: string | null
          message_id: string
          recipient_id: string
          sms_sent_at: string | null
        }
        Insert: {
          created_at?: string | null
          delivery_error?: string | null
          email_opened_at?: string | null
          email_sent_at?: string | null
          id?: string
          in_app_delivered_at?: string | null
          in_app_read_at?: string | null
          message_id: string
          recipient_id: string
          sms_sent_at?: string | null
        }
        Update: {
          created_at?: string | null
          delivery_error?: string | null
          email_opened_at?: string | null
          email_sent_at?: string | null
          id?: string
          in_app_delivered_at?: string | null
          in_app_read_at?: string | null
          message_id?: string
          recipient_id?: string
          sms_sent_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "message_recipients_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "admin_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      moderation_appeals: {
        Row: {
          additional_context: string | null
          appeal_reason: string
          appeal_status: string
          created_at: string | null
          id: string
          moderation_request_id: string
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          submitted_at: string
          user_id: string
        }
        Insert: {
          additional_context?: string | null
          appeal_reason: string
          appeal_status?: string
          created_at?: string | null
          id?: string
          moderation_request_id: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          submitted_at?: string
          user_id: string
        }
        Update: {
          additional_context?: string | null
          appeal_reason?: string
          appeal_status?: string
          created_at?: string | null
          id?: string
          moderation_request_id?: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          submitted_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "moderation_appeals_moderation_request_id_fkey"
            columns: ["moderation_request_id"]
            isOneToOne: false
            referencedRelation: "moderation_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moderation_appeals_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      moderation_results: {
        Row: {
          appeals_available: boolean | null
          content_id: string
          content_type: string
          created_at: string | null
          elder_assignment: Json | null
          id: string
          moderated_by: string
          moderation_details: Json
          review_deadline: string | null
          status: string
        }
        Insert: {
          appeals_available?: boolean | null
          content_id: string
          content_type: string
          created_at?: string | null
          elder_assignment?: Json | null
          id: string
          moderated_by?: string
          moderation_details?: Json
          review_deadline?: string | null
          status: string
        }
        Update: {
          appeals_available?: boolean | null
          content_id?: string
          content_type?: string
          created_at?: string | null
          elder_assignment?: Json | null
          id?: string
          moderated_by?: string
          moderation_details?: Json
          review_deadline?: string | null
          status?: string
        }
        Relationships: []
      }
      narrative_themes: {
        Row: {
          ai_confidence_score: number | null
          created_at: string | null
          first_detected_at: string | null
          id: string
          related_themes: string[] | null
          sentiment_score: number | null
          storyteller_count: number | null
          tenant_id: string
          theme_category: string | null
          theme_description: string | null
          theme_name: string
          updated_at: string | null
          usage_count: number | null
        }
        Insert: {
          ai_confidence_score?: number | null
          created_at?: string | null
          first_detected_at?: string | null
          id?: string
          related_themes?: string[] | null
          sentiment_score?: number | null
          storyteller_count?: number | null
          tenant_id: string
          theme_category?: string | null
          theme_description?: string | null
          theme_name: string
          updated_at?: string | null
          usage_count?: number | null
        }
        Update: {
          ai_confidence_score?: number | null
          created_at?: string | null
          first_detected_at?: string | null
          id?: string
          related_themes?: string[] | null
          sentiment_score?: number | null
          storyteller_count?: number | null
          tenant_id?: string
          theme_category?: string | null
          theme_description?: string | null
          theme_name?: string
          updated_at?: string | null
          usage_count?: number | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_label: string | null
          action_url: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          is_read: boolean | null
          message: string
          metadata: Json | null
          priority: string
          read_at: string | null
          recipient_id: string
          title: string
          type: string
        }
        Insert: {
          action_label?: string | null
          action_url?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          metadata?: Json | null
          priority?: string
          read_at?: string | null
          recipient_id: string
          title: string
          type: string
        }
        Update: {
          action_label?: string | null
          action_url?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          metadata?: Json | null
          priority?: string
          read_at?: string | null
          recipient_id?: string
          title?: string
          type?: string
        }
        Relationships: []
      }
      opportunity_recommendations: {
        Row: {
          application_deadline: string | null
          application_strategy: string | null
          community_impact_potential: string | null
          created_at: string | null
          cultural_fit_analysis: string | null
          cultural_focus: boolean | null
          description: string | null
          funding_amount: string | null
          id: string
          match_score: number | null
          matching_skills: string[] | null
          opportunity_type: string | null
          organization: string | null
          profile_id: string | null
          salary_range: string | null
          skill_gaps: string[] | null
          suggested_approach: string | null
          title: string
          updated_at: string | null
          url: string | null
        }
        Insert: {
          application_deadline?: string | null
          application_strategy?: string | null
          community_impact_potential?: string | null
          created_at?: string | null
          cultural_fit_analysis?: string | null
          cultural_focus?: boolean | null
          description?: string | null
          funding_amount?: string | null
          id?: string
          match_score?: number | null
          matching_skills?: string[] | null
          opportunity_type?: string | null
          organization?: string | null
          profile_id?: string | null
          salary_range?: string | null
          skill_gaps?: string[] | null
          suggested_approach?: string | null
          title: string
          updated_at?: string | null
          url?: string | null
        }
        Update: {
          application_deadline?: string | null
          application_strategy?: string | null
          community_impact_potential?: string | null
          created_at?: string | null
          cultural_fit_analysis?: string | null
          cultural_focus?: boolean | null
          description?: string | null
          funding_amount?: string | null
          id?: string
          match_score?: number | null
          matching_skills?: string[] | null
          opportunity_type?: string | null
          organization?: string | null
          profile_id?: string | null
          salary_range?: string | null
          skill_gaps?: string[] | null
          suggested_approach?: string | null
          title?: string
          updated_at?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "opportunity_recommendations_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_analytics: {
        Row: {
          dominant_themes: string[] | null
          executive_summary: string | null
          generated_at: string | null
          id: string
          key_insights: string[] | null
          key_quotes: Json | null
          last_analysis_at: string | null
          network_data: Json | null
          organization_id: string
          quote_count: number | null
          sentiment_analysis: Json | null
          story_count: number | null
          storyteller_connections: Json | null
          theme_count: number | null
          themes: Json | null
          total_word_count: number | null
          transcript_count: number | null
          updated_at: string | null
        }
        Insert: {
          dominant_themes?: string[] | null
          executive_summary?: string | null
          generated_at?: string | null
          id?: string
          key_insights?: string[] | null
          key_quotes?: Json | null
          last_analysis_at?: string | null
          network_data?: Json | null
          organization_id: string
          quote_count?: number | null
          sentiment_analysis?: Json | null
          story_count?: number | null
          storyteller_connections?: Json | null
          theme_count?: number | null
          themes?: Json | null
          total_word_count?: number | null
          transcript_count?: number | null
          updated_at?: string | null
        }
        Update: {
          dominant_themes?: string[] | null
          executive_summary?: string | null
          generated_at?: string | null
          id?: string
          key_insights?: string[] | null
          key_quotes?: Json | null
          last_analysis_at?: string | null
          network_data?: Json | null
          organization_id?: string
          quote_count?: number | null
          sentiment_analysis?: Json | null
          story_count?: number | null
          storyteller_connections?: Json | null
          theme_count?: number | null
          themes?: Json | null
          total_word_count?: number | null
          transcript_count?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_analytics_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organization_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_analytics_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_contexts: {
        Row: {
          ai_model_used: string | null
          approach_description: string | null
          context_type: string | null
          created_at: string | null
          created_by: string | null
          cultural_frameworks: string[] | null
          extraction_quality_score: number | null
          id: string
          impact_domains: Json | null
          impact_philosophy: string | null
          impact_report_urls: string[] | null
          imported_document_text: string | null
          key_principles: string[] | null
          last_updated_by: string | null
          measurement_approach: string | null
          mission: string | null
          organization_id: string
          seed_interview_responses: Json | null
          theory_of_change_url: string | null
          updated_at: string | null
          values: string[] | null
          vision: string | null
          website: string | null
        }
        Insert: {
          ai_model_used?: string | null
          approach_description?: string | null
          context_type?: string | null
          created_at?: string | null
          created_by?: string | null
          cultural_frameworks?: string[] | null
          extraction_quality_score?: number | null
          id?: string
          impact_domains?: Json | null
          impact_philosophy?: string | null
          impact_report_urls?: string[] | null
          imported_document_text?: string | null
          key_principles?: string[] | null
          last_updated_by?: string | null
          measurement_approach?: string | null
          mission?: string | null
          organization_id: string
          seed_interview_responses?: Json | null
          theory_of_change_url?: string | null
          updated_at?: string | null
          values?: string[] | null
          vision?: string | null
          website?: string | null
        }
        Update: {
          ai_model_used?: string | null
          approach_description?: string | null
          context_type?: string | null
          created_at?: string | null
          created_by?: string | null
          cultural_frameworks?: string[] | null
          extraction_quality_score?: number | null
          id?: string
          impact_domains?: Json | null
          impact_philosophy?: string | null
          impact_report_urls?: string[] | null
          imported_document_text?: string | null
          key_principles?: string[] | null
          last_updated_by?: string | null
          measurement_approach?: string | null
          mission?: string | null
          organization_id?: string
          seed_interview_responses?: Json | null
          theory_of_change_url?: string | null
          updated_at?: string | null
          values?: string[] | null
          vision?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_contexts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_contexts_last_updated_by_fkey"
            columns: ["last_updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_contexts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organization_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_contexts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_cross_transcript_insights: {
        Row: {
          confidence_score: number | null
          created_at: string | null
          generated_at: string | null
          generated_by: string | null
          id: string
          insight_description: string | null
          insight_title: string
          insight_type: string
          is_featured: boolean | null
          is_public: boolean | null
          organization_id: string
          related_themes: string[] | null
          significance: string | null
          storyteller_coverage: number | null
          supporting_quotes: Json | null
          supporting_transcripts: string[] | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string | null
          generated_at?: string | null
          generated_by?: string | null
          id?: string
          insight_description?: string | null
          insight_title: string
          insight_type: string
          is_featured?: boolean | null
          is_public?: boolean | null
          organization_id: string
          related_themes?: string[] | null
          significance?: string | null
          storyteller_coverage?: number | null
          supporting_quotes?: Json | null
          supporting_transcripts?: string[] | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          confidence_score?: number | null
          created_at?: string | null
          generated_at?: string | null
          generated_by?: string | null
          id?: string
          insight_description?: string | null
          insight_title?: string
          insight_type?: string
          is_featured?: boolean | null
          is_public?: boolean | null
          organization_id?: string
          related_themes?: string[] | null
          significance?: string | null
          storyteller_coverage?: number | null
          supporting_quotes?: Json | null
          supporting_transcripts?: string[] | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_cross_transcript_insights_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_cross_transcript_insights_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_cross_transcript_insights_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_analytics"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "organization_cross_transcript_insights_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_cross_transcript_insights_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_ai_usage_summary"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      organization_duplicates: {
        Row: {
          confidence_level: string
          detected_at: string | null
          duplicate_organization_id: string | null
          id: string
          matching_fields: string[] | null
          primary_organization_id: string | null
          resolution_notes: string | null
          resolution_status: string | null
          resolved_at: string | null
          resolved_by: string | null
          similarity_score: number
        }
        Insert: {
          confidence_level: string
          detected_at?: string | null
          duplicate_organization_id?: string | null
          id?: string
          matching_fields?: string[] | null
          primary_organization_id?: string | null
          resolution_notes?: string | null
          resolution_status?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          similarity_score: number
        }
        Update: {
          confidence_level?: string
          detected_at?: string | null
          duplicate_organization_id?: string | null
          id?: string
          matching_fields?: string[] | null
          primary_organization_id?: string | null
          resolution_notes?: string | null
          resolution_status?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          similarity_score?: number
        }
        Relationships: [
          {
            foreignKeyName: "organization_duplicates_duplicate_organization_id_fkey"
            columns: ["duplicate_organization_id"]
            isOneToOne: false
            referencedRelation: "organization_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_duplicates_duplicate_organization_id_fkey"
            columns: ["duplicate_organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_duplicates_primary_organization_id_fkey"
            columns: ["primary_organization_id"]
            isOneToOne: false
            referencedRelation: "organization_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_duplicates_primary_organization_id_fkey"
            columns: ["primary_organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_enrichment: {
        Row: {
          active: boolean | null
          confidence_score: number
          created_at: string | null
          data: Json
          enrichment_type: string
          id: string
          organization_id: string | null
          source_metadata: Json | null
          updated_at: string | null
          validated_at: string | null
          validated_by: string | null
          validation_notes: string | null
          validation_status: string | null
        }
        Insert: {
          active?: boolean | null
          confidence_score: number
          created_at?: string | null
          data: Json
          enrichment_type: string
          id?: string
          organization_id?: string | null
          source_metadata?: Json | null
          updated_at?: string | null
          validated_at?: string | null
          validated_by?: string | null
          validation_notes?: string | null
          validation_status?: string | null
        }
        Update: {
          active?: boolean | null
          confidence_score?: number
          created_at?: string | null
          data?: Json
          enrichment_type?: string
          id?: string
          organization_id?: string | null
          source_metadata?: Json | null
          updated_at?: string | null
          validated_at?: string | null
          validated_by?: string | null
          validation_notes?: string | null
          validation_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_enrichment_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_enrichment_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_impact_metrics: {
        Row: {
          active_storytellers: number | null
          analyzed_transcripts: number | null
          calculation_version: string | null
          community_engagement_score: number | null
          created_at: string | null
          cross_cultural_connections: number | null
          cultural_preservation_score: number | null
          cultural_themes: string[] | null
          elder_storytellers: number | null
          featured_storytellers: number | null
          high_impact_quotes: number | null
          id: string
          knowledge_transmission_score: number | null
          last_calculated_at: string | null
          most_powerful_quotes: Json | null
          organization_id: string
          overall_impact_score: number | null
          primary_themes: string[] | null
          published_stories: number | null
          storyteller_connection_density: number | null
          tenant_id: string
          theme_diversity_score: number | null
          total_quotes: number | null
          total_stories: number | null
          total_storytellers: number | null
          total_transcripts: number | null
          updated_at: string | null
        }
        Insert: {
          active_storytellers?: number | null
          analyzed_transcripts?: number | null
          calculation_version?: string | null
          community_engagement_score?: number | null
          created_at?: string | null
          cross_cultural_connections?: number | null
          cultural_preservation_score?: number | null
          cultural_themes?: string[] | null
          elder_storytellers?: number | null
          featured_storytellers?: number | null
          high_impact_quotes?: number | null
          id?: string
          knowledge_transmission_score?: number | null
          last_calculated_at?: string | null
          most_powerful_quotes?: Json | null
          organization_id: string
          overall_impact_score?: number | null
          primary_themes?: string[] | null
          published_stories?: number | null
          storyteller_connection_density?: number | null
          tenant_id: string
          theme_diversity_score?: number | null
          total_quotes?: number | null
          total_stories?: number | null
          total_storytellers?: number | null
          total_transcripts?: number | null
          updated_at?: string | null
        }
        Update: {
          active_storytellers?: number | null
          analyzed_transcripts?: number | null
          calculation_version?: string | null
          community_engagement_score?: number | null
          created_at?: string | null
          cross_cultural_connections?: number | null
          cultural_preservation_score?: number | null
          cultural_themes?: string[] | null
          elder_storytellers?: number | null
          featured_storytellers?: number | null
          high_impact_quotes?: number | null
          id?: string
          knowledge_transmission_score?: number | null
          last_calculated_at?: string | null
          most_powerful_quotes?: Json | null
          organization_id?: string
          overall_impact_score?: number | null
          primary_themes?: string[] | null
          published_stories?: number | null
          storyteller_connection_density?: number | null
          tenant_id?: string
          theme_diversity_score?: number | null
          total_quotes?: number | null
          total_stories?: number | null
          total_storytellers?: number | null
          total_transcripts?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_impact_metrics_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organization_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_impact_metrics_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_impact_metrics_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_analytics"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "organization_impact_metrics_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_impact_metrics_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_ai_usage_summary"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      organization_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string | null
          email: string
          expires_at: string
          id: string
          invitation_code: string
          invited_by: string | null
          metadata: Json | null
          organization_id: string
          profile_id: string | null
          role: string
          status: string | null
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string | null
          email: string
          expires_at: string
          id?: string
          invitation_code?: string
          invited_by?: string | null
          metadata?: Json | null
          organization_id: string
          profile_id?: string | null
          role?: string
          status?: string | null
        }
        Update: {
          accepted_at?: string | null
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          invitation_code?: string
          invited_by?: string | null
          metadata?: Json | null
          organization_id?: string
          profile_id?: string | null
          role?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_invitations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_invitations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_invitations_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          can_approve_stories: boolean | null
          can_manage_members: boolean | null
          can_manage_reports: boolean | null
          can_view_analytics: boolean | null
          created_at: string | null
          end_date: string | null
          id: string
          is_active: boolean | null
          join_date: string | null
          metadata: Json | null
          organization_id: string
          profile_id: string
          role: string
          service_id: string | null
          updated_at: string | null
        }
        Insert: {
          can_approve_stories?: boolean | null
          can_manage_members?: boolean | null
          can_manage_reports?: boolean | null
          can_view_analytics?: boolean | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          join_date?: string | null
          metadata?: Json | null
          organization_id: string
          profile_id: string
          role?: string
          service_id?: string | null
          updated_at?: string | null
        }
        Update: {
          can_approve_stories?: boolean | null
          can_manage_members?: boolean | null
          can_manage_reports?: boolean | null
          can_view_analytics?: boolean | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          join_date?: string | null
          metadata?: Json | null
          organization_id?: string
          profile_id?: string
          role?: string
          service_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "organization_services"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_roles: {
        Row: {
          created_at: string | null
          granted_at: string | null
          granted_by: string | null
          id: string
          is_active: boolean | null
          organization_id: string
          profile_id: string
          revoked_at: string | null
          role: Database["public"]["Enums"]["organization_role"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          is_active?: boolean | null
          organization_id: string
          profile_id: string
          revoked_at?: string | null
          role?: Database["public"]["Enums"]["organization_role"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          is_active?: boolean | null
          organization_id?: string
          profile_id?: string
          revoked_at?: string | null
          role?: Database["public"]["Enums"]["organization_role"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_organization_roles_granted_by"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_organization_roles_organization"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_organization_roles_organization"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_organization_roles_profile"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_services: {
        Row: {
          budget_annual: number | null
          clients_served_annual: number | null
          created_at: string | null
          description: string | null
          icon_name: string | null
          id: string
          impact_categories: string[] | null
          is_active: boolean | null
          manager_profile_id: string | null
          metadata: Json | null
          organization_id: string
          service_category: string
          service_color: string | null
          service_name: string
          service_slug: string
          staff_count: number | null
          start_date: string | null
          story_count: number | null
          updated_at: string | null
        }
        Insert: {
          budget_annual?: number | null
          clients_served_annual?: number | null
          created_at?: string | null
          description?: string | null
          icon_name?: string | null
          id?: string
          impact_categories?: string[] | null
          is_active?: boolean | null
          manager_profile_id?: string | null
          metadata?: Json | null
          organization_id: string
          service_category: string
          service_color?: string | null
          service_name: string
          service_slug: string
          staff_count?: number | null
          start_date?: string | null
          story_count?: number | null
          updated_at?: string | null
        }
        Update: {
          budget_annual?: number | null
          clients_served_annual?: number | null
          created_at?: string | null
          description?: string | null
          icon_name?: string | null
          id?: string
          impact_categories?: string[] | null
          is_active?: boolean | null
          manager_profile_id?: string | null
          metadata?: Json | null
          organization_id?: string
          service_category?: string
          service_color?: string | null
          service_name?: string
          service_slug?: string
          staff_count?: number | null
          start_date?: string | null
          story_count?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_services_manager_profile_id_fkey"
            columns: ["manager_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_services_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_services_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_storyteller_network: {
        Row: {
          collaboration_count: number | null
          connection_strength: number | null
          connection_type: string
          created_at: string | null
          geographic_proximity: string | null
          id: string
          organization_id: string
          shared_cultural_background: string | null
          shared_projects: string[] | null
          shared_themes: string[] | null
          storyteller_a_id: string
          storyteller_b_id: string
          tenant_id: string
          theme_overlap_count: number | null
          updated_at: string | null
        }
        Insert: {
          collaboration_count?: number | null
          connection_strength?: number | null
          connection_type: string
          created_at?: string | null
          geographic_proximity?: string | null
          id?: string
          organization_id: string
          shared_cultural_background?: string | null
          shared_projects?: string[] | null
          shared_themes?: string[] | null
          storyteller_a_id: string
          storyteller_b_id: string
          tenant_id: string
          theme_overlap_count?: number | null
          updated_at?: string | null
        }
        Update: {
          collaboration_count?: number | null
          connection_strength?: number | null
          connection_type?: string
          created_at?: string | null
          geographic_proximity?: string | null
          id?: string
          organization_id?: string
          shared_cultural_background?: string | null
          shared_projects?: string[] | null
          shared_themes?: string[] | null
          storyteller_a_id?: string
          storyteller_b_id?: string
          tenant_id?: string
          theme_overlap_count?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_storyteller_network_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_storyteller_network_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_storyteller_network_storyteller_a_id_fkey"
            columns: ["storyteller_a_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_storyteller_network_storyteller_b_id_fkey"
            columns: ["storyteller_b_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_storyteller_network_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_analytics"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "organization_storyteller_network_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_storyteller_network_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_ai_usage_summary"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      organization_theme_analytics: {
        Row: {
          average_confidence_score: number | null
          created_at: string | null
          cultural_relevance: string | null
          first_occurrence_date: string | null
          id: string
          key_storytellers: string[] | null
          last_occurrence_date: string | null
          monthly_trend: Json | null
          organization_id: string
          related_themes: string[] | null
          representative_quotes: string[] | null
          story_count: number | null
          storyteller_count: number | null
          tenant_id: string
          theme: string
          theme_category: string | null
          total_occurrences: number | null
          transcript_count: number | null
          updated_at: string | null
        }
        Insert: {
          average_confidence_score?: number | null
          created_at?: string | null
          cultural_relevance?: string | null
          first_occurrence_date?: string | null
          id?: string
          key_storytellers?: string[] | null
          last_occurrence_date?: string | null
          monthly_trend?: Json | null
          organization_id: string
          related_themes?: string[] | null
          representative_quotes?: string[] | null
          story_count?: number | null
          storyteller_count?: number | null
          tenant_id: string
          theme: string
          theme_category?: string | null
          total_occurrences?: number | null
          transcript_count?: number | null
          updated_at?: string | null
        }
        Update: {
          average_confidence_score?: number | null
          created_at?: string | null
          cultural_relevance?: string | null
          first_occurrence_date?: string | null
          id?: string
          key_storytellers?: string[] | null
          last_occurrence_date?: string | null
          monthly_trend?: Json | null
          organization_id?: string
          related_themes?: string[] | null
          representative_quotes?: string[] | null
          story_count?: number | null
          storyteller_count?: number | null
          tenant_id?: string
          theme?: string
          theme_category?: string | null
          total_occurrences?: number | null
          transcript_count?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_theme_analytics_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_theme_analytics_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_theme_analytics_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_analytics"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "organization_theme_analytics_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_theme_analytics_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_ai_usage_summary"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      organizations: {
        Row: {
          abn: string | null
          annual_reports_enabled: boolean | null
          billing_contact_email: string | null
          billing_status: Database["public"]["Enums"]["billing_status"] | null
          collaboration_settings: Json
          community_approval_required: boolean | null
          contact_email: string | null
          coordinates: unknown
          created_at: string | null
          created_by: string | null
          cultural_advisor_ids: string[] | null
          cultural_identity: Json
          cultural_protocols: Json | null
          cultural_significance: string | null
          default_permissions: Json
          default_story_access_level: string | null
          description: string | null
          distribution_policy: Json
          domain: string | null
          elder_approval_required: boolean | null
          elder_oversight_required: boolean | null
          email: string | null
          empathy_ledger_enabled: boolean | null
          established_date: string | null
          governance_model: string | null
          governance_structure: Json
          guest_access_enabled: boolean | null
          guest_pin: string | null
          has_cultural_protocols: boolean | null
          id: string
          impact_tracking_enabled: boolean | null
          indigenous_controlled: boolean | null
          justicehub_enabled: boolean | null
          justicehub_synced_at: string | null
          language_groups: string[] | null
          legal_name: string | null
          location: string | null
          location_id: string | null
          logo_url: string | null
          metadata: Json | null
          mission_statement: string | null
          name: string
          onboarded_at: string | null
          phone: string | null
          physical_address: string | null
          postal_address: string | null
          primary_color: string | null
          require_story_approval: boolean | null
          secondary_color: string | null
          service_locations: string[] | null
          settings: Json | null
          shared_vocabularies: string[] | null
          short_name: string | null
          slug: string | null
          status: Database["public"]["Enums"]["organization_status"] | null
          subscription_status: string | null
          subscription_tier: string | null
          tagline: string | null
          tenant_id: string
          tier: Database["public"]["Enums"]["organization_tier"] | null
          traditional_country: string | null
          type: string | null
          updated_at: string | null
          website: string | null
          website_url: string | null
        }
        Insert: {
          abn?: string | null
          annual_reports_enabled?: boolean | null
          billing_contact_email?: string | null
          billing_status?: Database["public"]["Enums"]["billing_status"] | null
          collaboration_settings?: Json
          community_approval_required?: boolean | null
          contact_email?: string | null
          coordinates?: unknown
          created_at?: string | null
          created_by?: string | null
          cultural_advisor_ids?: string[] | null
          cultural_identity?: Json
          cultural_protocols?: Json | null
          cultural_significance?: string | null
          default_permissions?: Json
          default_story_access_level?: string | null
          description?: string | null
          distribution_policy?: Json
          domain?: string | null
          elder_approval_required?: boolean | null
          elder_oversight_required?: boolean | null
          email?: string | null
          empathy_ledger_enabled?: boolean | null
          established_date?: string | null
          governance_model?: string | null
          governance_structure?: Json
          guest_access_enabled?: boolean | null
          guest_pin?: string | null
          has_cultural_protocols?: boolean | null
          id?: string
          impact_tracking_enabled?: boolean | null
          indigenous_controlled?: boolean | null
          justicehub_enabled?: boolean | null
          justicehub_synced_at?: string | null
          language_groups?: string[] | null
          legal_name?: string | null
          location?: string | null
          location_id?: string | null
          logo_url?: string | null
          metadata?: Json | null
          mission_statement?: string | null
          name: string
          onboarded_at?: string | null
          phone?: string | null
          physical_address?: string | null
          postal_address?: string | null
          primary_color?: string | null
          require_story_approval?: boolean | null
          secondary_color?: string | null
          service_locations?: string[] | null
          settings?: Json | null
          shared_vocabularies?: string[] | null
          short_name?: string | null
          slug?: string | null
          status?: Database["public"]["Enums"]["organization_status"] | null
          subscription_status?: string | null
          subscription_tier?: string | null
          tagline?: string | null
          tenant_id: string
          tier?: Database["public"]["Enums"]["organization_tier"] | null
          traditional_country?: string | null
          type?: string | null
          updated_at?: string | null
          website?: string | null
          website_url?: string | null
        }
        Update: {
          abn?: string | null
          annual_reports_enabled?: boolean | null
          billing_contact_email?: string | null
          billing_status?: Database["public"]["Enums"]["billing_status"] | null
          collaboration_settings?: Json
          community_approval_required?: boolean | null
          contact_email?: string | null
          coordinates?: unknown
          created_at?: string | null
          created_by?: string | null
          cultural_advisor_ids?: string[] | null
          cultural_identity?: Json
          cultural_protocols?: Json | null
          cultural_significance?: string | null
          default_permissions?: Json
          default_story_access_level?: string | null
          description?: string | null
          distribution_policy?: Json
          domain?: string | null
          elder_approval_required?: boolean | null
          elder_oversight_required?: boolean | null
          email?: string | null
          empathy_ledger_enabled?: boolean | null
          established_date?: string | null
          governance_model?: string | null
          governance_structure?: Json
          guest_access_enabled?: boolean | null
          guest_pin?: string | null
          has_cultural_protocols?: boolean | null
          id?: string
          impact_tracking_enabled?: boolean | null
          indigenous_controlled?: boolean | null
          justicehub_enabled?: boolean | null
          justicehub_synced_at?: string | null
          language_groups?: string[] | null
          legal_name?: string | null
          location?: string | null
          location_id?: string | null
          logo_url?: string | null
          metadata?: Json | null
          mission_statement?: string | null
          name?: string
          onboarded_at?: string | null
          phone?: string | null
          physical_address?: string | null
          postal_address?: string | null
          primary_color?: string | null
          require_story_approval?: boolean | null
          secondary_color?: string | null
          service_locations?: string[] | null
          settings?: Json | null
          shared_vocabularies?: string[] | null
          short_name?: string | null
          slug?: string | null
          status?: Database["public"]["Enums"]["organization_status"] | null
          subscription_status?: string | null
          subscription_tier?: string | null
          tagline?: string | null
          tenant_id?: string
          tier?: Database["public"]["Enums"]["organization_tier"] | null
          traditional_country?: string | null
          type?: string | null
          updated_at?: string | null
          website?: string | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organizations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organizations_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organizations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_analytics"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "organizations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organizations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_ai_usage_summary"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      outcomes: {
        Row: {
          activity_ids: string[] | null
          baseline_value: number | null
          challenges: string[] | null
          created_at: string | null
          cultural_protocols_followed: boolean | null
          current_value: number | null
          data_quality: string | null
          description: string | null
          elder_involvement: boolean | null
          id: string
          indicator_name: string
          language_use: string[] | null
          learnings: string[] | null
          measurement_date: string | null
          measurement_method: string | null
          on_country_component: boolean | null
          organization_id: string
          outcome_level: string
          outcome_type: string
          participant_count: number | null
          project_id: string | null
          qualitative_evidence: string[] | null
          related_story_ids: string[] | null
          reported_by: string | null
          service_area: string
          source_document_ids: string[] | null
          source_empathy_entry_id: string | null
          success_stories: string[] | null
          sync_date: string | null
          target_value: number | null
          tenant_id: string
          title: string
          traditional_knowledge_transmitted: boolean | null
          unit: string | null
          updated_at: string | null
          verification_date: string | null
          verified_by: string | null
        }
        Insert: {
          activity_ids?: string[] | null
          baseline_value?: number | null
          challenges?: string[] | null
          created_at?: string | null
          cultural_protocols_followed?: boolean | null
          current_value?: number | null
          data_quality?: string | null
          description?: string | null
          elder_involvement?: boolean | null
          id?: string
          indicator_name: string
          language_use?: string[] | null
          learnings?: string[] | null
          measurement_date?: string | null
          measurement_method?: string | null
          on_country_component?: boolean | null
          organization_id: string
          outcome_level: string
          outcome_type: string
          participant_count?: number | null
          project_id?: string | null
          qualitative_evidence?: string[] | null
          related_story_ids?: string[] | null
          reported_by?: string | null
          service_area: string
          source_document_ids?: string[] | null
          source_empathy_entry_id?: string | null
          success_stories?: string[] | null
          sync_date?: string | null
          target_value?: number | null
          tenant_id: string
          title: string
          traditional_knowledge_transmitted?: boolean | null
          unit?: string | null
          updated_at?: string | null
          verification_date?: string | null
          verified_by?: string | null
        }
        Update: {
          activity_ids?: string[] | null
          baseline_value?: number | null
          challenges?: string[] | null
          created_at?: string | null
          cultural_protocols_followed?: boolean | null
          current_value?: number | null
          data_quality?: string | null
          description?: string | null
          elder_involvement?: boolean | null
          id?: string
          indicator_name?: string
          language_use?: string[] | null
          learnings?: string[] | null
          measurement_date?: string | null
          measurement_method?: string | null
          on_country_component?: boolean | null
          organization_id?: string
          outcome_level?: string
          outcome_type?: string
          participant_count?: number | null
          project_id?: string | null
          qualitative_evidence?: string[] | null
          related_story_ids?: string[] | null
          reported_by?: string | null
          service_area?: string
          source_document_ids?: string[] | null
          source_empathy_entry_id?: string | null
          success_stories?: string[] | null
          sync_date?: string | null
          target_value?: number | null
          tenant_id?: string
          title?: string
          traditional_knowledge_transmitted?: boolean | null
          unit?: string | null
          updated_at?: string | null
          verification_date?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "outcomes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_analytics_daily: {
        Row: {
          app_id: string
          avg_scroll_depth: number | null
          clicks_to_empathy_ledger: number | null
          created_at: string | null
          date: string
          id: string
          project_id: string | null
          shares: number | null
          stories_displayed: number | null
          stories_with_engagement: number | null
          top_cities: Json | null
          top_countries: Json | null
          top_stories: Json | null
          total_read_time_seconds: number | null
          total_views: number | null
          unique_visitors: number | null
        }
        Insert: {
          app_id: string
          avg_scroll_depth?: number | null
          clicks_to_empathy_ledger?: number | null
          created_at?: string | null
          date: string
          id?: string
          project_id?: string | null
          shares?: number | null
          stories_displayed?: number | null
          stories_with_engagement?: number | null
          top_cities?: Json | null
          top_countries?: Json | null
          top_stories?: Json | null
          total_read_time_seconds?: number | null
          total_views?: number | null
          unique_visitors?: number | null
        }
        Update: {
          app_id?: string
          avg_scroll_depth?: number | null
          clicks_to_empathy_ledger?: number | null
          created_at?: string | null
          date?: string
          id?: string
          project_id?: string | null
          shares?: number | null
          stories_displayed?: number | null
          stories_with_engagement?: number | null
          top_cities?: Json | null
          top_countries?: Json | null
          top_stories?: Json | null
          total_read_time_seconds?: number | null
          total_views?: number | null
          unique_visitors?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "partner_analytics_daily_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "external_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_analytics_daily_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "syndicated_stories"
            referencedColumns: ["app_id"]
          },
          {
            foreignKeyName: "partner_analytics_daily_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "partner_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_message_templates: {
        Row: {
          category: string | null
          content: string
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          subject: string
          times_used: number | null
          variables: string[] | null
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          subject: string
          times_used?: number | null
          variables?: string[] | null
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          subject?: string
          times_used?: number | null
          variables?: string[] | null
        }
        Relationships: []
      }
      partner_messages: {
        Row: {
          app_id: string
          content: string
          content_html: string | null
          created_at: string | null
          id: string
          is_archived: boolean | null
          is_read: boolean | null
          metadata: Json | null
          parent_message_id: string | null
          project_id: string | null
          read_at: string | null
          request_id: string | null
          sender_type: string
          sender_user_id: string | null
          story_id: string | null
          storyteller_id: string
          subject: string | null
          thread_id: string
        }
        Insert: {
          app_id: string
          content: string
          content_html?: string | null
          created_at?: string | null
          id?: string
          is_archived?: boolean | null
          is_read?: boolean | null
          metadata?: Json | null
          parent_message_id?: string | null
          project_id?: string | null
          read_at?: string | null
          request_id?: string | null
          sender_type: string
          sender_user_id?: string | null
          story_id?: string | null
          storyteller_id: string
          subject?: string | null
          thread_id?: string
        }
        Update: {
          app_id?: string
          content?: string
          content_html?: string | null
          created_at?: string | null
          id?: string
          is_archived?: boolean | null
          is_read?: boolean | null
          metadata?: Json | null
          parent_message_id?: string | null
          project_id?: string | null
          read_at?: string | null
          request_id?: string | null
          sender_type?: string
          sender_user_id?: string | null
          story_id?: string | null
          storyteller_id?: string
          subject?: string | null
          thread_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_messages_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "external_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_messages_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "syndicated_stories"
            referencedColumns: ["app_id"]
          },
          {
            foreignKeyName: "partner_messages_parent_message_id_fkey"
            columns: ["parent_message_id"]
            isOneToOne: false
            referencedRelation: "partner_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_messages_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "partner_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_messages_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "story_syndication_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_messages_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_messages_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories_with_trust_indicators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_messages_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "syndicated_stories"
            referencedColumns: ["story_id"]
          },
          {
            foreignKeyName: "partner_messages_storyteller_id_fkey"
            columns: ["storyteller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_projects: {
        Row: {
          allow_full_content: boolean | null
          app_id: string
          created_at: string | null
          custom_branding: Json | null
          description: string | null
          embed_config: Json | null
          geographic_focus: string | null
          id: string
          is_active: boolean | null
          name: string
          show_storyteller_names: boolean | null
          show_storyteller_photos: boolean | null
          slug: string
          stories_count: number | null
          story_types: string[] | null
          themes: string[] | null
          updated_at: string | null
        }
        Insert: {
          allow_full_content?: boolean | null
          app_id: string
          created_at?: string | null
          custom_branding?: Json | null
          description?: string | null
          embed_config?: Json | null
          geographic_focus?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          show_storyteller_names?: boolean | null
          show_storyteller_photos?: boolean | null
          slug: string
          stories_count?: number | null
          story_types?: string[] | null
          themes?: string[] | null
          updated_at?: string | null
        }
        Update: {
          allow_full_content?: boolean | null
          app_id?: string
          created_at?: string | null
          custom_branding?: Json | null
          description?: string | null
          embed_config?: Json | null
          geographic_focus?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          show_storyteller_names?: boolean | null
          show_storyteller_photos?: boolean | null
          slug?: string
          stories_count?: number | null
          story_types?: string[] | null
          themes?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partner_projects_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "external_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_projects_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "syndicated_stories"
            referencedColumns: ["app_id"]
          },
        ]
      }
      partner_team_members: {
        Row: {
          accepted_at: string | null
          app_id: string
          created_at: string | null
          id: string
          invitation_token: string | null
          invited_at: string | null
          invited_by: string | null
          invited_email: string | null
          permissions: Json | null
          role: string | null
          user_id: string
        }
        Insert: {
          accepted_at?: string | null
          app_id: string
          created_at?: string | null
          id?: string
          invitation_token?: string | null
          invited_at?: string | null
          invited_by?: string | null
          invited_email?: string | null
          permissions?: Json | null
          role?: string | null
          user_id: string
        }
        Update: {
          accepted_at?: string | null
          app_id?: string
          created_at?: string | null
          id?: string
          invitation_token?: string | null
          invited_at?: string | null
          invited_by?: string | null
          invited_email?: string | null
          permissions?: Json | null
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_team_members_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "external_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_team_members_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "syndicated_stories"
            referencedColumns: ["app_id"]
          },
        ]
      }
      partners: {
        Row: {
          category: string
          created_at: string | null
          display_order: number | null
          id: string
          is_visible: boolean | null
          logo_url: string | null
          name: string
          website: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_visible?: boolean | null
          logo_url?: string | null
          name: string
          website?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_visible?: boolean | null
          logo_url?: string | null
          name?: string
          website?: string | null
        }
        Relationships: []
      }
      personal_insights: {
        Row: {
          community_connections: string[] | null
          confidence_score: number | null
          core_values: string[] | null
          created_at: string | null
          cultural_identity_markers: string[] | null
          growth_areas: string[] | null
          id: string
          last_analyzed_at: string | null
          life_philosophy: string | null
          narrative_themes: string[] | null
          personal_strengths: string[] | null
          profile_id: string | null
          traditional_knowledge_areas: string[] | null
          transcript_count: number | null
          updated_at: string | null
        }
        Insert: {
          community_connections?: string[] | null
          confidence_score?: number | null
          core_values?: string[] | null
          created_at?: string | null
          cultural_identity_markers?: string[] | null
          growth_areas?: string[] | null
          id?: string
          last_analyzed_at?: string | null
          life_philosophy?: string | null
          narrative_themes?: string[] | null
          personal_strengths?: string[] | null
          profile_id?: string | null
          traditional_knowledge_areas?: string[] | null
          transcript_count?: number | null
          updated_at?: string | null
        }
        Update: {
          community_connections?: string[] | null
          confidence_score?: number | null
          core_values?: string[] | null
          created_at?: string | null
          cultural_identity_markers?: string[] | null
          growth_areas?: string[] | null
          id?: string
          last_analyzed_at?: string | null
          life_philosophy?: string | null
          narrative_themes?: string[] | null
          personal_strengths?: string[] | null
          profile_id?: string | null
          traditional_knowledge_areas?: string[] | null
          transcript_count?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "personal_insights_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      photo_analytics: {
        Row: {
          cdn_cache_hits: number | null
          comment_count: number | null
          community_impact_score: number | null
          cultural_engagement_score: number | null
          download_count: number | null
          face_recognition_uses: number | null
          gallery_id: string | null
          id: string
          last_downloaded_at: string | null
          last_shared_at: string | null
          last_viewed_at: string | null
          like_count: number | null
          load_time_avg_ms: number | null
          media_asset_id: string
          recommendation_clicks: number | null
          search_appearances: number | null
          share_count: number | null
          storage_tier: string | null
          tag_contributions: number | null
          tenant_id: string
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          cdn_cache_hits?: number | null
          comment_count?: number | null
          community_impact_score?: number | null
          cultural_engagement_score?: number | null
          download_count?: number | null
          face_recognition_uses?: number | null
          gallery_id?: string | null
          id?: string
          last_downloaded_at?: string | null
          last_shared_at?: string | null
          last_viewed_at?: string | null
          like_count?: number | null
          load_time_avg_ms?: number | null
          media_asset_id: string
          recommendation_clicks?: number | null
          search_appearances?: number | null
          share_count?: number | null
          storage_tier?: string | null
          tag_contributions?: number | null
          tenant_id: string
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          cdn_cache_hits?: number | null
          comment_count?: number | null
          community_impact_score?: number | null
          cultural_engagement_score?: number | null
          download_count?: number | null
          face_recognition_uses?: number | null
          gallery_id?: string | null
          id?: string
          last_downloaded_at?: string | null
          last_shared_at?: string | null
          last_viewed_at?: string | null
          like_count?: number | null
          load_time_avg_ms?: number | null
          media_asset_id?: string
          recommendation_clicks?: number | null
          search_appearances?: number | null
          share_count?: number | null
          storage_tier?: string | null
          tag_contributions?: number | null
          tenant_id?: string
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "photo_analytics_gallery_id_fkey"
            columns: ["gallery_id"]
            isOneToOne: false
            referencedRelation: "photo_galleries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photo_analytics_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_analytics"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "photo_analytics_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photo_analytics_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_ai_usage_summary"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      photo_faces: {
        Row: {
          bounding_box: Json
          cluster_confidence: number | null
          cluster_id: string | null
          confirmed_at: string | null
          confirmed_by: string | null
          created_at: string | null
          created_by: string | null
          cultural_sensitivity: string | null
          detection_confidence: number
          detection_model: string | null
          face_encoding: Json | null
          id: string
          is_confirmed: boolean | null
          landmarks: Json | null
          media_asset_id: string
          person_confidence: number | null
          person_id: string | null
          privacy_level: string | null
          processing_version: string | null
          requires_consent: boolean | null
          tenant_id: string
        }
        Insert: {
          bounding_box: Json
          cluster_confidence?: number | null
          cluster_id?: string | null
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string | null
          created_by?: string | null
          cultural_sensitivity?: string | null
          detection_confidence: number
          detection_model?: string | null
          face_encoding?: Json | null
          id?: string
          is_confirmed?: boolean | null
          landmarks?: Json | null
          media_asset_id: string
          person_confidence?: number | null
          person_id?: string | null
          privacy_level?: string | null
          processing_version?: string | null
          requires_consent?: boolean | null
          tenant_id: string
        }
        Update: {
          bounding_box?: Json
          cluster_confidence?: number | null
          cluster_id?: string | null
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string | null
          created_by?: string | null
          cultural_sensitivity?: string | null
          detection_confidence?: number
          detection_model?: string | null
          face_encoding?: Json | null
          id?: string
          is_confirmed?: boolean | null
          landmarks?: Json | null
          media_asset_id?: string
          person_confidence?: number | null
          person_id?: string | null
          privacy_level?: string | null
          processing_version?: string | null
          requires_consent?: boolean | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_photo_faces_media_asset"
            columns: ["media_asset_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photo_faces_confirmed_by_fkey"
            columns: ["confirmed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photo_faces_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photo_faces_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photo_faces_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_analytics"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "photo_faces_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photo_faces_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_ai_usage_summary"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      photo_galleries: {
        Row: {
          auto_organize_enabled: boolean | null
          cover_photo_id: string | null
          created_at: string | null
          created_by: string
          cultural_sensitivity_level: string
          description: string | null
          face_grouping_enabled: boolean | null
          gallery_type: string
          id: string
          last_updated_at: string | null
          location_grouping_enabled: boolean | null
          organization_id: string | null
          photo_count: number | null
          privacy_level: string
          project_id: string | null
          requires_elder_approval: boolean | null
          search_vector: unknown
          storyteller_id: string | null
          tenant_id: string
          title: string
          total_size_bytes: number | null
          updated_at: string | null
        }
        Insert: {
          auto_organize_enabled?: boolean | null
          cover_photo_id?: string | null
          created_at?: string | null
          created_by: string
          cultural_sensitivity_level?: string
          description?: string | null
          face_grouping_enabled?: boolean | null
          gallery_type: string
          id?: string
          last_updated_at?: string | null
          location_grouping_enabled?: boolean | null
          organization_id?: string | null
          photo_count?: number | null
          privacy_level?: string
          project_id?: string | null
          requires_elder_approval?: boolean | null
          search_vector?: unknown
          storyteller_id?: string | null
          tenant_id: string
          title: string
          total_size_bytes?: number | null
          updated_at?: string | null
        }
        Update: {
          auto_organize_enabled?: boolean | null
          cover_photo_id?: string | null
          created_at?: string | null
          created_by?: string
          cultural_sensitivity_level?: string
          description?: string | null
          face_grouping_enabled?: boolean | null
          gallery_type?: string
          id?: string
          last_updated_at?: string | null
          location_grouping_enabled?: boolean | null
          organization_id?: string | null
          photo_count?: number | null
          privacy_level?: string
          project_id?: string | null
          requires_elder_approval?: boolean | null
          search_vector?: unknown
          storyteller_id?: string | null
          tenant_id?: string
          title?: string
          total_size_bytes?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_photo_galleries_organization"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_photo_galleries_organization"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_photo_galleries_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photo_galleries_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photo_galleries_storyteller_id_fkey"
            columns: ["storyteller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photo_galleries_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_analytics"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "photo_galleries_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photo_galleries_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_ai_usage_summary"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      photo_gallery_items: {
        Row: {
          added_at: string | null
          added_by: string
          caption: string | null
          display_order: number | null
          gallery_id: string
          id: string
          is_featured: boolean | null
          media_asset_id: string
        }
        Insert: {
          added_at?: string | null
          added_by: string
          caption?: string | null
          display_order?: number | null
          gallery_id: string
          id?: string
          is_featured?: boolean | null
          media_asset_id: string
        }
        Update: {
          added_at?: string | null
          added_by?: string
          caption?: string | null
          display_order?: number | null
          gallery_id?: string
          id?: string
          is_featured?: boolean | null
          media_asset_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_gallery_items_media_asset"
            columns: ["media_asset_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photo_gallery_items_added_by_fkey"
            columns: ["added_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photo_gallery_items_gallery_id_fkey"
            columns: ["gallery_id"]
            isOneToOne: false
            referencedRelation: "photo_galleries"
            referencedColumns: ["id"]
          },
        ]
      }
      photo_locations: {
        Row: {
          created_at: string | null
          created_by: string
          description: string | null
          gps_accuracy_meters: number | null
          id: string
          is_approximate: boolean | null
          location_context: string
          location_id: string
          photo_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description?: string | null
          gps_accuracy_meters?: number | null
          id?: string
          is_approximate?: boolean | null
          location_context?: string
          location_id: string
          photo_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          gps_accuracy_meters?: number | null
          id?: string
          is_approximate?: boolean | null
          location_context?: string
          location_id?: string
          photo_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_photo_locations_media_asset"
            columns: ["photo_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photo_locations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      photo_memories: {
        Row: {
          cover_photo_id: string | null
          created_at: string | null
          created_by_ai: boolean | null
          cultural_sensitivity_level: string | null
          description: string | null
          display_date: string
          engagement_score: number | null
          expires_at: string | null
          for_organization_id: string | null
          for_user_id: string | null
          gallery_id: string | null
          generation_confidence: number | null
          generation_metadata: Json | null
          generation_model: string | null
          id: string
          is_active: boolean | null
          media_asset_ids: string[]
          memory_type: string
          privacy_level: string | null
          quality_score: number | null
          subtitle: string | null
          tenant_id: string
          title: string
          updated_at: string | null
          view_count: number | null
          viewed_at: string | null
          was_viewed: boolean | null
        }
        Insert: {
          cover_photo_id?: string | null
          created_at?: string | null
          created_by_ai?: boolean | null
          cultural_sensitivity_level?: string | null
          description?: string | null
          display_date: string
          engagement_score?: number | null
          expires_at?: string | null
          for_organization_id?: string | null
          for_user_id?: string | null
          gallery_id?: string | null
          generation_confidence?: number | null
          generation_metadata?: Json | null
          generation_model?: string | null
          id?: string
          is_active?: boolean | null
          media_asset_ids: string[]
          memory_type: string
          privacy_level?: string | null
          quality_score?: number | null
          subtitle?: string | null
          tenant_id: string
          title: string
          updated_at?: string | null
          view_count?: number | null
          viewed_at?: string | null
          was_viewed?: boolean | null
        }
        Update: {
          cover_photo_id?: string | null
          created_at?: string | null
          created_by_ai?: boolean | null
          cultural_sensitivity_level?: string | null
          description?: string | null
          display_date?: string
          engagement_score?: number | null
          expires_at?: string | null
          for_organization_id?: string | null
          for_user_id?: string | null
          gallery_id?: string | null
          generation_confidence?: number | null
          generation_metadata?: Json | null
          generation_model?: string | null
          id?: string
          is_active?: boolean | null
          media_asset_ids?: string[]
          memory_type?: string
          privacy_level?: string | null
          quality_score?: number | null
          subtitle?: string | null
          tenant_id?: string
          title?: string
          updated_at?: string | null
          view_count?: number | null
          viewed_at?: string | null
          was_viewed?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "photo_memories_for_user_id_fkey"
            columns: ["for_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photo_memories_gallery_id_fkey"
            columns: ["gallery_id"]
            isOneToOne: false
            referencedRelation: "photo_galleries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photo_memories_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_analytics"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "photo_memories_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photo_memories_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_ai_usage_summary"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      photo_organizations: {
        Row: {
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          organization_id: string
          organization_role: string
          photo_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          organization_id: string
          organization_role?: string
          photo_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          organization_id?: string
          organization_role?: string
          photo_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_photo_organizations_media_asset"
            columns: ["photo_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photo_organizations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photo_organizations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photo_organizations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      photo_projects: {
        Row: {
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          photo_id: string
          project_id: string
          project_role: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          photo_id: string
          project_id: string
          project_role?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          photo_id?: string
          project_id?: string
          project_role?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_photo_projects_media_asset"
            columns: ["photo_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photo_projects_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photo_projects_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      photo_storytellers: {
        Row: {
          consent_date: string | null
          consent_given: boolean | null
          created_at: string | null
          created_by: string
          id: string
          photo_id: string
          privacy_override: string | null
          relationship_type: string
          role_description: string | null
          storyteller_id: string
          updated_at: string | null
        }
        Insert: {
          consent_date?: string | null
          consent_given?: boolean | null
          created_at?: string | null
          created_by: string
          id?: string
          photo_id: string
          privacy_override?: string | null
          relationship_type?: string
          role_description?: string | null
          storyteller_id: string
          updated_at?: string | null
        }
        Update: {
          consent_date?: string | null
          consent_given?: boolean | null
          created_at?: string | null
          created_by?: string
          id?: string
          photo_id?: string
          privacy_override?: string | null
          relationship_type?: string
          role_description?: string | null
          storyteller_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_photo_storytellers_media_asset"
            columns: ["photo_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photo_storytellers_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photo_storytellers_storyteller_id_fkey"
            columns: ["storyteller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      photo_tags: {
        Row: {
          confidence_score: number | null
          created_at: string | null
          created_by: string | null
          cultural_sensitivity: string | null
          id: string
          is_verified: boolean | null
          latitude: number | null
          location_confidence: number | null
          location_name: string | null
          longitude: number | null
          media_asset_id: string
          organization_id: string | null
          person_id: string | null
          project_id: string | null
          requires_review: boolean | null
          source: string
          tag_type: string
          tag_value: string
          tenant_id: string
          updated_at: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string | null
          created_by?: string | null
          cultural_sensitivity?: string | null
          id?: string
          is_verified?: boolean | null
          latitude?: number | null
          location_confidence?: number | null
          location_name?: string | null
          longitude?: number | null
          media_asset_id: string
          organization_id?: string | null
          person_id?: string | null
          project_id?: string | null
          requires_review?: boolean | null
          source: string
          tag_type: string
          tag_value: string
          tenant_id: string
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          confidence_score?: number | null
          created_at?: string | null
          created_by?: string | null
          cultural_sensitivity?: string | null
          id?: string
          is_verified?: boolean | null
          latitude?: number | null
          location_confidence?: number | null
          location_name?: string | null
          longitude?: number | null
          media_asset_id?: string
          organization_id?: string | null
          person_id?: string | null
          project_id?: string | null
          requires_review?: boolean | null
          source?: string
          tag_type?: string
          tag_value?: string
          tenant_id?: string
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_photo_tags_media_asset"
            columns: ["media_asset_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_photo_tags_organization"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_photo_tags_organization"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_photo_tags_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photo_tags_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photo_tags_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photo_tags_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_analytics"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "photo_tags_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photo_tags_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_ai_usage_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "photo_tags_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_analytics: {
        Row: {
          active_storytellers: number | null
          ai_jobs_completed: number | null
          ai_processing_success_rate: number | null
          average_ai_confidence: number | null
          average_ai_processing_time: number | null
          average_connections_per_storyteller: number | null
          average_story_quality: number | null
          community_health_score: number | null
          connection_success_rate: number | null
          content_creation_velocity: number | null
          created_at: string | null
          cultural_diversity_score: number | null
          demographic_distribution: Json | null
          geographic_diversity_score: number | null
          high_impact_stories_count: number | null
          id: string
          new_connections: number | null
          new_storytellers: number | null
          new_themes_discovered: number | null
          period_end: string
          period_start: string
          period_type: string
          quotes_extracted: number | null
          returning_storytellers: number | null
          stories_created: number | null
          storyteller_locations: Json | null
          system_performance_score: number | null
          tenant_id: string
          theme_distribution: Json | null
          top_themes: Json | null
          total_connections: number | null
          total_quotes: number | null
          total_stories: number | null
          total_storytellers: number | null
          total_themes: number | null
          total_transcripts: number | null
          transcripts_processed: number | null
          trending_themes: string[] | null
          user_retention_rate: number | null
          viral_content_count: number | null
        }
        Insert: {
          active_storytellers?: number | null
          ai_jobs_completed?: number | null
          ai_processing_success_rate?: number | null
          average_ai_confidence?: number | null
          average_ai_processing_time?: number | null
          average_connections_per_storyteller?: number | null
          average_story_quality?: number | null
          community_health_score?: number | null
          connection_success_rate?: number | null
          content_creation_velocity?: number | null
          created_at?: string | null
          cultural_diversity_score?: number | null
          demographic_distribution?: Json | null
          geographic_diversity_score?: number | null
          high_impact_stories_count?: number | null
          id?: string
          new_connections?: number | null
          new_storytellers?: number | null
          new_themes_discovered?: number | null
          period_end: string
          period_start: string
          period_type: string
          quotes_extracted?: number | null
          returning_storytellers?: number | null
          stories_created?: number | null
          storyteller_locations?: Json | null
          system_performance_score?: number | null
          tenant_id: string
          theme_distribution?: Json | null
          top_themes?: Json | null
          total_connections?: number | null
          total_quotes?: number | null
          total_stories?: number | null
          total_storytellers?: number | null
          total_themes?: number | null
          total_transcripts?: number | null
          transcripts_processed?: number | null
          trending_themes?: string[] | null
          user_retention_rate?: number | null
          viral_content_count?: number | null
        }
        Update: {
          active_storytellers?: number | null
          ai_jobs_completed?: number | null
          ai_processing_success_rate?: number | null
          average_ai_confidence?: number | null
          average_ai_processing_time?: number | null
          average_connections_per_storyteller?: number | null
          average_story_quality?: number | null
          community_health_score?: number | null
          connection_success_rate?: number | null
          content_creation_velocity?: number | null
          created_at?: string | null
          cultural_diversity_score?: number | null
          demographic_distribution?: Json | null
          geographic_diversity_score?: number | null
          high_impact_stories_count?: number | null
          id?: string
          new_connections?: number | null
          new_storytellers?: number | null
          new_themes_discovered?: number | null
          period_end?: string
          period_start?: string
          period_type?: string
          quotes_extracted?: number | null
          returning_storytellers?: number | null
          stories_created?: number | null
          storyteller_locations?: Json | null
          system_performance_score?: number | null
          tenant_id?: string
          theme_distribution?: Json | null
          top_themes?: Json | null
          total_connections?: number | null
          total_quotes?: number | null
          total_stories?: number | null
          total_storytellers?: number | null
          total_themes?: number | null
          total_transcripts?: number | null
          transcripts_processed?: number | null
          trending_themes?: string[] | null
          user_retention_rate?: number | null
          viral_content_count?: number | null
        }
        Relationships: []
      }
      platform_stats_cache: {
        Row: {
          active_users_last_30_days: number | null
          active_users_last_7_days: number | null
          ai_jobs_failed_24h: number | null
          ai_jobs_pending: number | null
          analysis_coverage_percent: number | null
          failed_uploads: number | null
          id: string
          pending_elder_reviews: number | null
          pending_reviews: number | null
          stale_analysis_count: number | null
          stories_last_30_days: number | null
          stories_last_7_days: number | null
          stories_with_analysis: number | null
          theme_trends: Json | null
          total_media_assets: number | null
          total_organizations: number | null
          total_projects: number | null
          total_storage_bytes: number | null
          total_stories: number | null
          total_storytellers: number | null
          total_transcripts: number | null
          updated_at: string | null
          webhook_failures_24h: number | null
        }
        Insert: {
          active_users_last_30_days?: number | null
          active_users_last_7_days?: number | null
          ai_jobs_failed_24h?: number | null
          ai_jobs_pending?: number | null
          analysis_coverage_percent?: number | null
          failed_uploads?: number | null
          id: string
          pending_elder_reviews?: number | null
          pending_reviews?: number | null
          stale_analysis_count?: number | null
          stories_last_30_days?: number | null
          stories_last_7_days?: number | null
          stories_with_analysis?: number | null
          theme_trends?: Json | null
          total_media_assets?: number | null
          total_organizations?: number | null
          total_projects?: number | null
          total_storage_bytes?: number | null
          total_stories?: number | null
          total_storytellers?: number | null
          total_transcripts?: number | null
          updated_at?: string | null
          webhook_failures_24h?: number | null
        }
        Update: {
          active_users_last_30_days?: number | null
          active_users_last_7_days?: number | null
          ai_jobs_failed_24h?: number | null
          ai_jobs_pending?: number | null
          analysis_coverage_percent?: number | null
          failed_uploads?: number | null
          id?: string
          pending_elder_reviews?: number | null
          pending_reviews?: number | null
          stale_analysis_count?: number | null
          stories_last_30_days?: number | null
          stories_last_7_days?: number | null
          stories_with_analysis?: number | null
          theme_trends?: Json | null
          total_media_assets?: number | null
          total_organizations?: number | null
          total_projects?: number | null
          total_storage_bytes?: number | null
          total_stories?: number | null
          total_storytellers?: number | null
          total_transcripts?: number | null
          updated_at?: string | null
          webhook_failures_24h?: number | null
        }
        Relationships: []
      }
      privacy_changes: {
        Row: {
          changes: Json | null
          field_name: string | null
          id: string
          impact: Json | null
          new_value: string | null
          old_value: string | null
          reason: string | null
          timestamp: string | null
          user_id: string | null
        }
        Insert: {
          changes?: Json | null
          field_name?: string | null
          id?: string
          impact?: Json | null
          new_value?: string | null
          old_value?: string | null
          reason?: string | null
          timestamp?: string | null
          user_id?: string | null
        }
        Update: {
          changes?: Json | null
          field_name?: string | null
          id?: string
          impact?: Json | null
          new_value?: string | null
          old_value?: string | null
          reason?: string | null
          timestamp?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "privacy_changes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      processing_jobs: {
        Row: {
          completed_at: string | null
          configuration: Json
          created_at: string | null
          created_by: string | null
          data_source_id: string | null
          error_message: string | null
          estimated_completion: string | null
          id: string
          max_retries: number | null
          priority: string | null
          progress_percentage: number | null
          results_summary: Json | null
          retry_count: number | null
          scheduled_at: string | null
          source_urls: string[] | null
          started_at: string | null
          status: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          configuration?: Json
          created_at?: string | null
          created_by?: string | null
          data_source_id?: string | null
          error_message?: string | null
          estimated_completion?: string | null
          id?: string
          max_retries?: number | null
          priority?: string | null
          progress_percentage?: number | null
          results_summary?: Json | null
          retry_count?: number | null
          scheduled_at?: string | null
          source_urls?: string[] | null
          started_at?: string | null
          status?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          configuration?: Json
          created_at?: string | null
          created_by?: string | null
          data_source_id?: string | null
          error_message?: string | null
          estimated_completion?: string | null
          id?: string
          max_retries?: number | null
          priority?: string | null
          progress_percentage?: number | null
          results_summary?: Json | null
          retry_count?: number | null
          scheduled_at?: string | null
          source_urls?: string[] | null
          started_at?: string | null
          status?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "processing_jobs_data_source_id_fkey"
            columns: ["data_source_id"]
            isOneToOne: false
            referencedRelation: "data_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      professional_competencies: {
        Row: {
          competency_level: number | null
          created_at: string | null
          development_opportunities: string[] | null
          evidence_from_transcript: string | null
          id: string
          market_value_score: number | null
          profile_id: string | null
          real_world_applications: string[] | null
          skill_category: string | null
          skill_gap_analysis: string | null
          skill_name: string
          transferable_contexts: string[] | null
          updated_at: string | null
        }
        Insert: {
          competency_level?: number | null
          created_at?: string | null
          development_opportunities?: string[] | null
          evidence_from_transcript?: string | null
          id?: string
          market_value_score?: number | null
          profile_id?: string | null
          real_world_applications?: string[] | null
          skill_category?: string | null
          skill_gap_analysis?: string | null
          skill_name: string
          transferable_contexts?: string[] | null
          updated_at?: string | null
        }
        Update: {
          competency_level?: number | null
          created_at?: string | null
          development_opportunities?: string[] | null
          evidence_from_transcript?: string | null
          id?: string
          market_value_score?: number | null
          profile_id?: string | null
          real_world_applications?: string[] | null
          skill_category?: string | null
          skill_gap_analysis?: string | null
          skill_name?: string
          transferable_contexts?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "professional_competencies_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_galleries: {
        Row: {
          created_at: string | null
          gallery_id: string
          id: string
          profile_id: string
          role: string | null
        }
        Insert: {
          created_at?: string | null
          gallery_id: string
          id?: string
          profile_id: string
          role?: string | null
        }
        Update: {
          created_at?: string | null
          gallery_id?: string
          id?: string
          profile_id?: string
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_galleries_gallery_id_fkey"
            columns: ["gallery_id"]
            isOneToOne: false
            referencedRelation: "galleries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_galleries_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
            referencedRelation: "organization_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_organizations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
          joined_at: string | null
          profile_id: string
          project_id: string
          role: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          joined_at?: string | null
          profile_id: string
          project_id: string
          role?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
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
          age_range: string | null
          ai_consent_date: string | null
          ai_consent_scope: Json | null
          ai_enhanced_bio: string | null
          ai_personality_insights: Json | null
          ai_processing_consent: boolean | null
          ai_themes: Json | null
          airtable_record_id: string | null
          allow_ai_analysis: boolean | null
          allow_community_recommendations: boolean | null
          allow_messages: boolean | null
          allow_research_participation: boolean | null
          analytics_preferences: Json | null
          attribution_preferences: Json | null
          available_for_collaboration: boolean | null
          avatar_media_id: string | null
          avatar_url: string | null
          basic_info_visibility: string | null
          bio: string | null
          can_share_traditional_knowledge: boolean | null
          change_maker_type: string | null
          collaboration_preferences: Json | null
          community_leadership_score: number | null
          community_role: string | null
          community_roles: string[] | null
          connection_strength_scores: Json | null
          consent_date: string | null
          consent_given: boolean | null
          consent_version: string | null
          cover_media_id: string | null
          created_at: string | null
          created_by: string | null
          cross_tenant_sharing: boolean | null
          cultural_affiliations: string[] | null
          cultural_background: string | null
          cultural_communities_visibility: string | null
          cultural_identity_visibility: string | null
          cultural_permissions: Json | null
          cultural_protocol_level: string | null
          cultural_protocol_score: number | null
          cultural_protocols: Json | null
          current_organization: string | null
          current_role: string | null
          date_of_birth: string | null
          dietary_requirements: string[] | null
          display_name: string | null
          email: string | null
          emergency_contact: Json | null
          engagement_score: number | null
          expertise_areas: string[] | null
          face_recognition_consent: boolean | null
          face_recognition_consent_date: string | null
          featured_video_url: string | null
          first_name: string | null
          full_name: string | null
          gender: string | null
          generated_themes: Json | null
          geographic_connections: Json | null
          geographic_scope: string | null
          healing_integration_score: number | null
          id: string
          impact_badges: string[] | null
          impact_confidence_score: number | null
          impact_focus_areas: string[] | null
          impact_score: number | null
          impact_story_promotion: boolean | null
          indigenous_status: string | null
          industry_sectors: string[] | null
          interested_in_peer_support: boolean | null
          interests: string[] | null
          is_cultural_advisor: boolean | null
          is_elder: boolean | null
          is_featured: boolean | null
          is_service_provider: boolean | null
          is_storyteller: boolean | null
          job_title: string | null
          justicehub_enabled: boolean | null
          justicehub_featured: boolean | null
          justicehub_role: string | null
          justicehub_synced_at: string | null
          knowledge_transmission_score: number | null
          language_communities_visibility: string | null
          language_group: string | null
          languages_spoken: string[] | null
          last_impact_analysis: string | null
          last_name: string | null
          last_story_date: string | null
          legacy_airtable_id: string | null
          legacy_location_id: string | null
          legacy_organization_id: string | null
          legacy_project_id: string | null
          legacy_storyteller_id: string | null
          legacy_user_id: string | null
          life_motto: string | null
          linkedin_profile_url: string | null
          location: string | null
          location_id: string | null
          media_visibility: string | null
          mentor_availability: boolean | null
          metadata: Json | null
          migrated_at: string | null
          migration_quality_score: number | null
          narrative_ownership_level: string | null
          narrative_themes: string[] | null
          network_visibility: string | null
          occupation: string | null
          onboarding_completed: boolean | null
          open_to_mentoring: boolean | null
          personal_statement: string | null
          phone: string | null
          phone_number: string | null
          photo_consent_contexts: string[] | null
          platform_benefit_sharing: Json | null
          preferred_communication: string[] | null
          preferred_name: string | null
          preferred_pronouns: string | null
          primary_impact_type: string | null
          primary_organization_id: string | null
          privacy_preferences: Json | null
          professional_summary: string | null
          professional_visibility: string | null
          profile_image_alt_text: string | null
          profile_image_url: string | null
          profile_status: string | null
          profile_visibility: string | null
          pronouns: string | null
          quote_sharing_consent: boolean | null
          recommendation_opt_in: boolean | null
          relationship_building_score: number | null
          requires_elder_review: boolean | null
          resume_url: string | null
          seeking_organizational_connections: boolean | null
          show_in_directory: boolean | null
          social_links: Json | null
          speaking_availability: boolean | null
          stories_contributed: number | null
          stories_visibility: string | null
          story_use_permissions: Json | null
          story_visibility_level: string | null
          storyteller_ranking: number | null
          storyteller_type: string | null
          storytelling_experience: string | null
          storytelling_methods: string[] | null
          super_admin: boolean | null
          system_navigation_score: number | null
          tenant_id: string
          tenant_roles: string[] | null
          timezone: string | null
          total_impact_insights: number | null
          traditional_country: string | null
          traditional_knowledge_flag: boolean | null
          traditional_knowledge_keeper: boolean | null
          transcripts_visibility: string | null
          updated_at: string | null
          user_id: string | null
          video_introduction_url: string | null
          video_metadata: Json | null
          video_portfolio_urls: string[] | null
          website_url: string | null
          wisdom_sharing_level: string | null
          years_of_community_work: number | null
          years_of_experience: number | null
        }
        Insert: {
          accessibility_needs?: string[] | null
          address?: Json | null
          age_range?: string | null
          ai_consent_date?: string | null
          ai_consent_scope?: Json | null
          ai_enhanced_bio?: string | null
          ai_personality_insights?: Json | null
          ai_processing_consent?: boolean | null
          ai_themes?: Json | null
          airtable_record_id?: string | null
          allow_ai_analysis?: boolean | null
          allow_community_recommendations?: boolean | null
          allow_messages?: boolean | null
          allow_research_participation?: boolean | null
          analytics_preferences?: Json | null
          attribution_preferences?: Json | null
          available_for_collaboration?: boolean | null
          avatar_media_id?: string | null
          avatar_url?: string | null
          basic_info_visibility?: string | null
          bio?: string | null
          can_share_traditional_knowledge?: boolean | null
          change_maker_type?: string | null
          collaboration_preferences?: Json | null
          community_leadership_score?: number | null
          community_role?: string | null
          community_roles?: string[] | null
          connection_strength_scores?: Json | null
          consent_date?: string | null
          consent_given?: boolean | null
          consent_version?: string | null
          cover_media_id?: string | null
          created_at?: string | null
          created_by?: string | null
          cross_tenant_sharing?: boolean | null
          cultural_affiliations?: string[] | null
          cultural_background?: string | null
          cultural_communities_visibility?: string | null
          cultural_identity_visibility?: string | null
          cultural_permissions?: Json | null
          cultural_protocol_level?: string | null
          cultural_protocol_score?: number | null
          cultural_protocols?: Json | null
          current_organization?: string | null
          current_role?: string | null
          date_of_birth?: string | null
          dietary_requirements?: string[] | null
          display_name?: string | null
          email?: string | null
          emergency_contact?: Json | null
          engagement_score?: number | null
          expertise_areas?: string[] | null
          face_recognition_consent?: boolean | null
          face_recognition_consent_date?: string | null
          featured_video_url?: string | null
          first_name?: string | null
          full_name?: string | null
          gender?: string | null
          generated_themes?: Json | null
          geographic_connections?: Json | null
          geographic_scope?: string | null
          healing_integration_score?: number | null
          id: string
          impact_badges?: string[] | null
          impact_confidence_score?: number | null
          impact_focus_areas?: string[] | null
          impact_score?: number | null
          impact_story_promotion?: boolean | null
          indigenous_status?: string | null
          industry_sectors?: string[] | null
          interested_in_peer_support?: boolean | null
          interests?: string[] | null
          is_cultural_advisor?: boolean | null
          is_elder?: boolean | null
          is_featured?: boolean | null
          is_service_provider?: boolean | null
          is_storyteller?: boolean | null
          job_title?: string | null
          justicehub_enabled?: boolean | null
          justicehub_featured?: boolean | null
          justicehub_role?: string | null
          justicehub_synced_at?: string | null
          knowledge_transmission_score?: number | null
          language_communities_visibility?: string | null
          language_group?: string | null
          languages_spoken?: string[] | null
          last_impact_analysis?: string | null
          last_name?: string | null
          last_story_date?: string | null
          legacy_airtable_id?: string | null
          legacy_location_id?: string | null
          legacy_organization_id?: string | null
          legacy_project_id?: string | null
          legacy_storyteller_id?: string | null
          legacy_user_id?: string | null
          life_motto?: string | null
          linkedin_profile_url?: string | null
          location?: string | null
          location_id?: string | null
          media_visibility?: string | null
          mentor_availability?: boolean | null
          metadata?: Json | null
          migrated_at?: string | null
          migration_quality_score?: number | null
          narrative_ownership_level?: string | null
          narrative_themes?: string[] | null
          network_visibility?: string | null
          occupation?: string | null
          onboarding_completed?: boolean | null
          open_to_mentoring?: boolean | null
          personal_statement?: string | null
          phone?: string | null
          phone_number?: string | null
          photo_consent_contexts?: string[] | null
          platform_benefit_sharing?: Json | null
          preferred_communication?: string[] | null
          preferred_name?: string | null
          preferred_pronouns?: string | null
          primary_impact_type?: string | null
          primary_organization_id?: string | null
          privacy_preferences?: Json | null
          professional_summary?: string | null
          professional_visibility?: string | null
          profile_image_alt_text?: string | null
          profile_image_url?: string | null
          profile_status?: string | null
          profile_visibility?: string | null
          pronouns?: string | null
          quote_sharing_consent?: boolean | null
          recommendation_opt_in?: boolean | null
          relationship_building_score?: number | null
          requires_elder_review?: boolean | null
          resume_url?: string | null
          seeking_organizational_connections?: boolean | null
          show_in_directory?: boolean | null
          social_links?: Json | null
          speaking_availability?: boolean | null
          stories_contributed?: number | null
          stories_visibility?: string | null
          story_use_permissions?: Json | null
          story_visibility_level?: string | null
          storyteller_ranking?: number | null
          storyteller_type?: string | null
          storytelling_experience?: string | null
          storytelling_methods?: string[] | null
          super_admin?: boolean | null
          system_navigation_score?: number | null
          tenant_id: string
          tenant_roles?: string[] | null
          timezone?: string | null
          total_impact_insights?: number | null
          traditional_country?: string | null
          traditional_knowledge_flag?: boolean | null
          traditional_knowledge_keeper?: boolean | null
          transcripts_visibility?: string | null
          updated_at?: string | null
          user_id?: string | null
          video_introduction_url?: string | null
          video_metadata?: Json | null
          video_portfolio_urls?: string[] | null
          website_url?: string | null
          wisdom_sharing_level?: string | null
          years_of_community_work?: number | null
          years_of_experience?: number | null
        }
        Update: {
          accessibility_needs?: string[] | null
          address?: Json | null
          age_range?: string | null
          ai_consent_date?: string | null
          ai_consent_scope?: Json | null
          ai_enhanced_bio?: string | null
          ai_personality_insights?: Json | null
          ai_processing_consent?: boolean | null
          ai_themes?: Json | null
          airtable_record_id?: string | null
          allow_ai_analysis?: boolean | null
          allow_community_recommendations?: boolean | null
          allow_messages?: boolean | null
          allow_research_participation?: boolean | null
          analytics_preferences?: Json | null
          attribution_preferences?: Json | null
          available_for_collaboration?: boolean | null
          avatar_media_id?: string | null
          avatar_url?: string | null
          basic_info_visibility?: string | null
          bio?: string | null
          can_share_traditional_knowledge?: boolean | null
          change_maker_type?: string | null
          collaboration_preferences?: Json | null
          community_leadership_score?: number | null
          community_role?: string | null
          community_roles?: string[] | null
          connection_strength_scores?: Json | null
          consent_date?: string | null
          consent_given?: boolean | null
          consent_version?: string | null
          cover_media_id?: string | null
          created_at?: string | null
          created_by?: string | null
          cross_tenant_sharing?: boolean | null
          cultural_affiliations?: string[] | null
          cultural_background?: string | null
          cultural_communities_visibility?: string | null
          cultural_identity_visibility?: string | null
          cultural_permissions?: Json | null
          cultural_protocol_level?: string | null
          cultural_protocol_score?: number | null
          cultural_protocols?: Json | null
          current_organization?: string | null
          current_role?: string | null
          date_of_birth?: string | null
          dietary_requirements?: string[] | null
          display_name?: string | null
          email?: string | null
          emergency_contact?: Json | null
          engagement_score?: number | null
          expertise_areas?: string[] | null
          face_recognition_consent?: boolean | null
          face_recognition_consent_date?: string | null
          featured_video_url?: string | null
          first_name?: string | null
          full_name?: string | null
          gender?: string | null
          generated_themes?: Json | null
          geographic_connections?: Json | null
          geographic_scope?: string | null
          healing_integration_score?: number | null
          id?: string
          impact_badges?: string[] | null
          impact_confidence_score?: number | null
          impact_focus_areas?: string[] | null
          impact_score?: number | null
          impact_story_promotion?: boolean | null
          indigenous_status?: string | null
          industry_sectors?: string[] | null
          interested_in_peer_support?: boolean | null
          interests?: string[] | null
          is_cultural_advisor?: boolean | null
          is_elder?: boolean | null
          is_featured?: boolean | null
          is_service_provider?: boolean | null
          is_storyteller?: boolean | null
          job_title?: string | null
          justicehub_enabled?: boolean | null
          justicehub_featured?: boolean | null
          justicehub_role?: string | null
          justicehub_synced_at?: string | null
          knowledge_transmission_score?: number | null
          language_communities_visibility?: string | null
          language_group?: string | null
          languages_spoken?: string[] | null
          last_impact_analysis?: string | null
          last_name?: string | null
          last_story_date?: string | null
          legacy_airtable_id?: string | null
          legacy_location_id?: string | null
          legacy_organization_id?: string | null
          legacy_project_id?: string | null
          legacy_storyteller_id?: string | null
          legacy_user_id?: string | null
          life_motto?: string | null
          linkedin_profile_url?: string | null
          location?: string | null
          location_id?: string | null
          media_visibility?: string | null
          mentor_availability?: boolean | null
          metadata?: Json | null
          migrated_at?: string | null
          migration_quality_score?: number | null
          narrative_ownership_level?: string | null
          narrative_themes?: string[] | null
          network_visibility?: string | null
          occupation?: string | null
          onboarding_completed?: boolean | null
          open_to_mentoring?: boolean | null
          personal_statement?: string | null
          phone?: string | null
          phone_number?: string | null
          photo_consent_contexts?: string[] | null
          platform_benefit_sharing?: Json | null
          preferred_communication?: string[] | null
          preferred_name?: string | null
          preferred_pronouns?: string | null
          primary_impact_type?: string | null
          primary_organization_id?: string | null
          privacy_preferences?: Json | null
          professional_summary?: string | null
          professional_visibility?: string | null
          profile_image_alt_text?: string | null
          profile_image_url?: string | null
          profile_status?: string | null
          profile_visibility?: string | null
          pronouns?: string | null
          quote_sharing_consent?: boolean | null
          recommendation_opt_in?: boolean | null
          relationship_building_score?: number | null
          requires_elder_review?: boolean | null
          resume_url?: string | null
          seeking_organizational_connections?: boolean | null
          show_in_directory?: boolean | null
          social_links?: Json | null
          speaking_availability?: boolean | null
          stories_contributed?: number | null
          stories_visibility?: string | null
          story_use_permissions?: Json | null
          story_visibility_level?: string | null
          storyteller_ranking?: number | null
          storyteller_type?: string | null
          storytelling_experience?: string | null
          storytelling_methods?: string[] | null
          super_admin?: boolean | null
          system_navigation_score?: number | null
          tenant_id?: string
          tenant_roles?: string[] | null
          timezone?: string | null
          total_impact_insights?: number | null
          traditional_country?: string | null
          traditional_knowledge_flag?: boolean | null
          traditional_knowledge_keeper?: boolean | null
          transcripts_visibility?: string | null
          updated_at?: string | null
          user_id?: string | null
          video_introduction_url?: string | null
          video_metadata?: Json | null
          video_portfolio_urls?: string[] | null
          website_url?: string | null
          wisdom_sharing_level?: string | null
          years_of_community_work?: number | null
          years_of_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_primary_organization_id_fkey"
            columns: ["primary_organization_id"]
            isOneToOne: false
            referencedRelation: "organization_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_primary_organization_id_fkey"
            columns: ["primary_organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
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
          {
            foreignKeyName: "profiles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_ai_usage_summary"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      project_analyses: {
        Row: {
          analysis_data: Json
          analysis_type: string
          analyzed_at: string
          content_hash: string
          created_at: string
          id: string
          model_used: string
          project_id: string
          updated_at: string
        }
        Insert: {
          analysis_data: Json
          analysis_type: string
          analyzed_at?: string
          content_hash: string
          created_at?: string
          id?: string
          model_used: string
          project_id: string
          updated_at?: string
        }
        Update: {
          analysis_data?: Json
          analysis_type?: string
          analyzed_at?: string
          content_hash?: string
          created_at?: string
          id?: string
          model_used?: string
          project_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_analyses_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_analytics: {
        Row: {
          challenges: string[] | null
          generated_at: string | null
          id: string
          impact_metrics: Json | null
          key_learnings: string[] | null
          last_analysis_at: string | null
          milestones: Json | null
          outcomes: Json | null
          participant_count: number | null
          participant_demographics: Json | null
          participant_quotes: Json | null
          project_id: string
          project_objectives: Json | null
          recommendations: string[] | null
          stakeholder_network: Json | null
          success_stories: Json | null
          theme_count: number | null
          themes: Json | null
          total_engagement_hours: number | null
          transcript_count: number | null
          updated_at: string | null
        }
        Insert: {
          challenges?: string[] | null
          generated_at?: string | null
          id?: string
          impact_metrics?: Json | null
          key_learnings?: string[] | null
          last_analysis_at?: string | null
          milestones?: Json | null
          outcomes?: Json | null
          participant_count?: number | null
          participant_demographics?: Json | null
          participant_quotes?: Json | null
          project_id: string
          project_objectives?: Json | null
          recommendations?: string[] | null
          stakeholder_network?: Json | null
          success_stories?: Json | null
          theme_count?: number | null
          themes?: Json | null
          total_engagement_hours?: number | null
          transcript_count?: number | null
          updated_at?: string | null
        }
        Update: {
          challenges?: string[] | null
          generated_at?: string | null
          id?: string
          impact_metrics?: Json | null
          key_learnings?: string[] | null
          last_analysis_at?: string | null
          milestones?: Json | null
          outcomes?: Json | null
          participant_count?: number | null
          participant_demographics?: Json | null
          participant_quotes?: Json | null
          project_id?: string
          project_objectives?: Json | null
          recommendations?: string[] | null
          stakeholder_network?: Json | null
          success_stories?: Json | null
          theme_count?: number | null
          themes?: Json | null
          total_engagement_hours?: number | null
          transcript_count?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_analytics_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_contexts: {
        Row: {
          ai_extracted: boolean | null
          ai_model_used: string | null
          context: string | null
          context_type: string | null
          created_at: string | null
          created_by: string | null
          cultural_approaches: string[] | null
          custom_fields: Json | null
          existing_documents: string | null
          expected_outcomes: Json | null
          extraction_quality_score: number | null
          id: string
          inherits_from_org: boolean | null
          key_activities: string[] | null
          last_updated_by: string | null
          organization_id: string
          program_model: string | null
          project_id: string
          purpose: string | null
          seed_interview_text: string | null
          success_criteria: string[] | null
          target_population: string | null
          timeframe: string | null
          updated_at: string | null
        }
        Insert: {
          ai_extracted?: boolean | null
          ai_model_used?: string | null
          context?: string | null
          context_type?: string | null
          created_at?: string | null
          created_by?: string | null
          cultural_approaches?: string[] | null
          custom_fields?: Json | null
          existing_documents?: string | null
          expected_outcomes?: Json | null
          extraction_quality_score?: number | null
          id?: string
          inherits_from_org?: boolean | null
          key_activities?: string[] | null
          last_updated_by?: string | null
          organization_id: string
          program_model?: string | null
          project_id: string
          purpose?: string | null
          seed_interview_text?: string | null
          success_criteria?: string[] | null
          target_population?: string | null
          timeframe?: string | null
          updated_at?: string | null
        }
        Update: {
          ai_extracted?: boolean | null
          ai_model_used?: string | null
          context?: string | null
          context_type?: string | null
          created_at?: string | null
          created_by?: string | null
          cultural_approaches?: string[] | null
          custom_fields?: Json | null
          existing_documents?: string | null
          expected_outcomes?: Json | null
          extraction_quality_score?: number | null
          id?: string
          inherits_from_org?: boolean | null
          key_activities?: string[] | null
          last_updated_by?: string | null
          organization_id?: string
          program_model?: string | null
          project_id?: string
          purpose?: string | null
          seed_interview_text?: string | null
          success_criteria?: string[] | null
          target_population?: string | null
          timeframe?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_contexts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_contexts_last_updated_by_fkey"
            columns: ["last_updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_contexts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_contexts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_contexts_organization_id_fkey1"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_contexts_organization_id_fkey1"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_contexts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_media: {
        Row: {
          created_at: string | null
          display_order: number | null
          id: string
          media_asset_id: string | null
          project_id: string | null
          uploaded_by: string | null
          usage_context: string | null
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          media_asset_id?: string | null
          project_id?: string | null
          uploaded_by?: string | null
          usage_context?: string | null
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          media_asset_id?: string | null
          project_id?: string | null
          uploaded_by?: string | null
          usage_context?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_media_media_asset_id_fkey"
            columns: ["media_asset_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_media_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_media_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      project_organizations: {
        Row: {
          created_at: string | null
          id: string
          organization_id: string
          project_id: string
          role: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          organization_id: string
          project_id: string
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          organization_id?: string
          project_id?: string
          role?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_organizations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_organizations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_organizations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_participants: {
        Row: {
          created_at: string | null
          id: string
          joined_at: string | null
          notes: string | null
          project_id: string | null
          role: string | null
          status: string | null
          storyteller_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          joined_at?: string | null
          notes?: string | null
          project_id?: string | null
          role?: string | null
          status?: string | null
          storyteller_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          joined_at?: string | null
          notes?: string | null
          project_id?: string | null
          role?: string | null
          status?: string | null
          storyteller_id?: string | null
          updated_at?: string | null
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
      project_profiles: {
        Row: {
          approved_by: string | null
          challenge_language: string[] | null
          community_impact: string[] | null
          community_need: string | null
          community_wisdom: string[] | null
          completeness_score: number | null
          created_at: string | null
          cultural_approaches: string[] | null
          cultural_protocols: string[] | null
          cultural_values: string[] | null
          family_impact: string[] | null
          id: string
          indigenous_frameworks: string[] | null
          individual_impact: string[] | null
          key_activities: string[] | null
          last_reviewed_at: string | null
          long_term_outcomes: string[] | null
          medium_term_outcomes: string[] | null
          mission: string | null
          origin_story: string | null
          outcome_categories: Json[] | null
          positive_language: string[] | null
          primary_goals: string[] | null
          program_model: string | null
          project_id: string
          short_term_outcomes: string[] | null
          success_indicators: Json[] | null
          systems_impact: string[] | null
          target_population: string | null
          transformation_markers: string[] | null
          updated_at: string | null
          who_initiated: string | null
        }
        Insert: {
          approved_by?: string | null
          challenge_language?: string[] | null
          community_impact?: string[] | null
          community_need?: string | null
          community_wisdom?: string[] | null
          completeness_score?: number | null
          created_at?: string | null
          cultural_approaches?: string[] | null
          cultural_protocols?: string[] | null
          cultural_values?: string[] | null
          family_impact?: string[] | null
          id?: string
          indigenous_frameworks?: string[] | null
          individual_impact?: string[] | null
          key_activities?: string[] | null
          last_reviewed_at?: string | null
          long_term_outcomes?: string[] | null
          medium_term_outcomes?: string[] | null
          mission?: string | null
          origin_story?: string | null
          outcome_categories?: Json[] | null
          positive_language?: string[] | null
          primary_goals?: string[] | null
          program_model?: string | null
          project_id: string
          short_term_outcomes?: string[] | null
          success_indicators?: Json[] | null
          systems_impact?: string[] | null
          target_population?: string | null
          transformation_markers?: string[] | null
          updated_at?: string | null
          who_initiated?: string | null
        }
        Update: {
          approved_by?: string | null
          challenge_language?: string[] | null
          community_impact?: string[] | null
          community_need?: string | null
          community_wisdom?: string[] | null
          completeness_score?: number | null
          created_at?: string | null
          cultural_approaches?: string[] | null
          cultural_protocols?: string[] | null
          cultural_values?: string[] | null
          family_impact?: string[] | null
          id?: string
          indigenous_frameworks?: string[] | null
          individual_impact?: string[] | null
          key_activities?: string[] | null
          last_reviewed_at?: string | null
          long_term_outcomes?: string[] | null
          medium_term_outcomes?: string[] | null
          mission?: string | null
          origin_story?: string | null
          outcome_categories?: Json[] | null
          positive_language?: string[] | null
          primary_goals?: string[] | null
          program_model?: string | null
          project_id?: string
          short_term_outcomes?: string[] | null
          success_indicators?: Json[] | null
          systems_impact?: string[] | null
          target_population?: string | null
          transformation_markers?: string[] | null
          updated_at?: string | null
          who_initiated?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_profiles_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_seed_interviews: {
        Row: {
          created_at: string | null
          extracted_context: Json | null
          id: string
          interview_audio_url: string | null
          interview_date: string | null
          interview_transcript: string | null
          interviewed_by: string | null
          project_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          extracted_context?: Json | null
          id?: string
          interview_audio_url?: string | null
          interview_date?: string | null
          interview_transcript?: string | null
          interviewed_by?: string | null
          project_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          extracted_context?: Json | null
          id?: string
          interview_audio_url?: string | null
          interview_date?: string | null
          interview_transcript?: string | null
          interviewed_by?: string | null
          project_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_seed_interviews_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_storytellers: {
        Row: {
          created_at: string | null
          id: string
          joined_at: string | null
          project_id: string
          role: string | null
          status: string | null
          storyteller_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          joined_at?: string | null
          project_id: string
          role?: string | null
          status?: string | null
          storyteller_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          joined_at?: string | null
          project_id?: string
          role?: string | null
          status?: string | null
          storyteller_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_storytellers_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_storytellers_storyteller_id_fkey"
            columns: ["storyteller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      project_updates: {
        Row: {
          content: string
          created_at: string | null
          created_by: string
          id: string
          project_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by: string
          id?: string
          project_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string
          id?: string
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_updates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_updates_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          budget: number | null
          context_description: string | null
          context_model: string | null
          context_updated_at: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          end_date: string | null
          id: string
          justicehub_enabled: boolean | null
          justicehub_program_type: string | null
          justicehub_synced_at: string | null
          location: string | null
          location_id: string | null
          name: string
          organization_id: string | null
          start_date: string | null
          status: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          budget?: number | null
          context_description?: string | null
          context_model?: string | null
          context_updated_at?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          justicehub_enabled?: boolean | null
          justicehub_program_type?: string | null
          justicehub_synced_at?: string | null
          location?: string | null
          location_id?: string | null
          name: string
          organization_id?: string | null
          start_date?: string | null
          status?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          budget?: number | null
          context_description?: string | null
          context_model?: string | null
          context_updated_at?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          justicehub_enabled?: boolean | null
          justicehub_program_type?: string | null
          justicehub_synced_at?: string | null
          location?: string | null
          location_id?: string | null
          name?: string
          organization_id?: string | null
          start_date?: string | null
          status?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
          {
            foreignKeyName: "projects_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_ai_usage_summary"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      quotes: {
        Row: {
          ai_confidence_score: number | null
          attribution_approved: boolean | null
          author_id: string
          context_after: string | null
          context_before: string | null
          created_at: string | null
          cultural_sensitivity: string | null
          emotional_tone: string | null
          extracted_by_ai: boolean | null
          extraction_model: string | null
          id: string
          last_used_at: string | null
          legacy_quote_id: string | null
          legacy_story_id: string | null
          legacy_storyteller_id: string | null
          legacy_transcript_id: string | null
          migrated_at: string | null
          quote_text: string
          quote_type: string | null
          requires_attribution: boolean | null
          significance_score: number | null
          story_id: string | null
          storyteller_approved: boolean | null
          tenant_id: string
          themes: Json | null
          transcript_id: string | null
          updated_at: string | null
          usage_count: number | null
          usage_permissions: Json | null
          visibility: string | null
        }
        Insert: {
          ai_confidence_score?: number | null
          attribution_approved?: boolean | null
          author_id: string
          context_after?: string | null
          context_before?: string | null
          created_at?: string | null
          cultural_sensitivity?: string | null
          emotional_tone?: string | null
          extracted_by_ai?: boolean | null
          extraction_model?: string | null
          id?: string
          last_used_at?: string | null
          legacy_quote_id?: string | null
          legacy_story_id?: string | null
          legacy_storyteller_id?: string | null
          legacy_transcript_id?: string | null
          migrated_at?: string | null
          quote_text: string
          quote_type?: string | null
          requires_attribution?: boolean | null
          significance_score?: number | null
          story_id?: string | null
          storyteller_approved?: boolean | null
          tenant_id: string
          themes?: Json | null
          transcript_id?: string | null
          updated_at?: string | null
          usage_count?: number | null
          usage_permissions?: Json | null
          visibility?: string | null
        }
        Update: {
          ai_confidence_score?: number | null
          attribution_approved?: boolean | null
          author_id?: string
          context_after?: string | null
          context_before?: string | null
          created_at?: string | null
          cultural_sensitivity?: string | null
          emotional_tone?: string | null
          extracted_by_ai?: boolean | null
          extraction_model?: string | null
          id?: string
          last_used_at?: string | null
          legacy_quote_id?: string | null
          legacy_story_id?: string | null
          legacy_storyteller_id?: string | null
          legacy_transcript_id?: string | null
          migrated_at?: string | null
          quote_text?: string
          quote_type?: string | null
          requires_attribution?: boolean | null
          significance_score?: number | null
          story_id?: string | null
          storyteller_approved?: boolean | null
          tenant_id?: string
          themes?: Json | null
          transcript_id?: string | null
          updated_at?: string | null
          usage_count?: number | null
          usage_permissions?: Json | null
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotes_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories_with_trust_indicators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "syndicated_stories"
            referencedColumns: ["story_id"]
          },
          {
            foreignKeyName: "quotes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_analytics"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "quotes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_ai_usage_summary"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      report_feedback: {
        Row: {
          created_at: string | null
          design_feedback: string | null
          feedback_text: string | null
          feedback_type: string
          id: string
          improvement_areas: string[] | null
          is_addressed: boolean | null
          liked_sections: string[] | null
          metadata: Json | null
          missing_content: string | null
          profile_id: string | null
          rating: number | null
          report_id: string
          responded_at: string | null
          responded_by: string | null
          response_text: string | null
        }
        Insert: {
          created_at?: string | null
          design_feedback?: string | null
          feedback_text?: string | null
          feedback_type: string
          id?: string
          improvement_areas?: string[] | null
          is_addressed?: boolean | null
          liked_sections?: string[] | null
          metadata?: Json | null
          missing_content?: string | null
          profile_id?: string | null
          rating?: number | null
          report_id: string
          responded_at?: string | null
          responded_by?: string | null
          response_text?: string | null
        }
        Update: {
          created_at?: string | null
          design_feedback?: string | null
          feedback_text?: string | null
          feedback_type?: string
          id?: string
          improvement_areas?: string[] | null
          is_addressed?: boolean | null
          liked_sections?: string[] | null
          metadata?: Json | null
          missing_content?: string | null
          profile_id?: string | null
          rating?: number | null
          report_id?: string
          responded_at?: string | null
          responded_by?: string | null
          response_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "report_feedback_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_feedback_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "annual_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_feedback_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "annual_reports_with_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_feedback_responded_by_fkey"
            columns: ["responded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      report_sections: {
        Row: {
          background_color: string | null
          content_format: string | null
          created_at: string | null
          created_by: string | null
          custom_content: string | null
          data_viz_config: Json | null
          display_order: number | null
          id: string
          include_data_viz: boolean | null
          include_media: boolean | null
          include_stories: boolean | null
          layout_style: string | null
          media_ids: string[] | null
          metadata: Json | null
          page_break_before: boolean | null
          report_id: string
          section_content: string | null
          section_title: string
          section_type: string
          story_ids: string[] | null
          updated_at: string | null
        }
        Insert: {
          background_color?: string | null
          content_format?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_content?: string | null
          data_viz_config?: Json | null
          display_order?: number | null
          id?: string
          include_data_viz?: boolean | null
          include_media?: boolean | null
          include_stories?: boolean | null
          layout_style?: string | null
          media_ids?: string[] | null
          metadata?: Json | null
          page_break_before?: boolean | null
          report_id: string
          section_content?: string | null
          section_title: string
          section_type: string
          story_ids?: string[] | null
          updated_at?: string | null
        }
        Update: {
          background_color?: string | null
          content_format?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_content?: string | null
          data_viz_config?: Json | null
          display_order?: number | null
          id?: string
          include_data_viz?: boolean | null
          include_media?: boolean | null
          include_stories?: boolean | null
          layout_style?: string | null
          media_ids?: string[] | null
          metadata?: Json | null
          page_break_before?: boolean | null
          report_id?: string
          section_content?: string | null
          section_title?: string
          section_type?: string
          story_ids?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "report_sections_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_sections_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "annual_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_sections_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "annual_reports_with_stats"
            referencedColumns: ["id"]
          },
        ]
      }
      report_templates: {
        Row: {
          category: string | null
          cover_template_url: string | null
          created_at: string | null
          created_by: string | null
          default_sections: Json
          description: string | null
          design_config: Json
          display_name: string
          footer_template_url: string | null
          header_template_url: string | null
          id: string
          is_public: boolean | null
          metadata: Json | null
          organization_id: string | null
          template_name: string
          updated_at: string | null
          usage_count: number | null
        }
        Insert: {
          category?: string | null
          cover_template_url?: string | null
          created_at?: string | null
          created_by?: string | null
          default_sections: Json
          description?: string | null
          design_config?: Json
          display_name: string
          footer_template_url?: string | null
          header_template_url?: string | null
          id?: string
          is_public?: boolean | null
          metadata?: Json | null
          organization_id?: string | null
          template_name: string
          updated_at?: string | null
          usage_count?: number | null
        }
        Update: {
          category?: string | null
          cover_template_url?: string | null
          created_at?: string | null
          created_by?: string | null
          default_sections?: Json
          description?: string | null
          design_config?: Json
          display_name?: string
          footer_template_url?: string | null
          header_template_url?: string | null
          id?: string
          is_public?: boolean | null
          metadata?: Json | null
          organization_id?: string | null
          template_name?: string
          updated_at?: string | null
          usage_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "report_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      ripple_effects: {
        Row: {
          created_at: string | null
          effect_description: string
          evidence: string | null
          geographic_scope: string | null
          id: string
          people_affected: number | null
          project_id: string | null
          reported_by: string | null
          reported_date: string | null
          ripple_label: string | null
          ripple_level: number | null
          story_id: string | null
          time_lag_days: number | null
          triggered_by: string | null
          verified: boolean | null
        }
        Insert: {
          created_at?: string | null
          effect_description: string
          evidence?: string | null
          geographic_scope?: string | null
          id?: string
          people_affected?: number | null
          project_id?: string | null
          reported_by?: string | null
          reported_date?: string | null
          ripple_label?: string | null
          ripple_level?: number | null
          story_id?: string | null
          time_lag_days?: number | null
          triggered_by?: string | null
          verified?: boolean | null
        }
        Update: {
          created_at?: string | null
          effect_description?: string
          evidence?: string | null
          geographic_scope?: string | null
          id?: string
          people_affected?: number | null
          project_id?: string | null
          reported_by?: string | null
          reported_date?: string | null
          ripple_label?: string | null
          ripple_level?: number | null
          story_id?: string | null
          time_lag_days?: number | null
          triggered_by?: string | null
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "ripple_effects_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ripple_effects_reported_by_fkey"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ripple_effects_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ripple_effects_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories_with_trust_indicators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ripple_effects_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "syndicated_stories"
            referencedColumns: ["story_id"]
          },
          {
            foreignKeyName: "ripple_effects_triggered_by_fkey"
            columns: ["triggered_by"]
            isOneToOne: false
            referencedRelation: "ripple_effects"
            referencedColumns: ["id"]
          },
        ]
      }
      scraped_services: {
        Row: {
          active: boolean | null
          availability_schedule: Json | null
          capacity_indicators: Json | null
          category: string | null
          confidence_score: number
          contact_info: Json | null
          cost_structure: string | null
          created_at: string | null
          description: string | null
          eligibility_criteria: string[] | null
          extraction_timestamp: string | null
          geographical_coverage: Json | null
          id: string
          name: string
          organization_id: string | null
          outcomes_evidence: string[] | null
          source_url: string | null
          subcategory: string | null
          target_demographics: Json | null
          updated_at: string | null
          validation_status: string | null
        }
        Insert: {
          active?: boolean | null
          availability_schedule?: Json | null
          capacity_indicators?: Json | null
          category?: string | null
          confidence_score: number
          contact_info?: Json | null
          cost_structure?: string | null
          created_at?: string | null
          description?: string | null
          eligibility_criteria?: string[] | null
          extraction_timestamp?: string | null
          geographical_coverage?: Json | null
          id?: string
          name: string
          organization_id?: string | null
          outcomes_evidence?: string[] | null
          source_url?: string | null
          subcategory?: string | null
          target_demographics?: Json | null
          updated_at?: string | null
          validation_status?: string | null
        }
        Update: {
          active?: boolean | null
          availability_schedule?: Json | null
          capacity_indicators?: Json | null
          category?: string | null
          confidence_score?: number
          contact_info?: Json | null
          cost_structure?: string | null
          created_at?: string | null
          description?: string | null
          eligibility_criteria?: string[] | null
          extraction_timestamp?: string | null
          geographical_coverage?: Json | null
          id?: string
          name?: string
          organization_id?: string | null
          outcomes_evidence?: string[] | null
          source_url?: string | null
          subcategory?: string | null
          target_demographics?: Json | null
          updated_at?: string | null
          validation_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scraped_services_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scraped_services_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      scraper_health_metrics: {
        Row: {
          alert_sent: boolean | null
          alert_sent_at: string | null
          data_source_id: string | null
          id: string
          measurement_timestamp: string | null
          metric_name: string
          metric_unit: string | null
          metric_value: number | null
          notes: string | null
          status: string | null
          threshold_critical: number | null
          threshold_warning: number | null
        }
        Insert: {
          alert_sent?: boolean | null
          alert_sent_at?: string | null
          data_source_id?: string | null
          id?: string
          measurement_timestamp?: string | null
          metric_name: string
          metric_unit?: string | null
          metric_value?: number | null
          notes?: string | null
          status?: string | null
          threshold_critical?: number | null
          threshold_warning?: number | null
        }
        Update: {
          alert_sent?: boolean | null
          alert_sent_at?: string | null
          data_source_id?: string | null
          id?: string
          measurement_timestamp?: string | null
          metric_name?: string
          metric_unit?: string | null
          metric_value?: number | null
          notes?: string | null
          status?: string | null
          threshold_critical?: number | null
          threshold_warning?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "scraper_health_metrics_data_source_id_fkey"
            columns: ["data_source_id"]
            isOneToOne: false
            referencedRelation: "data_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      scraping_metadata: {
        Row: {
          ai_processing_version: string
          confidence_scores: Json
          created_at: string | null
          data_lineage: Json | null
          discovery_method: string
          extraction_method: string
          id: string
          last_updated: string | null
          organization_id: string | null
          quality_flags: Json | null
          scraping_timestamp: string | null
          source_type: string
          source_url: string
          validation_status: string | null
        }
        Insert: {
          ai_processing_version: string
          confidence_scores?: Json
          created_at?: string | null
          data_lineage?: Json | null
          discovery_method: string
          extraction_method: string
          id?: string
          last_updated?: string | null
          organization_id?: string | null
          quality_flags?: Json | null
          scraping_timestamp?: string | null
          source_type: string
          source_url: string
          validation_status?: string | null
        }
        Update: {
          ai_processing_version?: string
          confidence_scores?: Json
          created_at?: string | null
          data_lineage?: Json | null
          discovery_method?: string
          extraction_method?: string
          id?: string
          last_updated?: string | null
          organization_id?: string | null
          quality_flags?: Json | null
          scraping_timestamp?: string | null
          source_type?: string
          source_url?: string
          validation_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scraping_metadata_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scraping_metadata_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      service_impact: {
        Row: {
          activities_delivered: number | null
          activity_ids: string[] | null
          approval_date: string | null
          approved_by: string | null
          budget_allocated: number | null
          budget_spent: number | null
          challenges_faced: string[] | null
          community_events_held: number | null
          community_participation: number | null
          compiled_by: string | null
          completion_rate: number | null
          cost_per_participant: number | null
          created_at: string | null
          cultural_connection_improved: number | null
          cultural_protocols_maintained_rate: number | null
          document_ids: string[] | null
          documents_created: number | null
          elder_involvement_hours: number | null
          elder_satisfaction_rate: number | null
          id: string
          key_achievements: string[] | null
          language_use_sessions: number | null
          leadership_roles_assumed: number | null
          learnings_identified: string[] | null
          new_participants: number | null
          on_country_hours: number | null
          organization_id: string
          outcome_ids: string[] | null
          outcomes_achieved: number | null
          outcomes_in_progress: number | null
          partnerships_activated: number | null
          period_end: string
          period_start: string
          photos_collected: number | null
          project_id: string | null
          reduced_justice_involvement: number | null
          referral_success_rate: number | null
          reporting_period: string
          retention_rate: number | null
          returning_participants: number | null
          reviewed_by: string | null
          school_reengagement: number | null
          service_area: string
          service_referrals_made: number | null
          skills_developed: number | null
          stories_published: number | null
          story_ids: string[] | null
          success_stories_count: number | null
          target_achievement_rate: number | null
          tenant_id: string
          testimonials: string[] | null
          total_activity_hours: number | null
          total_participants: number | null
          traditional_knowledge_sessions: number | null
          updated_at: string | null
          videos_produced: number | null
        }
        Insert: {
          activities_delivered?: number | null
          activity_ids?: string[] | null
          approval_date?: string | null
          approved_by?: string | null
          budget_allocated?: number | null
          budget_spent?: number | null
          challenges_faced?: string[] | null
          community_events_held?: number | null
          community_participation?: number | null
          compiled_by?: string | null
          completion_rate?: number | null
          cost_per_participant?: number | null
          created_at?: string | null
          cultural_connection_improved?: number | null
          cultural_protocols_maintained_rate?: number | null
          document_ids?: string[] | null
          documents_created?: number | null
          elder_involvement_hours?: number | null
          elder_satisfaction_rate?: number | null
          id?: string
          key_achievements?: string[] | null
          language_use_sessions?: number | null
          leadership_roles_assumed?: number | null
          learnings_identified?: string[] | null
          new_participants?: number | null
          on_country_hours?: number | null
          organization_id: string
          outcome_ids?: string[] | null
          outcomes_achieved?: number | null
          outcomes_in_progress?: number | null
          partnerships_activated?: number | null
          period_end: string
          period_start: string
          photos_collected?: number | null
          project_id?: string | null
          reduced_justice_involvement?: number | null
          referral_success_rate?: number | null
          reporting_period: string
          retention_rate?: number | null
          returning_participants?: number | null
          reviewed_by?: string | null
          school_reengagement?: number | null
          service_area: string
          service_referrals_made?: number | null
          skills_developed?: number | null
          stories_published?: number | null
          story_ids?: string[] | null
          success_stories_count?: number | null
          target_achievement_rate?: number | null
          tenant_id: string
          testimonials?: string[] | null
          total_activity_hours?: number | null
          total_participants?: number | null
          traditional_knowledge_sessions?: number | null
          updated_at?: string | null
          videos_produced?: number | null
        }
        Update: {
          activities_delivered?: number | null
          activity_ids?: string[] | null
          approval_date?: string | null
          approved_by?: string | null
          budget_allocated?: number | null
          budget_spent?: number | null
          challenges_faced?: string[] | null
          community_events_held?: number | null
          community_participation?: number | null
          compiled_by?: string | null
          completion_rate?: number | null
          cost_per_participant?: number | null
          created_at?: string | null
          cultural_connection_improved?: number | null
          cultural_protocols_maintained_rate?: number | null
          document_ids?: string[] | null
          documents_created?: number | null
          elder_involvement_hours?: number | null
          elder_satisfaction_rate?: number | null
          id?: string
          key_achievements?: string[] | null
          language_use_sessions?: number | null
          leadership_roles_assumed?: number | null
          learnings_identified?: string[] | null
          new_participants?: number | null
          on_country_hours?: number | null
          organization_id?: string
          outcome_ids?: string[] | null
          outcomes_achieved?: number | null
          outcomes_in_progress?: number | null
          partnerships_activated?: number | null
          period_end?: string
          period_start?: string
          photos_collected?: number | null
          project_id?: string | null
          reduced_justice_involvement?: number | null
          referral_success_rate?: number | null
          reporting_period?: string
          retention_rate?: number | null
          returning_participants?: number | null
          reviewed_by?: string | null
          school_reengagement?: number | null
          service_area?: string
          service_referrals_made?: number | null
          skills_developed?: number | null
          stories_published?: number | null
          story_ids?: string[] | null
          success_stories_count?: number | null
          target_achievement_rate?: number | null
          tenant_id?: string
          testimonials?: string[] | null
          total_activity_hours?: number | null
          total_participants?: number | null
          traditional_knowledge_sessions?: number | null
          updated_at?: string | null
          videos_produced?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "service_impact_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          created_at: string | null
          description: string
          display_order: number | null
          features: Json | null
          icon_svg: string | null
          id: string
          image_url: string | null
          is_visible: boolean | null
          slug: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          display_order?: number | null
          features?: Json | null
          icon_svg?: string | null
          id?: string
          image_url?: string | null
          is_visible?: boolean | null
          slug: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          display_order?: number | null
          features?: Json | null
          icon_svg?: string | null
          id?: string
          image_url?: string | null
          is_visible?: boolean | null
          slug?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      sroi_calculations: {
        Row: {
          calculated_by: string | null
          calculation_date: string | null
          created_at: string | null
          id: string
          net_social_value: number | null
          sensitivity_conservative: number | null
          sensitivity_optimistic: number | null
          sroi_input_id: string
          sroi_ratio: number
          total_investment: number
          total_social_value: number
        }
        Insert: {
          calculated_by?: string | null
          calculation_date?: string | null
          created_at?: string | null
          id?: string
          net_social_value?: number | null
          sensitivity_conservative?: number | null
          sensitivity_optimistic?: number | null
          sroi_input_id: string
          sroi_ratio: number
          total_investment: number
          total_social_value: number
        }
        Update: {
          calculated_by?: string | null
          calculation_date?: string | null
          created_at?: string | null
          id?: string
          net_social_value?: number | null
          sensitivity_conservative?: number | null
          sensitivity_optimistic?: number | null
          sroi_input_id?: string
          sroi_ratio?: number
          total_investment?: number
          total_social_value?: number
        }
        Relationships: [
          {
            foreignKeyName: "sroi_calculations_calculated_by_fkey"
            columns: ["calculated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sroi_calculations_sroi_input_id_fkey"
            columns: ["sroi_input_id"]
            isOneToOne: false
            referencedRelation: "sroi_inputs"
            referencedColumns: ["id"]
          },
        ]
      }
      sroi_inputs: {
        Row: {
          created_at: string | null
          discount_rate: number | null
          funding_sources: Json | null
          id: string
          organization_id: string | null
          period_end: string
          period_start: string
          project_id: string | null
          total_investment: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          discount_rate?: number | null
          funding_sources?: Json | null
          id?: string
          organization_id?: string | null
          period_end: string
          period_start: string
          project_id?: string | null
          total_investment: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          discount_rate?: number | null
          funding_sources?: Json | null
          id?: string
          organization_id?: string | null
          period_end?: string
          period_start?: string
          project_id?: string | null
          total_investment?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sroi_inputs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sroi_inputs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sroi_inputs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      sroi_outcomes: {
        Row: {
          attribution: number | null
          beneficiary_count: number | null
          created_at: string | null
          deadweight: number | null
          displacement: number | null
          drop_off: number | null
          duration_years: number | null
          evidence_source: string | null
          financial_proxy: number | null
          id: string
          outcome_description: string
          outcome_type: string
          quantity: number | null
          sroi_input_id: string
          stakeholder_group: string
          total_value: number | null
          unit_of_measurement: string | null
        }
        Insert: {
          attribution?: number | null
          beneficiary_count?: number | null
          created_at?: string | null
          deadweight?: number | null
          displacement?: number | null
          drop_off?: number | null
          duration_years?: number | null
          evidence_source?: string | null
          financial_proxy?: number | null
          id?: string
          outcome_description: string
          outcome_type: string
          quantity?: number | null
          sroi_input_id: string
          stakeholder_group: string
          total_value?: number | null
          unit_of_measurement?: string | null
        }
        Update: {
          attribution?: number | null
          beneficiary_count?: number | null
          created_at?: string | null
          deadweight?: number | null
          displacement?: number | null
          drop_off?: number | null
          duration_years?: number | null
          evidence_source?: string | null
          financial_proxy?: number | null
          id?: string
          outcome_description?: string
          outcome_type?: string
          quantity?: number | null
          sroi_input_id?: string
          stakeholder_group?: string
          total_value?: number | null
          unit_of_measurement?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sroi_outcomes_sroi_input_id_fkey"
            columns: ["sroi_input_id"]
            isOneToOne: false
            referencedRelation: "sroi_inputs"
            referencedColumns: ["id"]
          },
        ]
      }
      stories: {
        Row: {
          ai_confidence_scores: Json | null
          ai_enhanced_content: string | null
          ai_generated_summary: boolean | null
          ai_processed: boolean | null
          ai_processing_consent_verified: boolean | null
          airtable_record_id: string | null
          allowed_embed_domains: string[] | null
          anonymization_requested_at: string | null
          anonymization_status: string | null
          anonymized_at: string | null
          anonymized_fields: Json | null
          archive_consent_given: boolean | null
          archive_reason: string | null
          archived_at: string | null
          archived_by: string | null
          author_id: string | null
          community_status: string | null
          consent_details: Json | null
          consent_verified_at: string | null
          consent_withdrawal_reason: string | null
          consent_withdrawn_at: string | null
          content: string
          created_at: string | null
          cross_tenant_visibility: string[] | null
          cultural_sensitivity_flag: boolean | null
          cultural_sensitivity_level: string | null
          cultural_themes: string[] | null
          cultural_warnings: Json | null
          elder_approved_at: string | null
          elder_approved_by: string | null
          elder_reviewed: boolean | null
          elder_reviewed_at: string | null
          elder_reviewer_id: string | null
          embedding: string | null
          embeds_enabled: boolean | null
          fellow_id: string | null
          fellowship_phase: string | null
          has_explicit_consent: boolean | null
          id: string
          is_archived: boolean | null
          is_featured: boolean | null
          is_public: boolean | null
          latitude: number | null
          legacy_airtable_id: string | null
          legacy_author: string | null
          legacy_fellow_id: string | null
          legacy_story_id: string | null
          legacy_storyteller_id: string | null
          likes_count: number
          location_id: string | null
          location_text: string | null
          longitude: number | null
          media_attachments: Json | null
          media_metadata: Json | null
          media_url: string | null
          media_urls: string[] | null
          migrated_at: string | null
          migration_quality_score: number | null
          organization_id: string | null
          original_author_display: string | null
          original_author_id: string | null
          ownership_status: string | null
          ownership_transferred_at: string | null
          permission_tier: Database["public"]["Enums"]["permission_tier"] | null
          privacy_level: string | null
          project_id: string | null
          provenance_chain: Json | null
          published_at: string | null
          requires_elder_approval: boolean | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          search_vector: unknown
          service_id: string | null
          shares_count: number
          sharing_enabled: boolean | null
          sharing_permissions: Json | null
          source_empathy_entry_id: string | null
          source_links: Json | null
          status: string | null
          story_category: string | null
          story_image_file: string | null
          story_image_url: string | null
          story_stage: string | null
          story_type: string | null
          storyteller_id: string | null
          summary: string | null
          sync_date: string | null
          tenant_id: string
          themes: Json | null
          title: string
          traditional_knowledge_flag: boolean | null
          transcript_id: string | null
          transcription: string | null
          updated_at: string | null
          video_embed_code: string | null
          video_stage: string | null
          views_count: number
        }
        Insert: {
          ai_confidence_scores?: Json | null
          ai_enhanced_content?: string | null
          ai_generated_summary?: boolean | null
          ai_processed?: boolean | null
          ai_processing_consent_verified?: boolean | null
          airtable_record_id?: string | null
          allowed_embed_domains?: string[] | null
          anonymization_requested_at?: string | null
          anonymization_status?: string | null
          anonymized_at?: string | null
          anonymized_fields?: Json | null
          archive_consent_given?: boolean | null
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          author_id?: string | null
          community_status?: string | null
          consent_details?: Json | null
          consent_verified_at?: string | null
          consent_withdrawal_reason?: string | null
          consent_withdrawn_at?: string | null
          content: string
          created_at?: string | null
          cross_tenant_visibility?: string[] | null
          cultural_sensitivity_flag?: boolean | null
          cultural_sensitivity_level?: string | null
          cultural_themes?: string[] | null
          cultural_warnings?: Json | null
          elder_approved_at?: string | null
          elder_approved_by?: string | null
          elder_reviewed?: boolean | null
          elder_reviewed_at?: string | null
          elder_reviewer_id?: string | null
          embedding?: string | null
          embeds_enabled?: boolean | null
          fellow_id?: string | null
          fellowship_phase?: string | null
          has_explicit_consent?: boolean | null
          id?: string
          is_archived?: boolean | null
          is_featured?: boolean | null
          is_public?: boolean | null
          latitude?: number | null
          legacy_airtable_id?: string | null
          legacy_author?: string | null
          legacy_fellow_id?: string | null
          legacy_story_id?: string | null
          legacy_storyteller_id?: string | null
          likes_count?: number
          location_id?: string | null
          location_text?: string | null
          longitude?: number | null
          media_attachments?: Json | null
          media_metadata?: Json | null
          media_url?: string | null
          media_urls?: string[] | null
          migrated_at?: string | null
          migration_quality_score?: number | null
          organization_id?: string | null
          original_author_display?: string | null
          original_author_id?: string | null
          ownership_status?: string | null
          ownership_transferred_at?: string | null
          permission_tier?:
            | Database["public"]["Enums"]["permission_tier"]
            | null
          privacy_level?: string | null
          project_id?: string | null
          provenance_chain?: Json | null
          published_at?: string | null
          requires_elder_approval?: boolean | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          search_vector?: unknown
          service_id?: string | null
          shares_count?: number
          sharing_enabled?: boolean | null
          sharing_permissions?: Json | null
          source_empathy_entry_id?: string | null
          source_links?: Json | null
          status?: string | null
          story_category?: string | null
          story_image_file?: string | null
          story_image_url?: string | null
          story_stage?: string | null
          story_type?: string | null
          storyteller_id?: string | null
          summary?: string | null
          sync_date?: string | null
          tenant_id: string
          themes?: Json | null
          title: string
          traditional_knowledge_flag?: boolean | null
          transcript_id?: string | null
          transcription?: string | null
          updated_at?: string | null
          video_embed_code?: string | null
          video_stage?: string | null
          views_count?: number
        }
        Update: {
          ai_confidence_scores?: Json | null
          ai_enhanced_content?: string | null
          ai_generated_summary?: boolean | null
          ai_processed?: boolean | null
          ai_processing_consent_verified?: boolean | null
          airtable_record_id?: string | null
          allowed_embed_domains?: string[] | null
          anonymization_requested_at?: string | null
          anonymization_status?: string | null
          anonymized_at?: string | null
          anonymized_fields?: Json | null
          archive_consent_given?: boolean | null
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          author_id?: string | null
          community_status?: string | null
          consent_details?: Json | null
          consent_verified_at?: string | null
          consent_withdrawal_reason?: string | null
          consent_withdrawn_at?: string | null
          content?: string
          created_at?: string | null
          cross_tenant_visibility?: string[] | null
          cultural_sensitivity_flag?: boolean | null
          cultural_sensitivity_level?: string | null
          cultural_themes?: string[] | null
          cultural_warnings?: Json | null
          elder_approved_at?: string | null
          elder_approved_by?: string | null
          elder_reviewed?: boolean | null
          elder_reviewed_at?: string | null
          elder_reviewer_id?: string | null
          embedding?: string | null
          embeds_enabled?: boolean | null
          fellow_id?: string | null
          fellowship_phase?: string | null
          has_explicit_consent?: boolean | null
          id?: string
          is_archived?: boolean | null
          is_featured?: boolean | null
          is_public?: boolean | null
          latitude?: number | null
          legacy_airtable_id?: string | null
          legacy_author?: string | null
          legacy_fellow_id?: string | null
          legacy_story_id?: string | null
          legacy_storyteller_id?: string | null
          likes_count?: number
          location_id?: string | null
          location_text?: string | null
          longitude?: number | null
          media_attachments?: Json | null
          media_metadata?: Json | null
          media_url?: string | null
          media_urls?: string[] | null
          migrated_at?: string | null
          migration_quality_score?: number | null
          organization_id?: string | null
          original_author_display?: string | null
          original_author_id?: string | null
          ownership_status?: string | null
          ownership_transferred_at?: string | null
          permission_tier?:
            | Database["public"]["Enums"]["permission_tier"]
            | null
          privacy_level?: string | null
          project_id?: string | null
          provenance_chain?: Json | null
          published_at?: string | null
          requires_elder_approval?: boolean | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          search_vector?: unknown
          service_id?: string | null
          shares_count?: number
          sharing_enabled?: boolean | null
          sharing_permissions?: Json | null
          source_empathy_entry_id?: string | null
          source_links?: Json | null
          status?: string | null
          story_category?: string | null
          story_image_file?: string | null
          story_image_url?: string | null
          story_stage?: string | null
          story_type?: string | null
          storyteller_id?: string | null
          summary?: string | null
          sync_date?: string | null
          tenant_id?: string
          themes?: Json | null
          title?: string
          traditional_knowledge_flag?: boolean | null
          transcript_id?: string | null
          transcription?: string | null
          updated_at?: string | null
          video_embed_code?: string | null
          video_stage?: string | null
          views_count?: number
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
            foreignKeyName: "stories_elder_approved_by_fkey"
            columns: ["elder_approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stories_elder_reviewer_id_fkey"
            columns: ["elder_reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stories_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stories_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stories_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
            foreignKeyName: "stories_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stories_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "organization_services"
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
            foreignKeyName: "stories_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_ai_usage_summary"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      story_access_log: {
        Row: {
          access_context: Json | null
          access_type: string
          accessed_at: string | null
          accessor_ip: string | null
          accessor_user_agent: string | null
          app_id: string
          id: string
          story_id: string
        }
        Insert: {
          access_context?: Json | null
          access_type: string
          accessed_at?: string | null
          accessor_ip?: string | null
          accessor_user_agent?: string | null
          app_id: string
          id?: string
          story_id: string
        }
        Update: {
          access_context?: Json | null
          access_type?: string
          accessed_at?: string | null
          accessor_ip?: string | null
          accessor_user_agent?: string | null
          app_id?: string
          id?: string
          story_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_access_log_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "external_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_access_log_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "syndicated_stories"
            referencedColumns: ["app_id"]
          },
          {
            foreignKeyName: "story_access_log_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_access_log_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories_with_trust_indicators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_access_log_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "syndicated_stories"
            referencedColumns: ["story_id"]
          },
        ]
      }
      story_access_tokens: {
        Row: {
          created_at: string
          created_by: string | null
          expires_at: string
          id: string
          last_accessed_at: string | null
          max_views: number | null
          purpose: string | null
          revoked: boolean
          shared_to: string[] | null
          story_id: string
          tenant_id: string
          token: string
          view_count: number
          watermark_text: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          expires_at: string
          id?: string
          last_accessed_at?: string | null
          max_views?: number | null
          purpose?: string | null
          revoked?: boolean
          shared_to?: string[] | null
          story_id: string
          tenant_id: string
          token: string
          view_count?: number
          watermark_text?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          expires_at?: string
          id?: string
          last_accessed_at?: string | null
          max_views?: number | null
          purpose?: string | null
          revoked?: boolean
          shared_to?: string[] | null
          story_id?: string
          tenant_id?: string
          token?: string
          view_count?: number
          watermark_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "story_access_tokens_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_access_tokens_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_access_tokens_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories_with_trust_indicators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_access_tokens_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "syndicated_stories"
            referencedColumns: ["story_id"]
          },
          {
            foreignKeyName: "story_access_tokens_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_analytics"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "story_access_tokens_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_access_tokens_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_ai_usage_summary"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      story_distributions: {
        Row: {
          click_count: number | null
          consent_snapshot: Json | null
          consent_version: string | null
          created_at: string | null
          created_by: string | null
          distribution_url: string | null
          embed_domain: string | null
          expires_at: string | null
          id: string
          last_viewed_at: string | null
          metadata: Json | null
          notes: string | null
          platform: string
          platform_post_id: string | null
          revocation_reason: string | null
          revoked_at: string | null
          revoked_by: string | null
          status: string | null
          story_id: string
          tenant_id: string
          updated_at: string | null
          view_count: number | null
          webhook_notified_at: string | null
          webhook_response: Json | null
          webhook_retry_count: number | null
          webhook_secret: string | null
          webhook_url: string | null
        }
        Insert: {
          click_count?: number | null
          consent_snapshot?: Json | null
          consent_version?: string | null
          created_at?: string | null
          created_by?: string | null
          distribution_url?: string | null
          embed_domain?: string | null
          expires_at?: string | null
          id?: string
          last_viewed_at?: string | null
          metadata?: Json | null
          notes?: string | null
          platform: string
          platform_post_id?: string | null
          revocation_reason?: string | null
          revoked_at?: string | null
          revoked_by?: string | null
          status?: string | null
          story_id: string
          tenant_id: string
          updated_at?: string | null
          view_count?: number | null
          webhook_notified_at?: string | null
          webhook_response?: Json | null
          webhook_retry_count?: number | null
          webhook_secret?: string | null
          webhook_url?: string | null
        }
        Update: {
          click_count?: number | null
          consent_snapshot?: Json | null
          consent_version?: string | null
          created_at?: string | null
          created_by?: string | null
          distribution_url?: string | null
          embed_domain?: string | null
          expires_at?: string | null
          id?: string
          last_viewed_at?: string | null
          metadata?: Json | null
          notes?: string | null
          platform?: string
          platform_post_id?: string | null
          revocation_reason?: string | null
          revoked_at?: string | null
          revoked_by?: string | null
          status?: string | null
          story_id?: string
          tenant_id?: string
          updated_at?: string | null
          view_count?: number | null
          webhook_notified_at?: string | null
          webhook_response?: Json | null
          webhook_retry_count?: number | null
          webhook_secret?: string | null
          webhook_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "story_distributions_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_distributions_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories_with_trust_indicators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_distributions_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "syndicated_stories"
            referencedColumns: ["story_id"]
          },
        ]
      }
      story_engagement_daily: {
        Row: {
          action_count: number
          avg_scroll_depth: number | null
          created_at: string
          date: string
          desktop_percent: number | null
          id: string
          mobile_percent: number | null
          platform_name: string
          read_count: number
          share_count: number
          story_id: string
          storyteller_id: string | null
          top_countries: Json | null
          total_read_time_seconds: number
          updated_at: string
          view_count: number
        }
        Insert: {
          action_count?: number
          avg_scroll_depth?: number | null
          created_at?: string
          date: string
          desktop_percent?: number | null
          id?: string
          mobile_percent?: number | null
          platform_name: string
          read_count?: number
          share_count?: number
          story_id: string
          storyteller_id?: string | null
          top_countries?: Json | null
          total_read_time_seconds?: number
          updated_at?: string
          view_count?: number
        }
        Update: {
          action_count?: number
          avg_scroll_depth?: number | null
          created_at?: string
          date?: string
          desktop_percent?: number | null
          id?: string
          mobile_percent?: number | null
          platform_name?: string
          read_count?: number
          share_count?: number
          story_id?: string
          storyteller_id?: string | null
          top_countries?: Json | null
          total_read_time_seconds?: number
          updated_at?: string
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "story_engagement_daily_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_engagement_daily_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories_with_trust_indicators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_engagement_daily_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "syndicated_stories"
            referencedColumns: ["story_id"]
          },
          {
            foreignKeyName: "story_engagement_daily_storyteller_id_fkey"
            columns: ["storyteller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      story_engagement_events: {
        Row: {
          browser: string | null
          city: string | null
          country_code: string | null
          created_at: string
          device_type: string | null
          event_type: string
          id: string
          platform_id: string | null
          platform_name: string
          read_time_seconds: number | null
          referrer: string | null
          region: string | null
          scroll_depth: number | null
          session_id: string | null
          story_id: string
          storyteller_id: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          browser?: string | null
          city?: string | null
          country_code?: string | null
          created_at?: string
          device_type?: string | null
          event_type: string
          id?: string
          platform_id?: string | null
          platform_name?: string
          read_time_seconds?: number | null
          referrer?: string | null
          region?: string | null
          scroll_depth?: number | null
          session_id?: string | null
          story_id: string
          storyteller_id?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          browser?: string | null
          city?: string | null
          country_code?: string | null
          created_at?: string
          device_type?: string | null
          event_type?: string
          id?: string
          platform_id?: string | null
          platform_name?: string
          read_time_seconds?: number | null
          referrer?: string | null
          region?: string | null
          scroll_depth?: number | null
          session_id?: string | null
          story_id?: string
          storyteller_id?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "story_engagement_events_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "external_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_engagement_events_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "syndicated_stories"
            referencedColumns: ["app_id"]
          },
          {
            foreignKeyName: "story_engagement_events_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_engagement_events_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories_with_trust_indicators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_engagement_events_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "syndicated_stories"
            referencedColumns: ["story_id"]
          },
          {
            foreignKeyName: "story_engagement_events_storyteller_id_fkey"
            columns: ["storyteller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      story_images: {
        Row: {
          alt_text: string | null
          caption: string | null
          cultural_sensitivity_flag: boolean | null
          display_order: number | null
          elder_approved: boolean | null
          file_size: number | null
          height: number | null
          id: string
          is_primary: boolean | null
          metadata: Json | null
          mime_type: string | null
          photo_date: string | null
          photo_location: string | null
          photographer_id: string | null
          photographer_name: string | null
          public_url: string
          requires_elder_approval: boolean | null
          storage_path: string
          story_id: string
          thumbnail_url: string | null
          uploaded_at: string | null
          uploaded_by: string | null
          width: number | null
        }
        Insert: {
          alt_text?: string | null
          caption?: string | null
          cultural_sensitivity_flag?: boolean | null
          display_order?: number | null
          elder_approved?: boolean | null
          file_size?: number | null
          height?: number | null
          id?: string
          is_primary?: boolean | null
          metadata?: Json | null
          mime_type?: string | null
          photo_date?: string | null
          photo_location?: string | null
          photographer_id?: string | null
          photographer_name?: string | null
          public_url: string
          requires_elder_approval?: boolean | null
          storage_path: string
          story_id: string
          thumbnail_url?: string | null
          uploaded_at?: string | null
          uploaded_by?: string | null
          width?: number | null
        }
        Update: {
          alt_text?: string | null
          caption?: string | null
          cultural_sensitivity_flag?: boolean | null
          display_order?: number | null
          elder_approved?: boolean | null
          file_size?: number | null
          height?: number | null
          id?: string
          is_primary?: boolean | null
          metadata?: Json | null
          mime_type?: string | null
          photo_date?: string | null
          photo_location?: string | null
          photographer_id?: string | null
          photographer_name?: string | null
          public_url?: string
          requires_elder_approval?: boolean | null
          storage_path?: string
          story_id?: string
          thumbnail_url?: string | null
          uploaded_at?: string | null
          uploaded_by?: string | null
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "story_images_photographer_id_fkey"
            columns: ["photographer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_images_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_images_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories_with_trust_indicators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_images_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "syndicated_stories"
            referencedColumns: ["story_id"]
          },
          {
            foreignKeyName: "story_images_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      story_media: {
        Row: {
          all_permissions_obtained: boolean | null
          alt_text: string | null
          caption: string | null
          created_at: string | null
          created_by: string | null
          display_order: number | null
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          is_featured: boolean | null
          is_public: boolean | null
          media_embedding: string | null
          media_type: string
          metadata: Json | null
          ml_analysis: Json | null
          people_in_media: string[] | null
          requires_permission: boolean | null
          story_id: string
          supabase_bucket: string
          updated_at: string | null
        }
        Insert: {
          all_permissions_obtained?: boolean | null
          alt_text?: string | null
          caption?: string | null
          created_at?: string | null
          created_by?: string | null
          display_order?: number | null
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          is_featured?: boolean | null
          is_public?: boolean | null
          media_embedding?: string | null
          media_type: string
          metadata?: Json | null
          ml_analysis?: Json | null
          people_in_media?: string[] | null
          requires_permission?: boolean | null
          story_id: string
          supabase_bucket: string
          updated_at?: string | null
        }
        Update: {
          all_permissions_obtained?: boolean | null
          alt_text?: string | null
          caption?: string | null
          created_at?: string | null
          created_by?: string | null
          display_order?: number | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          is_featured?: boolean | null
          is_public?: boolean | null
          media_embedding?: string | null
          media_type?: string
          metadata?: Json | null
          ml_analysis?: Json | null
          people_in_media?: string[] | null
          requires_permission?: boolean | null
          story_id?: string
          supabase_bucket?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "story_media_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_media_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_media_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories_with_trust_indicators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_media_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "syndicated_stories"
            referencedColumns: ["story_id"]
          },
        ]
      }
      story_narrative_arcs: {
        Row: {
          analysis_method: string | null
          analysis_version: string | null
          analyzed_at: string | null
          arc_confidence: number | null
          arc_type: string
          community_validated: boolean | null
          created_at: string | null
          emotional_range: number | null
          id: string
          peak_moment: number | null
          segments: Json | null
          story_id: string
          trajectory_data: Json
          transformation_score: number | null
          updated_at: string | null
          validated_by: string | null
          validation_notes: string | null
          valley_moment: number | null
          volatility: number | null
        }
        Insert: {
          analysis_method?: string | null
          analysis_version?: string | null
          analyzed_at?: string | null
          arc_confidence?: number | null
          arc_type: string
          community_validated?: boolean | null
          created_at?: string | null
          emotional_range?: number | null
          id?: string
          peak_moment?: number | null
          segments?: Json | null
          story_id: string
          trajectory_data: Json
          transformation_score?: number | null
          updated_at?: string | null
          validated_by?: string | null
          validation_notes?: string | null
          valley_moment?: number | null
          volatility?: number | null
        }
        Update: {
          analysis_method?: string | null
          analysis_version?: string | null
          analyzed_at?: string | null
          arc_confidence?: number | null
          arc_type?: string
          community_validated?: boolean | null
          created_at?: string | null
          emotional_range?: number | null
          id?: string
          peak_moment?: number | null
          segments?: Json | null
          story_id?: string
          trajectory_data?: Json
          transformation_score?: number | null
          updated_at?: string | null
          validated_by?: string | null
          validation_notes?: string | null
          valley_moment?: number | null
          volatility?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "story_narrative_arcs_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: true
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_narrative_arcs_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: true
            referencedRelation: "stories_with_trust_indicators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_narrative_arcs_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: true
            referencedRelation: "syndicated_stories"
            referencedColumns: ["story_id"]
          },
          {
            foreignKeyName: "story_narrative_arcs_validated_by_fkey"
            columns: ["validated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      story_project_features: {
        Row: {
          act_project_id: string
          approved_at: string | null
          approved_by: string | null
          approved_by_act: boolean
          created_at: string | null
          featured_image_url: string | null
          featured_quote: string | null
          id: string
          is_visible: boolean | null
          story_id: string
          tagged_at: string | null
          tagged_by: string | null
          updated_at: string | null
        }
        Insert: {
          act_project_id: string
          approved_at?: string | null
          approved_by?: string | null
          approved_by_act?: boolean
          created_at?: string | null
          featured_image_url?: string | null
          featured_quote?: string | null
          id?: string
          is_visible?: boolean | null
          story_id: string
          tagged_at?: string | null
          tagged_by?: string | null
          updated_at?: string | null
        }
        Update: {
          act_project_id?: string
          approved_at?: string | null
          approved_by?: string | null
          approved_by_act?: boolean
          created_at?: string | null
          featured_image_url?: string | null
          featured_quote?: string | null
          id?: string
          is_visible?: boolean | null
          story_id?: string
          tagged_at?: string | null
          tagged_by?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "story_project_features_act_project_id_fkey"
            columns: ["act_project_id"]
            isOneToOne: false
            referencedRelation: "act_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_project_features_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "act_admins"
            referencedColumns: ["user_id"]
          },
        ]
      }
      story_project_tags: {
        Row: {
          act_approved: boolean | null
          act_approved_at: string | null
          act_approved_by: string | null
          act_project_id: string
          ai_reasoning: string | null
          created_at: string | null
          featured_as_hero: boolean | null
          featured_priority: number | null
          id: string
          is_featured: boolean | null
          notes: string | null
          relevance_score: number | null
          story_id: string
          storyteller_approved: boolean | null
          storyteller_approved_at: string | null
          suggested_themes: string[] | null
          tag_source: string | null
          tagged_at: string | null
          tagged_by: string | null
          updated_at: string | null
        }
        Insert: {
          act_approved?: boolean | null
          act_approved_at?: string | null
          act_approved_by?: string | null
          act_project_id: string
          ai_reasoning?: string | null
          created_at?: string | null
          featured_as_hero?: boolean | null
          featured_priority?: number | null
          id?: string
          is_featured?: boolean | null
          notes?: string | null
          relevance_score?: number | null
          story_id: string
          storyteller_approved?: boolean | null
          storyteller_approved_at?: string | null
          suggested_themes?: string[] | null
          tag_source?: string | null
          tagged_at?: string | null
          tagged_by?: string | null
          updated_at?: string | null
        }
        Update: {
          act_approved?: boolean | null
          act_approved_at?: string | null
          act_approved_by?: string | null
          act_project_id?: string
          ai_reasoning?: string | null
          created_at?: string | null
          featured_as_hero?: boolean | null
          featured_priority?: number | null
          id?: string
          is_featured?: boolean | null
          notes?: string | null
          relevance_score?: number | null
          story_id?: string
          storyteller_approved?: boolean | null
          storyteller_approved_at?: string | null
          suggested_themes?: string[] | null
          tag_source?: string | null
          tagged_at?: string | null
          tagged_by?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "story_project_tags_act_project_id_fkey"
            columns: ["act_project_id"]
            isOneToOne: false
            referencedRelation: "act_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_project_tags_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_project_tags_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories_with_trust_indicators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_project_tags_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "syndicated_stories"
            referencedColumns: ["story_id"]
          },
        ]
      }
      story_review_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          created_by: string
          expires_at: string
          id: string
          sent_at: string | null
          sent_via: string
          story_id: string
          storyteller_email: string | null
          storyteller_id: string | null
          storyteller_name: string
          storyteller_phone: string | null
          token: string
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          created_by: string
          expires_at: string
          id?: string
          sent_at?: string | null
          sent_via?: string
          story_id: string
          storyteller_email?: string | null
          storyteller_id?: string | null
          storyteller_name: string
          storyteller_phone?: string | null
          token: string
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          created_by?: string
          expires_at?: string
          id?: string
          sent_at?: string | null
          sent_via?: string
          story_id?: string
          storyteller_email?: string | null
          storyteller_id?: string | null
          storyteller_name?: string
          storyteller_phone?: string | null
          token?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_review_invitations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_review_invitations_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_review_invitations_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories_with_trust_indicators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_review_invitations_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "syndicated_stories"
            referencedColumns: ["story_id"]
          },
          {
            foreignKeyName: "story_review_invitations_storyteller_id_fkey"
            columns: ["storyteller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      story_syndication_consent: {
        Row: {
          anonymous_sharing: boolean | null
          app_id: string
          consent_expires_at: string | null
          consent_granted: boolean | null
          consent_granted_at: string | null
          consent_revoked_at: string | null
          created_at: string | null
          cultural_approval_status: string | null
          cultural_approver_id: string | null
          cultural_restrictions: Json | null
          id: string
          requires_cultural_approval: boolean | null
          share_attribution: boolean | null
          share_full_content: boolean | null
          share_media: boolean | null
          share_summary_only: boolean | null
          story_id: string
          storyteller_id: string
          updated_at: string | null
        }
        Insert: {
          anonymous_sharing?: boolean | null
          app_id: string
          consent_expires_at?: string | null
          consent_granted?: boolean | null
          consent_granted_at?: string | null
          consent_revoked_at?: string | null
          created_at?: string | null
          cultural_approval_status?: string | null
          cultural_approver_id?: string | null
          cultural_restrictions?: Json | null
          id?: string
          requires_cultural_approval?: boolean | null
          share_attribution?: boolean | null
          share_full_content?: boolean | null
          share_media?: boolean | null
          share_summary_only?: boolean | null
          story_id: string
          storyteller_id: string
          updated_at?: string | null
        }
        Update: {
          anonymous_sharing?: boolean | null
          app_id?: string
          consent_expires_at?: string | null
          consent_granted?: boolean | null
          consent_granted_at?: string | null
          consent_revoked_at?: string | null
          created_at?: string | null
          cultural_approval_status?: string | null
          cultural_approver_id?: string | null
          cultural_restrictions?: Json | null
          id?: string
          requires_cultural_approval?: boolean | null
          share_attribution?: boolean | null
          share_full_content?: boolean | null
          share_media?: boolean | null
          share_summary_only?: boolean | null
          story_id?: string
          storyteller_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "story_syndication_consent_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "external_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_syndication_consent_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "syndicated_stories"
            referencedColumns: ["app_id"]
          },
          {
            foreignKeyName: "story_syndication_consent_cultural_approver_id_fkey"
            columns: ["cultural_approver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_syndication_consent_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_syndication_consent_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories_with_trust_indicators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_syndication_consent_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "syndicated_stories"
            referencedColumns: ["story_id"]
          },
          {
            foreignKeyName: "story_syndication_consent_storyteller_id_fkey"
            columns: ["storyteller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      story_syndication_requests: {
        Row: {
          app_id: string
          consent_id: string | null
          decline_reason: string | null
          expires_at: string | null
          id: string
          project_id: string
          request_message: string | null
          requested_at: string | null
          requested_by: string | null
          responded_at: string | null
          status: string | null
          story_id: string
        }
        Insert: {
          app_id: string
          consent_id?: string | null
          decline_reason?: string | null
          expires_at?: string | null
          id?: string
          project_id: string
          request_message?: string | null
          requested_at?: string | null
          requested_by?: string | null
          responded_at?: string | null
          status?: string | null
          story_id: string
        }
        Update: {
          app_id?: string
          consent_id?: string | null
          decline_reason?: string | null
          expires_at?: string | null
          id?: string
          project_id?: string
          request_message?: string | null
          requested_at?: string | null
          requested_by?: string | null
          responded_at?: string | null
          status?: string | null
          story_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_syndication_requests_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "external_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_syndication_requests_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "syndicated_stories"
            referencedColumns: ["app_id"]
          },
          {
            foreignKeyName: "story_syndication_requests_consent_id_fkey"
            columns: ["consent_id"]
            isOneToOne: false
            referencedRelation: "story_syndication_consent"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_syndication_requests_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "partner_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_syndication_requests_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_syndication_requests_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories_with_trust_indicators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_syndication_requests_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "syndicated_stories"
            referencedColumns: ["story_id"]
          },
        ]
      }
      storyteller_analytics: {
        Row: {
          collaboration_score: number | null
          connection_count: number | null
          created_at: string | null
          cultural_elements_frequency: Json | null
          emotional_tone_profile: Json | null
          id: string
          impact_reach: number | null
          inspiration_impact_score: number | null
          last_calculated_at: string | null
          primary_themes: string[] | null
          quote_citation_count: number | null
          shared_narrative_count: number | null
          story_share_count: number | null
          story_view_count: number | null
          storyteller_id: string
          storytelling_style: string | null
          tenant_id: string
          theme_distribution: Json | null
          theme_evolution: Json | null
          total_engagement_score: number | null
          total_stories: number | null
          total_transcripts: number | null
          total_word_count: number | null
          updated_at: string | null
        }
        Insert: {
          collaboration_score?: number | null
          connection_count?: number | null
          created_at?: string | null
          cultural_elements_frequency?: Json | null
          emotional_tone_profile?: Json | null
          id?: string
          impact_reach?: number | null
          inspiration_impact_score?: number | null
          last_calculated_at?: string | null
          primary_themes?: string[] | null
          quote_citation_count?: number | null
          shared_narrative_count?: number | null
          story_share_count?: number | null
          story_view_count?: number | null
          storyteller_id: string
          storytelling_style?: string | null
          tenant_id: string
          theme_distribution?: Json | null
          theme_evolution?: Json | null
          total_engagement_score?: number | null
          total_stories?: number | null
          total_transcripts?: number | null
          total_word_count?: number | null
          updated_at?: string | null
        }
        Update: {
          collaboration_score?: number | null
          connection_count?: number | null
          created_at?: string | null
          cultural_elements_frequency?: Json | null
          emotional_tone_profile?: Json | null
          id?: string
          impact_reach?: number | null
          inspiration_impact_score?: number | null
          last_calculated_at?: string | null
          primary_themes?: string[] | null
          quote_citation_count?: number | null
          shared_narrative_count?: number | null
          story_share_count?: number | null
          story_view_count?: number | null
          storyteller_id?: string
          storytelling_style?: string | null
          tenant_id?: string
          theme_distribution?: Json | null
          theme_evolution?: Json | null
          total_engagement_score?: number | null
          total_stories?: number | null
          total_transcripts?: number | null
          total_word_count?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "storyteller_analytics_storyteller_id_fkey"
            columns: ["storyteller_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      storyteller_connections: {
        Row: {
          ai_confidence: number | null
          ai_model_version: string | null
          ai_reasoning: string | null
          calculated_at: string | null
          complementary_skills: string[] | null
          connected_at: string | null
          connection_strength: number | null
          connection_type: string
          created_at: string | null
          cultural_similarity_score: number | null
          declined_at: string | null
          evidence_examples: Json | null
          geographic_proximity_score: number | null
          id: string
          initiated_by: string | null
          is_mutual: boolean | null
          life_experience_similarity: number | null
          matching_quotes: string[] | null
          mutual_themes_count: number | null
          narrative_style_similarity: number | null
          potential_collaboration_areas: string[] | null
          professional_alignment_score: number | null
          shared_locations: string[] | null
          shared_themes: string[] | null
          similar_experiences: string[] | null
          status: string | null
          storyteller_a_id: string
          storyteller_b_id: string
          suggested_at: string | null
          tenant_id: string
          theme_similarity_score: number | null
          updated_at: string | null
          viewed_at: string | null
        }
        Insert: {
          ai_confidence?: number | null
          ai_model_version?: string | null
          ai_reasoning?: string | null
          calculated_at?: string | null
          complementary_skills?: string[] | null
          connected_at?: string | null
          connection_strength?: number | null
          connection_type: string
          created_at?: string | null
          cultural_similarity_score?: number | null
          declined_at?: string | null
          evidence_examples?: Json | null
          geographic_proximity_score?: number | null
          id?: string
          initiated_by?: string | null
          is_mutual?: boolean | null
          life_experience_similarity?: number | null
          matching_quotes?: string[] | null
          mutual_themes_count?: number | null
          narrative_style_similarity?: number | null
          potential_collaboration_areas?: string[] | null
          professional_alignment_score?: number | null
          shared_locations?: string[] | null
          shared_themes?: string[] | null
          similar_experiences?: string[] | null
          status?: string | null
          storyteller_a_id: string
          storyteller_b_id: string
          suggested_at?: string | null
          tenant_id: string
          theme_similarity_score?: number | null
          updated_at?: string | null
          viewed_at?: string | null
        }
        Update: {
          ai_confidence?: number | null
          ai_model_version?: string | null
          ai_reasoning?: string | null
          calculated_at?: string | null
          complementary_skills?: string[] | null
          connected_at?: string | null
          connection_strength?: number | null
          connection_type?: string
          created_at?: string | null
          cultural_similarity_score?: number | null
          declined_at?: string | null
          evidence_examples?: Json | null
          geographic_proximity_score?: number | null
          id?: string
          initiated_by?: string | null
          is_mutual?: boolean | null
          life_experience_similarity?: number | null
          matching_quotes?: string[] | null
          mutual_themes_count?: number | null
          narrative_style_similarity?: number | null
          potential_collaboration_areas?: string[] | null
          professional_alignment_score?: number | null
          shared_locations?: string[] | null
          shared_themes?: string[] | null
          similar_experiences?: string[] | null
          status?: string | null
          storyteller_a_id?: string
          storyteller_b_id?: string
          suggested_at?: string | null
          tenant_id?: string
          theme_similarity_score?: number | null
          updated_at?: string | null
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "storyteller_connections_initiated_by_fkey"
            columns: ["initiated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "storyteller_connections_storyteller_a_id_fkey"
            columns: ["storyteller_a_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "storyteller_connections_storyteller_b_id_fkey"
            columns: ["storyteller_b_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      storyteller_dashboard_config: {
        Row: {
          analytics_sharing_level: string | null
          auto_refresh_enabled: boolean | null
          created_at: string | null
          dashboard_layout: string | null
          enabled_widgets: Json | null
          id: string
          last_refreshed_at: string | null
          notification_preferences: Json | null
          public_dashboard: boolean | null
          refresh_interval_minutes: number | null
          shared_with_network: boolean | null
          storyteller_id: string
          tenant_id: string
          theme_preferences: Json | null
          updated_at: string | null
          widget_positions: Json | null
          widget_sizes: Json | null
        }
        Insert: {
          analytics_sharing_level?: string | null
          auto_refresh_enabled?: boolean | null
          created_at?: string | null
          dashboard_layout?: string | null
          enabled_widgets?: Json | null
          id?: string
          last_refreshed_at?: string | null
          notification_preferences?: Json | null
          public_dashboard?: boolean | null
          refresh_interval_minutes?: number | null
          shared_with_network?: boolean | null
          storyteller_id: string
          tenant_id: string
          theme_preferences?: Json | null
          updated_at?: string | null
          widget_positions?: Json | null
          widget_sizes?: Json | null
        }
        Update: {
          analytics_sharing_level?: string | null
          auto_refresh_enabled?: boolean | null
          created_at?: string | null
          dashboard_layout?: string | null
          enabled_widgets?: Json | null
          id?: string
          last_refreshed_at?: string | null
          notification_preferences?: Json | null
          public_dashboard?: boolean | null
          refresh_interval_minutes?: number | null
          shared_with_network?: boolean | null
          storyteller_id?: string
          tenant_id?: string
          theme_preferences?: Json | null
          updated_at?: string | null
          widget_positions?: Json | null
          widget_sizes?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "storyteller_dashboard_config_storyteller_id_fkey"
            columns: ["storyteller_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      storyteller_demographics: {
        Row: {
          achievements_and_milestones: string[] | null
          ai_extracted_confidence: number | null
          areas_of_expertise: string[] | null
          causes_supported: string[] | null
          challenges_overcome: string[] | null
          community_roles: string[] | null
          created_at: string | null
          cultural_background: string[] | null
          cultural_info_sharing: string | null
          cultural_protocols_followed: string[] | null
          current_location: Json | null
          data_sources: Json | null
          demographic_sharing_level: string | null
          family_roles: string[] | null
          generation_category: string | null
          geographic_region: string | null
          id: string
          interests_and_passions: string[] | null
          languages_spoken: string[] | null
          last_updated_by: string | null
          life_transitions: string[] | null
          location_history: Json[] | null
          location_sharing_level: string | null
          manually_verified: boolean | null
          mentorship_roles: string[] | null
          organizations_involved: string[] | null
          places_of_significance: string[] | null
          professional_background: string[] | null
          significant_life_events: string[] | null
          skills_and_talents: string[] | null
          storyteller_id: string
          tenant_id: string
          traditional_knowledge_areas: string[] | null
          updated_at: string | null
          volunteer_work: string[] | null
        }
        Insert: {
          achievements_and_milestones?: string[] | null
          ai_extracted_confidence?: number | null
          areas_of_expertise?: string[] | null
          causes_supported?: string[] | null
          challenges_overcome?: string[] | null
          community_roles?: string[] | null
          created_at?: string | null
          cultural_background?: string[] | null
          cultural_info_sharing?: string | null
          cultural_protocols_followed?: string[] | null
          current_location?: Json | null
          data_sources?: Json | null
          demographic_sharing_level?: string | null
          family_roles?: string[] | null
          generation_category?: string | null
          geographic_region?: string | null
          id?: string
          interests_and_passions?: string[] | null
          languages_spoken?: string[] | null
          last_updated_by?: string | null
          life_transitions?: string[] | null
          location_history?: Json[] | null
          location_sharing_level?: string | null
          manually_verified?: boolean | null
          mentorship_roles?: string[] | null
          organizations_involved?: string[] | null
          places_of_significance?: string[] | null
          professional_background?: string[] | null
          significant_life_events?: string[] | null
          skills_and_talents?: string[] | null
          storyteller_id: string
          tenant_id: string
          traditional_knowledge_areas?: string[] | null
          updated_at?: string | null
          volunteer_work?: string[] | null
        }
        Update: {
          achievements_and_milestones?: string[] | null
          ai_extracted_confidence?: number | null
          areas_of_expertise?: string[] | null
          causes_supported?: string[] | null
          challenges_overcome?: string[] | null
          community_roles?: string[] | null
          created_at?: string | null
          cultural_background?: string[] | null
          cultural_info_sharing?: string | null
          cultural_protocols_followed?: string[] | null
          current_location?: Json | null
          data_sources?: Json | null
          demographic_sharing_level?: string | null
          family_roles?: string[] | null
          generation_category?: string | null
          geographic_region?: string | null
          id?: string
          interests_and_passions?: string[] | null
          languages_spoken?: string[] | null
          last_updated_by?: string | null
          life_transitions?: string[] | null
          location_history?: Json[] | null
          location_sharing_level?: string | null
          manually_verified?: boolean | null
          mentorship_roles?: string[] | null
          organizations_involved?: string[] | null
          places_of_significance?: string[] | null
          professional_background?: string[] | null
          significant_life_events?: string[] | null
          skills_and_talents?: string[] | null
          storyteller_id?: string
          tenant_id?: string
          traditional_knowledge_areas?: string[] | null
          updated_at?: string | null
          volunteer_work?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "storyteller_demographics_last_updated_by_fkey"
            columns: ["last_updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "storyteller_demographics_storyteller_id_fkey"
            columns: ["storyteller_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      storyteller_engagement: {
        Row: {
          active_minutes: number | null
          ai_analysis_requests: number | null
          average_story_rating: number | null
          collaborative_projects: number | null
          comments_given: number | null
          comments_received: number | null
          community_contributions: number | null
          connections_accepted: number | null
          connections_made: number | null
          consistency_score: number | null
          created_at: string | null
          engagement_score: number | null
          features_used: string[] | null
          growth_score: number | null
          high_impact_content_count: number | null
          id: string
          impact_score: number | null
          login_days: number | null
          media_items_uploaded: number | null
          mentoring_activities: number | null
          new_themes_discovered: number | null
          page_views: number | null
          period_end: string
          period_start: string
          period_type: string
          profile_views: number | null
          quote_citations: number | null
          quotes_shared: number | null
          recommendations_acted_upon: number | null
          recommendations_viewed: number | null
          skill_development_activities: number | null
          stories_created: number | null
          story_completion_rate: number | null
          story_shares: number | null
          story_views: number | null
          storyteller_id: string
          tenant_id: string
          themes_explored: number | null
          transcripts_processed: number | null
          tutorial_completions: number | null
        }
        Insert: {
          active_minutes?: number | null
          ai_analysis_requests?: number | null
          average_story_rating?: number | null
          collaborative_projects?: number | null
          comments_given?: number | null
          comments_received?: number | null
          community_contributions?: number | null
          connections_accepted?: number | null
          connections_made?: number | null
          consistency_score?: number | null
          created_at?: string | null
          engagement_score?: number | null
          features_used?: string[] | null
          growth_score?: number | null
          high_impact_content_count?: number | null
          id?: string
          impact_score?: number | null
          login_days?: number | null
          media_items_uploaded?: number | null
          mentoring_activities?: number | null
          new_themes_discovered?: number | null
          page_views?: number | null
          period_end: string
          period_start: string
          period_type: string
          profile_views?: number | null
          quote_citations?: number | null
          quotes_shared?: number | null
          recommendations_acted_upon?: number | null
          recommendations_viewed?: number | null
          skill_development_activities?: number | null
          stories_created?: number | null
          story_completion_rate?: number | null
          story_shares?: number | null
          story_views?: number | null
          storyteller_id: string
          tenant_id: string
          themes_explored?: number | null
          transcripts_processed?: number | null
          tutorial_completions?: number | null
        }
        Update: {
          active_minutes?: number | null
          ai_analysis_requests?: number | null
          average_story_rating?: number | null
          collaborative_projects?: number | null
          comments_given?: number | null
          comments_received?: number | null
          community_contributions?: number | null
          connections_accepted?: number | null
          connections_made?: number | null
          consistency_score?: number | null
          created_at?: string | null
          engagement_score?: number | null
          features_used?: string[] | null
          growth_score?: number | null
          high_impact_content_count?: number | null
          id?: string
          impact_score?: number | null
          login_days?: number | null
          media_items_uploaded?: number | null
          mentoring_activities?: number | null
          new_themes_discovered?: number | null
          page_views?: number | null
          period_end?: string
          period_start?: string
          period_type?: string
          profile_views?: number | null
          quote_citations?: number | null
          quotes_shared?: number | null
          recommendations_acted_upon?: number | null
          recommendations_viewed?: number | null
          skill_development_activities?: number | null
          stories_created?: number | null
          story_completion_rate?: number | null
          story_shares?: number | null
          story_views?: number | null
          storyteller_id?: string
          tenant_id?: string
          themes_explored?: number | null
          transcripts_processed?: number | null
          tutorial_completions?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "storyteller_engagement_storyteller_id_fkey"
            columns: ["storyteller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      storyteller_impact_metrics: {
        Row: {
          average_content_rating: number | null
          career_guidance_provided: number | null
          community_impact_score: number | null
          community_initiatives_started: number | null
          connection_quality_score: number | null
          content_bookmarks: number | null
          content_completion_rate: number | null
          content_longevity_score: number | null
          content_shares: number | null
          created_at: string | null
          cross_cultural_connections: number | null
          cultural_impact_score: number | null
          cultural_preservation_contributions: number | null
          first_impact_date: string | null
          id: string
          impact_consistency: number | null
          impact_trend: string | null
          impact_velocity: number | null
          inspirational_impact_score: number | null
          intergenerational_bridges: number | null
          last_calculated_at: string | null
          last_significant_impact: string | null
          learning_resources_contributed: number | null
          mentorship_connections: number | null
          network_diversity_score: number | null
          network_growth_rate: number | null
          network_size: number | null
          overall_impact_score: number | null
          peak_impact_date: string | null
          people_directly_impacted: number | null
          professional_opportunities_created: number | null
          quotes_cited_by_others: number | null
          repeat_audience_percentage: number | null
          skills_taught_or_shared: number | null
          stories_that_inspired_others: number | null
          storyteller_id: string
          tenant_id: string
          total_content_views: number | null
          unique_viewers: number | null
          updated_at: string | null
        }
        Insert: {
          average_content_rating?: number | null
          career_guidance_provided?: number | null
          community_impact_score?: number | null
          community_initiatives_started?: number | null
          connection_quality_score?: number | null
          content_bookmarks?: number | null
          content_completion_rate?: number | null
          content_longevity_score?: number | null
          content_shares?: number | null
          created_at?: string | null
          cross_cultural_connections?: number | null
          cultural_impact_score?: number | null
          cultural_preservation_contributions?: number | null
          first_impact_date?: string | null
          id?: string
          impact_consistency?: number | null
          impact_trend?: string | null
          impact_velocity?: number | null
          inspirational_impact_score?: number | null
          intergenerational_bridges?: number | null
          last_calculated_at?: string | null
          last_significant_impact?: string | null
          learning_resources_contributed?: number | null
          mentorship_connections?: number | null
          network_diversity_score?: number | null
          network_growth_rate?: number | null
          network_size?: number | null
          overall_impact_score?: number | null
          peak_impact_date?: string | null
          people_directly_impacted?: number | null
          professional_opportunities_created?: number | null
          quotes_cited_by_others?: number | null
          repeat_audience_percentage?: number | null
          skills_taught_or_shared?: number | null
          stories_that_inspired_others?: number | null
          storyteller_id: string
          tenant_id: string
          total_content_views?: number | null
          unique_viewers?: number | null
          updated_at?: string | null
        }
        Update: {
          average_content_rating?: number | null
          career_guidance_provided?: number | null
          community_impact_score?: number | null
          community_initiatives_started?: number | null
          connection_quality_score?: number | null
          content_bookmarks?: number | null
          content_completion_rate?: number | null
          content_longevity_score?: number | null
          content_shares?: number | null
          created_at?: string | null
          cross_cultural_connections?: number | null
          cultural_impact_score?: number | null
          cultural_preservation_contributions?: number | null
          first_impact_date?: string | null
          id?: string
          impact_consistency?: number | null
          impact_trend?: string | null
          impact_velocity?: number | null
          inspirational_impact_score?: number | null
          intergenerational_bridges?: number | null
          last_calculated_at?: string | null
          last_significant_impact?: string | null
          learning_resources_contributed?: number | null
          mentorship_connections?: number | null
          network_diversity_score?: number | null
          network_growth_rate?: number | null
          network_size?: number | null
          overall_impact_score?: number | null
          peak_impact_date?: string | null
          people_directly_impacted?: number | null
          professional_opportunities_created?: number | null
          quotes_cited_by_others?: number | null
          repeat_audience_percentage?: number | null
          skills_taught_or_shared?: number | null
          stories_that_inspired_others?: number | null
          storyteller_id?: string
          tenant_id?: string
          total_content_views?: number | null
          unique_viewers?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "storyteller_impact_metrics_storyteller_id_fkey"
            columns: ["storyteller_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      storyteller_locations: {
        Row: {
          created_at: string | null
          id: string
          is_primary: boolean | null
          location_id: string
          relationship_type: string | null
          significance: string | null
          storyteller_id: string
          tenant_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          location_id: string
          relationship_type?: string | null
          significance?: string | null
          storyteller_id: string
          tenant_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          location_id?: string
          relationship_type?: string | null
          significance?: string | null
          storyteller_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "storyteller_locations_storyteller_id_fkey"
            columns: ["storyteller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "storyteller_locations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_analytics"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "storyteller_locations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "storyteller_locations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_ai_usage_summary"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      storyteller_media_links: {
        Row: {
          created_at: string | null
          description: string | null
          duration_seconds: number | null
          id: string
          is_primary: boolean | null
          is_public: boolean | null
          link_type: string
          metadata: Json | null
          platform: string | null
          storyteller_id: string
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          url: string
          video_stage: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration_seconds?: number | null
          id?: string
          is_primary?: boolean | null
          is_public?: boolean | null
          link_type: string
          metadata?: Json | null
          platform?: string | null
          storyteller_id: string
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          url: string
          video_stage?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration_seconds?: number | null
          id?: string
          is_primary?: boolean | null
          is_public?: boolean | null
          link_type?: string
          metadata?: Json | null
          platform?: string | null
          storyteller_id?: string
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          url?: string
          video_stage?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "storyteller_media_links_storyteller_id_fkey"
            columns: ["storyteller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      storyteller_milestones: {
        Row: {
          achieved_at: string | null
          achievement_threshold: number | null
          achievement_value: number | null
          badge_earned: string | null
          celebration_shared: boolean | null
          created_at: string | null
          evidence_items: string[] | null
          featured_milestone: boolean | null
          id: string
          is_public: boolean | null
          mentor_recognition: boolean | null
          milestone_description: string | null
          milestone_title: string
          milestone_type: string
          peer_congratulations: number | null
          progress_percentage: number | null
          status: string | null
          storyteller_id: string
          supporting_data: Json | null
          tenant_id: string
          updated_at: string | null
          verified_at: string | null
        }
        Insert: {
          achieved_at?: string | null
          achievement_threshold?: number | null
          achievement_value?: number | null
          badge_earned?: string | null
          celebration_shared?: boolean | null
          created_at?: string | null
          evidence_items?: string[] | null
          featured_milestone?: boolean | null
          id?: string
          is_public?: boolean | null
          mentor_recognition?: boolean | null
          milestone_description?: string | null
          milestone_title: string
          milestone_type: string
          peer_congratulations?: number | null
          progress_percentage?: number | null
          status?: string | null
          storyteller_id: string
          supporting_data?: Json | null
          tenant_id: string
          updated_at?: string | null
          verified_at?: string | null
        }
        Update: {
          achieved_at?: string | null
          achievement_threshold?: number | null
          achievement_value?: number | null
          badge_earned?: string | null
          celebration_shared?: boolean | null
          created_at?: string | null
          evidence_items?: string[] | null
          featured_milestone?: boolean | null
          id?: string
          is_public?: boolean | null
          mentor_recognition?: boolean | null
          milestone_description?: string | null
          milestone_title?: string
          milestone_type?: string
          peer_congratulations?: number | null
          progress_percentage?: number | null
          status?: string | null
          storyteller_id?: string
          supporting_data?: Json | null
          tenant_id?: string
          updated_at?: string | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "storyteller_milestones_storyteller_id_fkey"
            columns: ["storyteller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      storyteller_organizations: {
        Row: {
          created_at: string | null
          end_date: string | null
          id: string
          is_active: boolean | null
          organization_id: string
          relationship_type: string | null
          role: string | null
          start_date: string | null
          storyteller_id: string
          tenant_id: string
        }
        Insert: {
          created_at?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          organization_id: string
          relationship_type?: string | null
          role?: string | null
          start_date?: string | null
          storyteller_id: string
          tenant_id: string
        }
        Update: {
          created_at?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          organization_id?: string
          relationship_type?: string | null
          role?: string | null
          start_date?: string | null
          storyteller_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "storyteller_organizations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "storyteller_organizations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "storyteller_organizations_storyteller_id_fkey"
            columns: ["storyteller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "storyteller_organizations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_analytics"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "storyteller_organizations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "storyteller_organizations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_ai_usage_summary"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      storyteller_project_features: {
        Row: {
          act_project_id: string
          approved_at: string | null
          approved_by: string | null
          approved_by_act: boolean | null
          created_at: string | null
          custom_bio: string | null
          custom_tagline: string | null
          feature_bio: boolean | null
          feature_stories: boolean | null
          featured_priority: number | null
          id: string
          is_visible: boolean | null
          notes: string | null
          opt_in_method: string | null
          opted_in: boolean | null
          opted_in_at: string | null
          storyteller_id: string
          updated_at: string | null
        }
        Insert: {
          act_project_id: string
          approved_at?: string | null
          approved_by?: string | null
          approved_by_act?: boolean | null
          created_at?: string | null
          custom_bio?: string | null
          custom_tagline?: string | null
          feature_bio?: boolean | null
          feature_stories?: boolean | null
          featured_priority?: number | null
          id?: string
          is_visible?: boolean | null
          notes?: string | null
          opt_in_method?: string | null
          opted_in?: boolean | null
          opted_in_at?: string | null
          storyteller_id: string
          updated_at?: string | null
        }
        Update: {
          act_project_id?: string
          approved_at?: string | null
          approved_by?: string | null
          approved_by_act?: boolean | null
          created_at?: string | null
          custom_bio?: string | null
          custom_tagline?: string | null
          feature_bio?: boolean | null
          feature_stories?: boolean | null
          featured_priority?: number | null
          id?: string
          is_visible?: boolean | null
          notes?: string | null
          opt_in_method?: string | null
          opted_in?: boolean | null
          opted_in_at?: string | null
          storyteller_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "storyteller_project_features_act_project_id_fkey"
            columns: ["act_project_id"]
            isOneToOne: false
            referencedRelation: "act_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      storyteller_projects: {
        Row: {
          created_at: string | null
          end_date: string | null
          id: string
          involvement_level: string | null
          is_active: boolean | null
          project_id: string
          role: string | null
          start_date: string | null
          storyteller_id: string
          tenant_id: string
        }
        Insert: {
          created_at?: string | null
          end_date?: string | null
          id?: string
          involvement_level?: string | null
          is_active?: boolean | null
          project_id: string
          role?: string | null
          start_date?: string | null
          storyteller_id: string
          tenant_id: string
        }
        Update: {
          created_at?: string | null
          end_date?: string | null
          id?: string
          involvement_level?: string | null
          is_active?: boolean | null
          project_id?: string
          role?: string | null
          start_date?: string | null
          storyteller_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "storyteller_projects_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "storyteller_projects_storyteller_id_fkey"
            columns: ["storyteller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "storyteller_projects_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_analytics"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "storyteller_projects_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "storyteller_projects_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_ai_usage_summary"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      storyteller_quotes: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          citation_count: number | null
          context_after: string | null
          context_before: string | null
          created_at: string | null
          emotional_impact_score: number | null
          id: string
          inspiration_rating: number | null
          inspiration_score: number | null
          is_public: boolean | null
          page_or_section: string | null
          quotability_score: number | null
          quote_category: string | null
          quote_text: string
          requires_approval: boolean | null
          sentiment_score: number | null
          share_count: number | null
          source_id: string
          source_title: string | null
          source_type: string
          storyteller_id: string
          tenant_id: string
          themes: string[] | null
          timestamp_in_source: number | null
          updated_at: string | null
          view_count: number | null
          wisdom_score: number | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          citation_count?: number | null
          context_after?: string | null
          context_before?: string | null
          created_at?: string | null
          emotional_impact_score?: number | null
          id?: string
          inspiration_rating?: number | null
          inspiration_score?: number | null
          is_public?: boolean | null
          page_or_section?: string | null
          quotability_score?: number | null
          quote_category?: string | null
          quote_text: string
          requires_approval?: boolean | null
          sentiment_score?: number | null
          share_count?: number | null
          source_id: string
          source_title?: string | null
          source_type: string
          storyteller_id: string
          tenant_id: string
          themes?: string[] | null
          timestamp_in_source?: number | null
          updated_at?: string | null
          view_count?: number | null
          wisdom_score?: number | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          citation_count?: number | null
          context_after?: string | null
          context_before?: string | null
          created_at?: string | null
          emotional_impact_score?: number | null
          id?: string
          inspiration_rating?: number | null
          inspiration_score?: number | null
          is_public?: boolean | null
          page_or_section?: string | null
          quotability_score?: number | null
          quote_category?: string | null
          quote_text?: string
          requires_approval?: boolean | null
          sentiment_score?: number | null
          share_count?: number | null
          source_id?: string
          source_title?: string | null
          source_type?: string
          storyteller_id?: string
          tenant_id?: string
          themes?: string[] | null
          timestamp_in_source?: number | null
          updated_at?: string | null
          view_count?: number | null
          wisdom_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "storyteller_quotes_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "storyteller_quotes_storyteller_id_fkey"
            columns: ["storyteller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      storyteller_recommendations: {
        Row: {
          acted_upon_at: string | null
          ai_model_version: string | null
          based_on_activities: string[] | null
          based_on_connections: string[] | null
          based_on_themes: string[] | null
          call_to_action: string | null
          confidence_score: number | null
          connection_context: Json | null
          created_at: string | null
          description: string | null
          dismissed_at: string | null
          engagement_score: number | null
          expires_at: string | null
          feedback_notes: string | null
          generation_method: string | null
          id: string
          impact_potential_score: number | null
          optimal_display_time: string | null
          potential_impact: string | null
          priority_score: number | null
          reason: string | null
          recommendation_outcome: string | null
          recommendation_type: string
          recommended_entity_id: string | null
          recommended_entity_type: string
          relevance_score: number | null
          status: string | null
          storyteller_id: string
          success_indicators: string[] | null
          supporting_data: Json | null
          tenant_id: string
          title: string
          updated_at: string | null
          user_feedback: string | null
          viewed_at: string | null
        }
        Insert: {
          acted_upon_at?: string | null
          ai_model_version?: string | null
          based_on_activities?: string[] | null
          based_on_connections?: string[] | null
          based_on_themes?: string[] | null
          call_to_action?: string | null
          confidence_score?: number | null
          connection_context?: Json | null
          created_at?: string | null
          description?: string | null
          dismissed_at?: string | null
          engagement_score?: number | null
          expires_at?: string | null
          feedback_notes?: string | null
          generation_method?: string | null
          id?: string
          impact_potential_score?: number | null
          optimal_display_time?: string | null
          potential_impact?: string | null
          priority_score?: number | null
          reason?: string | null
          recommendation_outcome?: string | null
          recommendation_type: string
          recommended_entity_id?: string | null
          recommended_entity_type: string
          relevance_score?: number | null
          status?: string | null
          storyteller_id: string
          success_indicators?: string[] | null
          supporting_data?: Json | null
          tenant_id: string
          title: string
          updated_at?: string | null
          user_feedback?: string | null
          viewed_at?: string | null
        }
        Update: {
          acted_upon_at?: string | null
          ai_model_version?: string | null
          based_on_activities?: string[] | null
          based_on_connections?: string[] | null
          based_on_themes?: string[] | null
          call_to_action?: string | null
          confidence_score?: number | null
          connection_context?: Json | null
          created_at?: string | null
          description?: string | null
          dismissed_at?: string | null
          engagement_score?: number | null
          expires_at?: string | null
          feedback_notes?: string | null
          generation_method?: string | null
          id?: string
          impact_potential_score?: number | null
          optimal_display_time?: string | null
          potential_impact?: string | null
          priority_score?: number | null
          reason?: string | null
          recommendation_outcome?: string | null
          recommendation_type?: string
          recommended_entity_id?: string | null
          recommended_entity_type?: string
          relevance_score?: number | null
          status?: string | null
          storyteller_id?: string
          success_indicators?: string[] | null
          supporting_data?: Json | null
          tenant_id?: string
          title?: string
          updated_at?: string | null
          user_feedback?: string | null
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "storyteller_recommendations_storyteller_id_fkey"
            columns: ["storyteller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      storyteller_themes: {
        Row: {
          context_examples: Json | null
          created_at: string | null
          first_occurrence: string | null
          frequency_count: number | null
          id: string
          key_quotes: string[] | null
          last_occurrence: string | null
          prominence_score: number | null
          source_stories: string[] | null
          source_transcripts: string[] | null
          storyteller_id: string
          tenant_id: string
          theme_id: string
          updated_at: string | null
        }
        Insert: {
          context_examples?: Json | null
          created_at?: string | null
          first_occurrence?: string | null
          frequency_count?: number | null
          id?: string
          key_quotes?: string[] | null
          last_occurrence?: string | null
          prominence_score?: number | null
          source_stories?: string[] | null
          source_transcripts?: string[] | null
          storyteller_id: string
          tenant_id: string
          theme_id: string
          updated_at?: string | null
        }
        Update: {
          context_examples?: Json | null
          created_at?: string | null
          first_occurrence?: string | null
          frequency_count?: number | null
          id?: string
          key_quotes?: string[] | null
          last_occurrence?: string | null
          prominence_score?: number | null
          source_stories?: string[] | null
          source_transcripts?: string[] | null
          storyteller_id?: string
          tenant_id?: string
          theme_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "storyteller_themes_storyteller_id_fkey"
            columns: ["storyteller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "storyteller_themes_theme_id_fkey"
            columns: ["theme_id"]
            isOneToOne: false
            referencedRelation: "narrative_themes"
            referencedColumns: ["id"]
          },
        ]
      }
      storytelling_circle_evaluations: {
        Row: {
          circle_date: string
          circle_theme: string | null
          collective_insights: string[] | null
          created_at: string | null
          emotional_tone: string | null
          facilitator_id: string | null
          facilitator_notes: string | null
          id: string
          participant_count: number | null
          project_id: string | null
          protocols_followed: string[] | null
          safety_rating: number | null
          stories_shared: number | null
        }
        Insert: {
          circle_date: string
          circle_theme?: string | null
          collective_insights?: string[] | null
          created_at?: string | null
          emotional_tone?: string | null
          facilitator_id?: string | null
          facilitator_notes?: string | null
          id?: string
          participant_count?: number | null
          project_id?: string | null
          protocols_followed?: string[] | null
          safety_rating?: number | null
          stories_shared?: number | null
        }
        Update: {
          circle_date?: string
          circle_theme?: string | null
          collective_insights?: string[] | null
          created_at?: string | null
          emotional_tone?: string | null
          facilitator_id?: string | null
          facilitator_notes?: string | null
          id?: string
          participant_count?: number | null
          project_id?: string | null
          protocols_followed?: string[] | null
          safety_rating?: number | null
          stories_shared?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "storytelling_circle_evaluations_facilitator_id_fkey"
            columns: ["facilitator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "storytelling_circle_evaluations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          is_visible: boolean | null
          name: string
          quote: string | null
          role: string
          tribe: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_visible?: boolean | null
          name: string
          quote?: string | null
          role: string
          tribe?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_visible?: boolean | null
          name?: string
          quote?: string | null
          role?: string
          tribe?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      tenant_ai_policies: {
        Row: {
          allow_function_calling: boolean | null
          allow_streaming: boolean | null
          allow_vision: boolean | null
          allowed_models: string[] | null
          auto_downgrade_enabled: boolean | null
          block_on_safety_flag: boolean | null
          blocked_models: string[] | null
          created_at: string | null
          current_day_usage_usd: number | null
          current_month_usage_usd: number | null
          daily_budget_usd: number | null
          default_model: string | null
          downgrade_model: string | null
          downgrade_threshold_pct: number | null
          id: string
          last_reset_date: string | null
          monthly_budget_usd: number | null
          per_request_max_usd: number | null
          requests_per_hour: number | null
          requests_per_minute: number | null
          require_safety_check: boolean | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          allow_function_calling?: boolean | null
          allow_streaming?: boolean | null
          allow_vision?: boolean | null
          allowed_models?: string[] | null
          auto_downgrade_enabled?: boolean | null
          block_on_safety_flag?: boolean | null
          blocked_models?: string[] | null
          created_at?: string | null
          current_day_usage_usd?: number | null
          current_month_usage_usd?: number | null
          daily_budget_usd?: number | null
          default_model?: string | null
          downgrade_model?: string | null
          downgrade_threshold_pct?: number | null
          id?: string
          last_reset_date?: string | null
          monthly_budget_usd?: number | null
          per_request_max_usd?: number | null
          requests_per_hour?: number | null
          requests_per_minute?: number | null
          require_safety_check?: boolean | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          allow_function_calling?: boolean | null
          allow_streaming?: boolean | null
          allow_vision?: boolean | null
          allowed_models?: string[] | null
          auto_downgrade_enabled?: boolean | null
          block_on_safety_flag?: boolean | null
          blocked_models?: string[] | null
          created_at?: string | null
          current_day_usage_usd?: number | null
          current_month_usage_usd?: number | null
          daily_budget_usd?: number | null
          default_model?: string | null
          downgrade_model?: string | null
          downgrade_threshold_pct?: number | null
          id?: string
          last_reset_date?: string | null
          monthly_budget_usd?: number | null
          per_request_max_usd?: number | null
          requests_per_hour?: number | null
          requests_per_minute?: number | null
          require_safety_check?: boolean | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenant_ai_policies_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "tenant_analytics"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "tenant_ai_policies_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_ai_policies_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "v_tenant_ai_usage_summary"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      tenants: {
        Row: {
          contact_email: string | null
          created_at: string | null
          cultural_protocols: Json | null
          description: string | null
          domain: string | null
          id: string
          legacy_org_id: string | null
          location: string | null
          name: string
          onboarded_at: string | null
          settings: Json | null
          slug: string
          status: string | null
          subscription_tier: string | null
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          contact_email?: string | null
          created_at?: string | null
          cultural_protocols?: Json | null
          description?: string | null
          domain?: string | null
          id?: string
          legacy_org_id?: string | null
          location?: string | null
          name: string
          onboarded_at?: string | null
          settings?: Json | null
          slug: string
          status?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          contact_email?: string | null
          created_at?: string | null
          cultural_protocols?: Json | null
          description?: string | null
          domain?: string | null
          id?: string
          legacy_org_id?: string | null
          location?: string | null
          name?: string
          onboarded_at?: string | null
          settings?: Json | null
          slug?: string
          status?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          avatar_url: string | null
          category: string | null
          context: string | null
          created_at: string | null
          display_order: number | null
          id: string
          impact_statement: string | null
          is_visible: boolean | null
          name: string
          quote: string
          role: string
          source: string | null
          specialties: Json | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          category?: string | null
          context?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          impact_statement?: string | null
          is_visible?: boolean | null
          name: string
          quote: string
          role: string
          source?: string | null
          specialties?: Json | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          category?: string | null
          context?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          impact_statement?: string | null
          is_visible?: boolean | null
          name?: string
          quote?: string
          role?: string
          source?: string | null
          specialties?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      theme_associations: {
        Row: {
          context: string | null
          created_at: string | null
          entity_id: string
          entity_type: string
          id: string
          strength: number | null
          theme_id: string | null
        }
        Insert: {
          context?: string | null
          created_at?: string | null
          entity_id: string
          entity_type: string
          id?: string
          strength?: number | null
          theme_id?: string | null
        }
        Update: {
          context?: string | null
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          strength?: number | null
          theme_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "theme_associations_theme_id_fkey"
            columns: ["theme_id"]
            isOneToOne: false
            referencedRelation: "themes"
            referencedColumns: ["id"]
          },
        ]
      }
      theme_concept_evolution: {
        Row: {
          created_at: string | null
          detected_at: string | null
          evidence_quotes: string[] | null
          evolution_narrative: string | null
          evolved_concept: string | null
          id: string
          original_concept: string
          semantic_shift: number | null
          theme_id: string
        }
        Insert: {
          created_at?: string | null
          detected_at?: string | null
          evidence_quotes?: string[] | null
          evolution_narrative?: string | null
          evolved_concept?: string | null
          id?: string
          original_concept: string
          semantic_shift?: number | null
          theme_id: string
        }
        Update: {
          created_at?: string | null
          detected_at?: string | null
          evidence_quotes?: string[] | null
          evolution_narrative?: string | null
          evolved_concept?: string | null
          id?: string
          original_concept?: string
          semantic_shift?: number | null
          theme_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "theme_concept_evolution_theme_id_fkey"
            columns: ["theme_id"]
            isOneToOne: false
            referencedRelation: "themes"
            referencedColumns: ["id"]
          },
        ]
      }
      theme_evolution: {
        Row: {
          created_at: string | null
          current_status: string | null
          id: string
          peak_moment: string | null
          prominence_score: number | null
          story_count: number | null
          theme_id: string
          time_period_end: string
          time_period_start: string
          valley_moment: string | null
        }
        Insert: {
          created_at?: string | null
          current_status?: string | null
          id?: string
          peak_moment?: string | null
          prominence_score?: number | null
          story_count?: number | null
          theme_id: string
          time_period_end: string
          time_period_start: string
          valley_moment?: string | null
        }
        Update: {
          created_at?: string | null
          current_status?: string | null
          id?: string
          peak_moment?: string | null
          prominence_score?: number | null
          story_count?: number | null
          theme_id?: string
          time_period_end?: string
          time_period_start?: string
          valley_moment?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "theme_evolution_theme_id_fkey"
            columns: ["theme_id"]
            isOneToOne: false
            referencedRelation: "themes"
            referencedColumns: ["id"]
          },
        ]
      }
      theme_evolution_tracking: {
        Row: {
          community_response_indicators: string[] | null
          created_at: string | null
          current_frequency_score: number | null
          first_appearance: string
          geographic_distribution: Json | null
          id: string
          peak_prominence_date: string | null
          policy_influence_events: string[] | null
          related_themes: string[] | null
          resource_mobilization_evidence: string[] | null
          storyteller_contributors: string[] | null
          tenant_id: string
          theme_category: string | null
          theme_name: string
          trend_direction: string | null
          updated_at: string | null
        }
        Insert: {
          community_response_indicators?: string[] | null
          created_at?: string | null
          current_frequency_score?: number | null
          first_appearance: string
          geographic_distribution?: Json | null
          id?: string
          peak_prominence_date?: string | null
          policy_influence_events?: string[] | null
          related_themes?: string[] | null
          resource_mobilization_evidence?: string[] | null
          storyteller_contributors?: string[] | null
          tenant_id: string
          theme_category?: string | null
          theme_name: string
          trend_direction?: string | null
          updated_at?: string | null
        }
        Update: {
          community_response_indicators?: string[] | null
          created_at?: string | null
          current_frequency_score?: number | null
          first_appearance?: string
          geographic_distribution?: Json | null
          id?: string
          peak_prominence_date?: string | null
          policy_influence_events?: string[] | null
          related_themes?: string[] | null
          resource_mobilization_evidence?: string[] | null
          storyteller_contributors?: string[] | null
          tenant_id?: string
          theme_category?: string | null
          theme_name?: string
          trend_direction?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      themes: {
        Row: {
          category: string | null
          color: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
          usage_count: number | null
          weight: number | null
        }
        Insert: {
          category?: string | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
          usage_count?: number | null
          weight?: number | null
        }
        Update: {
          category?: string | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
          usage_count?: number | null
          weight?: number | null
        }
        Relationships: []
      }
      theory_of_change: {
        Row: {
          activities: Json | null
          assumptions: string[] | null
          created_at: string | null
          created_by: string | null
          external_factors: string[] | null
          id: string
          impact: Json | null
          indicators: Json | null
          inputs: Json | null
          outcomes: Json | null
          outputs: Json | null
          project_id: string
          updated_at: string | null
        }
        Insert: {
          activities?: Json | null
          assumptions?: string[] | null
          created_at?: string | null
          created_by?: string | null
          external_factors?: string[] | null
          id?: string
          impact?: Json | null
          indicators?: Json | null
          inputs?: Json | null
          outcomes?: Json | null
          outputs?: Json | null
          project_id: string
          updated_at?: string | null
        }
        Update: {
          activities?: Json | null
          assumptions?: string[] | null
          created_at?: string | null
          created_by?: string | null
          external_factors?: string[] | null
          id?: string
          impact?: Json | null
          indicators?: Json | null
          inputs?: Json | null
          outcomes?: Json | null
          outputs?: Json | null
          project_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "theory_of_change_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "theory_of_change_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      title_suggestions: {
        Row: {
          created_at: string | null
          id: string
          selected_at: string | null
          selected_by: string | null
          selected_title: string | null
          status: string | null
          story_id: string | null
          suggestions: Json
          transcript_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          selected_at?: string | null
          selected_by?: string | null
          selected_title?: string | null
          status?: string | null
          story_id?: string | null
          suggestions: Json
          transcript_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          selected_at?: string | null
          selected_by?: string | null
          selected_title?: string | null
          status?: string | null
          story_id?: string | null
          suggestions?: Json
          transcript_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "title_suggestions_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "title_suggestions_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories_with_trust_indicators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "title_suggestions_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "syndicated_stories"
            referencedColumns: ["story_id"]
          },
        ]
      }
      tour_requests: {
        Row: {
          city: string | null
          country: string | null
          created_at: string | null
          email: string
          ghl_contact_id: string | null
          how_can_help: string[] | null
          id: string
          latitude: number | null
          location_text: string
          longitude: number | null
          name: string
          notes: string | null
          organization_name: string | null
          organization_role: string | null
          phone: string | null
          status: string | null
          storytellers_description: string | null
          updated_at: string | null
          why_visit: string
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string | null
          email: string
          ghl_contact_id?: string | null
          how_can_help?: string[] | null
          id?: string
          latitude?: number | null
          location_text: string
          longitude?: number | null
          name: string
          notes?: string | null
          organization_name?: string | null
          organization_role?: string | null
          phone?: string | null
          status?: string | null
          storytellers_description?: string | null
          updated_at?: string | null
          why_visit: string
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string | null
          email?: string
          ghl_contact_id?: string | null
          how_can_help?: string[] | null
          id?: string
          latitude?: number | null
          location_text?: string
          longitude?: number | null
          name?: string
          notes?: string | null
          organization_name?: string | null
          organization_role?: string | null
          phone?: string | null
          status?: string | null
          storytellers_description?: string | null
          updated_at?: string | null
          why_visit?: string
        }
        Relationships: []
      }
      tour_stops: {
        Row: {
          city: string | null
          country: string | null
          cover_image_url: string | null
          created_at: string | null
          date_end: string | null
          date_start: string | null
          description: string | null
          gallery_urls: string[] | null
          highlights: string | null
          id: string
          latitude: number
          location_text: string
          longitude: number
          partner_organizations: string[] | null
          status: string | null
          stories_collected: number | null
          storytellers_met: number | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          city?: string | null
          country?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          date_end?: string | null
          date_start?: string | null
          description?: string | null
          gallery_urls?: string[] | null
          highlights?: string | null
          id?: string
          latitude: number
          location_text: string
          longitude: number
          partner_organizations?: string[] | null
          status?: string | null
          stories_collected?: number | null
          storytellers_met?: number | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          city?: string | null
          country?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          date_end?: string | null
          date_start?: string | null
          description?: string | null
          gallery_urls?: string[] | null
          highlights?: string | null
          id?: string
          latitude?: number
          location_text?: string
          longitude?: number
          partner_organizations?: string[] | null
          status?: string | null
          stories_collected?: number | null
          storytellers_met?: number | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      transcription_jobs: {
        Row: {
          attempts: number | null
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          error_message: string | null
          id: string
          max_attempts: number | null
          media_asset_id: string | null
          metadata: Json | null
          priority: number | null
          started_at: string | null
          status: string | null
        }
        Insert: {
          attempts?: number | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          error_message?: string | null
          id?: string
          max_attempts?: number | null
          media_asset_id?: string | null
          metadata?: Json | null
          priority?: number | null
          started_at?: string | null
          status?: string | null
        }
        Update: {
          attempts?: number | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          error_message?: string | null
          id?: string
          max_attempts?: number | null
          media_asset_id?: string | null
          metadata?: Json | null
          priority?: number | null
          started_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transcription_jobs_media_asset_id_fkey"
            columns: ["media_asset_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      transcripts: {
        Row: {
          ai_analysis_allowed: boolean | null
          ai_confidence_score: number | null
          ai_model_version: string | null
          ai_processing_consent: boolean | null
          ai_processing_date: string | null
          ai_processing_status: string | null
          ai_summary: string | null
          anonymization_level: string | null
          audio_url: string | null
          character_count: number | null
          confidence: number | null
          content: string | null
          content_embedding: string | null
          created_at: string | null
          created_by: string | null
          cultural_sensitivity: string | null
          duration: number | null
          duration_seconds: number | null
          elder_reviewed_at: string | null
          elder_reviewed_by: string | null
          error_message: string | null
          formatted_text: string | null
          id: string
          key_quotes: string[] | null
          language: string | null
          legacy_story_id: string | null
          legacy_transcript_id: string | null
          location_id: string | null
          media_asset_id: string | null
          media_metadata: Json | null
          metadata: Json | null
          organization_id: string | null
          privacy_level: string | null
          processing_consent: boolean | null
          processing_status: string | null
          project_id: string | null
          recording_date: string | null
          requires_elder_review: boolean | null
          search_vector: unknown
          segments: Json | null
          source_empathy_entry_id: string | null
          source_video_duration: number | null
          source_video_platform: string | null
          source_video_thumbnail: string | null
          source_video_title: string | null
          source_video_url: string | null
          status: string | null
          story_id: string | null
          storyteller_id: string | null
          sync_date: string | null
          tenant_id: string
          text: string | null
          themes: string[] | null
          title: string
          transcript_content: string
          transcript_quality: string | null
          updated_at: string | null
          video_url: string | null
          word_count: number | null
        }
        Insert: {
          ai_analysis_allowed?: boolean | null
          ai_confidence_score?: number | null
          ai_model_version?: string | null
          ai_processing_consent?: boolean | null
          ai_processing_date?: string | null
          ai_processing_status?: string | null
          ai_summary?: string | null
          anonymization_level?: string | null
          audio_url?: string | null
          character_count?: number | null
          confidence?: number | null
          content?: string | null
          content_embedding?: string | null
          created_at?: string | null
          created_by?: string | null
          cultural_sensitivity?: string | null
          duration?: number | null
          duration_seconds?: number | null
          elder_reviewed_at?: string | null
          elder_reviewed_by?: string | null
          error_message?: string | null
          formatted_text?: string | null
          id?: string
          key_quotes?: string[] | null
          language?: string | null
          legacy_story_id?: string | null
          legacy_transcript_id?: string | null
          location_id?: string | null
          media_asset_id?: string | null
          media_metadata?: Json | null
          metadata?: Json | null
          organization_id?: string | null
          privacy_level?: string | null
          processing_consent?: boolean | null
          processing_status?: string | null
          project_id?: string | null
          recording_date?: string | null
          requires_elder_review?: boolean | null
          search_vector?: unknown
          segments?: Json | null
          source_empathy_entry_id?: string | null
          source_video_duration?: number | null
          source_video_platform?: string | null
          source_video_thumbnail?: string | null
          source_video_title?: string | null
          source_video_url?: string | null
          status?: string | null
          story_id?: string | null
          storyteller_id?: string | null
          sync_date?: string | null
          tenant_id: string
          text?: string | null
          themes?: string[] | null
          title: string
          transcript_content: string
          transcript_quality?: string | null
          updated_at?: string | null
          video_url?: string | null
          word_count?: number | null
        }
        Update: {
          ai_analysis_allowed?: boolean | null
          ai_confidence_score?: number | null
          ai_model_version?: string | null
          ai_processing_consent?: boolean | null
          ai_processing_date?: string | null
          ai_processing_status?: string | null
          ai_summary?: string | null
          anonymization_level?: string | null
          audio_url?: string | null
          character_count?: number | null
          confidence?: number | null
          content?: string | null
          content_embedding?: string | null
          created_at?: string | null
          created_by?: string | null
          cultural_sensitivity?: string | null
          duration?: number | null
          duration_seconds?: number | null
          elder_reviewed_at?: string | null
          elder_reviewed_by?: string | null
          error_message?: string | null
          formatted_text?: string | null
          id?: string
          key_quotes?: string[] | null
          language?: string | null
          legacy_story_id?: string | null
          legacy_transcript_id?: string | null
          location_id?: string | null
          media_asset_id?: string | null
          media_metadata?: Json | null
          metadata?: Json | null
          organization_id?: string | null
          privacy_level?: string | null
          processing_consent?: boolean | null
          processing_status?: string | null
          project_id?: string | null
          recording_date?: string | null
          requires_elder_review?: boolean | null
          search_vector?: unknown
          segments?: Json | null
          source_empathy_entry_id?: string | null
          source_video_duration?: number | null
          source_video_platform?: string | null
          source_video_thumbnail?: string | null
          source_video_title?: string | null
          source_video_url?: string | null
          status?: string | null
          story_id?: string | null
          storyteller_id?: string | null
          sync_date?: string | null
          tenant_id?: string
          text?: string | null
          themes?: string[] | null
          title?: string
          transcript_content?: string
          transcript_quality?: string | null
          updated_at?: string | null
          video_url?: string | null
          word_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "transcripts_elder_reviewed_by_fkey"
            columns: ["elder_reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transcripts_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transcripts_media_asset_id_fkey"
            columns: ["media_asset_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transcripts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transcripts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
            foreignKeyName: "transcripts_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transcripts_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories_with_trust_indicators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transcripts_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "syndicated_stories"
            referencedColumns: ["story_id"]
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
          {
            foreignKeyName: "transcripts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_ai_usage_summary"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          department: string | null
          email: string
          full_name: string
          id: string
          is_active: boolean | null
          is_verified: boolean | null
          last_login_at: string | null
          login_count: number | null
          permissions: string[] | null
          phone: string | null
          position: string | null
          preferences: Json | null
          project_id: string | null
          role: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          department?: string | null
          email: string
          full_name: string
          id: string
          is_active?: boolean | null
          is_verified?: boolean | null
          last_login_at?: string | null
          login_count?: number | null
          permissions?: string[] | null
          phone?: string | null
          position?: string | null
          preferences?: Json | null
          project_id?: string | null
          role?: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          department?: string | null
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          last_login_at?: string | null
          login_count?: number | null
          permissions?: string[] | null
          phone?: string | null
          position?: string | null
          preferences?: Json | null
          project_id?: string | null
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      videos: {
        Row: {
          category: string | null
          created_at: string | null
          cultural_approved: boolean | null
          cultural_review_required: boolean | null
          description: string | null
          duration: number | null
          elder_approved: boolean | null
          embed_code: string | null
          featured: boolean | null
          id: string
          is_public: boolean | null
          privacy_level: string | null
          published_at: string | null
          service_area: string | null
          source_blog_post_id: string | null
          source_empathy_entry_id: string | null
          source_notion_page_id: string | null
          status: string | null
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          video_id: string | null
          video_type: string | null
          video_url: string
          view_count: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          cultural_approved?: boolean | null
          cultural_review_required?: boolean | null
          description?: string | null
          duration?: number | null
          elder_approved?: boolean | null
          embed_code?: string | null
          featured?: boolean | null
          id?: string
          is_public?: boolean | null
          privacy_level?: string | null
          published_at?: string | null
          service_area?: string | null
          source_blog_post_id?: string | null
          source_empathy_entry_id?: string | null
          source_notion_page_id?: string | null
          status?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          video_id?: string | null
          video_type?: string | null
          video_url: string
          view_count?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          cultural_approved?: boolean | null
          cultural_review_required?: boolean | null
          description?: string | null
          duration?: number | null
          elder_approved?: boolean | null
          embed_code?: string | null
          featured?: boolean | null
          id?: string
          is_public?: boolean | null
          privacy_level?: string | null
          published_at?: string | null
          service_area?: string | null
          source_blog_post_id?: string | null
          source_empathy_entry_id?: string | null
          source_notion_page_id?: string | null
          status?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          video_id?: string | null
          video_type?: string | null
          video_url?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "videos_source_blog_post_id_fkey"
            columns: ["source_blog_post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "videos_source_empathy_entry_id_fkey"
            columns: ["source_empathy_entry_id"]
            isOneToOne: false
            referencedRelation: "empathy_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_delivery_log: {
        Row: {
          attempt_number: number | null
          created_at: string | null
          delivered_at: string | null
          error_message: string | null
          event_payload: Json
          event_type: string
          id: string
          next_retry_at: string | null
          response_body: string | null
          response_status: number | null
          response_time_ms: number | null
          subscription_id: string
          success: boolean | null
        }
        Insert: {
          attempt_number?: number | null
          created_at?: string | null
          delivered_at?: string | null
          error_message?: string | null
          event_payload: Json
          event_type: string
          id?: string
          next_retry_at?: string | null
          response_body?: string | null
          response_status?: number | null
          response_time_ms?: number | null
          subscription_id: string
          success?: boolean | null
        }
        Update: {
          attempt_number?: number | null
          created_at?: string | null
          delivered_at?: string | null
          error_message?: string | null
          event_payload?: Json
          event_type?: string
          id?: string
          next_retry_at?: string | null
          response_body?: string | null
          response_status?: number | null
          response_time_ms?: number | null
          subscription_id?: string
          success?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "webhook_delivery_log_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "webhook_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_subscriptions: {
        Row: {
          app_id: string
          consecutive_failures: number | null
          created_at: string | null
          description: string | null
          events: string[]
          failure_count: number | null
          id: string
          is_active: boolean | null
          last_failure_at: string | null
          last_success_at: string | null
          last_triggered_at: string | null
          max_consecutive_failures: number | null
          secret_key: string
          updated_at: string | null
          webhook_url: string
        }
        Insert: {
          app_id: string
          consecutive_failures?: number | null
          created_at?: string | null
          description?: string | null
          events?: string[]
          failure_count?: number | null
          id?: string
          is_active?: boolean | null
          last_failure_at?: string | null
          last_success_at?: string | null
          last_triggered_at?: string | null
          max_consecutive_failures?: number | null
          secret_key: string
          updated_at?: string | null
          webhook_url: string
        }
        Update: {
          app_id?: string
          consecutive_failures?: number | null
          created_at?: string | null
          description?: string | null
          events?: string[]
          failure_count?: number | null
          id?: string
          is_active?: boolean | null
          last_failure_at?: string | null
          last_success_at?: string | null
          last_triggered_at?: string | null
          max_consecutive_failures?: number | null
          secret_key?: string
          updated_at?: string | null
          webhook_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_subscriptions_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "external_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "webhook_subscriptions_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "syndicated_stories"
            referencedColumns: ["app_id"]
          },
        ]
      }
    }
    Views: {
      act_featured_storytellers: {
        Row: {
          act_project_id: string | null
          approved_at: string | null
          created_at: string | null
          display_name: string | null
          featured_bio: string | null
          featured_image_url: string | null
          featured_tagline: string | null
          id: string | null
          opted_in_at: string | null
          profile_image_url: string | null
          project_slug: string | null
          project_title: string | null
          storyteller_email: string | null
          storyteller_id: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "storyteller_project_features_act_project_id_fkey"
            columns: ["act_project_id"]
            isOneToOne: false
            referencedRelation: "act_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      annual_reports_with_stats: {
        Row: {
          acknowledgments: string | null
          auto_generated: boolean | null
          auto_include_criteria: Json | null
          average_rating: number | null
          cover_image_url: string | null
          created_at: string | null
          created_by: string | null
          cultural_advisor_review: boolean | null
          cultural_notes: string | null
          distribution_date: string | null
          distribution_list: string[] | null
          downloads: number | null
          elder_approval_date: string | null
          elder_approval_required: boolean | null
          elder_approvals: string[] | null
          exclude_story_ids: string[] | null
          executive_summary: string | null
          featured_story_ids: string[] | null
          feedback_count: number | null
          generated_by: string | null
          generation_date: string | null
          id: string | null
          leadership_message: string | null
          leadership_message_author: string | null
          looking_forward: string | null
          metadata: Json | null
          organization_id: string | null
          organization_logo: string | null
          organization_name: string | null
          pdf_url: string | null
          published_by: string | null
          published_date: string | null
          report_year: number | null
          reporting_period_end: string | null
          reporting_period_start: string | null
          sections_config: Json | null
          statistics: Json | null
          status: string | null
          story_count: number | null
          subtitle: string | null
          template_name: string | null
          theme: string | null
          title: string | null
          updated_at: string | null
          views: number | null
          web_version_url: string | null
          year_highlights: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "annual_reports_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "annual_reports_generated_by_fkey"
            columns: ["generated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "annual_reports_leadership_message_author_fkey"
            columns: ["leadership_message_author"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "annual_reports_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "annual_reports_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "annual_reports_published_by_fkey"
            columns: ["published_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      elder_review_dashboard: {
        Row: {
          assigned_at: string | null
          assigned_elder_id: string | null
          assigned_elder_name: string | null
          community_input_required: boolean | null
          content_id: string | null
          content_preview: string | null
          content_title: string | null
          content_type: string | null
          created_at: string | null
          cultural_issues: Json | null
          due_date: string | null
          id: string | null
          priority: string | null
          review_conditions: string[] | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "elder_review_queue_assigned_elder_id_fkey"
            columns: ["assigned_elder_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "elder_review_queue_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      moderation_statistics: {
        Row: {
          approved_count: number | null
          blocked_count: number | null
          date: string | null
          elder_review_count: number | null
          flagged_count: number | null
          total_moderated: number | null
        }
        Relationships: []
      }
      organization_overview: {
        Row: {
          abn: string | null
          annual_reports_enabled: boolean | null
          contact_email: string | null
          coordinates: unknown
          created_at: string | null
          created_by: string | null
          cultural_advisor_ids: string[] | null
          cultural_protocols: Json | null
          cultural_significance: string | null
          default_story_access_level: string | null
          description: string | null
          domain: string | null
          elder_approval_required: boolean | null
          email: string | null
          empathy_ledger_enabled: boolean | null
          established_date: string | null
          governance_model: string | null
          has_cultural_protocols: boolean | null
          id: string | null
          impact_tracking_enabled: boolean | null
          indigenous_controlled: boolean | null
          language_groups: string[] | null
          legal_name: string | null
          location: string | null
          location_id: string | null
          logo_url: string | null
          member_count: number | null
          metadata: Json | null
          mission_statement: string | null
          name: string | null
          onboarded_at: string | null
          phone: string | null
          physical_address: string | null
          postal_address: string | null
          primary_color: string | null
          report_count: number | null
          require_story_approval: boolean | null
          secondary_color: string | null
          service_count: number | null
          service_locations: string[] | null
          settings: Json | null
          short_name: string | null
          slug: string | null
          story_count: number | null
          subscription_status: string | null
          subscription_tier: string | null
          tagline: string | null
          tenant_id: string | null
          traditional_country: string | null
          type: string | null
          updated_at: string | null
          website: string | null
          website_url: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organizations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organizations_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organizations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_analytics"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "organizations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organizations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_ai_usage_summary"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      partner_dashboard_summary: {
        Row: {
          active_projects: number | null
          app_id: string | null
          app_name: string | null
          approved_stories: number | null
          pending_requests: number | null
          unread_messages: number | null
          user_id: string | null
          views_30d: number | null
        }
        Relationships: [
          {
            foreignKeyName: "partner_team_members_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "external_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_team_members_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "syndicated_stories"
            referencedColumns: ["app_id"]
          },
        ]
      }
      pg_all_foreign_keys: {
        Row: {
          fk_columns: unknown[] | null
          fk_constraint_name: unknown
          fk_schema_name: unknown
          fk_table_name: unknown
          fk_table_oid: unknown
          is_deferrable: boolean | null
          is_deferred: boolean | null
          match_type: string | null
          on_delete: string | null
          on_update: string | null
          pk_columns: unknown[] | null
          pk_constraint_name: unknown
          pk_index_name: unknown
          pk_schema_name: unknown
          pk_table_name: unknown
          pk_table_oid: unknown
        }
        Relationships: []
      }
      stories_with_trust_indicators: {
        Row: {
          ai_confidence_scores: Json | null
          ai_enhanced_content: string | null
          ai_generated_summary: boolean | null
          ai_processed: boolean | null
          ai_processing_consent_verified: boolean | null
          airtable_record_id: string | null
          allowed_embed_domains: string[] | null
          anonymization_requested_at: string | null
          anonymization_status: string | null
          anonymized_at: string | null
          anonymized_fields: Json | null
          archive_consent_given: boolean | null
          archive_reason: string | null
          archived_at: string | null
          archived_by: string | null
          author_id: string | null
          community_status: string | null
          consent_details: Json | null
          consent_recently_verified: boolean | null
          consent_verified_at: string | null
          consent_withdrawal_reason: string | null
          consent_withdrawn_at: string | null
          content: string | null
          created_at: string | null
          cross_tenant_visibility: string[] | null
          cultural_sensitivity_flag: boolean | null
          cultural_sensitivity_level: string | null
          cultural_themes: string[] | null
          cultural_warnings: Json | null
          elder_approved_at: string | null
          elder_approved_by: string | null
          elder_badge: string | null
          elder_reviewed: boolean | null
          elder_reviewed_at: string | null
          elder_reviewer_id: string | null
          embedding: string | null
          embeds_enabled: boolean | null
          fellow_id: string | null
          fellowship_phase: string | null
          has_elder_review: boolean | null
          has_explicit_consent: boolean | null
          id: string | null
          is_archived: boolean | null
          is_featured: boolean | null
          is_public: boolean | null
          is_publicly_shareable: boolean | null
          latitude: number | null
          legacy_airtable_id: string | null
          legacy_author: string | null
          legacy_fellow_id: string | null
          legacy_story_id: string | null
          legacy_storyteller_id: string | null
          likes_count: number | null
          location_id: string | null
          location_text: string | null
          longitude: number | null
          media_attachments: Json | null
          media_metadata: Json | null
          media_url: string | null
          media_urls: string[] | null
          migrated_at: string | null
          migration_quality_score: number | null
          organization_id: string | null
          original_author_display: string | null
          original_author_id: string | null
          ownership_status: string | null
          ownership_transferred_at: string | null
          permission_tier: Database["public"]["Enums"]["permission_tier"] | null
          permission_tier_emoji: string | null
          permission_tier_label: string | null
          privacy_level: string | null
          project_id: string | null
          provenance_chain: Json | null
          published_at: string | null
          requires_elder_approval: boolean | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          search_vector: unknown
          service_id: string | null
          shares_count: number | null
          sharing_enabled: boolean | null
          sharing_permissions: Json | null
          source_empathy_entry_id: string | null
          source_links: Json | null
          status: string | null
          story_category: string | null
          story_image_file: string | null
          story_image_url: string | null
          story_stage: string | null
          story_type: string | null
          storyteller_id: string | null
          summary: string | null
          sync_date: string | null
          tenant_id: string | null
          themes: Json | null
          title: string | null
          traditional_knowledge_flag: boolean | null
          transcript_id: string | null
          transcription: string | null
          updated_at: string | null
          video_embed_code: string | null
          video_stage: string | null
          views_count: number | null
        }
        Insert: {
          ai_confidence_scores?: Json | null
          ai_enhanced_content?: string | null
          ai_generated_summary?: boolean | null
          ai_processed?: boolean | null
          ai_processing_consent_verified?: boolean | null
          airtable_record_id?: string | null
          allowed_embed_domains?: string[] | null
          anonymization_requested_at?: string | null
          anonymization_status?: string | null
          anonymized_at?: string | null
          anonymized_fields?: Json | null
          archive_consent_given?: boolean | null
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          author_id?: string | null
          community_status?: string | null
          consent_details?: Json | null
          consent_recently_verified?: never
          consent_verified_at?: string | null
          consent_withdrawal_reason?: string | null
          consent_withdrawn_at?: string | null
          content?: string | null
          created_at?: string | null
          cross_tenant_visibility?: string[] | null
          cultural_sensitivity_flag?: boolean | null
          cultural_sensitivity_level?: string | null
          cultural_themes?: string[] | null
          cultural_warnings?: Json | null
          elder_approved_at?: string | null
          elder_approved_by?: string | null
          elder_badge?: never
          elder_reviewed?: boolean | null
          elder_reviewed_at?: string | null
          elder_reviewer_id?: string | null
          embedding?: string | null
          embeds_enabled?: boolean | null
          fellow_id?: string | null
          fellowship_phase?: string | null
          has_elder_review?: boolean | null
          has_explicit_consent?: boolean | null
          id?: string | null
          is_archived?: boolean | null
          is_featured?: boolean | null
          is_public?: boolean | null
          is_publicly_shareable?: never
          latitude?: number | null
          legacy_airtable_id?: string | null
          legacy_author?: string | null
          legacy_fellow_id?: string | null
          legacy_story_id?: string | null
          legacy_storyteller_id?: string | null
          likes_count?: number | null
          location_id?: string | null
          location_text?: string | null
          longitude?: number | null
          media_attachments?: Json | null
          media_metadata?: Json | null
          media_url?: string | null
          media_urls?: string[] | null
          migrated_at?: string | null
          migration_quality_score?: number | null
          organization_id?: string | null
          original_author_display?: string | null
          original_author_id?: string | null
          ownership_status?: string | null
          ownership_transferred_at?: string | null
          permission_tier?:
            | Database["public"]["Enums"]["permission_tier"]
            | null
          permission_tier_emoji?: never
          permission_tier_label?: never
          privacy_level?: string | null
          project_id?: string | null
          provenance_chain?: Json | null
          published_at?: string | null
          requires_elder_approval?: boolean | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          search_vector?: unknown
          service_id?: string | null
          shares_count?: number | null
          sharing_enabled?: boolean | null
          sharing_permissions?: Json | null
          source_empathy_entry_id?: string | null
          source_links?: Json | null
          status?: string | null
          story_category?: string | null
          story_image_file?: string | null
          story_image_url?: string | null
          story_stage?: string | null
          story_type?: string | null
          storyteller_id?: string | null
          summary?: string | null
          sync_date?: string | null
          tenant_id?: string | null
          themes?: Json | null
          title?: string | null
          traditional_knowledge_flag?: boolean | null
          transcript_id?: string | null
          transcription?: string | null
          updated_at?: string | null
          video_embed_code?: string | null
          video_stage?: string | null
          views_count?: number | null
        }
        Update: {
          ai_confidence_scores?: Json | null
          ai_enhanced_content?: string | null
          ai_generated_summary?: boolean | null
          ai_processed?: boolean | null
          ai_processing_consent_verified?: boolean | null
          airtable_record_id?: string | null
          allowed_embed_domains?: string[] | null
          anonymization_requested_at?: string | null
          anonymization_status?: string | null
          anonymized_at?: string | null
          anonymized_fields?: Json | null
          archive_consent_given?: boolean | null
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          author_id?: string | null
          community_status?: string | null
          consent_details?: Json | null
          consent_recently_verified?: never
          consent_verified_at?: string | null
          consent_withdrawal_reason?: string | null
          consent_withdrawn_at?: string | null
          content?: string | null
          created_at?: string | null
          cross_tenant_visibility?: string[] | null
          cultural_sensitivity_flag?: boolean | null
          cultural_sensitivity_level?: string | null
          cultural_themes?: string[] | null
          cultural_warnings?: Json | null
          elder_approved_at?: string | null
          elder_approved_by?: string | null
          elder_badge?: never
          elder_reviewed?: boolean | null
          elder_reviewed_at?: string | null
          elder_reviewer_id?: string | null
          embedding?: string | null
          embeds_enabled?: boolean | null
          fellow_id?: string | null
          fellowship_phase?: string | null
          has_elder_review?: boolean | null
          has_explicit_consent?: boolean | null
          id?: string | null
          is_archived?: boolean | null
          is_featured?: boolean | null
          is_public?: boolean | null
          is_publicly_shareable?: never
          latitude?: number | null
          legacy_airtable_id?: string | null
          legacy_author?: string | null
          legacy_fellow_id?: string | null
          legacy_story_id?: string | null
          legacy_storyteller_id?: string | null
          likes_count?: number | null
          location_id?: string | null
          location_text?: string | null
          longitude?: number | null
          media_attachments?: Json | null
          media_metadata?: Json | null
          media_url?: string | null
          media_urls?: string[] | null
          migrated_at?: string | null
          migration_quality_score?: number | null
          organization_id?: string | null
          original_author_display?: string | null
          original_author_id?: string | null
          ownership_status?: string | null
          ownership_transferred_at?: string | null
          permission_tier?:
            | Database["public"]["Enums"]["permission_tier"]
            | null
          permission_tier_emoji?: never
          permission_tier_label?: never
          privacy_level?: string | null
          project_id?: string | null
          provenance_chain?: Json | null
          published_at?: string | null
          requires_elder_approval?: boolean | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          search_vector?: unknown
          service_id?: string | null
          shares_count?: number | null
          sharing_enabled?: boolean | null
          sharing_permissions?: Json | null
          source_empathy_entry_id?: string | null
          source_links?: Json | null
          status?: string | null
          story_category?: string | null
          story_image_file?: string | null
          story_image_url?: string | null
          story_stage?: string | null
          story_type?: string | null
          storyteller_id?: string | null
          summary?: string | null
          sync_date?: string | null
          tenant_id?: string | null
          themes?: Json | null
          title?: string | null
          traditional_knowledge_flag?: boolean | null
          transcript_id?: string | null
          transcription?: string | null
          updated_at?: string | null
          video_embed_code?: string | null
          video_stage?: string | null
          views_count?: number | null
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
            foreignKeyName: "stories_elder_approved_by_fkey"
            columns: ["elder_approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stories_elder_reviewer_id_fkey"
            columns: ["elder_reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stories_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stories_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stories_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
            foreignKeyName: "stories_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stories_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "organization_services"
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
            foreignKeyName: "stories_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_ai_usage_summary"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      syndicated_stories: {
        Row: {
          app_id: string | null
          consent_expires_at: string | null
          content: string | null
          cultural_restrictions: Json | null
          requesting_app: string | null
          share_media: boolean | null
          story_date: string | null
          story_id: string | null
          story_type: string | null
          storyteller_id: string | null
          storyteller_name: string | null
          themes: Json | null
          title: string | null
        }
        Relationships: []
      }
      tap_funky: {
        Row: {
          args: string | null
          is_definer: boolean | null
          is_strict: boolean | null
          is_visible: boolean | null
          kind: unknown
          langoid: unknown
          name: unknown
          oid: unknown
          owner: unknown
          returns: string | null
          returns_set: boolean | null
          schema: unknown
          volatility: string | null
        }
        Relationships: []
      }
      tenant_analytics: {
        Row: {
          available_for_collaboration: number | null
          available_for_mentoring: number | null
          avg_story_quality: number | null
          avg_storyteller_quality: number | null
          last_profile_update: string | null
          last_story_update: string | null
          public_stories: number | null
          slug: string | null
          tenant_id: string | null
          tenant_name: string | null
          total_quotes: number | null
          total_stories: number | null
          total_storytellers: number | null
        }
        Relationships: []
      }
      users_public: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          department: string | null
          email: string | null
          full_name: string | null
          id: string | null
          is_active: boolean | null
          position: string | null
          role: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          department?: string | null
          email?: string | null
          full_name?: string | null
          id?: string | null
          is_active?: boolean | null
          position?: string | null
          role?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          department?: string | null
          email?: string | null
          full_name?: string | null
          id?: string | null
          is_active?: boolean | null
          position?: string | null
          role?: string | null
        }
        Relationships: []
      }
      v_agent_usage_stats: {
        Row: {
          agent_name: string | null
          avg_duration_ms: number | null
          blocked: number | null
          day: string | null
          failed: number | null
          flagged: number | null
          successful: number | null
          total_cost_usd: number | null
          total_requests: number | null
          total_tokens: number | null
        }
        Relationships: []
      }
      v_tenant_ai_usage_summary: {
        Row: {
          allowed_models: string[] | null
          auto_downgrade_enabled: boolean | null
          budget_used_pct: number | null
          current_day_usage_usd: number | null
          current_month_usage_usd: number | null
          daily_budget_usd: number | null
          downgrade_threshold_pct: number | null
          monthly_budget_usd: number | null
          tenant_id: string | null
          tenant_name: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      _cleanup: { Args: never; Returns: boolean }
      _contract_on: { Args: { "": string }; Returns: unknown }
      _currtest: { Args: never; Returns: number }
      _db_privs: { Args: never; Returns: unknown[] }
      _extensions: { Args: never; Returns: unknown[] }
      _get: { Args: { "": string }; Returns: number }
      _get_latest: { Args: { "": string }; Returns: number[] }
      _get_note: { Args: { "": string }; Returns: string }
      _is_verbose: { Args: never; Returns: boolean }
      _prokind: { Args: { p_oid: unknown }; Returns: unknown }
      _query: { Args: { "": string }; Returns: string }
      _refine_vol: { Args: { "": string }; Returns: string }
      _table_privs: { Args: never; Returns: unknown[] }
      _temptypes: { Args: { "": string }; Returns: string }
      _todo: { Args: never; Returns: string }
      aggregate_daily_engagement: { Args: never; Returns: undefined }
      approve_for_publishing: {
        Args: { notes?: string; queue_id: string; reviewer_id: string }
        Returns: undefined
      }
      approve_story_feature: {
        Args: { admin_uuid: string; tag_id: string }
        Returns: boolean
      }
      approve_storyteller_feature: {
        Args: { admin_uuid: string; feature_id: string }
        Returns: boolean
      }
      archive_story: {
        Args: { p_archived_by: string; p_reason?: string; p_story_id: string }
        Returns: boolean
      }
      calculate_connection_strength: {
        Args: { p_storyteller_a_id: string; p_storyteller_b_id: string }
        Returns: number
      }
      calculate_engagement_score: {
        Args: { p_storyteller_id: string }
        Returns: number
      }
      calculate_organization_completeness: {
        Args: { org_id: string }
        Returns: number
      }
      calculate_organization_impact_metrics: {
        Args: { org_id: string }
        Returns: undefined
      }
      calculate_outcome_progress: {
        Args: { outcome_id: string }
        Returns: number
      }
      calculate_sroi_outcome_value: {
        Args: { p_discount_rate?: number; p_outcome_id: string }
        Returns: number
      }
      calculate_storyteller_analytics: {
        Args: { p_storyteller_id: string }
        Returns: undefined
      }
      can_create_share_link: {
        Args: { p_purpose: string; p_story_id: string }
        Returns: {
          allowed: boolean
          reason: string
          tier: Database["public"]["Enums"]["permission_tier"]
        }[]
      }
      check_cultural_protocol: {
        Args: { protocol_type_param: string; resource_data?: Json }
        Returns: boolean
      }
      check_storyteller_milestones: {
        Args: { p_storyteller_id: string }
        Returns: undefined
      }
      cleanup_expired_tokens: { Args: never; Returns: number }
      cleanup_old_notifications: { Args: never; Returns: undefined }
      col_is_null:
        | {
            Args: {
              column_name: unknown
              description?: string
              schema_name: unknown
              table_name: unknown
            }
            Returns: string
          }
        | {
            Args: {
              column_name: unknown
              description?: string
              table_name: unknown
            }
            Returns: string
          }
      col_not_null:
        | {
            Args: {
              column_name: unknown
              description?: string
              schema_name: unknown
              table_name: unknown
            }
            Returns: string
          }
        | {
            Args: {
              column_name: unknown
              description?: string
              table_name: unknown
            }
            Returns: string
          }
      create_default_dashboard_config: {
        Args: { p_storyteller_id: string }
        Returns: undefined
      }
      create_profile_with_media: {
        Args: {
          p_avatar_media_id?: string
          p_bio?: string
          p_cover_media_id?: string
          p_display_name: string
          p_email?: string
          p_full_name?: string
          p_is_storyteller?: boolean
          p_phone_number?: string
          p_tenant_id?: string
        }
        Returns: {
          accessibility_needs: string[] | null
          address: Json | null
          age_range: string | null
          ai_consent_date: string | null
          ai_consent_scope: Json | null
          ai_enhanced_bio: string | null
          ai_personality_insights: Json | null
          ai_processing_consent: boolean | null
          ai_themes: Json | null
          airtable_record_id: string | null
          allow_ai_analysis: boolean | null
          allow_community_recommendations: boolean | null
          allow_messages: boolean | null
          allow_research_participation: boolean | null
          analytics_preferences: Json | null
          attribution_preferences: Json | null
          available_for_collaboration: boolean | null
          avatar_media_id: string | null
          avatar_url: string | null
          basic_info_visibility: string | null
          bio: string | null
          can_share_traditional_knowledge: boolean | null
          change_maker_type: string | null
          collaboration_preferences: Json | null
          community_leadership_score: number | null
          community_role: string | null
          community_roles: string[] | null
          connection_strength_scores: Json | null
          consent_date: string | null
          consent_given: boolean | null
          consent_version: string | null
          cover_media_id: string | null
          created_at: string | null
          created_by: string | null
          cross_tenant_sharing: boolean | null
          cultural_affiliations: string[] | null
          cultural_background: string | null
          cultural_communities_visibility: string | null
          cultural_identity_visibility: string | null
          cultural_permissions: Json | null
          cultural_protocol_level: string | null
          cultural_protocol_score: number | null
          cultural_protocols: Json | null
          current_organization: string | null
          current_role: string | null
          date_of_birth: string | null
          dietary_requirements: string[] | null
          display_name: string | null
          email: string | null
          emergency_contact: Json | null
          engagement_score: number | null
          expertise_areas: string[] | null
          face_recognition_consent: boolean | null
          face_recognition_consent_date: string | null
          featured_video_url: string | null
          first_name: string | null
          full_name: string | null
          gender: string | null
          generated_themes: Json | null
          geographic_connections: Json | null
          geographic_scope: string | null
          healing_integration_score: number | null
          id: string
          impact_badges: string[] | null
          impact_confidence_score: number | null
          impact_focus_areas: string[] | null
          impact_score: number | null
          impact_story_promotion: boolean | null
          indigenous_status: string | null
          industry_sectors: string[] | null
          interested_in_peer_support: boolean | null
          interests: string[] | null
          is_cultural_advisor: boolean | null
          is_elder: boolean | null
          is_featured: boolean | null
          is_service_provider: boolean | null
          is_storyteller: boolean | null
          job_title: string | null
          justicehub_enabled: boolean | null
          justicehub_featured: boolean | null
          justicehub_role: string | null
          justicehub_synced_at: string | null
          knowledge_transmission_score: number | null
          language_communities_visibility: string | null
          language_group: string | null
          languages_spoken: string[] | null
          last_impact_analysis: string | null
          last_name: string | null
          last_story_date: string | null
          legacy_airtable_id: string | null
          legacy_location_id: string | null
          legacy_organization_id: string | null
          legacy_project_id: string | null
          legacy_storyteller_id: string | null
          legacy_user_id: string | null
          life_motto: string | null
          linkedin_profile_url: string | null
          location: string | null
          location_id: string | null
          media_visibility: string | null
          mentor_availability: boolean | null
          metadata: Json | null
          migrated_at: string | null
          migration_quality_score: number | null
          narrative_ownership_level: string | null
          narrative_themes: string[] | null
          network_visibility: string | null
          occupation: string | null
          onboarding_completed: boolean | null
          open_to_mentoring: boolean | null
          personal_statement: string | null
          phone: string | null
          phone_number: string | null
          photo_consent_contexts: string[] | null
          platform_benefit_sharing: Json | null
          preferred_communication: string[] | null
          preferred_name: string | null
          preferred_pronouns: string | null
          primary_impact_type: string | null
          primary_organization_id: string | null
          privacy_preferences: Json | null
          professional_summary: string | null
          professional_visibility: string | null
          profile_image_alt_text: string | null
          profile_image_url: string | null
          profile_status: string | null
          profile_visibility: string | null
          pronouns: string | null
          quote_sharing_consent: boolean | null
          recommendation_opt_in: boolean | null
          relationship_building_score: number | null
          requires_elder_review: boolean | null
          resume_url: string | null
          seeking_organizational_connections: boolean | null
          show_in_directory: boolean | null
          social_links: Json | null
          speaking_availability: boolean | null
          stories_contributed: number | null
          stories_visibility: string | null
          story_use_permissions: Json | null
          story_visibility_level: string | null
          storyteller_ranking: number | null
          storyteller_type: string | null
          storytelling_experience: string | null
          storytelling_methods: string[] | null
          super_admin: boolean | null
          system_navigation_score: number | null
          tenant_id: string
          tenant_roles: string[] | null
          timezone: string | null
          total_impact_insights: number | null
          traditional_country: string | null
          traditional_knowledge_flag: boolean | null
          traditional_knowledge_keeper: boolean | null
          transcripts_visibility: string | null
          updated_at: string | null
          user_id: string | null
          video_introduction_url: string | null
          video_metadata: Json | null
          video_portfolio_urls: string[] | null
          website_url: string | null
          wisdom_sharing_level: string | null
          years_of_community_work: number | null
          years_of_experience: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "profiles"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      decrement_story_like_count: {
        Args: { story_uuid: string }
        Returns: undefined
      }
      diag:
        | {
            Args: { msg: unknown }
            Returns: {
              error: true
            } & "Could not choose the best candidate function between: public.diag(msg => text), public.diag(msg => anyelement). Try renaming the parameters or the function itself in the database so function overloading can be resolved"
          }
        | {
            Args: { msg: string }
            Returns: {
              error: true
            } & "Could not choose the best candidate function between: public.diag(msg => text), public.diag(msg => anyelement). Try renaming the parameters or the function itself in the database so function overloading can be resolved"
          }
      diag_test_name: { Args: { "": string }; Returns: string }
      do_tap:
        | { Args: never; Returns: string[] }
        | { Args: { "": string }; Returns: string[] }
      exec: { Args: { sql: string }; Returns: undefined }
      exec_sql: { Args: { sql: string }; Returns: Json }
      expire_pending_requests: { Args: never; Returns: undefined }
      extract_descript_id: { Args: { url: string }; Returns: string }
      extract_youtube_id: { Args: { url: string }; Returns: string }
      fail:
        | { Args: never; Returns: string }
        | { Args: { "": string }; Returns: string }
      find_collaborators: {
        Args: {
          collaboration_type?: string
          skill_keywords?: string[]
          user_tenant_id: string
        }
        Returns: {
          collaboration_available: boolean
          full_name: string
          mentoring_available: boolean
          profile_id: string
          skills_match: string[]
        }[]
      }
      find_storyteller_connections: {
        Args: {
          p_connection_types?: string[]
          p_limit?: number
          p_min_strength?: number
          p_storyteller_id: string
        }
        Returns: {
          connection_id: string
          connection_type: string
          potential_connection_id: string
          reason: string
          shared_themes: string[]
          strength: number
        }[]
      }
      findfuncs: { Args: { "": string }; Returns: string[] }
      finish: { Args: { exception_on_failure?: boolean }; Returns: string[] }
      generate_descript_embed: {
        Args: { height?: string; video_id: string; width?: string }
        Returns: string
      }
      generate_youtube_embed: {
        Args: { height?: string; video_id: string; width?: string }
        Returns: string
      }
      get_database_schema: {
        Args: never
        Returns: {
          column_count: number
          has_rls: boolean
          row_count: number
          table_name: string
          table_size: string
        }[]
      }
      get_database_stats: {
        Args: never
        Returns: {
          database_size: string
          total_columns: number
          total_functions: number
          total_indexes: number
          total_policies: number
          total_tables: number
        }[]
      }
      get_justicehub_organizations: {
        Args: never
        Returns: {
          id: string
          justicehub_synced_at: string
          name: string
          slug: string
          type: string
        }[]
      }
      get_justicehub_profiles: {
        Args: never
        Returns: {
          bio: string
          cultural_background: string
          display_name: string
          email: string
          full_name: string
          id: string
          is_elder: boolean
          justicehub_featured: boolean
          justicehub_role: string
          justicehub_synced_at: string
          profile_image_url: string
        }[]
      }
      get_justicehub_projects: {
        Args: never
        Returns: {
          description: string
          id: string
          justicehub_program_type: string
          justicehub_synced_at: string
          name: string
          organization_id: string
          slug: string
        }[]
      }
      get_organization_stats: {
        Args: { org_uuid: string }
        Returns: {
          active_services: number
          published_reports: number
          stories_this_year: number
          total_members: number
          total_reports: number
          total_stories: number
        }[]
      }
      get_project_context: { Args: { p_project_id: string }; Returns: Json }
      get_service_summary: {
        Args: {
          p_end_date?: string
          p_organization_id: string
          p_service_area: string
          p_start_date?: string
        }
        Returns: Json
      }
      get_stories_for_report: {
        Args: { limit_count?: number; org_uuid: string; year_value: number }
        Returns: {
          category: string
          impact_score: number
          relevance_score: number
          story_id: string
          story_title: string
        }[]
      }
      get_story_media_path: { Args: { story_id: string }; Returns: string }
      get_storyteller_dashboard_summary: {
        Args: { p_storyteller_id: string }
        Returns: {
          impact_score: number
          pending_recommendations: number
          recent_activity_count: number
          top_themes: string[]
          total_connections: number
          total_stories: number
        }[]
      }
      get_storyteller_media_links: {
        Args: { storyteller_uuid: string }
        Returns: {
          created_at: string
          description: string
          duration_seconds: number
          id: string
          is_primary: boolean
          is_public: boolean
          link_type: string
          platform: string
          tags: string[]
          thumbnail_url: string
          title: string
          updated_at: string
          url: string
          video_stage: string
        }[]
      }
      get_storyteller_recommendations: {
        Args: {
          p_limit?: number
          p_min_relevance?: number
          p_recommendation_types?: string[]
          p_storyteller_id: string
        }
        Returns: {
          created_at: string
          description: string
          rec_type: string
          recommendation_id: string
          relevance_score: number
          title: string
        }[]
      }
      get_storyteller_syndication_stats: {
        Args: { p_storyteller_id: string }
        Returns: {
          app_display_name: string
          app_name: string
          last_accessed: string
          total_stories_shared: number
          total_views: number
        }[]
      }
      get_storyteller_top_themes: {
        Args: { p_limit?: number; p_storyteller_id: string }
        Returns: {
          frequency_count: number
          prominence_score: number
          theme_name: string
        }[]
      }
      get_syndicated_stories_for_app: {
        Args: { target_app_name: string }
        Returns: {
          content: string
          cultural_restrictions: Json
          share_media: boolean
          story_date: string
          story_id: string
          story_type: string
          storyteller_name: string
          themes: string[]
          title: string
        }[]
      }
      get_table_columns: {
        Args: { p_table_name: string }
        Returns: {
          column_default: string
          column_name: string
          data_type: string
          foreign_column: string
          foreign_table: string
          is_foreign_key: boolean
          is_nullable: string
          is_primary_key: boolean
        }[]
      }
      get_table_policies: {
        Args: { p_table_name: string }
        Returns: {
          policy_check: string
          policy_command: string
          policy_name: string
          policy_qual: string
          policy_roles: string[]
        }[]
      }
      get_table_relationships: {
        Args: never
        Returns: {
          constraint_name: string
          from_column: string
          from_table: string
          to_column: string
          to_table: string
        }[]
      }
      get_transcripts_with_source_video: {
        Args: { org_id?: string }
        Returns: {
          has_source_video: boolean
          source_video_duration: number
          source_video_platform: string
          source_video_title: string
          source_video_url: string
          storyteller_name: string
          title: string
          transcript_id: string
        }[]
      }
      get_user_organization_role: {
        Args: { org_id: string; user_id?: string }
        Returns: Database["public"]["Enums"]["organization_role"]
      }
      get_user_storage_path: { Args: { bucket_name: string }; Returns: string }
      get_user_tenant_id: { Args: never; Returns: string }
      has_unique: { Args: { "": string }; Returns: string }
      in_todo: { Args: never; Returns: boolean }
      increment_distribution_view: {
        Args: { distribution_id: string }
        Returns: undefined
      }
      increment_embed_usage: {
        Args: { p_domain: string; p_ip: unknown; p_token_hash: string }
        Returns: string
      }
      increment_media_view_count: {
        Args: { asset_id: string }
        Returns: undefined
      }
      increment_story_like_count: {
        Args: { story_uuid: string }
        Returns: undefined
      }
      increment_story_share_count: {
        Args: { story_uuid: string }
        Returns: undefined
      }
      increment_story_view_count: {
        Args: { story_uuid: string }
        Returns: undefined
      }
      is_act_admin: { Args: { user_uuid: string }; Returns: boolean }
      is_admin: { Args: never; Returns: boolean }
      is_empty: { Args: { "": string }; Returns: string }
      is_story_syndicated: {
        Args: { p_app_name: string; p_story_id: string }
        Returns: boolean
      }
      isnt_empty: { Args: { "": string }; Returns: string }
      lives_ok: { Args: { "": string }; Returns: string }
      log_activity: {
        Args: {
          p_action: string
          p_action_category: string
          p_details?: Json
          p_entity_id: string
          p_entity_title: string
          p_entity_type: string
          p_organization_id?: string
          p_requires_attention?: boolean
          p_user_id: string
          p_user_name: string
          p_user_role: string
        }
        Returns: string
      }
      mark_ready_to_publish: { Args: { entry_id: string }; Returns: undefined }
      migrate_locations_from_profiles: { Args: never; Returns: number }
      migrate_organizations_from_profiles: { Args: never; Returns: number }
      no_plan: { Args: never; Returns: boolean[] }
      num_failed: { Args: never; Returns: number }
      os_name: { Args: never; Returns: string }
      pass:
        | { Args: never; Returns: string }
        | { Args: { "": string }; Returns: string }
      pg_version: { Args: never; Returns: string }
      pg_version_num: { Args: never; Returns: number }
      pgtap_version: { Args: never; Returns: number }
      refresh_tenant_analytics: { Args: never; Returns: undefined }
      reject_content: {
        Args: { queue_id: string; reason: string; reviewer_id: string }
        Returns: undefined
      }
      restore_story: {
        Args: { p_restored_by: string; p_story_id: string }
        Returns: boolean
      }
      revoke_all_story_distributions: {
        Args: { p_reason?: string; p_revoked_by: string; p_story_id: string }
        Returns: number
      }
      runtests:
        | { Args: never; Returns: string[] }
        | { Args: { "": string }; Returns: string[] }
      search_schema: {
        Args: { p_search_term: string }
        Returns: {
          column_name: string
          data_type: string
          description: string
          result_type: string
          table_name: string
        }[]
      }
      search_stories: {
        Args: {
          limit_count?: number
          search_query: string
          user_tenant_id: string
        }
        Returns: {
          author_name: string
          content_snippet: string
          relevance_score: number
          story_id: string
          themes: string[]
          title: string
        }[]
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      skip:
        | { Args: { "": string }; Returns: string }
        | { Args: { how_many: number; why: string }; Returns: string }
      throws_ok: { Args: { "": string }; Returns: string }
      todo:
        | { Args: { how_many: number }; Returns: boolean[] }
        | { Args: { how_many: number; why: string }; Returns: boolean[] }
        | { Args: { why: string }; Returns: boolean[] }
        | { Args: { how_many: number; why: string }; Returns: boolean[] }
      todo_end: { Args: never; Returns: boolean[] }
      todo_start:
        | { Args: never; Returns: boolean[] }
        | { Args: { "": string }; Returns: boolean[] }
      update_data_quality_metrics: {
        Args: { org_id: string }
        Returns: undefined
      }
      update_platform_stats: { Args: never; Returns: undefined }
      user_has_organization_role: {
        Args: {
          org_id: string
          required_role: Database["public"]["Enums"]["organization_role"]
          user_id?: string
        }
        Returns: boolean
      }
      user_has_role: { Args: { role_name: string }; Returns: boolean }
      validate_and_increment_token: {
        Args: { p_token: string }
        Returns: {
          is_valid: boolean
          reason: string
          story_id: string
        }[]
      }
      validate_collaboration_settings: {
        Args: { data: Json }
        Returns: boolean
      }
      validate_cultural_identity: { Args: { data: Json }; Returns: boolean }
      validate_cultural_protocols: { Args: { data: Json }; Returns: boolean }
      validate_default_permissions: { Args: { data: Json }; Returns: boolean }
      validate_embed_token: {
        Args: { p_domain: string; p_token_hash: string }
        Returns: {
          error_message: string
          is_valid: boolean
          story_id: string
          token_id: string
        }[]
      }
      validate_governance_structure: { Args: { data: Json }; Returns: boolean }
      validate_role_hierarchy: {
        Args: {
          assigned_role: Database["public"]["Enums"]["organization_role"]
          assigner_role: Database["public"]["Enums"]["organization_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      billing_status: "active" | "trialing" | "past_due" | "paused" | "canceled"
      collaboration_type:
        | "shared_project"
        | "knowledge_exchange"
        | "ceremonial_partnership"
        | "educational_alliance"
        | "cultural_preservation"
        | "research_partnership"
        | "language_revitalization"
      content_type:
        | "story"
        | "transcript"
        | "media_asset"
        | "gallery"
        | "project"
      cultural_permission_level:
        | "sacred"
        | "restricted"
        | "community_only"
        | "educational"
        | "public"
      organization_role:
        | "elder"
        | "cultural_keeper"
        | "knowledge_holder"
        | "admin"
        | "project_leader"
        | "storyteller"
        | "community_member"
        | "guest"
        | "cultural_liaison"
        | "archivist"
      organization_status:
        | "active"
        | "inactive"
        | "under_review"
        | "suspended"
        | "archived"
      organization_tier:
        | "community"
        | "basic"
        | "standard"
        | "premium"
        | "enterprise"
      permission_tier:
        | "private"
        | "trusted_circle"
        | "community"
        | "public"
        | "archive"
      sharing_policy:
        | "open"
        | "request_based"
        | "elder_approved"
        | "restricted"
        | "never"
      tag_category:
        | "traditional_knowledge"
        | "ceremonial"
        | "ecological_knowledge"
        | "medicinal_knowledge"
        | "language_preservation"
        | "cultural_practice"
        | "historical_event"
        | "geographical_place"
        | "family_clan"
        | "seasonal_activity"
        | "artistic_tradition"
        | "spiritual_practice"
      tag_source:
        | "manual"
        | "ai_generated"
        | "community_suggested"
        | "elder_designated"
        | "imported"
    }
    CompositeTypes: {
      _time_trial_type: {
        a_time: number | null
      }
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      billing_status: ["active", "trialing", "past_due", "paused", "canceled"],
      collaboration_type: [
        "shared_project",
        "knowledge_exchange",
        "ceremonial_partnership",
        "educational_alliance",
        "cultural_preservation",
        "research_partnership",
        "language_revitalization",
      ],
      content_type: [
        "story",
        "transcript",
        "media_asset",
        "gallery",
        "project",
      ],
      cultural_permission_level: [
        "sacred",
        "restricted",
        "community_only",
        "educational",
        "public",
      ],
      organization_role: [
        "elder",
        "cultural_keeper",
        "knowledge_holder",
        "admin",
        "project_leader",
        "storyteller",
        "community_member",
        "guest",
        "cultural_liaison",
        "archivist",
      ],
      organization_status: [
        "active",
        "inactive",
        "under_review",
        "suspended",
        "archived",
      ],
      organization_tier: [
        "community",
        "basic",
        "standard",
        "premium",
        "enterprise",
      ],
      permission_tier: [
        "private",
        "trusted_circle",
        "community",
        "public",
        "archive",
      ],
      sharing_policy: [
        "open",
        "request_based",
        "elder_approved",
        "restricted",
        "never",
      ],
      tag_category: [
        "traditional_knowledge",
        "ceremonial",
        "ecological_knowledge",
        "medicinal_knowledge",
        "language_preservation",
        "cultural_practice",
        "historical_event",
        "geographical_place",
        "family_clan",
        "seasonal_activity",
        "artistic_tradition",
        "spiritual_practice",
      ],
      tag_source: [
        "manual",
        "ai_generated",
        "community_suggested",
        "elder_designated",
        "imported",
      ],
    },
  },
} as const
A new version of Supabase CLI is available: v2.67.1 (currently installed v2.58.5)
We recommend updating regularly for new features and bug fixes: https://supabase.com/docs/guides/cli/getting-started#updating-the-supabase-cli
