| table_name                   | column_name                         | data_type                   | is_nullable |
| ---------------------------- | ----------------------------------- | --------------------------- | ----------- |
| activities                   | id                                  | uuid                        | NO          |
| activities                   | organization_id                     | uuid                        | NO          |
| activities                   | tenant_id                           | uuid                        | NO          |
| activities                   | project_id                          | uuid                        | YES         |
| activities                   | title                               | text                        | NO          |
| activities                   | description                         | text                        | YES         |
| activities                   | activity_type                       | text                        | NO          |
| activities                   | service_area                        | text                        | NO          |
| activities                   | activity_date                       | date                        | NO          |
| activities                   | start_time                          | time without time zone      | YES         |
| activities                   | end_time                            | time without time zone      | YES         |
| activities                   | duration_minutes                    | integer                     | YES         |
| activities                   | location                            | text                        | YES         |
| activities                   | on_country                          | boolean                     | YES         |
| activities                   | participant_count                   | integer                     | YES         |
| activities                   | participant_age_range               | text                        | YES         |
| activities                   | participant_gender_breakdown        | jsonb                       | YES         |
| activities                   | language_groups                     | ARRAY                       | YES         |
| activities                   | communities_represented             | ARRAY                       | YES         |
| activities                   | facilitators                        | ARRAY                       | YES         |
| activities                   | elder_involvement                   | boolean                     | YES         |
| activities                   | elders_involved                     | ARRAY                       | YES         |
| activities                   | cultural_authority_present          | boolean                     | YES         |
| activities                   | cultural_protocols_followed         | boolean                     | YES         |
| activities                   | traditional_knowledge_shared        | boolean                     | YES         |
| activities                   | knowledge_topics                    | ARRAY                       | YES         |
| activities                   | language_use                        | ARRAY                       | YES         |
| activities                   | cultural_materials_used             | ARRAY                       | YES         |
| activities                   | budget_allocated                    | numeric                     | YES         |
| activities                   | actual_cost                         | numeric                     | YES         |
| activities                   | partners_involved                   | ARRAY                       | YES         |
| activities                   | transport_provided                  | boolean                     | YES         |
| activities                   | meals_provided                      | boolean                     | YES         |
| activities                   | outputs                             | ARRAY                       | YES         |
| activities                   | outcomes_observed                   | ARRAY                       | YES         |
| activities                   | participant_feedback                | ARRAY                       | YES         |
| activities                   | facilitator_reflections             | text                        | YES         |
| activities                   | photos_taken                        | integer                     | YES         |
| activities                   | videos_recorded                     | integer                     | YES         |
| activities                   | related_outcome_ids                 | ARRAY                       | YES         |
| activities                   | source_document_id                  | uuid                        | YES         |
| activities                   | media_ids                           | ARRAY                       | YES         |
| activities                   | follow_up_required                  | boolean                     | YES         |
| activities                   | follow_up_notes                     | text                        | YES         |
| activities                   | follow_up_date                      | date                        | YES         |
| activities                   | recorded_by                         | uuid                        | YES         |
| activities                   | verified_by                         | uuid                        | YES         |
| activities                   | verification_date                   | date                        | YES         |
| activities                   | created_at                          | timestamp with time zone    | YES         |
| activities                   | updated_at                          | timestamp with time zone    | YES         |
| activity_log                 | id                                  | uuid                        | NO          |
| activity_log                 | created_at                          | timestamp with time zone    | YES         |
| activity_log                 | user_id                             | uuid                        | YES         |
| activity_log                 | user_name                           | text                        | YES         |
| activity_log                 | user_role                           | text                        | YES         |
| activity_log                 | action                              | text                        | NO          |
| activity_log                 | action_category                     | text                        | NO          |
| activity_log                 | entity_type                         | text                        | NO          |
| activity_log                 | entity_id                           | uuid                        | YES         |
| activity_log                 | entity_title                        | text                        | YES         |
| activity_log                 | details                             | jsonb                       | YES         |
| activity_log                 | changes                             | jsonb                       | YES         |
| activity_log                 | organization_id                     | uuid                        | YES         |
| activity_log                 | is_system_action                    | boolean                     | YES         |
| activity_log                 | requires_attention                  | boolean                     | YES         |
| activity_log                 | attention_resolved_at               | timestamp with time zone    | YES         |
| activity_log                 | attention_resolved_by               | uuid                        | YES         |
| admin_messages               | id                                  | uuid                        | NO          |
| admin_messages               | created_at                          | timestamp with time zone    | YES         |
| admin_messages               | updated_at                          | timestamp with time zone    | YES         |
| admin_messages               | sender_id                           | uuid                        | YES         |
| admin_messages               | sender_name                         | text                        | YES         |
| admin_messages               | subject                             | text                        | NO          |
| admin_messages               | body                                | text                        | NO          |
| admin_messages               | message_type                        | text                        | NO          |
| admin_messages               | target_type                         | text                        | NO          |
| admin_messages               | target_organization_id              | uuid                        | YES         |
| admin_messages               | target_project_id                   | uuid                        | YES         |
| admin_messages               | target_user_ids                     | ARRAY                       | YES         |
| admin_messages               | target_filter                       | jsonb                       | YES         |
| admin_messages               | channels                            | ARRAY                       | YES         |
| admin_messages               | scheduled_at                        | timestamp with time zone    | YES         |
| admin_messages               | sent_at                             | timestamp with time zone    | YES         |
| admin_messages               | status                              | text                        | YES         |
| admin_messages               | recipient_count                     | integer                     | YES         |
| admin_messages               | delivered_count                     | integer                     | YES         |
| admin_messages               | read_count                          | integer                     | YES         |
| admin_messages               | template_vars                       | jsonb                       | YES         |
| ai_agent_registry            | id                                  | uuid                        | NO          |
| ai_agent_registry            | name                                | text                        | NO          |
| ai_agent_registry            | display_name                        | text                        | NO          |
| ai_agent_registry            | description                         | text                        | YES         |
| ai_agent_registry            | version                             | text                        | YES         |
| ai_agent_registry            | agent_type                          | text                        | NO          |
| ai_agent_registry            | default_model                       | text                        | YES         |
| ai_agent_registry            | fallback_model                      | text                        | YES         |
| ai_agent_registry            | max_tokens                          | integer                     | YES         |
| ai_agent_registry            | temperature                         | numeric                     | YES         |
| ai_agent_registry            | avg_prompt_tokens                   | integer                     | YES         |
| ai_agent_registry            | avg_completion_tokens               | integer                     | YES         |
| ai_agent_registry            | avg_cost_usd                        | numeric                     | YES         |
| ai_agent_registry            | requires_safety_check               | boolean                     | YES         |
| ai_agent_registry            | requires_elder_review               | boolean                     | YES         |
| ai_agent_registry            | cultural_sensitivity_level          | text                        | YES         |
| ai_agent_registry            | is_active                           | boolean                     | YES         |
| ai_agent_registry            | is_beta                             | boolean                     | YES         |
| ai_agent_registry            | config                              | jsonb                       | YES         |
| ai_agent_registry            | created_at                          | timestamp with time zone    | YES         |
| ai_agent_registry            | updated_at                          | timestamp with time zone    | YES         |
| ai_analysis_jobs             | id                                  | uuid                        | NO          |
| ai_analysis_jobs             | created_at                          | timestamp with time zone    | YES         |
| ai_analysis_jobs             | updated_at                          | timestamp with time zone    | YES         |
| ai_analysis_jobs             | job_type                            | text                        | NO          |
| ai_analysis_jobs             | entity_type                         | text                        | YES         |
| ai_analysis_jobs             | entity_id                           | uuid                        | YES         |
| ai_analysis_jobs             | priority                            | integer                     | YES         |
| ai_analysis_jobs             | scheduled_for                       | timestamp with time zone    | YES         |
| ai_analysis_jobs             | status                              | text                        | YES         |
| ai_analysis_jobs             | started_at                          | timestamp with time zone    | YES         |
| ai_analysis_jobs             | completed_at                        | timestamp with time zone    | YES         |
| ai_analysis_jobs             | result                              | jsonb                       | YES         |
| ai_analysis_jobs             | error_message                       | text                        | YES         |
| ai_analysis_jobs             | retry_count                         | integer                     | YES         |
| ai_analysis_jobs             | max_retries                         | integer                     | YES         |
| ai_analysis_jobs             | triggered_by                        | uuid                        | YES         |
| ai_analysis_jobs             | trigger_reason                      | text                        | YES         |
| ai_moderation_logs           | id                                  | uuid                        | NO          |
| ai_moderation_logs           | content_id                          | uuid                        | NO          |
| ai_moderation_logs           | content_type                        | text                        | NO          |
| ai_moderation_logs           | author_id                           | uuid                        | YES         |
| ai_moderation_logs           | moderation_status                   | text                        | YES         |
| ai_moderation_logs           | cultural_issues_detected            | integer                     | YES         |
| ai_moderation_logs           | elder_review_required               | boolean                     | YES         |
| ai_moderation_logs           | moderated_at                        | timestamp with time zone    | YES         |
| ai_moderation_logs           | elder_id                            | uuid                        | YES         |
| ai_moderation_logs           | elder_decision                      | text                        | YES         |
| ai_moderation_logs           | elder_notes                         | text                        | YES         |
| ai_moderation_logs           | elder_conditions                    | ARRAY                       | YES         |
| ai_moderation_logs           | reviewed_at                         | timestamp with time zone    | YES         |
| ai_moderation_logs           | created_at                          | timestamp with time zone    | YES         |
| ai_processing_logs           | id                                  | uuid                        | NO          |
| ai_processing_logs           | request_id                          | uuid                        | NO          |
| ai_processing_logs           | organization_id                     | uuid                        | YES         |
| ai_processing_logs           | ai_model_used                       | character varying           | NO          |
| ai_processing_logs           | prompt_hash                         | character varying           | YES         |
| ai_processing_logs           | input_content_hash                  | character varying           | YES         |
| ai_processing_logs           | extracted_data                      | jsonb                       | YES         |
| ai_processing_logs           | confidence_scores                   | jsonb                       | YES         |
| ai_processing_logs           | processing_time_ms                  | integer                     | YES         |
| ai_processing_logs           | token_usage                         | jsonb                       | YES         |
| ai_processing_logs           | error_message                       | text                        | YES         |
| ai_processing_logs           | quality_flags                       | jsonb                       | YES         |
| ai_processing_logs           | processing_timestamp                | timestamp with time zone    | YES         |
| ai_processing_logs           | created_at                          | timestamp with time zone    | YES         |
| ai_safety_logs               | id                                  | uuid                        | NO          |
| ai_safety_logs               | user_id                             | uuid                        | YES         |
| ai_safety_logs               | operation                           | text                        | NO          |
| ai_safety_logs               | context_type                        | text                        | YES         |
| ai_safety_logs               | content_preview                     | text                        | YES         |
| ai_safety_logs               | safety_result                       | jsonb                       | NO          |
| ai_safety_logs               | safety_level                        | text                        | YES         |
| ai_safety_logs               | created_at                          | timestamp with time zone    | YES         |
| ai_usage_daily               | id                                  | uuid                        | NO          |
| ai_usage_daily               | date                                | date                        | NO          |
| ai_usage_daily               | tenant_id                           | uuid                        | YES         |
| ai_usage_daily               | organization_id                     | uuid                        | YES         |
| ai_usage_daily               | agent_name                          | text                        | NO          |
| ai_usage_daily               | model                               | text                        | NO          |
| ai_usage_daily               | request_count                       | integer                     | YES         |
| ai_usage_daily               | success_count                       | integer                     | YES         |
| ai_usage_daily               | failure_count                       | integer                     | YES         |
| ai_usage_daily               | total_prompt_tokens                 | bigint                      | YES         |
| ai_usage_daily               | total_completion_tokens             | bigint                      | YES         |
| ai_usage_daily               | total_tokens                        | bigint                      | YES         |
| ai_usage_daily               | total_cost_usd                      | numeric                     | YES         |
| ai_usage_daily               | total_duration_ms                   | bigint                      | YES         |
| ai_usage_daily               | avg_duration_ms                     | integer                     | YES         |
| ai_usage_daily               | p95_duration_ms                     | integer                     | YES         |
| ai_usage_daily               | flagged_count                       | integer                     | YES         |
| ai_usage_daily               | blocked_count                       | integer                     | YES         |
| ai_usage_daily               | created_at                          | timestamp with time zone    | YES         |
| ai_usage_daily               | updated_at                          | timestamp with time zone    | YES         |
| ai_usage_events              | id                                  | uuid                        | NO          |
| ai_usage_events              | tenant_id                           | uuid                        | YES         |
| ai_usage_events              | organization_id                     | uuid                        | YES         |
| ai_usage_events              | user_id                             | uuid                        | YES         |
| ai_usage_events              | agent_name                          | text                        | NO          |
| ai_usage_events              | agent_version                       | text                        | YES         |
| ai_usage_events              | request_id                          | uuid                        | YES         |
| ai_usage_events              | parent_request_id                   | uuid                        | YES         |
| ai_usage_events              | model                               | text                        | NO          |
| ai_usage_events              | model_provider                      | text                        | NO          |
| ai_usage_events              | prompt_tokens                       | integer                     | YES         |
| ai_usage_events              | completion_tokens                   | integer                     | YES         |
| ai_usage_events              | total_tokens                        | integer                     | YES         |
| ai_usage_events              | cost_usd_est                        | numeric                     | YES         |
| ai_usage_events              | duration_ms                         | integer                     | YES         |
| ai_usage_events              | time_to_first_token_ms              | integer                     | YES         |
| ai_usage_events              | status                              | text                        | NO          |
| ai_usage_events              | error_code                          | text                        | YES         |
| ai_usage_events              | error_message                       | text                        | YES         |
| ai_usage_events              | safety_status                       | text                        | YES         |
| ai_usage_events              | safety_flags                        | jsonb                       | YES         |
| ai_usage_events              | input_preview                       | text                        | YES         |
| ai_usage_events              | output_preview                      | text                        | YES         |
| ai_usage_events              | metadata                            | jsonb                       | YES         |
| ai_usage_events              | created_at                          | timestamp with time zone    | YES         |
| ai_usage_events              | started_at                          | timestamp with time zone    | YES         |
| ai_usage_events              | completed_at                        | timestamp with time zone    | YES         |
| analysis_jobs                | id                                  | uuid                        | NO          |
| analysis_jobs                | profile_id                          | uuid                        | YES         |
| analysis_jobs                | job_type                            | text                        | YES         |
| analysis_jobs                | status                              | text                        | YES         |
| analysis_jobs                | transcript_ids                      | ARRAY                       | YES         |
| analysis_jobs                | ai_model_used                       | text                        | YES         |
| analysis_jobs                | processing_time_seconds             | integer                     | YES         |
| analysis_jobs                | results_data                        | jsonb                       | YES         |
| analysis_jobs                | error_message                       | text                        | YES         |
| analysis_jobs                | started_at                          | timestamp with time zone    | YES         |
| analysis_jobs                | completed_at                        | timestamp with time zone    | YES         |
| analysis_jobs                | created_at                          | timestamp with time zone    | YES         |
| analytics_processing_jobs    | id                                  | uuid                        | NO          |
| analytics_processing_jobs    | tenant_id                           | uuid                        | NO          |
| analytics_processing_jobs    | job_type                            | character varying           | NO          |
| analytics_processing_jobs    | job_status                          | character varying           | YES         |
| analytics_processing_jobs    | storyteller_id                      | uuid                        | YES         |
| analytics_processing_jobs    | entity_ids                          | ARRAY                       | YES         |
| analytics_processing_jobs    | entity_types                        | ARRAY                       | YES         |
| analytics_processing_jobs    | total_items                         | integer                     | YES         |
| analytics_processing_jobs    | processed_items                     | integer                     | YES         |
| analytics_processing_jobs    | failed_items                        | integer                     | YES         |
| analytics_processing_jobs    | success_rate                        | numeric                     | YES         |
| analytics_processing_jobs    | results_summary                     | jsonb                       | YES         |
| analytics_processing_jobs    | output_data                         | jsonb                       | YES         |
| analytics_processing_jobs    | error_details                       | text                        | YES         |
| analytics_processing_jobs    | warnings                            | ARRAY                       | YES         |
| analytics_processing_jobs    | started_at                          | timestamp with time zone    | YES         |
| analytics_processing_jobs    | completed_at                        | timestamp with time zone    | YES         |
| analytics_processing_jobs    | processing_time_seconds             | integer                     | YES         |
| analytics_processing_jobs    | ai_model_used                       | character varying           | YES         |
| analytics_processing_jobs    | ai_model_version                    | character varying           | YES         |
| analytics_processing_jobs    | ai_processing_cost                  | numeric                     | YES         |
| analytics_processing_jobs    | priority                            | integer                     | YES         |
| analytics_processing_jobs    | scheduled_for                       | timestamp with time zone    | YES         |
| analytics_processing_jobs    | retry_count                         | integer                     | YES         |
| analytics_processing_jobs    | max_retries                         | integer                     | YES         |
| analytics_processing_jobs    | created_at                          | timestamp with time zone    | YES         |
| analytics_processing_jobs    | updated_at                          | timestamp with time zone    | YES         |
| annual_report_stories        | id                                  | uuid                        | NO          |
| annual_report_stories        | report_id                           | uuid                        | NO          |
| annual_report_stories        | story_id                            | uuid                        | NO          |
| annual_report_stories        | inclusion_reason                    | text                        | YES         |
| annual_report_stories        | section_placement                   | text                        | YES         |
| annual_report_stories        | display_order                       | integer                     | YES         |
| annual_report_stories        | is_featured                         | boolean                     | YES         |
| annual_report_stories        | custom_title                        | text                        | YES         |
| annual_report_stories        | custom_excerpt                      | text                        | YES         |
| annual_report_stories        | include_full_text                   | boolean                     | YES         |
| annual_report_stories        | selected_media_ids                  | ARRAY                       | YES         |
| annual_report_stories        | added_at                            | timestamp without time zone | YES         |
| annual_report_stories        | added_by                            | uuid                        | YES         |
| annual_report_stories        | metadata                            | jsonb                       | YES         |
| annual_reports               | id                                  | uuid                        | NO          |
| annual_reports               | organization_id                     | uuid                        | NO          |
| annual_reports               | report_year                         | integer                     | NO          |
| annual_reports               | reporting_period_start              | date                        | NO          |
| annual_reports               | reporting_period_end                | date                        | NO          |
| annual_reports               | title                               | text                        | NO          |
| annual_reports               | subtitle                            | text                        | YES         |
| annual_reports               | theme                               | text                        | YES         |
| annual_reports               | status                              | text                        | YES         |
| annual_reports               | template_name                       | text                        | YES         |
| annual_reports               | cover_image_url                     | text                        | YES         |
| annual_reports               | featured_story_ids                  | ARRAY                       | YES         |
| annual_reports               | auto_include_criteria               | jsonb                       | YES         |
| annual_reports               | exclude_story_ids                   | ARRAY                       | YES         |
| annual_reports               | sections_config                     | jsonb                       | YES         |
| annual_reports               | executive_summary                   | text                        | YES         |
| annual_reports               | leadership_message                  | text                        | YES         |
| annual_reports               | leadership_message_author           | uuid                        | YES         |
| annual_reports               | year_highlights                     | ARRAY                       | YES         |
| annual_reports               | looking_forward                     | text                        | YES         |
| annual_reports               | acknowledgments                     | text                        | YES         |
| annual_reports               | statistics                          | jsonb                       | YES         |
| annual_reports               | elder_approval_required             | boolean                     | YES         |
| annual_reports               | elder_approvals                     | ARRAY                       | YES         |
| annual_reports               | elder_approval_date                 | timestamp without time zone | YES         |
| annual_reports               | cultural_advisor_review             | boolean                     | YES         |
| annual_reports               | cultural_notes                      | text                        | YES         |
| annual_reports               | auto_generated                      | boolean                     | YES         |
| annual_reports               | generation_date                     | timestamp without time zone | YES         |
| annual_reports               | generated_by                        | uuid                        | YES         |
| annual_reports               | published_date                      | timestamp without time zone | YES         |
| annual_reports               | published_by                        | uuid                        | YES         |
| annual_reports               | pdf_url                             | text                        | YES         |
| annual_reports               | web_version_url                     | text                        | YES         |
| annual_reports               | distribution_list                   | ARRAY                       | YES         |
| annual_reports               | distribution_date                   | timestamp without time zone | YES         |
| annual_reports               | views                               | integer                     | YES         |
| annual_reports               | downloads                           | integer                     | YES         |
| annual_reports               | created_at                          | timestamp without time zone | YES         |
| annual_reports               | updated_at                          | timestamp without time zone | YES         |
| annual_reports               | created_by                          | uuid                        | YES         |
| annual_reports               | metadata                            | jsonb                       | YES         |
| annual_reports_with_stats    | id                                  | uuid                        | YES         |
| annual_reports_with_stats    | organization_id                     | uuid                        | YES         |
| annual_reports_with_stats    | report_year                         | integer                     | YES         |
| annual_reports_with_stats    | reporting_period_start              | date                        | YES         |
| annual_reports_with_stats    | reporting_period_end                | date                        | YES         |
| annual_reports_with_stats    | title                               | text                        | YES         |
| annual_reports_with_stats    | subtitle                            | text                        | YES         |
| annual_reports_with_stats    | theme                               | text                        | YES         |
| annual_reports_with_stats    | status                              | text                        | YES         |
| annual_reports_with_stats    | template_name                       | text                        | YES         |
| annual_reports_with_stats    | cover_image_url                     | text                        | YES         |
| annual_reports_with_stats    | featured_story_ids                  | ARRAY                       | YES         |
| annual_reports_with_stats    | auto_include_criteria               | jsonb                       | YES         |
| annual_reports_with_stats    | exclude_story_ids                   | ARRAY                       | YES         |
| annual_reports_with_stats    | sections_config                     | jsonb                       | YES         |
| annual_reports_with_stats    | executive_summary                   | text                        | YES         |
| annual_reports_with_stats    | leadership_message                  | text                        | YES         |
| annual_reports_with_stats    | leadership_message_author           | uuid                        | YES         |
| annual_reports_with_stats    | year_highlights                     | ARRAY                       | YES         |
| annual_reports_with_stats    | looking_forward                     | text                        | YES         |
| annual_reports_with_stats    | acknowledgments                     | text                        | YES         |
| annual_reports_with_stats    | statistics                          | jsonb                       | YES         |
| annual_reports_with_stats    | elder_approval_required             | boolean                     | YES         |
| annual_reports_with_stats    | elder_approvals                     | ARRAY                       | YES         |
| annual_reports_with_stats    | elder_approval_date                 | timestamp without time zone | YES         |
| annual_reports_with_stats    | cultural_advisor_review             | boolean                     | YES         |
| annual_reports_with_stats    | cultural_notes                      | text                        | YES         |
| annual_reports_with_stats    | auto_generated                      | boolean                     | YES         |
| annual_reports_with_stats    | generation_date                     | timestamp without time zone | YES         |
| annual_reports_with_stats    | generated_by                        | uuid                        | YES         |
| annual_reports_with_stats    | published_date                      | timestamp without time zone | YES         |
| annual_reports_with_stats    | published_by                        | uuid                        | YES         |
| annual_reports_with_stats    | pdf_url                             | text                        | YES         |
| annual_reports_with_stats    | web_version_url                     | text                        | YES         |
| annual_reports_with_stats    | distribution_list                   | ARRAY                       | YES         |
| annual_reports_with_stats    | distribution_date                   | timestamp without time zone | YES         |
| annual_reports_with_stats    | views                               | integer                     | YES         |
| annual_reports_with_stats    | downloads                           | integer                     | YES         |
| annual_reports_with_stats    | created_at                          | timestamp without time zone | YES         |
| annual_reports_with_stats    | updated_at                          | timestamp without time zone | YES         |
| annual_reports_with_stats    | created_by                          | uuid                        | YES         |
| annual_reports_with_stats    | metadata                            | jsonb                       | YES         |
| annual_reports_with_stats    | organization_name                   | text                        | YES         |
| annual_reports_with_stats    | organization_logo                   | text                        | YES         |
| annual_reports_with_stats    | story_count                         | bigint                      | YES         |
| annual_reports_with_stats    | feedback_count                      | bigint                      | YES         |
| annual_reports_with_stats    | average_rating                      | numeric                     | YES         |
| audit_logs                   | id                                  | uuid                        | NO          |
| audit_logs                   | tenant_id                           | uuid                        | NO          |
| audit_logs                   | entity_type                         | text                        | NO          |
| audit_logs                   | entity_id                           | uuid                        | NO          |
| audit_logs                   | action                              | text                        | NO          |
| audit_logs                   | action_category                     | text                        | YES         |
| audit_logs                   | actor_id                            | uuid                        | YES         |
| audit_logs                   | actor_type                          | text                        | YES         |
| audit_logs                   | actor_ip                            | inet                        | YES         |
| audit_logs                   | actor_user_agent                    | text                        | YES         |
| audit_logs                   | previous_state                      | jsonb                       | YES         |
| audit_logs                   | new_state                           | jsonb                       | YES         |
| audit_logs                   | change_summary                      | text                        | YES         |
| audit_logs                   | change_diff                         | jsonb                       | YES         |
| audit_logs                   | related_entity_type                 | text                        | YES         |
| audit_logs                   | related_entity_id                   | uuid                        | YES         |
| audit_logs                   | request_id                          | text                        | YES         |
| audit_logs                   | session_id                          | text                        | YES         |
| audit_logs                   | metadata                            | jsonb                       | YES         |
| audit_logs                   | created_at                          | timestamp with time zone    | YES         |
| blog_posts                   | id                                  | uuid                        | NO          |
| blog_posts                   | project_id                          | uuid                        | YES         |
| blog_posts                   | title                               | text                        | NO          |
| blog_posts                   | excerpt                             | text                        | NO          |
| blog_posts                   | content                             | text                        | NO          |
| blog_posts                   | author                              | text                        | YES         |
| blog_posts                   | type                                | text                        | NO          |
| blog_posts                   | tags                                | ARRAY                       | YES         |
| blog_posts                   | hero_image                          | text                        | YES         |
| blog_posts                   | gallery                             | ARRAY                       | YES         |
| blog_posts                   | status                              | text                        | NO          |
| blog_posts                   | published_at                        | timestamp with time zone    | YES         |
| blog_posts                   | read_time                           | integer                     | YES         |
| blog_posts                   | storyteller_id                      | uuid                        | YES         |
| blog_posts                   | elder_approved                      | boolean                     | YES         |
| blog_posts                   | curated_by                          | text                        | YES         |
| blog_posts                   | cultural_review                     | text                        | YES         |
| blog_posts                   | approved_by                         | uuid                        | YES         |
| blog_posts                   | approved_at                         | timestamp with time zone    | YES         |
| blog_posts                   | created_at                          | timestamp with time zone    | YES         |
| blog_posts                   | updated_at                          | timestamp with time zone    | YES         |
| blog_posts                   | source_notion_page_id               | text                        | YES         |
| consent_change_log           | id                                  | uuid                        | NO          |
| consent_change_log           | consent_id                          | uuid                        | NO          |
| consent_change_log           | story_id                            | uuid                        | NO          |
| consent_change_log           | app_id                              | uuid                        | NO          |
| consent_change_log           | storyteller_id                      | uuid                        | NO          |
| consent_change_log           | change_type                         | text                        | NO          |
| consent_change_log           | previous_state                      | jsonb                       | YES         |
| consent_change_log           | new_state                           | jsonb                       | YES         |
| consent_change_log           | changed_by                          | uuid                        | YES         |
| consent_change_log           | change_reason                       | text                        | YES         |
| consent_change_log           | webhooks_triggered                  | boolean                     | YES         |
| consent_change_log           | webhooks_delivered_at               | timestamp with time zone    | YES         |
| consent_change_log           | created_at                          | timestamp with time zone    | YES         |
| content_approval_queue       | id                                  | uuid                        | NO          |
| content_approval_queue       | empathy_entry_id                    | uuid                        | YES         |
| content_approval_queue       | content_type                        | text                        | NO          |
| content_approval_queue       | title                               | text                        | NO          |
| content_approval_queue       | summary                             | text                        | YES         |
| content_approval_queue       | content_preview                     | text                        | YES         |
| content_approval_queue       | status                              | text                        | YES         |
| content_approval_queue       | privacy_level                       | text                        | YES         |
| content_approval_queue       | submitted_by                        | uuid                        | YES         |
| content_approval_queue       | submitted_at                        | timestamp with time zone    | YES         |
| content_approval_queue       | reviewed_by                         | uuid                        | YES         |
| content_approval_queue       | reviewed_at                         | timestamp with time zone    | YES         |
| content_approval_queue       | review_notes                        | text                        | YES         |
| content_approval_queue       | cultural_review_required            | boolean                     | YES         |
| content_approval_queue       | cultural_reviewer_id                | uuid                        | YES         |
| content_approval_queue       | cultural_review_notes               | text                        | YES         |
| content_approval_queue       | cultural_approved                   | boolean                     | YES         |
| content_approval_queue       | elder_review_required               | boolean                     | YES         |
| content_approval_queue       | elder_reviewer_id                   | uuid                        | YES         |
| content_approval_queue       | elder_review_notes                  | text                        | YES         |
| content_approval_queue       | elder_approved                      | boolean                     | YES         |
| content_approval_queue       | publish_to_website                  | boolean                     | YES         |
| content_approval_queue       | published_at                        | timestamp with time zone    | YES         |
| content_approval_queue       | published_url                       | text                        | YES         |
| content_approval_queue       | created_at                          | timestamp with time zone    | YES         |
| content_approval_queue       | updated_at                          | timestamp with time zone    | YES         |
| content_cache                | id                                  | uuid                        | NO          |
| content_cache                | url_hash                            | character varying           | NO          |
| content_cache                | url                                 | text                        | NO          |
| content_cache                | content_hash                        | character varying           | NO          |
| content_cache                | content_type                        | character varying           | YES         |
| content_cache                | raw_content                         | text                        | YES         |
| content_cache                | processed_content                   | jsonb                       | YES         |
| content_cache                | extraction_metadata                 | jsonb                       | YES         |
| content_cache                | cache_timestamp                     | timestamp with time zone    | YES         |
| content_cache                | expiry_timestamp                    | timestamp with time zone    | YES         |
| content_cache                | access_count                        | integer                     | YES         |
| content_cache                | last_accessed                       | timestamp with time zone    | YES         |
| content_cache                | content_size_bytes                  | integer                     | YES         |
| content_cache                | compression_used                    | boolean                     | YES         |
| cross_narrative_insights     | id                                  | uuid                        | NO          |
| cross_narrative_insights     | tenant_id                           | uuid                        | NO          |
| cross_narrative_insights     | insight_type                        | character varying           | NO          |
| cross_narrative_insights     | insight_category                    | character varying           | YES         |
| cross_narrative_insights     | title                               | character varying           | NO          |
| cross_narrative_insights     | description                         | text                        | NO          |
| cross_narrative_insights     | significance                        | text                        | YES         |
| cross_narrative_insights     | implications                        | text                        | YES         |
| cross_narrative_insights     | recommendations                     | text                        | YES         |
| cross_narrative_insights     | affected_storytellers               | ARRAY                       | YES         |
| cross_narrative_insights     | storyteller_count                   | integer                     | YES         |
| cross_narrative_insights     | geographic_scope                    | ARRAY                       | YES         |
| cross_narrative_insights     | demographic_scope                   | ARRAY                       | YES         |
| cross_narrative_insights     | supporting_quotes                   | ARRAY                       | YES         |
| cross_narrative_insights     | supporting_themes                   | ARRAY                       | YES         |
| cross_narrative_insights     | supporting_connections              | ARRAY                       | YES         |
| cross_narrative_insights     | statistical_evidence                | jsonb                       | YES         |
| cross_narrative_insights     | data_sources                        | ARRAY                       | YES         |
| cross_narrative_insights     | time_period_start                   | timestamp with time zone    | YES         |
| cross_narrative_insights     | time_period_end                     | timestamp with time zone    | YES         |
| cross_narrative_insights     | trend_direction                     | character varying           | YES         |
| cross_narrative_insights     | velocity_score                      | numeric                     | YES         |
| cross_narrative_insights     | confidence_level                    | numeric                     | YES         |
| cross_narrative_insights     | ai_model_version                    | character varying           | YES         |
| cross_narrative_insights     | validation_method                   | character varying           | YES         |
| cross_narrative_insights     | peer_reviewed                       | boolean                     | YES         |
| cross_narrative_insights     | potential_reach                     | integer                     | YES         |
| cross_narrative_insights     | actionability_score                 | numeric                     | YES         |
| cross_narrative_insights     | urgency_level                       | character varying           | YES         |
| cross_narrative_insights     | visibility_level                    | character varying           | YES         |
| cross_narrative_insights     | status                              | character varying           | YES         |
| cross_narrative_insights     | created_at                          | timestamp with time zone    | YES         |
| cross_narrative_insights     | updated_at                          | timestamp with time zone    | YES         |
| cross_sector_insights        | id                                  | uuid                        | NO          |
| cross_sector_insights        | tenant_id                           | uuid                        | NO          |
| cross_sector_insights        | primary_sector                      | text                        | NO          |
| cross_sector_insights        | secondary_sector                    | text                        | NO          |
| cross_sector_insights        | storyteller_connections             | jsonb                       | YES         |
| cross_sector_insights        | shared_themes                       | ARRAY                       | YES         |
| cross_sector_insights        | collaboration_opportunities         | ARRAY                       | YES         |
| cross_sector_insights        | combined_impact_potential           | integer                     | YES         |
| cross_sector_insights        | resource_sharing_opportunities      | ARRAY                       | YES         |
| cross_sector_insights        | policy_change_potential             | ARRAY                       | YES         |
| cross_sector_insights        | supporting_stories                  | ARRAY                       | YES         |
| cross_sector_insights        | ai_confidence_score                 | numeric                     | YES         |
| cross_sector_insights        | human_verified                      | boolean                     | YES         |
| cross_sector_insights        | verification_notes                  | text                        | YES         |
| cross_sector_insights        | geographic_regions                  | ARRAY                       | YES         |
| cross_sector_insights        | created_at                          | timestamp with time zone    | YES         |
| cross_sector_insights        | updated_at                          | timestamp with time zone    | YES         |
| cultural_protocols           | id                                  | uuid                        | NO          |
| cultural_protocols           | tenant_id                           | uuid                        | NO          |
| cultural_protocols           | protocol_name                       | text                        | NO          |
| cultural_protocols           | protocol_type                       | text                        | NO          |
| cultural_protocols           | description                         | text                        | YES         |
| cultural_protocols           | rules                               | jsonb                       | NO          |
| cultural_protocols           | enforcement_level                   | text                        | YES         |
| cultural_protocols           | created_by                          | uuid                        | YES         |
| cultural_protocols           | approved_by                         | uuid                        | YES         |
| cultural_protocols           | effective_date                      | timestamp with time zone    | YES         |
| cultural_protocols           | expiry_date                         | timestamp with time zone    | YES         |
| cultural_protocols           | status                              | text                        | YES         |
| cultural_protocols           | created_at                          | timestamp with time zone    | YES         |
| cultural_protocols           | updated_at                          | timestamp with time zone    | YES         |
| cultural_protocols           | legacy_project_id                   | uuid                        | YES         |
| cultural_protocols           | organization_id                     | uuid                        | YES         |
| cultural_tags                | id                                  | uuid                        | NO          |
| cultural_tags                | created_at                          | timestamp with time zone    | NO          |
| cultural_tags                | name                                | text                        | NO          |
| cultural_tags                | slug                                | text                        | NO          |
| cultural_tags                | description                         | text                        | YES         |
| cultural_tags                | category                            | text                        | NO          |
| cultural_tags                | cultural_sensitivity_level          | text                        | YES         |
| cultural_tags                | usage_count                         | integer                     | YES         |
| data_quality_metrics         | id                                  | uuid                        | NO          |
| data_quality_metrics         | organization_id                     | uuid                        | YES         |
| data_quality_metrics         | metric_type                         | character varying           | NO          |
| data_quality_metrics         | metric_value                        | numeric                     | NO          |
| data_quality_metrics         | metric_details                      | jsonb                       | YES         |
| data_quality_metrics         | measurement_date                    | timestamp with time zone    | YES         |
| data_quality_metrics         | data_source                         | character varying           | YES         |
| data_quality_metrics         | benchmark_comparison                | jsonb                       | YES         |
| data_quality_metrics         | improvement_suggestions             | ARRAY                       | YES         |
| data_quality_metrics         | created_at                          | timestamp with time zone    | YES         |
| data_sources                 | id                                  | uuid                        | NO          |
| data_sources                 | name                                | character varying           | NO          |
| data_sources                 | type                                | character varying           | NO          |
| data_sources                 | base_url                            | text                        | NO          |
| data_sources                 | api_endpoint                        | text                        | YES         |
| data_sources                 | scraping_config                     | jsonb                       | NO          |
| data_sources                 | discovery_patterns                  | jsonb                       | YES         |
| data_sources                 | update_frequency                    | character varying           | YES         |
| data_sources                 | reliability_score                   | numeric                     | YES         |
| data_sources                 | last_successful_scrape              | timestamp with time zone    | YES         |
| data_sources                 | last_error_message                  | text                        | YES         |
| data_sources                 | active                              | boolean                     | YES         |
| data_sources                 | rate_limit_ms                       | integer                     | YES         |
| data_sources                 | max_concurrent_requests             | integer                     | YES         |
| data_sources                 | respect_robots_txt                  | boolean                     | YES         |
| data_sources                 | created_at                          | timestamp with time zone    | YES         |
| data_sources                 | updated_at                          | timestamp with time zone    | YES         |
| deletion_requests            | id                                  | uuid                        | NO          |
| deletion_requests            | user_id                             | uuid                        | NO          |
| deletion_requests            | tenant_id                           | uuid                        | NO          |
| deletion_requests            | request_type                        | text                        | NO          |
| deletion_requests            | scope                               | jsonb                       | YES         |
| deletion_requests            | reason                              | text                        | YES         |
| deletion_requests            | status                              | text                        | YES         |
| deletion_requests            | requested_at                        | timestamp with time zone    | YES         |
| deletion_requests            | verified_at                         | timestamp with time zone    | YES         |
| deletion_requests            | processing_started_at               | timestamp with time zone    | YES         |
| deletion_requests            | completed_at                        | timestamp with time zone    | YES         |
| deletion_requests            | items_total                         | integer                     | YES         |
| deletion_requests            | items_processed                     | integer                     | YES         |
| deletion_requests            | items_failed                        | integer                     | YES         |
| deletion_requests            | processing_log                      | jsonb                       | YES         |
| deletion_requests            | error_message                       | text                        | YES         |
| deletion_requests            | verification_token                  | text                        | YES         |
| deletion_requests            | verification_expires_at             | timestamp with time zone    | YES         |
| deletion_requests            | verification_attempts               | integer                     | YES         |
| deletion_requests            | completion_report                   | jsonb                       | YES         |
| deletion_requests            | data_export_url                     | text                        | YES         |
| deletion_requests            | data_export_expires_at              | timestamp with time zone    | YES         |
| deletion_requests            | processed_by                        | uuid                        | YES         |
| deletion_requests            | admin_notes                         | text                        | YES         |
| deletion_requests            | updated_at                          | timestamp with time zone    | YES         |
| development_plans            | id                                  | uuid                        | NO          |
| development_plans            | profile_id                          | uuid                        | YES         |
| development_plans            | short_term_goals                    | ARRAY                       | YES         |
| development_plans            | long_term_goals                     | ARRAY                       | YES         |
| development_plans            | skill_development_priorities        | ARRAY                       | YES         |
| development_plans            | recommended_courses                 | ARRAY                       | YES         |
| development_plans            | networking_opportunities            | ARRAY                       | YES         |
| development_plans            | mentorship_suggestions              | ARRAY                       | YES         |
| development_plans            | cultural_preservation_activities    | ARRAY                       | YES         |
| development_plans            | community_engagement_opportunities  | ARRAY                       | YES         |
| development_plans            | traditional_knowledge_development   | ARRAY                       | YES         |
| development_plans            | milestones                          | jsonb                       | YES         |
| development_plans            | progress_indicators                 | ARRAY                       | YES         |
| development_plans            | success_metrics                     | ARRAY                       | YES         |
| development_plans            | plan_duration                       | text                        | YES         |
| development_plans            | next_review_date                    | date                        | YES         |
| development_plans            | created_at                          | timestamp with time zone    | YES         |
| development_plans            | updated_at                          | timestamp with time zone    | YES         |
| document_outcomes            | id                                  | uuid                        | NO          |
| document_outcomes            | document_id                         | uuid                        | NO          |
| document_outcomes            | outcome_id                          | uuid                        | NO          |
| document_outcomes            | evidence_type                       | text                        | YES         |
| document_outcomes            | relevance_score                     | numeric                     | YES         |
| document_outcomes            | extraction_method                   | text                        | YES         |
| document_outcomes            | evidence_text                       | text                        | YES         |
| document_outcomes            | evidence_page                       | integer                     | YES         |
| document_outcomes            | confidence_score                    | numeric                     | YES         |
| document_outcomes            | extracted_at                        | timestamp with time zone    | YES         |
| document_outcomes            | extracted_by                        | uuid                        | YES         |
| document_outcomes            | verified_at                         | timestamp with time zone    | YES         |
| document_outcomes            | verified_by                         | uuid                        | YES         |
| dream_organizations          | id                                  | uuid                        | NO          |
| dream_organizations          | name                                | text                        | NO          |
| dream_organizations          | logo_url                            | text                        | YES         |
| dream_organizations          | website_url                         | text                        | YES         |
| dream_organizations          | description                         | text                        | NO          |
| dream_organizations          | why_connect                         | text                        | NO          |
| dream_organizations          | category                            | text                        | NO          |
| dream_organizations          | location_text                       | text                        | YES         |
| dream_organizations          | city                                | text                        | YES         |
| dream_organizations          | country                             | text                        | YES         |
| dream_organizations          | latitude                            | numeric                     | YES         |
| dream_organizations          | longitude                           | numeric                     | YES         |
| dream_organizations          | contact_status                      | text                        | YES         |
| dream_organizations          | priority                            | integer                     | YES         |
| dream_organizations          | contact_notes                       | text                        | YES         |
| dream_organizations          | created_at                          | timestamp with time zone    | YES         |
| dream_organizations          | updated_at                          | timestamp with time zone    | YES         |
| elder_review_dashboard       | id                                  | uuid                        | YES         |
| elder_review_dashboard       | content_id                          | uuid                        | YES         |
| elder_review_dashboard       | content_type                        | text                        | YES         |
| elder_review_dashboard       | cultural_issues                     | jsonb                       | YES         |
| elder_review_dashboard       | priority                            | text                        | YES         |
| elder_review_dashboard       | assigned_elder_id                   | uuid                        | YES         |
| elder_review_dashboard       | assigned_at                         | timestamp with time zone    | YES         |
| elder_review_dashboard       | due_date                            | timestamp with time zone    | YES         |
| elder_review_dashboard       | status                              | text                        | YES         |
| elder_review_dashboard       | community_input_required            | boolean                     | YES         |
| elder_review_dashboard       | reviewed_by                         | uuid                        | YES         |
| elder_review_dashboard       | reviewed_at                         | timestamp with time zone    | YES         |
| elder_review_dashboard       | review_notes                        | text                        | YES         |
| elder_review_dashboard       | review_conditions                   | ARRAY                       | YES         |
| elder_review_dashboard       | created_at                          | timestamp with time zone    | YES         |
| elder_review_dashboard       | updated_at                          | timestamp with time zone    | YES         |
| elder_review_dashboard       | content_title                       | text                        | YES         |
| elder_review_dashboard       | content_preview                     | text                        | YES         |
| elder_review_dashboard       | assigned_elder_name                 | text                        | YES         |
| elder_review_queue           | id                                  | uuid                        | NO          |
| elder_review_queue           | content_id                          | uuid                        | NO          |
| elder_review_queue           | content_type                        | text                        | NO          |
| elder_review_queue           | cultural_issues                     | jsonb                       | YES         |
| elder_review_queue           | priority                            | text                        | NO          |
| elder_review_queue           | assigned_elder_id                   | uuid                        | YES         |
| elder_review_queue           | assigned_at                         | timestamp with time zone    | YES         |
| elder_review_queue           | due_date                            | timestamp with time zone    | YES         |
| elder_review_queue           | status                              | text                        | NO          |
| elder_review_queue           | community_input_required            | boolean                     | YES         |
| elder_review_queue           | reviewed_by                         | uuid                        | YES         |
| elder_review_queue           | reviewed_at                         | timestamp with time zone    | YES         |
| elder_review_queue           | review_notes                        | text                        | YES         |
| elder_review_queue           | review_conditions                   | ARRAY                       | YES         |
| elder_review_queue           | created_at                          | timestamp with time zone    | YES         |
| elder_review_queue           | updated_at                          | timestamp with time zone    | YES         |
| embed_tokens                 | id                                  | uuid                        | NO          |
| embed_tokens                 | story_id                            | uuid                        | NO          |
| embed_tokens                 | tenant_id                           | uuid                        | NO          |
| embed_tokens                 | token                               | text                        | NO          |
| embed_tokens                 | token_hash                          | text                        | NO          |
| embed_tokens                 | allowed_domains                     | ARRAY                       | YES         |
| embed_tokens                 | status                              | text                        | YES         |
| embed_tokens                 | expires_at                          | timestamp with time zone    | YES         |
| embed_tokens                 | usage_count                         | integer                     | YES         |
| embed_tokens                 | last_used_at                        | timestamp with time zone    | YES         |
| embed_tokens                 | last_used_domain                    | text                        | YES         |
| embed_tokens                 | last_used_ip                        | inet                        | YES         |
| embed_tokens                 | revoked_at                          | timestamp with time zone    | YES         |
| embed_tokens                 | revoked_by                          | uuid                        | YES         |
| embed_tokens                 | revocation_reason                   | text                        | YES         |
| embed_tokens                 | allow_analytics                     | boolean                     | YES         |
| embed_tokens                 | show_attribution                    | boolean                     | YES         |
| embed_tokens                 | custom_styles                       | jsonb                       | YES         |
| embed_tokens                 | created_at                          | timestamp with time zone    | YES         |
| embed_tokens                 | updated_at                          | timestamp with time zone    | YES         |
| embed_tokens                 | created_by                          | uuid                        | YES         |
| embed_tokens                 | distribution_id                     | uuid                        | YES         |
| empathy_entries              | id                                  | uuid                        | NO          |
| empathy_entries              | organization_id                     | uuid                        | NO          |
| empathy_entries              | title                               | text                        | NO          |
| empathy_entries              | narrative                           | text                        | NO          |
| empathy_entries              | storyteller_name                    | text                        | YES         |
| empathy_entries              | storyteller_consent                 | boolean                     | YES         |
| empathy_entries              | impact_indicator                    | text                        | YES         |
| empathy_entries              | outcome_level                       | text                        | YES         |
| empathy_entries              | timeframe                           | text                        | YES         |
| empathy_entries              | service_area                        | text                        | YES         |
| empathy_entries              | target_group                        | text                        | YES         |
| empathy_entries              | change_pathway                      | text                        | YES         |
| empathy_entries              | media_urls                          | ARRAY                       | YES         |
| empathy_entries              | document_urls                       | ARRAY                       | YES         |
| empathy_entries              | ready_to_publish                    | boolean                     | YES         |
| empathy_entries              | synced_to_oonchiumpa                | boolean                     | YES         |
| empathy_entries              | sync_date                           | timestamp with time zone    | YES         |
| empathy_entries              | linked_story_id                     | uuid                        | YES         |
| empathy_entries              | linked_outcome_id                   | uuid                        | YES         |
| empathy_entries              | linked_transcript_id                | uuid                        | YES         |
| empathy_entries              | publish_status                      | text                        | YES         |
| empathy_entries              | privacy_level                       | text                        | YES         |
| empathy_entries              | approved_by                         | uuid                        | YES         |
| empathy_entries              | approved_at                         | timestamp with time zone    | YES         |
| empathy_entries              | rejection_reason                    | text                        | YES         |
| empathy_entries              | created_by                          | uuid                        | YES         |
| empathy_entries              | created_at                          | timestamp with time zone    | YES         |
| empathy_entries              | updated_at                          | timestamp with time zone    | YES         |
| empathy_sync_log             | id                                  | uuid                        | NO          |
| empathy_sync_log             | empathy_entry_id                    | uuid                        | YES         |
| empathy_sync_log             | sync_type                           | text                        | NO          |
| empathy_sync_log             | sync_status                         | text                        | NO          |
| empathy_sync_log             | created_story_id                    | uuid                        | YES         |
| empathy_sync_log             | created_outcome_id                  | uuid                        | YES         |
| empathy_sync_log             | created_transcript_id               | uuid                        | YES         |
| empathy_sync_log             | created_media_ids                   | ARRAY                       | YES         |
| empathy_sync_log             | error_message                       | text                        | YES         |
| empathy_sync_log             | error_details                       | jsonb                       | YES         |
| empathy_sync_log             | synced_by                           | uuid                        | YES         |
| empathy_sync_log             | synced_at                           | timestamp with time zone    | YES         |
| empathy_sync_log             | source_data                         | jsonb                       | YES         |
| events                       | id                                  | uuid                        | NO          |
| events                       | tenant_id                           | uuid                        | NO          |
| events                       | user_id                             | uuid                        | YES         |
| events                       | event_type                          | text                        | NO          |
| events                       | event_data                          | jsonb                       | YES         |
| events                       | resource_type                       | text                        | YES         |
| events                       | resource_id                         | uuid                        | YES         |
| events                       | user_agent                          | text                        | YES         |
| events                       | ip_address                          | inet                        | YES         |
| events                       | session_id                          | uuid                        | YES         |
| events                       | anonymized                          | boolean                     | YES         |
| events                       | retention_expires_at                | timestamp with time zone    | YES         |
| events                       | created_at                          | timestamp with time zone    | NO          |
| events_2024_01               | id                                  | uuid                        | NO          |
| events_2024_01               | tenant_id                           | uuid                        | NO          |
| events_2024_01               | user_id                             | uuid                        | YES         |
| events_2024_01               | event_type                          | text                        | NO          |
| events_2024_01               | event_data                          | jsonb                       | YES         |
| events_2024_01               | resource_type                       | text                        | YES         |
| events_2024_01               | resource_id                         | uuid                        | YES         |
| events_2024_01               | user_agent                          | text                        | YES         |
| events_2024_01               | ip_address                          | inet                        | YES         |
| events_2024_01               | session_id                          | uuid                        | YES         |
| events_2024_01               | anonymized                          | boolean                     | YES         |
| events_2024_01               | retention_expires_at                | timestamp with time zone    | YES         |
| events_2024_01               | created_at                          | timestamp with time zone    | NO          |
| events_2025_08               | id                                  | uuid                        | NO          |
| events_2025_08               | tenant_id                           | uuid                        | NO          |
| events_2025_08               | user_id                             | uuid                        | YES         |
| events_2025_08               | event_type                          | text                        | NO          |
| events_2025_08               | event_data                          | jsonb                       | YES         |
| events_2025_08               | resource_type                       | text                        | YES         |
| events_2025_08               | resource_id                         | uuid                        | YES         |
| events_2025_08               | user_agent                          | text                        | YES         |
| events_2025_08               | ip_address                          | inet                        | YES         |
| events_2025_08               | session_id                          | uuid                        | YES         |
| events_2025_08               | anonymized                          | boolean                     | YES         |
| events_2025_08               | retention_expires_at                | timestamp with time zone    | YES         |
| events_2025_08               | created_at                          | timestamp with time zone    | NO          |
| events_2025_09               | id                                  | uuid                        | NO          |
| events_2025_09               | tenant_id                           | uuid                        | NO          |
| events_2025_09               | user_id                             | uuid                        | YES         |
| events_2025_09               | event_type                          | text                        | NO          |
| events_2025_09               | event_data                          | jsonb                       | YES         |
| events_2025_09               | resource_type                       | text                        | YES         |
| events_2025_09               | resource_id                         | uuid                        | YES         |
| events_2025_09               | user_agent                          | text                        | YES         |
| events_2025_09               | ip_address                          | inet                        | YES         |
| events_2025_09               | session_id                          | uuid                        | YES         |
| events_2025_09               | anonymized                          | boolean                     | YES         |
| events_2025_09               | retention_expires_at                | timestamp with time zone    | YES         |
| events_2025_09               | created_at                          | timestamp with time zone    | NO          |
| external_applications        | id                                  | uuid                        | NO          |
| external_applications        | app_name                            | text                        | NO          |
| external_applications        | app_display_name                    | text                        | NO          |
| external_applications        | app_description                     | text                        | YES         |
| external_applications        | api_key_hash                        | text                        | NO          |
| external_applications        | allowed_story_types                 | ARRAY                       | YES         |
| external_applications        | is_active                           | boolean                     | YES         |
| external_applications        | created_at                          | timestamp with time zone    | YES         |
| external_applications        | updated_at                          | timestamp with time zone    | YES         |
| external_applications        | portal_enabled                      | boolean                     | YES         |
| external_applications        | portal_settings                     | jsonb                       | YES         |
| external_applications        | onboarding_completed_at             | timestamp with time zone    | YES         |
| extracted_quotes             | id                                  | uuid                        | NO          |
| extracted_quotes             | quote_text                          | text                        | NO          |
| extracted_quotes             | author_id                           | uuid                        | YES         |
| extracted_quotes             | author_name                         | character varying           | YES         |
| extracted_quotes             | source_type                         | character varying           | YES         |
| extracted_quotes             | source_id                           | uuid                        | YES         |
| extracted_quotes             | context                             | text                        | YES         |
| extracted_quotes             | themes                              | ARRAY                       | YES         |
| extracted_quotes             | sentiment                           | character varying           | YES         |
| extracted_quotes             | impact_score                        | numeric                     | YES         |
| extracted_quotes             | organization_id                     | uuid                        | YES         |
| extracted_quotes             | project_id                          | uuid                        | YES         |
| extracted_quotes             | created_at                          | timestamp with time zone    | YES         |
| extracted_quotes             | search_vector                       | tsvector                    | YES         |
| galleries                    | id                                  | uuid                        | NO          |
| galleries                    | created_at                          | timestamp with time zone    | NO          |
| galleries                    | updated_at                          | timestamp with time zone    | NO          |
| galleries                    | title                               | text                        | NO          |
| galleries                    | slug                                | text                        | NO          |
| galleries                    | description                         | text                        | YES         |
| galleries                    | cover_image_id                      | uuid                        | YES         |
| galleries                    | created_by                          | uuid                        | NO          |
| galleries                    | organization_id                     | uuid                        | YES         |
| galleries                    | cultural_theme                      | text                        | YES         |
| galleries                    | cultural_context                    | jsonb                       | YES         |
| galleries                    | cultural_significance               | text                        | YES         |
| galleries                    | cultural_sensitivity_level          | text                        | YES         |
| galleries                    | visibility                          | text                        | YES         |
| galleries                    | status                              | text                        | YES         |
| galleries                    | photo_count                         | integer                     | YES         |
| galleries                    | view_count                          | integer                     | YES         |
| galleries                    | featured                            | boolean                     | YES         |
| galleries                    | is_public                           | boolean                     | YES         |
| galleries                    | cover_image                         | text                        | YES         |
| gallery_media                | id                                  | uuid                        | NO          |
| gallery_media                | tenant_id                           | uuid                        | NO          |
| gallery_media                | title                               | text                        | NO          |
| gallery_media                | description                         | text                        | YES         |
| gallery_media                | url                                 | text                        | NO          |
| gallery_media                | media_type                          | text                        | NO          |
| gallery_media                | category                            | text                        | YES         |
| gallery_media                | display_order                       | integer                     | YES         |
| gallery_media                | created_at                          | timestamp with time zone    | YES         |
| gallery_media                | updated_at                          | timestamp with time zone    | YES         |
| gallery_media_associations   | id                                  | uuid                        | NO          |
| gallery_media_associations   | created_at                          | timestamp with time zone    | NO          |
| gallery_media_associations   | gallery_id                          | uuid                        | NO          |
| gallery_media_associations   | media_asset_id                      | uuid                        | NO          |
| gallery_media_associations   | sort_order                          | integer                     | YES         |
| gallery_media_associations   | is_cover_image                      | boolean                     | YES         |
| gallery_media_associations   | caption                             | text                        | YES         |
| gallery_media_associations   | cultural_context                    | text                        | YES         |
| gallery_photos               | id                                  | uuid                        | NO          |
| gallery_photos               | gallery_id                          | uuid                        | NO          |
| gallery_photos               | photo_url                           | text                        | NO          |
| gallery_photos               | caption                             | text                        | YES         |
| gallery_photos               | photographer                        | text                        | YES         |
| gallery_photos               | order_index                         | integer                     | YES         |
| gallery_photos               | uploaded_by                         | uuid                        | YES         |
| gallery_photos               | created_at                          | timestamp with time zone    | YES         |
| gallery_photos               | source_empathy_entry_id             | uuid                        | YES         |
| gallery_photos               | sync_date                           | timestamp with time zone    | YES         |
| gallery_photos               | privacy_level                       | text                        | YES         |
| geographic_impact_patterns   | id                                  | uuid                        | NO          |
| geographic_impact_patterns   | tenant_id                           | uuid                        | NO          |
| geographic_impact_patterns   | location_id                         | uuid                        | YES         |
| geographic_impact_patterns   | geographic_scope                    | text                        | NO          |
| geographic_impact_patterns   | region_name                         | text                        | NO          |
| geographic_impact_patterns   | primary_themes                      | ARRAY                       | YES         |
| geographic_impact_patterns   | storyteller_density                 | integer                     | YES         |
| geographic_impact_patterns   | community_engagement_level          | text                        | YES         |
| geographic_impact_patterns   | emerging_issues                     | ARRAY                       | YES         |
| geographic_impact_patterns   | success_patterns                    | ARRAY                       | YES         |
| geographic_impact_patterns   | resource_needs                      | ARRAY                       | YES         |
| geographic_impact_patterns   | collaboration_networks              | jsonb                       | YES         |
| geographic_impact_patterns   | theme_evolution_data                | jsonb                       | YES         |
| geographic_impact_patterns   | impact_trajectory                   | text                        | YES         |
| geographic_impact_patterns   | supporting_storytellers             | ARRAY                       | YES         |
| geographic_impact_patterns   | key_stories                         | ARRAY                       | YES         |
| geographic_impact_patterns   | ai_analysis_confidence              | numeric                     | YES         |
| geographic_impact_patterns   | created_at                          | timestamp with time zone    | YES         |
| geographic_impact_patterns   | updated_at                          | timestamp with time zone    | YES         |
| impact_stats                 | id                                  | uuid                        | NO          |
| impact_stats                 | number                              | text                        | NO          |
| impact_stats                 | label                               | text                        | NO          |
| impact_stats                 | description                         | text                        | YES         |
| impact_stats                 | icon                                | text                        | YES         |
| impact_stats                 | display_order                       | integer                     | YES         |
| impact_stats                 | section                             | text                        | YES         |
| impact_stats                 | is_visible                          | boolean                     | YES         |
| impact_stats                 | created_at                          | timestamp with time zone    | YES         |
| impact_stats                 | updated_at                          | timestamp with time zone    | YES         |
| impact_stories               | id                                  | uuid                        | NO          |
| impact_stories               | profile_id                          | uuid                        | YES         |
| impact_stories               | title                               | text                        | NO          |
| impact_stories               | narrative                           | text                        | NO          |
| impact_stories               | context                             | text                        | YES         |
| impact_stories               | timeframe                           | text                        | YES         |
| impact_stories               | measurable_outcomes                 | ARRAY                       | YES         |
| impact_stories               | beneficiaries                       | ARRAY                       | YES         |
| impact_stories               | scale_of_impact                     | text                        | YES         |
| impact_stories               | suitable_for                        | ARRAY                       | YES         |
| impact_stories               | professional_summary                | text                        | YES         |
| impact_stories               | key_achievements                    | ARRAY                       | YES         |
| impact_stories               | cultural_significance               | text                        | YES         |
| impact_stories               | traditional_knowledge_involved      | boolean                     | YES         |
| impact_stories               | community_approval_required         | boolean                     | YES         |
| impact_stories               | created_at                          | timestamp with time zone    | YES         |
| impact_stories               | updated_at                          | timestamp with time zone    | YES         |
| locations                    | id                                  | uuid                        | NO          |
| locations                    | created_at                          | timestamp with time zone    | YES         |
| locations                    | updated_at                          | timestamp with time zone    | YES         |
| locations                    | name                                | character varying           | NO          |
| locations                    | city                                | character varying           | YES         |
| locations                    | state                               | character varying           | YES         |
| locations                    | country                             | character varying           | YES         |
| locations                    | postal_code                         | character varying           | YES         |
| locations                    | latitude                            | numeric                     | YES         |
| locations                    | longitude                           | numeric                     | YES         |
| media_assets                 | id                                  | uuid                        | NO          |
| media_assets                 | original_filename                   | character varying           | NO          |
| media_assets                 | display_name                        | character varying           | YES         |
| media_assets                 | file_size                           | bigint                      | NO          |
| media_assets                 | file_type                           | character varying           | NO          |
| media_assets                 | storage_bucket                      | character varying           | NO          |
| media_assets                 | storage_path                        | text                        | NO          |
| media_assets                 | cdn_url                             | text                        | YES         |
| media_assets                 | thumbnail_url                       | text                        | YES         |
| media_assets                 | medium_url                          | text                        | YES         |
| media_assets                 | large_url                           | text                        | YES         |
| media_assets                 | processing_status                   | character varying           | YES         |
| media_assets                 | processing_metadata                 | jsonb                       | YES         |
| media_assets                 | cultural_sensitivity_level          | character varying           | NO          |
| media_assets                 | privacy_level                       | character varying           | NO          |
| media_assets                 | requires_consent                    | boolean                     | YES         |
| media_assets                 | consent_granted                     | boolean                     | YES         |
| media_assets                 | consent_granted_by                  | uuid                        | YES         |
| media_assets                 | consent_granted_at                  | timestamp with time zone    | YES         |
| media_assets                 | tenant_id                           | uuid                        | NO          |
| media_assets                 | uploader_id                         | uuid                        | NO          |
| media_assets                 | story_id                            | uuid                        | YES         |
| media_assets                 | collection_id                       | uuid                        | YES         |
| media_assets                 | title                               | character varying           | YES         |
| media_assets                 | description                         | text                        | YES         |
| media_assets                 | alt_text                            | text                        | YES         |
| media_assets                 | width                               | integer                     | YES         |
| media_assets                 | height                              | integer                     | YES         |
| media_assets                 | duration                            | integer                     | YES         |
| media_assets                 | fps                                 | numeric                     | YES         |
| media_assets                 | bitrate                             | integer                     | YES         |
| media_assets                 | latitude                            | numeric                     | YES         |
| media_assets                 | longitude                           | numeric                     | YES         |
| media_assets                 | location_name                       | character varying           | YES         |
| media_assets                 | taken_at                            | timestamp with time zone    | YES         |
| media_assets                 | uploaded_at                         | timestamp with time zone    | YES         |
| media_assets                 | created_at                          | timestamp with time zone    | YES         |
| media_assets                 | updated_at                          | timestamp with time zone    | YES         |
| media_assets                 | view_count                          | integer                     | YES         |
| media_assets                 | download_count                      | integer                     | YES         |
| media_assets                 | last_accessed_at                    | timestamp with time zone    | YES         |
| media_assets                 | search_vector                       | tsvector                    | YES         |
| media_assets                 | filename                            | text                        | YES         |
| media_assets                 | url                                 | text                        | YES         |
| media_assets                 | media_type                          | text                        | YES         |
| media_assets                 | transcript_id                       | uuid                        | YES         |
| media_assets                 | file_path                           | text                        | YES         |
| media_assets                 | mime_type                           | text                        | YES         |
| media_assets                 | uploaded_by                         | uuid                        | YES         |
| media_assets                 | organization_id                     | uuid                        | YES         |
| media_assets                 | project_id                          | uuid                        | YES         |
| media_assets                 | metadata                            | jsonb                       | YES         |
| media_assets                 | checksum                            | text                        | YES         |
| media_assets                 | file_hash                           | text                        | YES         |
| media_assets                 | source_type                         | text                        | YES         |
| media_assets                 | source_url                          | text                        | YES         |
| media_assets                 | transcript_file_path                | text                        | YES         |
| media_assets                 | transcript_format                   | text                        | YES         |
| media_assets                 | status                              | text                        | YES         |
| media_assets                 | visibility                          | text                        | YES         |
| media_assets                 | cultural_sensitivity                | text                        | YES         |
| media_assets                 | elder_approved                      | boolean                     | YES         |
| media_assets                 | consent_obtained                    | boolean                     | YES         |
| media_assets                 | usage_rights                        | text                        | YES         |
| media_assets                 | views_count                         | integer                     | YES         |
| media_assets                 | downloads_count                     | integer                     | YES         |
| media_files                  | id                                  | uuid                        | NO          |
| media_files                  | title                               | text                        | NO          |
| media_files                  | description                         | text                        | YES         |
| media_files                  | type                                | text                        | NO          |
| media_files                  | category                            | text                        | NO          |
| media_files                  | url                                 | text                        | NO          |
| media_files                  | thumbnail_url                       | text                        | YES         |
| media_files                  | file_size                           | bigint                      | NO          |
| media_files                  | duration                            | integer                     | YES         |
| media_files                  | dimensions                          | jsonb                       | YES         |
| media_files                  | tags                                | ARRAY                       | YES         |
| media_files                  | created_by                          | text                        | NO          |
| media_files                  | storyteller_id                      | uuid                        | YES         |
| media_files                  | story_id                            | uuid                        | YES         |
| media_files                  | cultural_sensitivity                | text                        | NO          |
| media_files                  | elder_approved                      | boolean                     | YES         |
| media_files                  | project_id                          | uuid                        | YES         |
| media_files                  | created_at                          | timestamp with time zone    | YES         |
| media_files                  | updated_at                          | timestamp with time zone    | YES         |
| media_import_sessions        | id                                  | uuid                        | NO          |
| media_import_sessions        | created_at                          | timestamp with time zone    | YES         |
| media_import_sessions        | updated_at                          | timestamp with time zone    | YES         |
| media_import_sessions        | user_id                             | uuid                        | NO          |
| media_import_sessions        | organization_id                     | uuid                        | YES         |
| media_import_sessions        | status                              | text                        | YES         |
| media_import_sessions        | files                               | jsonb                       | YES         |
| media_import_sessions        | grouped_stories                     | jsonb                       | YES         |
| media_import_sessions        | stories_created                     | integer                     | YES         |
| media_import_sessions        | media_linked                        | integer                     | YES         |
| media_import_sessions        | errors                              | jsonb                       | YES         |
| media_usage_tracking         | id                                  | uuid                        | NO          |
| media_usage_tracking         | created_at                          | timestamp with time zone    | YES         |
| media_usage_tracking         | media_asset_id                      | uuid                        | YES         |
| media_usage_tracking         | used_in_type                        | text                        | YES         |
| media_usage_tracking         | used_in_id                          | uuid                        | YES         |
| media_usage_tracking         | usage_context                       | text                        | YES         |
| media_usage_tracking         | usage_role                          | text                        | YES         |
| media_usage_tracking         | added_by                            | uuid                        | YES         |
| media_usage_tracking         | ordinal_position                    | integer                     | YES         |
| message_recipients           | id                                  | uuid                        | NO          |
| message_recipients           | message_id                          | uuid                        | NO          |
| message_recipients           | recipient_id                        | uuid                        | NO          |
| message_recipients           | in_app_delivered_at                 | timestamp with time zone    | YES         |
| message_recipients           | in_app_read_at                      | timestamp with time zone    | YES         |
| message_recipients           | email_sent_at                       | timestamp with time zone    | YES         |
| message_recipients           | email_opened_at                     | timestamp with time zone    | YES         |
| message_recipients           | sms_sent_at                         | timestamp with time zone    | YES         |
| message_recipients           | delivery_error                      | text                        | YES         |
| message_recipients           | created_at                          | timestamp with time zone    | YES         |
| moderation_appeals           | id                                  | uuid                        | NO          |
| moderation_appeals           | moderation_request_id               | text                        | NO          |
| moderation_appeals           | user_id                             | uuid                        | NO          |
| moderation_appeals           | appeal_reason                       | text                        | NO          |
| moderation_appeals           | additional_context                  | text                        | YES         |
| moderation_appeals           | appeal_status                       | text                        | NO          |
| moderation_appeals           | submitted_at                        | timestamp with time zone    | NO          |
| moderation_appeals           | reviewed_at                         | timestamp with time zone    | YES         |
| moderation_appeals           | reviewed_by                         | uuid                        | YES         |
| moderation_appeals           | review_notes                        | text                        | YES         |
| moderation_appeals           | created_at                          | timestamp with time zone    | YES         |
| moderation_results           | id                                  | text                        | NO          |
| moderation_results           | content_id                          | uuid                        | NO          |
| moderation_results           | content_type                        | text                        | NO          |
| moderation_results           | status                              | text                        | NO          |
| moderation_results           | moderation_details                  | jsonb                       | NO          |
| moderation_results           | elder_assignment                    | jsonb                       | YES         |
| moderation_results           | review_deadline                     | timestamp with time zone    | YES         |
| moderation_results           | appeals_available                   | boolean                     | YES         |
| moderation_results           | moderated_by                        | text                        | NO          |
| moderation_results           | created_at                          | timestamp with time zone    | YES         |
| moderation_statistics        | date                                | timestamp with time zone    | YES         |
| moderation_statistics        | total_moderated                     | bigint                      | YES         |
| moderation_statistics        | approved_count                      | bigint                      | YES         |
| moderation_statistics        | flagged_count                       | bigint                      | YES         |
| moderation_statistics        | blocked_count                       | bigint                      | YES         |
| moderation_statistics        | elder_review_count                  | bigint                      | YES         |
| narrative_themes             | id                                  | uuid                        | NO          |
| narrative_themes             | tenant_id                           | uuid                        | NO          |
| narrative_themes             | theme_name                          | character varying           | NO          |
| narrative_themes             | theme_category                      | character varying           | YES         |
| narrative_themes             | theme_description                   | text                        | YES         |
| narrative_themes             | ai_confidence_score                 | numeric                     | YES         |
| narrative_themes             | related_themes                      | ARRAY                       | YES         |
| narrative_themes             | sentiment_score                     | numeric                     | YES         |
| narrative_themes             | usage_count                         | integer                     | YES         |
| narrative_themes             | storyteller_count                   | integer                     | YES         |
| narrative_themes             | first_detected_at                   | timestamp with time zone    | YES         |
| narrative_themes             | created_at                          | timestamp with time zone    | YES         |
| narrative_themes             | updated_at                          | timestamp with time zone    | YES         |
| notifications                | id                                  | uuid                        | NO          |
| notifications                | recipient_id                        | uuid                        | NO          |
| notifications                | type                                | text                        | NO          |
| notifications                | title                               | text                        | NO          |
| notifications                | message                             | text                        | NO          |
| notifications                | priority                            | text                        | NO          |
| notifications                | action_url                          | text                        | YES         |
| notifications                | action_label                        | text                        | YES         |
| notifications                | metadata                            | jsonb                       | YES         |
| notifications                | is_read                             | boolean                     | YES         |
| notifications                | read_at                             | timestamp with time zone    | YES         |
| notifications                | expires_at                          | timestamp with time zone    | YES         |
| notifications                | created_at                          | timestamp with time zone    | YES         |
| opportunity_recommendations  | id                                  | uuid                        | NO          |
| opportunity_recommendations  | profile_id                          | uuid                        | YES         |
| opportunity_recommendations  | opportunity_type                    | text                        | YES         |
| opportunity_recommendations  | title                               | text                        | NO          |
| opportunity_recommendations  | organization                        | text                        | YES         |
| opportunity_recommendations  | description                         | text                        | YES         |
| opportunity_recommendations  | match_score                         | integer                     | YES         |
| opportunity_recommendations  | matching_skills                     | ARRAY                       | YES         |
| opportunity_recommendations  | skill_gaps                          | ARRAY                       | YES         |
| opportunity_recommendations  | application_strategy                | text                        | YES         |
| opportunity_recommendations  | suggested_approach                  | text                        | YES         |
| opportunity_recommendations  | cultural_fit_analysis               | text                        | YES         |
| opportunity_recommendations  | funding_amount                      | text                        | YES         |
| opportunity_recommendations  | salary_range                        | text                        | YES         |
| opportunity_recommendations  | application_deadline                | date                        | YES         |
| opportunity_recommendations  | url                                 | text                        | YES         |
| opportunity_recommendations  | cultural_focus                      | boolean                     | YES         |
| opportunity_recommendations  | community_impact_potential          | text                        | YES         |
| opportunity_recommendations  | created_at                          | timestamp with time zone    | YES         |
| opportunity_recommendations  | updated_at                          | timestamp with time zone    | YES         |
| organization_analytics       | id                                  | uuid                        | NO          |
| organization_analytics       | organization_id                     | uuid                        | NO          |
| organization_analytics       | themes                              | jsonb                       | YES         |
| organization_analytics       | theme_count                         | integer                     | YES         |
| organization_analytics       | dominant_themes                     | ARRAY                       | YES         |
| organization_analytics       | key_quotes                          | jsonb                       | YES         |
| organization_analytics       | quote_count                         | integer                     | YES         |
| organization_analytics       | network_data                        | jsonb                       | YES         |
| organization_analytics       | storyteller_connections             | jsonb                       | YES         |
| organization_analytics       | key_insights                        | ARRAY                       | YES         |
| organization_analytics       | executive_summary                   | text                        | YES         |
| organization_analytics       | sentiment_analysis                  | jsonb                       | YES         |
| organization_analytics       | transcript_count                    | integer                     | YES         |
| organization_analytics       | story_count                         | integer                     | YES         |
| organization_analytics       | total_word_count                    | integer                     | YES         |
| organization_analytics       | generated_at                        | timestamp with time zone    | YES         |
| organization_analytics       | updated_at                          | timestamp with time zone    | YES         |
| organization_analytics       | last_analysis_at                    | timestamp with time zone    | YES         |
| organization_contexts        | id                                  | uuid                        | NO          |
| organization_contexts        | organization_id                     | uuid                        | NO          |
| organization_contexts        | mission                             | text                        | YES         |
| organization_contexts        | vision                              | text                        | YES         |
| organization_contexts        | values                              | ARRAY                       | YES         |
| organization_contexts        | approach_description                | text                        | YES         |
| organization_contexts        | cultural_frameworks                 | ARRAY                       | YES         |
| organization_contexts        | key_principles                      | ARRAY                       | YES         |
| organization_contexts        | impact_philosophy                   | text                        | YES         |
| organization_contexts        | impact_domains                      | jsonb                       | YES         |
| organization_contexts        | measurement_approach                | text                        | YES         |
| organization_contexts        | website                             | text                        | YES         |
| organization_contexts        | theory_of_change_url                | text                        | YES         |
| organization_contexts        | impact_report_urls                  | ARRAY                       | YES         |
| organization_contexts        | seed_interview_responses            | jsonb                       | YES         |
| organization_contexts        | imported_document_text              | text                        | YES         |
| organization_contexts        | context_type                        | character varying           | YES         |
| organization_contexts        | extraction_quality_score            | integer                     | YES         |
| organization_contexts        | ai_model_used                       | character varying           | YES         |
| organization_contexts        | created_at                          | timestamp with time zone    | YES         |
| organization_contexts        | updated_at                          | timestamp with time zone    | YES         |
| organization_contexts        | created_by                          | uuid                        | YES         |
| organization_contexts        | last_updated_by                     | uuid                        | YES         |
| organization_duplicates      | id                                  | uuid                        | NO          |
| organization_duplicates      | primary_organization_id             | uuid                        | YES         |
| organization_duplicates      | duplicate_organization_id           | uuid                        | YES         |
| organization_duplicates      | similarity_score                    | numeric                     | NO          |
| organization_duplicates      | matching_fields                     | ARRAY                       | YES         |
| organization_duplicates      | confidence_level                    | character varying           | NO          |
| organization_duplicates      | resolution_status                   | character varying           | YES         |
| organization_duplicates      | resolution_notes                    | text                        | YES         |
| organization_duplicates      | detected_at                         | timestamp with time zone    | YES         |
| organization_duplicates      | resolved_at                         | timestamp with time zone    | YES         |
| organization_duplicates      | resolved_by                         | character varying           | YES         |
| organization_enrichment      | id                                  | uuid                        | NO          |
| organization_enrichment      | organization_id                     | uuid                        | YES         |
| organization_enrichment      | enrichment_type                     | character varying           | NO          |
| organization_enrichment      | data                                | jsonb                       | NO          |
| organization_enrichment      | confidence_score                    | numeric                     | NO          |
| organization_enrichment      | source_metadata                     | jsonb                       | YES         |
| organization_enrichment      | validation_status                   | character varying           | YES         |
| organization_enrichment      | validated_by                        | character varying           | YES         |
| organization_enrichment      | validated_at                        | timestamp with time zone    | YES         |
| organization_enrichment      | validation_notes                    | text                        | YES         |
| organization_enrichment      | active                              | boolean                     | YES         |
| organization_enrichment      | created_at                          | timestamp with time zone    | YES         |
| organization_enrichment      | updated_at                          | timestamp with time zone    | YES         |
| organization_invitations     | id                                  | uuid                        | NO          |
| organization_invitations     | organization_id                     | uuid                        | NO          |
| organization_invitations     | email                               | text                        | NO          |
| organization_invitations     | role                                | text                        | NO          |
| organization_invitations     | profile_id                          | uuid                        | YES         |
| organization_invitations     | invitation_code                     | text                        | NO          |
| organization_invitations     | invited_by                          | uuid                        | YES         |
| organization_invitations     | status                              | text                        | YES         |
| organization_invitations     | expires_at                          | timestamp with time zone    | NO          |
| organization_invitations     | accepted_at                         | timestamp with time zone    | YES         |
| organization_invitations     | created_at                          | timestamp with time zone    | YES         |
| organization_invitations     | metadata                            | jsonb                       | YES         |
| organization_members         | id                                  | uuid                        | NO          |
| organization_members         | organization_id                     | uuid                        | NO          |
| organization_members         | profile_id                          | uuid                        | NO          |
| organization_members         | role                                | text                        | NO          |
| organization_members         | service_id                          | uuid                        | YES         |
| organization_members         | can_approve_stories                 | boolean                     | YES         |
| organization_members         | can_manage_reports                  | boolean                     | YES         |
| organization_members         | can_view_analytics                  | boolean                     | YES         |
| organization_members         | can_manage_members                  | boolean                     | YES         |
| organization_members         | is_active                           | boolean                     | YES         |
| organization_members         | join_date                           | date                        | YES         |
| organization_members         | end_date                            | date                        | YES         |
| organization_members         | created_at                          | timestamp without time zone | YES         |
| organization_members         | updated_at                          | timestamp without time zone | YES         |
| organization_members         | metadata                            | jsonb                       | YES         |
| organization_overview        | id                                  | uuid                        | YES         |
| organization_overview        | tenant_id                           | uuid                        | YES         |
| organization_overview        | name                                | text                        | YES         |
| organization_overview        | description                         | text                        | YES         |
| organization_overview        | type                                | text                        | YES         |
| organization_overview        | location                            | text                        | YES         |
| organization_overview        | website_url                         | text                        | YES         |
| organization_overview        | contact_email                       | text                        | YES         |
| organization_overview        | logo_url                            | text                        | YES         |
| organization_overview        | cultural_protocols                  | jsonb                       | YES         |
| organization_overview        | cultural_significance               | text                        | YES         |
| organization_overview        | created_at                          | timestamp with time zone    | YES         |
| organization_overview        | updated_at                          | timestamp with time zone    | YES         |
| organization_overview        | slug                                | text                        | YES         |
| organization_overview        | subscription_tier                   | text                        | YES         |
| organization_overview        | subscription_status                 | text                        | YES         |
| organization_overview        | domain                              | text                        | YES         |
| organization_overview        | settings                            | jsonb                       | YES         |
| organization_overview        | onboarded_at                        | timestamp with time zone    | YES         |
| organization_overview        | location_id                         | uuid                        | YES         |
| organization_overview        | legal_name                          | text                        | YES         |
| organization_overview        | short_name                          | text                        | YES         |
| organization_overview        | primary_color                       | text                        | YES         |
| organization_overview        | secondary_color                     | text                        | YES         |
| organization_overview        | tagline                             | text                        | YES         |
| organization_overview        | mission_statement                   | text                        | YES         |
| organization_overview        | traditional_country                 | text                        | YES         |
| organization_overview        | language_groups                     | ARRAY                       | YES         |
| organization_overview        | service_locations                   | ARRAY                       | YES         |
| organization_overview        | coordinates                         | point                       | YES         |
| organization_overview        | website                             | text                        | YES         |
| organization_overview        | email                               | text                        | YES         |
| organization_overview        | phone                               | text                        | YES         |
| organization_overview        | postal_address                      | text                        | YES         |
| organization_overview        | physical_address                    | text                        | YES         |
| organization_overview        | established_date                    | date                        | YES         |
| organization_overview        | abn                                 | text                        | YES         |
| organization_overview        | indigenous_controlled               | boolean                     | YES         |
| organization_overview        | governance_model                    | text                        | YES         |
| organization_overview        | empathy_ledger_enabled              | boolean                     | YES         |
| organization_overview        | annual_reports_enabled              | boolean                     | YES         |
| organization_overview        | impact_tracking_enabled             | boolean                     | YES         |
| organization_overview        | has_cultural_protocols              | boolean                     | YES         |
| organization_overview        | elder_approval_required             | boolean                     | YES         |
| organization_overview        | cultural_advisor_ids                | ARRAY                       | YES         |
| organization_overview        | default_story_access_level          | text                        | YES         |
| organization_overview        | require_story_approval              | boolean                     | YES         |
| organization_overview        | created_by                          | uuid                        | YES         |
| organization_overview        | metadata                            | jsonb                       | YES         |
| organization_overview        | member_count                        | bigint                      | YES         |
| organization_overview        | service_count                       | bigint                      | YES         |
| organization_overview        | story_count                         | bigint                      | YES         |
| organization_overview        | report_count                        | bigint                      | YES         |
| organization_roles           | id                                  | uuid                        | NO          |
| organization_roles           | organization_id                     | uuid                        | NO          |
| organization_roles           | profile_id                          | uuid                        | NO          |
| organization_roles           | role                                | USER-DEFINED                | NO          |
| organization_roles           | granted_by                          | uuid                        | YES         |
| organization_roles           | granted_at                          | timestamp with time zone    | YES         |
| organization_roles           | revoked_at                          | timestamp with time zone    | YES         |
| organization_roles           | is_active                           | boolean                     | YES         |
| organization_roles           | created_at                          | timestamp with time zone    | YES         |
| organization_roles           | updated_at                          | timestamp with time zone    | YES         |
| organization_services        | id                                  | uuid                        | NO          |
| organization_services        | organization_id                     | uuid                        | NO          |
| organization_services        | service_name                        | text                        | NO          |
| organization_services        | service_slug                        | text                        | NO          |
| organization_services        | description                         | text                        | YES         |
| organization_services        | service_category                    | text                        | NO          |
| organization_services        | manager_profile_id                  | uuid                        | YES         |
| organization_services        | staff_count                         | integer                     | YES         |
| organization_services        | is_active                           | boolean                     | YES         |
| organization_services        | start_date                          | date                        | YES         |
| organization_services        | clients_served_annual               | integer                     | YES         |
| organization_services        | budget_annual                       | numeric                     | YES         |
| organization_services        | impact_categories                   | ARRAY                       | YES         |
| organization_services        | story_count                         | integer                     | YES         |
| organization_services        | service_color                       | text                        | YES         |
| organization_services        | icon_name                           | text                        | YES         |
| organization_services        | created_at                          | timestamp without time zone | YES         |
| organization_services        | updated_at                          | timestamp without time zone | YES         |
| organization_services        | metadata                            | jsonb                       | YES         |
| organizations                | id                                  | uuid                        | NO          |
| organizations                | tenant_id                           | uuid                        | NO          |
| organizations                | name                                | text                        | NO          |
| organizations                | description                         | text                        | YES         |
| organizations                | type                                | text                        | YES         |
| organizations                | location                            | text                        | YES         |
| organizations                | website_url                         | text                        | YES         |
| organizations                | contact_email                       | text                        | YES         |
| organizations                | logo_url                            | text                        | YES         |
| organizations                | cultural_protocols                  | jsonb                       | YES         |
| organizations                | cultural_significance               | text                        | YES         |
| organizations                | created_at                          | timestamp with time zone    | YES         |
| organizations                | updated_at                          | timestamp with time zone    | YES         |
| organizations                | slug                                | text                        | YES         |
| organizations                | subscription_tier                   | text                        | YES         |
| organizations                | subscription_status                 | text                        | YES         |
| organizations                | domain                              | text                        | YES         |
| organizations                | settings                            | jsonb                       | YES         |
| organizations                | onboarded_at                        | timestamp with time zone    | YES         |
| organizations                | location_id                         | uuid                        | YES         |
| organizations                | legal_name                          | text                        | YES         |
| organizations                | short_name                          | text                        | YES         |
| organizations                | primary_color                       | text                        | YES         |
| organizations                | secondary_color                     | text                        | YES         |
| organizations                | tagline                             | text                        | YES         |
| organizations                | mission_statement                   | text                        | YES         |
| organizations                | traditional_country                 | text                        | YES         |
| organizations                | language_groups                     | ARRAY                       | YES         |
| organizations                | service_locations                   | ARRAY                       | YES         |
| organizations                | coordinates                         | point                       | YES         |
| organizations                | website                             | text                        | YES         |
| organizations                | email                               | text                        | YES         |
| organizations                | phone                               | text                        | YES         |
| organizations                | postal_address                      | text                        | YES         |
| organizations                | physical_address                    | text                        | YES         |
| organizations                | established_date                    | date                        | YES         |
| organizations                | abn                                 | text                        | YES         |
| organizations                | indigenous_controlled               | boolean                     | YES         |
| organizations                | governance_model                    | text                        | YES         |
| organizations                | empathy_ledger_enabled              | boolean                     | YES         |
| organizations                | annual_reports_enabled              | boolean                     | YES         |
| organizations                | impact_tracking_enabled             | boolean                     | YES         |
| organizations                | has_cultural_protocols              | boolean                     | YES         |
| organizations                | elder_approval_required             | boolean                     | YES         |
| organizations                | cultural_advisor_ids                | ARRAY                       | YES         |
| organizations                | default_story_access_level          | text                        | YES         |
| organizations                | require_story_approval              | boolean                     | YES         |
| organizations                | created_by                          | uuid                        | YES         |
| organizations                | metadata                            | jsonb                       | YES         |
| organizations                | justicehub_enabled                  | boolean                     | YES         |
| organizations                | justicehub_synced_at                | timestamp without time zone | YES         |
| organizations                | cultural_identity                   | jsonb                       | NO          |
| organizations                | governance_structure                | jsonb                       | NO          |
| organizations                | default_permissions                 | jsonb                       | NO          |
| organizations                | elder_oversight_required            | boolean                     | YES         |
| organizations                | community_approval_required         | boolean                     | YES         |
| organizations                | collaboration_settings              | jsonb                       | NO          |
| organizations                | shared_vocabularies                 | ARRAY                       | YES         |
| organizations                | status                              | USER-DEFINED                | YES         |
| organizations                | guest_pin                           | character varying           | YES         |
| organizations                | guest_access_enabled                | boolean                     | YES         |
| outcomes                     | id                                  | uuid                        | NO          |
| outcomes                     | organization_id                     | uuid                        | NO          |
| outcomes                     | tenant_id                           | uuid                        | NO          |
| outcomes                     | project_id                          | uuid                        | YES         |
| outcomes                     | title                               | text                        | NO          |
| outcomes                     | description                         | text                        | YES         |
| outcomes                     | outcome_type                        | text                        | NO          |
| outcomes                     | outcome_level                       | text                        | NO          |
| outcomes                     | service_area                        | text                        | NO          |
| outcomes                     | indicator_name                      | text                        | NO          |
| outcomes                     | measurement_method                  | text                        | YES         |
| outcomes                     | baseline_value                      | numeric                     | YES         |
| outcomes                     | target_value                        | numeric                     | YES         |
| outcomes                     | current_value                       | numeric                     | YES         |
| outcomes                     | unit                                | text                        | YES         |
| outcomes                     | qualitative_evidence                | ARRAY                       | YES         |
| outcomes                     | success_stories                     | ARRAY                       | YES         |
| outcomes                     | challenges                          | ARRAY                       | YES         |
| outcomes                     | learnings                           | ARRAY                       | YES         |
| outcomes                     | source_document_ids                 | ARRAY                       | YES         |
| outcomes                     | related_story_ids                   | ARRAY                       | YES         |
| outcomes                     | activity_ids                        | ARRAY                       | YES         |
| outcomes                     | participant_count                   | integer                     | YES         |
| outcomes                     | cultural_protocols_followed         | boolean                     | YES         |
| outcomes                     | elder_involvement                   | boolean                     | YES         |
| outcomes                     | traditional_knowledge_transmitted   | boolean                     | YES         |
| outcomes                     | on_country_component                | boolean                     | YES         |
| outcomes                     | language_use                        | ARRAY                       | YES         |
| outcomes                     | measurement_date                    | date                        | YES         |
| outcomes                     | reported_by                         | uuid                        | YES         |
| outcomes                     | verified_by                         | uuid                        | YES         |
| outcomes                     | verification_date                   | date                        | YES         |
| outcomes                     | data_quality                        | text                        | YES         |
| outcomes                     | created_at                          | timestamp with time zone    | YES         |
| outcomes                     | updated_at                          | timestamp with time zone    | YES         |
| outcomes                     | source_empathy_entry_id             | uuid                        | YES         |
| outcomes                     | sync_date                           | timestamp with time zone    | YES         |
| partner_analytics_daily      | id                                  | uuid                        | NO          |
| partner_analytics_daily      | app_id                              | uuid                        | NO          |
| partner_analytics_daily      | project_id                          | uuid                        | YES         |
| partner_analytics_daily      | date                                | date                        | NO          |
| partner_analytics_daily      | total_views                         | integer                     | YES         |
| partner_analytics_daily      | unique_visitors                     | integer                     | YES         |
| partner_analytics_daily      | total_read_time_seconds             | integer                     | YES         |
| partner_analytics_daily      | avg_scroll_depth                    | numeric                     | YES         |
| partner_analytics_daily      | shares                              | integer                     | YES         |
| partner_analytics_daily      | clicks_to_empathy_ledger            | integer                     | YES         |
| partner_analytics_daily      | stories_displayed                   | integer                     | YES         |
| partner_analytics_daily      | stories_with_engagement             | integer                     | YES         |
| partner_analytics_daily      | top_stories                         | jsonb                       | YES         |
| partner_analytics_daily      | top_countries                       | jsonb                       | YES         |
| partner_analytics_daily      | top_cities                          | jsonb                       | YES         |
| partner_analytics_daily      | created_at                          | timestamp with time zone    | YES         |
| partner_dashboard_summary    | app_id                              | uuid                        | YES         |
| partner_dashboard_summary    | user_id                             | uuid                        | YES         |
| partner_dashboard_summary    | app_name                            | text                        | YES         |
| partner_dashboard_summary    | active_projects                     | bigint                      | YES         |
| partner_dashboard_summary    | approved_stories                    | bigint                      | YES         |
| partner_dashboard_summary    | pending_requests                    | bigint                      | YES         |
| partner_dashboard_summary    | unread_messages                     | bigint                      | YES         |
| partner_dashboard_summary    | views_30d                           | bigint                      | YES         |
| partner_message_templates    | id                                  | uuid                        | NO          |
| partner_message_templates    | name                                | text                        | NO          |
| partner_message_templates    | subject                             | text                        | NO          |
| partner_message_templates    | content                             | text                        | NO          |
| partner_message_templates    | category                            | text                        | YES         |
| partner_message_templates    | variables                           | ARRAY                       | YES         |
| partner_message_templates    | times_used                          | integer                     | YES         |
| partner_message_templates    | is_active                           | boolean                     | YES         |
| partner_message_templates    | created_at                          | timestamp with time zone    | YES         |
| partner_messages             | id                                  | uuid                        | NO          |
| partner_messages             | thread_id                           | uuid                        | NO          |
| partner_messages             | parent_message_id                   | uuid                        | YES         |
| partner_messages             | app_id                              | uuid                        | NO          |
| partner_messages             | storyteller_id                      | uuid                        | NO          |
| partner_messages             | sender_type                         | text                        | NO          |
| partner_messages             | sender_user_id                      | uuid                        | YES         |
| partner_messages             | subject                             | text                        | YES         |
| partner_messages             | content                             | text                        | NO          |
| partner_messages             | content_html                        | text                        | YES         |
| partner_messages             | story_id                            | uuid                        | YES         |
| partner_messages             | project_id                          | uuid                        | YES         |
| partner_messages             | request_id                          | uuid                        | YES         |
| partner_messages             | is_read                             | boolean                     | YES         |
| partner_messages             | read_at                             | timestamp with time zone    | YES         |
| partner_messages             | is_archived                         | boolean                     | YES         |
| partner_messages             | created_at                          | timestamp with time zone    | YES         |
| partner_messages             | metadata                            | jsonb                       | YES         |
| partner_projects             | id                                  | uuid                        | NO          |
| partner_projects             | app_id                              | uuid                        | NO          |
| partner_projects             | name                                | text                        | NO          |
| partner_projects             | description                         | text                        | YES         |
| partner_projects             | slug                                | text                        | NO          |
| partner_projects             | themes                              | ARRAY                       | YES         |
| partner_projects             | story_types                         | ARRAY                       | YES         |
| partner_projects             | geographic_focus                    | text                        | YES         |
| partner_projects             | show_storyteller_names              | boolean                     | YES         |
| partner_projects             | show_storyteller_photos             | boolean                     | YES         |
| partner_projects             | allow_full_content                  | boolean                     | YES         |
| partner_projects             | custom_branding                     | jsonb                       | YES         |
| partner_projects             | embed_config                        | jsonb                       | YES         |
| partner_projects             | is_active                           | boolean                     | YES         |
| partner_projects             | stories_count                       | integer                     | YES         |
| partner_projects             | created_at                          | timestamp with time zone    | YES         |
| partner_projects             | updated_at                          | timestamp with time zone    | YES         |
| partner_team_members         | id                                  | uuid                        | NO          |
| partner_team_members         | app_id                              | uuid                        | NO          |
| partner_team_members         | user_id                             | uuid                        | NO          |
| partner_team_members         | role                                | text                        | YES         |
| partner_team_members         | invited_by                          | uuid                        | YES         |
| partner_team_members         | invited_email                       | text                        | YES         |
| partner_team_members         | invitation_token                    | uuid                        | YES         |
| partner_team_members         | invited_at                          | timestamp with time zone    | YES         |
| partner_team_members         | accepted_at                         | timestamp with time zone    | YES         |
| partner_team_members         | permissions                         | jsonb                       | YES         |
| partner_team_members         | created_at                          | timestamp with time zone    | YES         |
| partners                     | id                                  | uuid                        | NO          |
| partners                     | name                                | text                        | NO          |
| partners                     | category                            | text                        | NO          |
| partners                     | logo_url                            | text                        | YES         |
| partners                     | website                             | text                        | YES         |
| partners                     | display_order                       | integer                     | YES         |
| partners                     | is_visible                          | boolean                     | YES         |
| partners                     | created_at                          | timestamp with time zone    | YES         |
| personal_insights            | id                                  | uuid                        | NO          |
| personal_insights            | profile_id                          | uuid                        | YES         |
| personal_insights            | narrative_themes                    | ARRAY                       | YES         |
| personal_insights            | core_values                         | ARRAY                       | YES         |
| personal_insights            | life_philosophy                     | text                        | YES         |
| personal_insights            | personal_strengths                  | ARRAY                       | YES         |
| personal_insights            | growth_areas                        | ARRAY                       | YES         |
| personal_insights            | cultural_identity_markers           | ARRAY                       | YES         |
| personal_insights            | traditional_knowledge_areas         | ARRAY                       | YES         |
| personal_insights            | community_connections               | ARRAY                       | YES         |
| personal_insights            | transcript_count                    | integer                     | YES         |
| personal_insights            | confidence_score                    | numeric                     | YES         |
| personal_insights            | last_analyzed_at                    | timestamp with time zone    | YES         |
| personal_insights            | created_at                          | timestamp with time zone    | YES         |
| personal_insights            | updated_at                          | timestamp with time zone    | YES         |
| pg_all_foreign_keys          | fk_schema_name                      | name                        | YES         |
| pg_all_foreign_keys          | fk_table_name                       | name                        | YES         |
| pg_all_foreign_keys          | fk_constraint_name                  | name                        | YES         |
| pg_all_foreign_keys          | fk_table_oid                        | oid                         | YES         |
| pg_all_foreign_keys          | fk_columns                          | ARRAY                       | YES         |
| pg_all_foreign_keys          | pk_schema_name                      | name                        | YES         |
| pg_all_foreign_keys          | pk_table_name                       | name                        | YES         |
| pg_all_foreign_keys          | pk_constraint_name                  | name                        | YES         |
| pg_all_foreign_keys          | pk_table_oid                        | oid                         | YES         |
| pg_all_foreign_keys          | pk_index_name                       | name                        | YES         |
| pg_all_foreign_keys          | pk_columns                          | ARRAY                       | YES         |
| pg_all_foreign_keys          | match_type                          | text                        | YES         |
| pg_all_foreign_keys          | on_delete                           | text                        | YES         |
| pg_all_foreign_keys          | on_update                           | text                        | YES         |
| pg_all_foreign_keys          | is_deferrable                       | boolean                     | YES         |
| pg_all_foreign_keys          | is_deferred                         | boolean                     | YES         |
| photo_analytics              | id                                  | uuid                        | NO          |
| photo_analytics              | media_asset_id                      | uuid                        | NO          |
| photo_analytics              | gallery_id                          | uuid                        | YES         |
| photo_analytics              | view_count                          | integer                     | YES         |
| photo_analytics              | download_count                      | integer                     | YES         |
| photo_analytics              | share_count                         | integer                     | YES         |
| photo_analytics              | like_count                          | integer                     | YES         |
| photo_analytics              | comment_count                       | integer                     | YES         |
| photo_analytics              | search_appearances                  | integer                     | YES         |
| photo_analytics              | recommendation_clicks               | integer                     | YES         |
| photo_analytics              | face_recognition_uses               | integer                     | YES         |
| photo_analytics              | tag_contributions                   | integer                     | YES         |
| photo_analytics              | load_time_avg_ms                    | integer                     | YES         |
| photo_analytics              | cdn_cache_hits                      | integer                     | YES         |
| photo_analytics              | storage_tier                        | character varying           | YES         |
| photo_analytics              | last_viewed_at                      | timestamp with time zone    | YES         |
| photo_analytics              | last_downloaded_at                  | timestamp with time zone    | YES         |
| photo_analytics              | last_shared_at                      | timestamp with time zone    | YES         |
| photo_analytics              | cultural_engagement_score           | double precision            | YES         |
| photo_analytics              | community_impact_score              | double precision            | YES         |
| photo_analytics              | tenant_id                           | uuid                        | NO          |
| photo_analytics              | updated_at                          | timestamp with time zone    | YES         |
| photo_faces                  | id                                  | uuid                        | NO          |
| photo_faces                  | media_asset_id                      | uuid                        | NO          |
| photo_faces                  | face_encoding                       | jsonb                       | YES         |
| photo_faces                  | bounding_box                        | jsonb                       | NO          |
| photo_faces                  | landmarks                           | jsonb                       | YES         |
| photo_faces                  | detection_confidence                | double precision            | NO          |
| photo_faces                  | person_id                           | uuid                        | YES         |
| photo_faces                  | person_confidence                   | double precision            | YES         |
| photo_faces                  | is_confirmed                        | boolean                     | YES         |
| photo_faces                  | confirmed_by                        | uuid                        | YES         |
| photo_faces                  | confirmed_at                        | timestamp with time zone    | YES         |
| photo_faces                  | cluster_id                          | uuid                        | YES         |
| photo_faces                  | cluster_confidence                  | double precision            | YES         |
| photo_faces                  | privacy_level                       | character varying           | YES         |
| photo_faces                  | cultural_sensitivity                | character varying           | YES         |
| photo_faces                  | requires_consent                    | boolean                     | YES         |
| photo_faces                  | detection_model                     | character varying           | YES         |
| photo_faces                  | processing_version                  | character varying           | YES         |
| photo_faces                  | tenant_id                           | uuid                        | NO          |
| photo_faces                  | created_at                          | timestamp with time zone    | YES         |
| photo_faces                  | created_by                          | uuid                        | YES         |
| photo_galleries              | id                                  | uuid                        | NO          |
| photo_galleries              | title                               | character varying           | NO          |
| photo_galleries              | description                         | text                        | YES         |
| photo_galleries              | cover_photo_id                      | uuid                        | YES         |
| photo_galleries              | gallery_type                        | character varying           | NO          |
| photo_galleries              | storyteller_id                      | uuid                        | YES         |
| photo_galleries              | organization_id                     | uuid                        | YES         |
| photo_galleries              | project_id                          | uuid                        | YES         |
| photo_galleries              | privacy_level                       | character varying           | NO          |
| photo_galleries              | cultural_sensitivity_level          | character varying           | NO          |
| photo_galleries              | requires_elder_approval             | boolean                     | YES         |
| photo_galleries              | photo_count                         | integer                     | YES         |
| photo_galleries              | total_size_bytes                    | bigint                      | YES         |
| photo_galleries              | last_updated_at                     | timestamp with time zone    | YES         |
| photo_galleries              | created_by                          | uuid                        | NO          |
| photo_galleries              | tenant_id                           | uuid                        | NO          |
| photo_galleries              | created_at                          | timestamp with time zone    | YES         |
| photo_galleries              | updated_at                          | timestamp with time zone    | YES         |
| photo_galleries              | auto_organize_enabled               | boolean                     | YES         |
| photo_galleries              | face_grouping_enabled               | boolean                     | YES         |
| photo_galleries              | location_grouping_enabled           | boolean                     | YES         |
| photo_galleries              | search_vector                       | tsvector                    | YES         |
| photo_gallery_items          | id                                  | uuid                        | NO          |
| photo_gallery_items          | gallery_id                          | uuid                        | NO          |
| photo_gallery_items          | media_asset_id                      | uuid                        | NO          |
| photo_gallery_items          | display_order                       | integer                     | YES         |
| photo_gallery_items          | is_featured                         | boolean                     | YES         |
| photo_gallery_items          | caption                             | text                        | YES         |
| photo_gallery_items          | added_at                            | timestamp with time zone    | YES         |
| photo_gallery_items          | added_by                            | uuid                        | NO          |
| photo_locations              | id                                  | uuid                        | NO          |
| photo_locations              | photo_id                            | uuid                        | NO          |
| photo_locations              | location_id                         | uuid                        | NO          |
| photo_locations              | location_context                    | character varying           | NO          |
| photo_locations              | description                         | text                        | YES         |
| photo_locations              | gps_accuracy_meters                 | integer                     | YES         |
| photo_locations              | is_approximate                      | boolean                     | YES         |
| photo_locations              | created_by                          | uuid                        | NO          |
| photo_locations              | created_at                          | timestamp with time zone    | YES         |
| photo_locations              | updated_at                          | timestamp with time zone    | YES         |
| photo_memories               | id                                  | uuid                        | NO          |
| photo_memories               | title                               | character varying           | NO          |
| photo_memories               | subtitle                            | character varying           | YES         |
| photo_memories               | description                         | text                        | YES         |
| photo_memories               | memory_type                         | character varying           | NO          |
| photo_memories               | media_asset_ids                     | ARRAY                       | NO          |
| photo_memories               | cover_photo_id                      | uuid                        | YES         |
| photo_memories               | gallery_id                          | uuid                        | YES         |
| photo_memories               | for_user_id                         | uuid                        | YES         |
| photo_memories               | for_organization_id                 | uuid                        | YES         |
| photo_memories               | tenant_id                           | uuid                        | NO          |
| photo_memories               | display_date                        | date                        | NO          |
| photo_memories               | is_active                           | boolean                     | YES         |
| photo_memories               | was_viewed                          | boolean                     | YES         |
| photo_memories               | viewed_at                           | timestamp with time zone    | YES         |
| photo_memories               | view_count                          | integer                     | YES         |
| photo_memories               | cultural_sensitivity_level          | character varying           | YES         |
| photo_memories               | privacy_level                       | character varying           | YES         |
| photo_memories               | generation_metadata                 | jsonb                       | YES         |
| photo_memories               | generation_model                    | character varying           | YES         |
| photo_memories               | generation_confidence               | double precision            | YES         |
| photo_memories               | engagement_score                    | double precision            | YES         |
| photo_memories               | quality_score                       | double precision            | YES         |
| photo_memories               | created_by_ai                       | boolean                     | YES         |
| photo_memories               | created_at                          | timestamp with time zone    | YES         |
| photo_memories               | updated_at                          | timestamp with time zone    | YES         |
| photo_memories               | expires_at                          | timestamp with time zone    | YES         |
| photo_organizations          | id                                  | uuid                        | NO          |
| photo_organizations          | photo_id                            | uuid                        | NO          |
| photo_organizations          | organization_id                     | uuid                        | NO          |
| photo_organizations          | organization_role                   | character varying           | NO          |
| photo_organizations          | description                         | text                        | YES         |
| photo_organizations          | created_by                          | uuid                        | NO          |
| photo_organizations          | created_at                          | timestamp with time zone    | YES         |
| photo_organizations          | updated_at                          | timestamp with time zone    | YES         |
| photo_projects               | id                                  | uuid                        | NO          |
| photo_projects               | photo_id                            | uuid                        | NO          |
| photo_projects               | project_id                          | uuid                        | NO          |
| photo_projects               | project_role                        | character varying           | NO          |
| photo_projects               | description                         | text                        | YES         |
| photo_projects               | created_by                          | uuid                        | NO          |
| photo_projects               | created_at                          | timestamp with time zone    | YES         |
| photo_projects               | updated_at                          | timestamp with time zone    | YES         |
| photo_storytellers           | id                                  | uuid                        | NO          |
| photo_storytellers           | photo_id                            | uuid                        | NO          |
| photo_storytellers           | storyteller_id                      | uuid                        | NO          |
| photo_storytellers           | relationship_type                   | character varying           | NO          |
| photo_storytellers           | role_description                    | text                        | YES         |
| photo_storytellers           | consent_given                       | boolean                     | YES         |
| photo_storytellers           | consent_date                        | timestamp with time zone    | YES         |
| photo_storytellers           | privacy_override                    | character varying           | YES         |
| photo_storytellers           | created_by                          | uuid                        | NO          |
| photo_storytellers           | created_at                          | timestamp with time zone    | YES         |
| photo_storytellers           | updated_at                          | timestamp with time zone    | YES         |
| photo_tags                   | id                                  | uuid                        | NO          |
| photo_tags                   | media_asset_id                      | uuid                        | NO          |
| photo_tags                   | tag_type                            | character varying           | NO          |
| photo_tags                   | tag_value                           | text                        | NO          |
| photo_tags                   | confidence_score                    | double precision            | YES         |
| photo_tags                   | source                              | character varying           | NO          |
| photo_tags                   | person_id                           | uuid                        | YES         |
| photo_tags                   | organization_id                     | uuid                        | YES         |
| photo_tags                   | project_id                          | uuid                        | YES         |
| photo_tags                   | location_name                       | character varying           | YES         |
| photo_tags                   | latitude                            | numeric                     | YES         |
| photo_tags                   | longitude                           | numeric                     | YES         |
| photo_tags                   | location_confidence                 | double precision            | YES         |
| photo_tags                   | is_verified                         | boolean                     | YES         |
| photo_tags                   | verified_by                         | uuid                        | YES         |
| photo_tags                   | verified_at                         | timestamp with time zone    | YES         |
| photo_tags                   | cultural_sensitivity                | character varying           | YES         |
| photo_tags                   | requires_review                     | boolean                     | YES         |
| photo_tags                   | tenant_id                           | uuid                        | NO          |
| photo_tags                   | created_at                          | timestamp with time zone    | YES         |
| photo_tags                   | created_by                          | uuid                        | YES         |
| photo_tags                   | updated_at                          | timestamp with time zone    | YES         |
| platform_analytics           | id                                  | uuid                        | NO          |
| platform_analytics           | tenant_id                           | uuid                        | NO          |
| platform_analytics           | period_start                        | timestamp with time zone    | NO          |
| platform_analytics           | period_end                          | timestamp with time zone    | NO          |
| platform_analytics           | period_type                         | character varying           | NO          |
| platform_analytics           | total_storytellers                  | integer                     | YES         |
| platform_analytics           | active_storytellers                 | integer                     | YES         |
| platform_analytics           | new_storytellers                    | integer                     | YES         |
| platform_analytics           | returning_storytellers              | integer                     | YES         |
| platform_analytics           | total_stories                       | integer                     | YES         |
| platform_analytics           | stories_created                     | integer                     | YES         |
| platform_analytics           | total_transcripts                   | integer                     | YES         |
| platform_analytics           | transcripts_processed               | integer                     | YES         |
| platform_analytics           | total_quotes                        | integer                     | YES         |
| platform_analytics           | quotes_extracted                    | integer                     | YES         |
| platform_analytics           | total_themes                        | integer                     | YES         |
| platform_analytics           | new_themes_discovered               | integer                     | YES         |
| platform_analytics           | top_themes                          | jsonb                       | YES         |
| platform_analytics           | theme_distribution                  | jsonb                       | YES         |
| platform_analytics           | trending_themes                     | ARRAY                       | YES         |
| platform_analytics           | total_connections                   | integer                     | YES         |
| platform_analytics           | new_connections                     | integer                     | YES         |
| platform_analytics           | connection_success_rate             | numeric                     | YES         |
| platform_analytics           | average_connections_per_storyteller | numeric                     | YES         |
| platform_analytics           | average_story_quality               | numeric                     | YES         |
| platform_analytics           | average_ai_confidence               | numeric                     | YES         |
| platform_analytics           | high_impact_stories_count           | integer                     | YES         |
| platform_analytics           | viral_content_count                 | integer                     | YES         |
| platform_analytics           | storyteller_locations               | jsonb                       | YES         |
| platform_analytics           | demographic_distribution            | jsonb                       | YES         |
| platform_analytics           | geographic_diversity_score          | numeric                     | YES         |
| platform_analytics           | cultural_diversity_score            | numeric                     | YES         |
| platform_analytics           | user_retention_rate                 | numeric                     | YES         |
| platform_analytics           | content_creation_velocity           | numeric                     | YES         |
| platform_analytics           | community_health_score              | numeric                     | YES         |
| platform_analytics           | system_performance_score            | numeric                     | YES         |
| platform_analytics           | ai_jobs_completed                   | integer                     | YES         |
| platform_analytics           | ai_processing_success_rate          | numeric                     | YES         |
| platform_analytics           | average_ai_processing_time          | numeric                     | YES         |
| platform_analytics           | created_at                          | timestamp with time zone    | YES         |
| platform_stats_cache         | id                                  | text                        | NO          |
| platform_stats_cache         | updated_at                          | timestamp with time zone    | YES         |
| platform_stats_cache         | total_stories                       | integer                     | YES         |
| platform_stats_cache         | total_storytellers                  | integer                     | YES         |
| platform_stats_cache         | total_organizations                 | integer                     | YES         |
| platform_stats_cache         | total_projects                      | integer                     | YES         |
| platform_stats_cache         | total_transcripts                   | integer                     | YES         |
| platform_stats_cache         | total_media_assets                  | integer                     | YES         |
| platform_stats_cache         | stories_last_7_days                 | integer                     | YES         |
| platform_stats_cache         | stories_last_30_days                | integer                     | YES         |
| platform_stats_cache         | active_users_last_7_days            | integer                     | YES         |
| platform_stats_cache         | active_users_last_30_days           | integer                     | YES         |
| platform_stats_cache         | stories_with_analysis               | integer                     | YES         |
| platform_stats_cache         | analysis_coverage_percent           | numeric                     | YES         |
| platform_stats_cache         | stale_analysis_count                | integer                     | YES         |
| platform_stats_cache         | total_storage_bytes                 | bigint                      | YES         |
| platform_stats_cache         | theme_trends                        | jsonb                       | YES         |
| platform_stats_cache         | pending_reviews                     | integer                     | YES         |
| platform_stats_cache         | pending_elder_reviews               | integer                     | YES         |
| platform_stats_cache         | failed_uploads                      | integer                     | YES         |
| platform_stats_cache         | ai_jobs_pending                     | integer                     | YES         |
| platform_stats_cache         | ai_jobs_failed_24h                  | integer                     | YES         |
| platform_stats_cache         | webhook_failures_24h                | integer                     | YES         |
| privacy_changes              | id                                  | uuid                        | NO          |
| privacy_changes              | user_id                             | uuid                        | YES         |
| privacy_changes              | field_name                          | text                        | YES         |
| privacy_changes              | old_value                           | text                        | YES         |
| privacy_changes              | new_value                           | text                        | YES         |
| privacy_changes              | changes                             | jsonb                       | YES         |
| privacy_changes              | impact                              | jsonb                       | YES         |
| privacy_changes              | reason                              | text                        | YES         |
| privacy_changes              | timestamp                           | timestamp with time zone    | YES         |
| processing_jobs              | id                                  | uuid                        | NO          |
| processing_jobs              | type                                | character varying           | NO          |
| processing_jobs              | status                              | character varying           | YES         |
| processing_jobs              | priority                            | character varying           | YES         |
| processing_jobs              | source_urls                         | ARRAY                       | YES         |
| processing_jobs              | data_source_id                      | uuid                        | YES         |
| processing_jobs              | configuration                       | jsonb                       | NO          |
| processing_jobs              | progress_percentage                 | integer                     | YES         |
| processing_jobs              | results_summary                     | jsonb                       | YES         |
| processing_jobs              | error_message                       | text                        | YES         |
| processing_jobs              | retry_count                         | integer                     | YES         |
| processing_jobs              | max_retries                         | integer                     | YES         |
| processing_jobs              | scheduled_at                        | timestamp with time zone    | YES         |
| processing_jobs              | started_at                          | timestamp with time zone    | YES         |
| processing_jobs              | completed_at                        | timestamp with time zone    | YES         |
| processing_jobs              | estimated_completion                | timestamp with time zone    | YES         |
| processing_jobs              | created_by                          | character varying           | YES         |
| processing_jobs              | created_at                          | timestamp with time zone    | YES         |
| processing_jobs              | updated_at                          | timestamp with time zone    | YES         |
| professional_competencies    | id                                  | uuid                        | NO          |
| professional_competencies    | profile_id                          | uuid                        | YES         |
| professional_competencies    | skill_name                          | text                        | NO          |
| professional_competencies    | skill_category                      | text                        | YES         |
| professional_competencies    | competency_level                    | integer                     | YES         |
| professional_competencies    | market_value_score                  | integer                     | YES         |
| professional_competencies    | evidence_from_transcript            | text                        | YES         |
| professional_competencies    | real_world_applications             | ARRAY                       | YES         |
| professional_competencies    | transferable_contexts               | ARRAY                       | YES         |
| professional_competencies    | development_opportunities           | ARRAY                       | YES         |
| professional_competencies    | skill_gap_analysis                  | text                        | YES         |
| professional_competencies    | created_at                          | timestamp with time zone    | YES         |
| professional_competencies    | updated_at                          | timestamp with time zone    | YES         |
| profile_galleries            | id                                  | uuid                        | NO          |
| profile_galleries            | created_at                          | timestamp with time zone    | YES         |
| profile_galleries            | profile_id                          | uuid                        | NO          |
| profile_galleries            | gallery_id                          | uuid                        | NO          |
| profile_galleries            | role                                | character varying           | YES         |
| profile_locations            | id                                  | uuid                        | NO          |
| profile_locations            | created_at                          | timestamp with time zone    | YES         |
| profile_locations            | profile_id                          | uuid                        | NO          |
| profile_locations            | location_id                         | uuid                        | NO          |
| profile_locations            | is_primary                          | boolean                     | YES         |
| profile_locations            | location_type                       | character varying           | YES         |
| profile_organizations        | id                                  | uuid                        | NO          |
| profile_organizations        | created_at                          | timestamp with time zone    | YES         |
| profile_organizations        | profile_id                          | uuid                        | NO          |
| profile_organizations        | organization_id                     | uuid                        | NO          |
| profile_organizations        | role                                | character varying           | YES         |
| profile_organizations        | joined_at                           | timestamp with time zone    | YES         |
| profile_organizations        | is_active                           | boolean                     | YES         |
| profile_projects             | id                                  | uuid                        | NO          |
| profile_projects             | created_at                          | timestamp with time zone    | YES         |
| profile_projects             | profile_id                          | uuid                        | NO          |
| profile_projects             | project_id                          | uuid                        | NO          |
| profile_projects             | role                                | character varying           | YES         |
| profile_projects             | joined_at                           | timestamp with time zone    | YES         |
| profiles                     | id                                  | uuid                        | NO          |
| profiles                     | tenant_id                           | uuid                        | NO          |
| profiles                     | full_name                           | text                        | YES         |
| profiles                     | email                               | text                        | YES         |
| profiles                     | bio                                 | text                        | YES         |
| profiles                     | profile_image_url                   | text                        | YES         |
| profiles                     | cultural_background                 | text                        | YES         |
| profiles                     | preferred_pronouns                  | text                        | YES         |
| profiles                     | tenant_roles                        | ARRAY                       | YES         |
| profiles                     | cross_tenant_sharing                | boolean                     | YES         |
| profiles                     | legacy_storyteller_id               | uuid                        | YES         |
| profiles                     | airtable_record_id                  | text                        | YES         |
| profiles                     | geographic_connections              | jsonb                       | YES         |
| profiles                     | consent_given                       | boolean                     | YES         |
| profiles                     | consent_date                        | timestamp with time zone    | YES         |
| profiles                     | consent_version                     | text                        | YES         |
| profiles                     | privacy_preferences                 | jsonb                       | YES         |
| profiles                     | story_visibility_level              | text                        | YES         |
| profiles                     | quote_sharing_consent               | boolean                     | YES         |
| profiles                     | impact_story_promotion              | boolean                     | YES         |
| profiles                     | wisdom_sharing_level                | text                        | YES         |
| profiles                     | open_to_mentoring                   | boolean                     | YES         |
| profiles                     | available_for_collaboration         | boolean                     | YES         |
| profiles                     | seeking_organizational_connections  | boolean                     | YES         |
| profiles                     | interested_in_peer_support          | boolean                     | YES         |
| profiles                     | narrative_ownership_level           | text                        | YES         |
| profiles                     | attribution_preferences             | jsonb                       | YES         |
| profiles                     | story_use_permissions               | jsonb                       | YES         |
| profiles                     | platform_benefit_sharing            | jsonb                       | YES         |
| profiles                     | ai_processing_consent               | boolean                     | YES         |
| profiles                     | ai_consent_date                     | timestamp with time zone    | YES         |
| profiles                     | ai_consent_scope                    | jsonb                       | YES         |
| profiles                     | generated_themes                    | jsonb                       | YES         |
| profiles                     | created_at                          | timestamp with time zone    | YES         |
| profiles                     | updated_at                          | timestamp with time zone    | YES         |
| profiles                     | display_name                        | text                        | YES         |
| profiles                     | personal_statement                  | text                        | YES         |
| profiles                     | life_motto                          | text                        | YES         |
| profiles                     | phone_number                        | text                        | YES         |
| profiles                     | date_of_birth                       | date                        | YES         |
| profiles                     | age_range                           | text                        | YES         |
| profiles                     | current_role                        | text                        | YES         |
| profiles                     | current_organization                | text                        | YES         |
| profiles                     | years_of_experience                 | integer                     | YES         |
| profiles                     | professional_summary                | text                        | YES         |
| profiles                     | industry_sectors                    | ARRAY                       | YES         |
| profiles                     | profile_visibility                  | text                        | YES         |
| profiles                     | profile_image_alt_text              | text                        | YES         |
| profiles                     | website_url                         | text                        | YES         |
| profiles                     | linkedin_profile_url                | text                        | YES         |
| profiles                     | resume_url                          | text                        | YES         |
| profiles                     | legacy_organization_id              | uuid                        | YES         |
| profiles                     | legacy_project_id                   | uuid                        | YES         |
| profiles                     | legacy_location_id                  | uuid                        | YES         |
| profiles                     | legacy_user_id                      | uuid                        | YES         |
| profiles                     | legacy_airtable_id                  | text                        | YES         |
| profiles                     | migrated_at                         | timestamp with time zone    | YES         |
| profiles                     | migration_quality_score             | integer                     | YES         |
| profiles                     | ai_enhanced_bio                     | text                        | YES         |
| profiles                     | ai_personality_insights             | jsonb                       | YES         |
| profiles                     | ai_themes                           | jsonb                       | YES         |
| profiles                     | basic_info_visibility               | text                        | YES         |
| profiles                     | professional_visibility             | text                        | YES         |
| profiles                     | cultural_identity_visibility        | text                        | YES         |
| profiles                     | cultural_communities_visibility     | text                        | YES         |
| profiles                     | language_communities_visibility     | text                        | YES         |
| profiles                     | stories_visibility                  | text                        | YES         |
| profiles                     | transcripts_visibility              | text                        | YES         |
| profiles                     | media_visibility                    | text                        | YES         |
| profiles                     | allow_ai_analysis                   | boolean                     | YES         |
| profiles                     | allow_research_participation        | boolean                     | YES         |
| profiles                     | allow_community_recommendations     | boolean                     | YES         |
| profiles                     | requires_elder_review               | boolean                     | YES         |
| profiles                     | traditional_knowledge_flag          | boolean                     | YES         |
| profiles                     | cultural_protocol_level             | text                        | YES         |
| profiles                     | profile_status                      | text                        | YES         |
| profiles                     | is_storyteller                      | boolean                     | YES         |
| profiles                     | is_elder                            | boolean                     | YES         |
| profiles                     | onboarding_completed                | boolean                     | YES         |
| profiles                     | video_introduction_url              | text                        | YES         |
| profiles                     | video_portfolio_urls                | ARRAY                       | YES         |
| profiles                     | featured_video_url                  | text                        | YES         |
| profiles                     | video_metadata                      | jsonb                       | YES         |
| profiles                     | is_featured                         | boolean                     | YES         |
| profiles                     | total_impact_insights               | integer                     | YES         |
| profiles                     | primary_impact_type                 | text                        | YES         |
| profiles                     | impact_confidence_score             | numeric                     | YES         |
| profiles                     | cultural_protocol_score             | numeric                     | YES         |
| profiles                     | community_leadership_score          | numeric                     | YES         |
| profiles                     | knowledge_transmission_score        | numeric                     | YES         |
| profiles                     | healing_integration_score           | numeric                     | YES         |
| profiles                     | relationship_building_score         | numeric                     | YES         |
| profiles                     | system_navigation_score             | numeric                     | YES         |
| profiles                     | last_impact_analysis                | timestamp with time zone    | YES         |
| profiles                     | impact_badges                       | ARRAY                       | YES         |
| profiles                     | storyteller_ranking                 | integer                     | YES         |
| profiles                     | analytics_preferences               | jsonb                       | YES         |
| profiles                     | network_visibility                  | character varying           | YES         |
| profiles                     | recommendation_opt_in               | boolean                     | YES         |
| profiles                     | impact_score                        | numeric                     | YES         |
| profiles                     | narrative_themes                    | ARRAY                       | YES         |
| profiles                     | connection_strength_scores          | jsonb                       | YES         |
| profiles                     | impact_focus_areas                  | ARRAY                       | YES         |
| profiles                     | expertise_areas                     | ARRAY                       | YES         |
| profiles                     | collaboration_preferences           | jsonb                       | YES         |
| profiles                     | storytelling_methods                | ARRAY                       | YES         |
| profiles                     | community_roles                     | ARRAY                       | YES         |
| profiles                     | change_maker_type                   | text                        | YES         |
| profiles                     | geographic_scope                    | text                        | YES         |
| profiles                     | years_of_community_work             | integer                     | YES         |
| profiles                     | mentor_availability                 | boolean                     | YES         |
| profiles                     | speaking_availability               | boolean                     | YES         |
| profiles                     | primary_organization_id             | uuid                        | YES         |
| profiles                     | location_id                         | uuid                        | YES         |
| profiles                     | avatar_media_id                     | uuid                        | YES         |
| profiles                     | cover_media_id                      | uuid                        | YES         |
| profiles                     | first_name                          | text                        | YES         |
| profiles                     | last_name                           | text                        | YES         |
| profiles                     | preferred_name                      | text                        | YES         |
| profiles                     | pronouns                            | text                        | YES         |
| profiles                     | traditional_knowledge_keeper        | boolean                     | YES         |
| profiles                     | cultural_affiliations               | ARRAY                       | YES         |
| profiles                     | languages_spoken                    | ARRAY                       | YES         |
| profiles                     | timezone                            | text                        | YES         |
| profiles                     | storytelling_experience             | text                        | YES         |
| profiles                     | cultural_permissions                | jsonb                       | YES         |
| profiles                     | cultural_protocols                  | jsonb                       | YES         |
| profiles                     | social_links                        | jsonb                       | YES         |
| profiles                     | emergency_contact                   | jsonb                       | YES         |
| profiles                     | address                             | jsonb                       | YES         |
| profiles                     | dietary_requirements                | ARRAY                       | YES         |
| profiles                     | accessibility_needs                 | ARRAY                       | YES         |
| profiles                     | preferred_communication             | ARRAY                       | YES         |
| profiles                     | interests                           | ARRAY                       | YES         |
| profiles                     | occupation                          | text                        | YES         |
| profiles                     | job_title                           | text                        | YES         |
| profiles                     | user_id                             | uuid                        | YES         |
| profiles                     | community_role                      | text                        | YES         |
| profiles                     | phone                               | text                        | YES         |
| profiles                     | gender                              | text                        | YES         |
| profiles                     | indigenous_status                   | text                        | YES         |
| profiles                     | location                            | text                        | YES         |
| profiles                     | traditional_country                 | text                        | YES         |
| profiles                     | language_group                      | text                        | YES         |
| profiles                     | storyteller_type                    | text                        | YES         |
| profiles                     | is_cultural_advisor                 | boolean                     | YES         |
| profiles                     | is_service_provider                 | boolean                     | YES         |
| profiles                     | stories_contributed                 | integer                     | YES         |
| profiles                     | last_story_date                     | timestamp without time zone | YES         |
| profiles                     | engagement_score                    | integer                     | YES         |
| profiles                     | can_share_traditional_knowledge     | boolean                     | YES         |
| profiles                     | face_recognition_consent            | boolean                     | YES         |
| profiles                     | face_recognition_consent_date       | timestamp without time zone | YES         |
| profiles                     | photo_consent_contexts              | ARRAY                       | YES         |
| profiles                     | show_in_directory                   | boolean                     | YES         |
| profiles                     | allow_messages                      | boolean                     | YES         |
| profiles                     | created_by                          | uuid                        | YES         |
| profiles                     | metadata                            | jsonb                       | YES         |
| profiles                     | justicehub_enabled                  | boolean                     | YES         |
| profiles                     | justicehub_role                     | text                        | YES         |
| profiles                     | justicehub_featured                 | boolean                     | YES         |
| profiles                     | justicehub_synced_at                | timestamp without time zone | YES         |
| profiles                     | avatar_url                          | text                        | YES         |
| profiles                     | super_admin                         | boolean                     | YES         |
| project_analyses             | id                                  | uuid                        | NO          |
| project_analyses             | project_id                          | uuid                        | NO          |
| project_analyses             | model_used                          | text                        | NO          |
| project_analyses             | analysis_type                       | text                        | NO          |
| project_analyses             | content_hash                        | text                        | NO          |
| project_analyses             | analysis_data                       | jsonb                       | NO          |
| project_analyses             | analyzed_at                         | timestamp with time zone    | NO          |
| project_analyses             | created_at                          | timestamp with time zone    | NO          |
| project_analyses             | updated_at                          | timestamp with time zone    | NO          |
| project_analytics            | id                                  | uuid                        | NO          |
| project_analytics            | project_id                          | uuid                        | NO          |
| project_analytics            | themes                              | jsonb                       | YES         |
| project_analytics            | theme_count                         | integer                     | YES         |
| project_analytics            | project_objectives                  | jsonb                       | YES         |
| project_analytics            | participant_quotes                  | jsonb                       | YES         |
| project_analytics            | success_stories                     | jsonb                       | YES         |
| project_analytics            | stakeholder_network                 | jsonb                       | YES         |
| project_analytics            | participant_demographics            | jsonb                       | YES         |
| project_analytics            | impact_metrics                      | jsonb                       | YES         |
| project_analytics            | outcomes                            | jsonb                       | YES         |
| project_analytics            | milestones                          | jsonb                       | YES         |
| project_analytics            | key_learnings                       | ARRAY                       | YES         |
| project_analytics            | recommendations                     | ARRAY                       | YES         |
| project_analytics            | challenges                          | ARRAY                       | YES         |
| project_analytics            | participant_count                   | integer                     | YES         |
| project_analytics            | transcript_count                    | integer                     | YES         |
| project_analytics            | total_engagement_hours              | numeric                     | YES         |
| project_analytics            | generated_at                        | timestamp with time zone    | YES         |
| project_analytics            | updated_at                          | timestamp with time zone    | YES         |
| project_analytics            | last_analysis_at                    | timestamp with time zone    | YES         |
| project_contexts             | id                                  | uuid                        | NO          |
| project_contexts             | project_id                          | uuid                        | NO          |
| project_contexts             | organization_id                     | uuid                        | NO          |
| project_contexts             | purpose                             | text                        | YES         |
| project_contexts             | context                             | text                        | YES         |
| project_contexts             | target_population                   | text                        | YES         |
| project_contexts             | expected_outcomes                   | jsonb                       | YES         |
| project_contexts             | success_criteria                    | ARRAY                       | YES         |
| project_contexts             | timeframe                           | text                        | YES         |
| project_contexts             | program_model                       | text                        | YES         |
| project_contexts             | cultural_approaches                 | ARRAY                       | YES         |
| project_contexts             | key_activities                      | ARRAY                       | YES         |
| project_contexts             | seed_interview_text                 | text                        | YES         |
| project_contexts             | existing_documents                  | text                        | YES         |
| project_contexts             | context_type                        | character varying           | YES         |
| project_contexts             | ai_extracted                        | boolean                     | YES         |
| project_contexts             | extraction_quality_score            | integer                     | YES         |
| project_contexts             | ai_model_used                       | character varying           | YES         |
| project_contexts             | inherits_from_org                   | boolean                     | YES         |
| project_contexts             | custom_fields                       | jsonb                       | YES         |
| project_contexts             | created_at                          | timestamp with time zone    | YES         |
| project_contexts             | updated_at                          | timestamp with time zone    | YES         |
| project_contexts             | created_by                          | uuid                        | YES         |
| project_contexts             | last_updated_by                     | uuid                        | YES         |
| project_media                | id                                  | uuid                        | NO          |
| project_media                | project_id                          | uuid                        | YES         |
| project_media                | media_asset_id                      | uuid                        | YES         |
| project_media                | usage_context                       | text                        | YES         |
| project_media                | display_order                       | integer                     | YES         |
| project_media                | uploaded_by                         | uuid                        | YES         |
| project_media                | created_at                          | timestamp without time zone | YES         |
| project_organizations        | id                                  | uuid                        | NO          |
| project_organizations        | project_id                          | uuid                        | NO          |
| project_organizations        | organization_id                     | uuid                        | NO          |
| project_organizations        | role                                | text                        | YES         |
| project_organizations        | created_at                          | timestamp with time zone    | YES         |
| project_organizations        | updated_at                          | timestamp with time zone    | YES         |
| project_participants         | id                                  | uuid                        | NO          |
| project_participants         | project_id                          | uuid                        | YES         |
| project_participants         | storyteller_id                      | uuid                        | YES         |
| project_participants         | role                                | text                        | YES         |
| project_participants         | joined_at                           | timestamp without time zone | YES         |
| project_participants         | status                              | text                        | YES         |
| project_participants         | notes                               | text                        | YES         |
| project_participants         | created_at                          | timestamp without time zone | YES         |
| project_participants         | updated_at                          | timestamp without time zone | YES         |
| project_profiles             | id                                  | uuid                        | NO          |
| project_profiles             | project_id                          | uuid                        | NO          |
| project_profiles             | mission                             | text                        | YES         |
| project_profiles             | primary_goals                       | ARRAY                       | YES         |
| project_profiles             | target_population                   | text                        | YES         |
| project_profiles             | origin_story                        | text                        | YES         |
| project_profiles             | community_need                      | text                        | YES         |
| project_profiles             | who_initiated                       | text                        | YES         |
| project_profiles             | program_model                       | text                        | YES         |
| project_profiles             | key_activities                      | ARRAY                       | YES         |
| project_profiles             | cultural_approaches                 | ARRAY                       | YES         |
| project_profiles             | cultural_protocols                  | ARRAY                       | YES         |
| project_profiles             | outcome_categories                  | ARRAY                       | YES         |
| project_profiles             | short_term_outcomes                 | ARRAY                       | YES         |
| project_profiles             | medium_term_outcomes                | ARRAY                       | YES         |
| project_profiles             | long_term_outcomes                  | ARRAY                       | YES         |
| project_profiles             | success_indicators                  | ARRAY                       | YES         |
| project_profiles             | positive_language                   | ARRAY                       | YES         |
| project_profiles             | challenge_language                  | ARRAY                       | YES         |
| project_profiles             | transformation_markers              | ARRAY                       | YES         |
| project_profiles             | individual_impact                   | ARRAY                       | YES         |
| project_profiles             | family_impact                       | ARRAY                       | YES         |
| project_profiles             | community_impact                    | ARRAY                       | YES         |
| project_profiles             | systems_impact                      | ARRAY                       | YES         |
| project_profiles             | cultural_values                     | ARRAY                       | YES         |
| project_profiles             | indigenous_frameworks               | ARRAY                       | YES         |
| project_profiles             | community_wisdom                    | ARRAY                       | YES         |
| project_profiles             | completeness_score                  | integer                     | YES         |
| project_profiles             | last_reviewed_at                    | timestamp with time zone    | YES         |
| project_profiles             | approved_by                         | text                        | YES         |
| project_profiles             | created_at                          | timestamp with time zone    | YES         |
| project_profiles             | updated_at                          | timestamp with time zone    | YES         |
| project_seed_interviews      | id                                  | uuid                        | NO          |
| project_seed_interviews      | project_id                          | uuid                        | NO          |
| project_seed_interviews      | interview_transcript                | text                        | YES         |
| project_seed_interviews      | interview_audio_url                 | text                        | YES         |
| project_seed_interviews      | interview_date                      | timestamp with time zone    | YES         |
| project_seed_interviews      | interviewed_by                      | text                        | YES         |
| project_seed_interviews      | extracted_context                   | jsonb                       | YES         |
| project_seed_interviews      | created_at                          | timestamp with time zone    | YES         |
| project_seed_interviews      | updated_at                          | timestamp with time zone    | YES         |
| project_storytellers         | id                                  | uuid                        | NO          |
| project_storytellers         | project_id                          | uuid                        | NO          |
| project_storytellers         | storyteller_id                      | uuid                        | NO          |
| project_storytellers         | role                                | text                        | YES         |
| project_storytellers         | joined_at                           | timestamp with time zone    | YES         |
| project_storytellers         | status                              | text                        | YES         |
| project_storytellers         | created_at                          | timestamp with time zone    | YES         |
| project_storytellers         | updated_at                          | timestamp with time zone    | YES         |
| project_updates              | id                                  | uuid                        | NO          |
| project_updates              | project_id                          | uuid                        | NO          |
| project_updates              | content                             | text                        | NO          |
| project_updates              | created_by                          | uuid                        | NO          |
| project_updates              | created_at                          | timestamp with time zone    | YES         |
| projects                     | id                                  | uuid                        | NO          |
| projects                     | tenant_id                           | uuid                        | NO          |
| projects                     | organization_id                     | uuid                        | YES         |
| projects                     | name                                | text                        | NO          |
| projects                     | description                         | text                        | YES         |
| projects                     | location                            | text                        | YES         |
| projects                     | status                              | text                        | YES         |
| projects                     | start_date                          | date                        | YES         |
| projects                     | end_date                            | date                        | YES         |
| projects                     | budget                              | numeric                     | YES         |
| projects                     | created_by                          | uuid                        | YES         |
| projects                     | created_at                          | timestamp with time zone    | YES         |
| projects                     | updated_at                          | timestamp with time zone    | YES         |
| projects                     | location_id                         | uuid                        | YES         |
| projects                     | context_model                       | text                        | YES         |
| projects                     | context_description                 | text                        | YES         |
| projects                     | context_updated_at                  | timestamp with time zone    | YES         |
| projects                     | justicehub_enabled                  | boolean                     | YES         |
| projects                     | justicehub_program_type             | text                        | YES         |
| projects                     | justicehub_synced_at                | timestamp without time zone | YES         |
| quotes                       | id                                  | uuid                        | NO          |
| quotes                       | tenant_id                           | uuid                        | NO          |
| quotes                       | story_id                            | uuid                        | YES         |
| quotes                       | author_id                           | uuid                        | NO          |
| quotes                       | quote_text                          | text                        | NO          |
| quotes                       | context_before                      | text                        | YES         |
| quotes                       | context_after                       | text                        | YES         |
| quotes                       | extracted_by_ai                     | boolean                     | YES         |
| quotes                       | ai_confidence_score                 | numeric                     | YES         |
| quotes                       | extraction_model                    | text                        | YES         |
| quotes                       | themes                              | jsonb                       | YES         |
| quotes                       | emotional_tone                      | text                        | YES         |
| quotes                       | significance_score                  | numeric                     | YES         |
| quotes                       | quote_type                          | text                        | YES         |
| quotes                       | cultural_sensitivity                | text                        | YES         |
| quotes                       | requires_attribution                | boolean                     | YES         |
| quotes                       | attribution_approved                | boolean                     | YES         |
| quotes                       | storyteller_approved                | boolean                     | YES         |
| quotes                       | usage_permissions                   | jsonb                       | YES         |
| quotes                       | usage_count                         | integer                     | YES         |
| quotes                       | last_used_at                        | timestamp with time zone    | YES         |
| quotes                       | visibility                          | text                        | YES         |
| quotes                       | legacy_quote_id                     | uuid                        | YES         |
| quotes                       | transcript_id                       | uuid                        | YES         |
| quotes                       | created_at                          | timestamp with time zone    | YES         |
| quotes                       | updated_at                          | timestamp with time zone    | YES         |
| quotes                       | legacy_story_id                     | uuid                        | YES         |
| quotes                       | legacy_transcript_id                | uuid                        | YES         |
| quotes                       | legacy_storyteller_id               | uuid                        | YES         |
| quotes                       | migrated_at                         | timestamp with time zone    | YES         |
| report_feedback              | id                                  | uuid                        | NO          |
| report_feedback              | report_id                           | uuid                        | NO          |
| report_feedback              | profile_id                          | uuid                        | YES         |
| report_feedback              | feedback_type                       | text                        | NO          |
| report_feedback              | rating                              | integer                     | YES         |
| report_feedback              | feedback_text                       | text                        | YES         |
| report_feedback              | liked_sections                      | ARRAY                       | YES         |
| report_feedback              | improvement_areas                   | ARRAY                       | YES         |
| report_feedback              | missing_content                     | text                        | YES         |
| report_feedback              | design_feedback                     | text                        | YES         |
| report_feedback              | is_addressed                        | boolean                     | YES         |
| report_feedback              | response_text                       | text                        | YES         |
| report_feedback              | responded_by                        | uuid                        | YES         |
| report_feedback              | responded_at                        | timestamp without time zone | YES         |
| report_feedback              | created_at                          | timestamp without time zone | YES         |
| report_feedback              | metadata                            | jsonb                       | YES         |
| report_sections              | id                                  | uuid                        | NO          |
| report_sections              | report_id                           | uuid                        | NO          |
| report_sections              | section_type                        | text                        | NO          |
| report_sections              | section_title                       | text                        | NO          |
| report_sections              | section_content                     | text                        | YES         |
| report_sections              | display_order                       | integer                     | YES         |
| report_sections              | page_break_before                   | boolean                     | YES         |
| report_sections              | layout_style                        | text                        | YES         |
| report_sections              | background_color                    | text                        | YES         |
| report_sections              | include_stories                     | boolean                     | YES         |
| report_sections              | story_ids                           | ARRAY                       | YES         |
| report_sections              | include_media                       | boolean                     | YES         |
| report_sections              | media_ids                           | ARRAY                       | YES         |
| report_sections              | include_data_viz                    | boolean                     | YES         |
| report_sections              | data_viz_config                     | jsonb                       | YES         |
| report_sections              | custom_content                      | text                        | YES         |
| report_sections              | content_format                      | text                        | YES         |
| report_sections              | created_at                          | timestamp without time zone | YES         |
| report_sections              | updated_at                          | timestamp without time zone | YES         |
| report_sections              | created_by                          | uuid                        | YES         |
| report_sections              | metadata                            | jsonb                       | YES         |
| report_templates             | id                                  | uuid                        | NO          |
| report_templates             | template_name                       | text                        | NO          |
| report_templates             | display_name                        | text                        | NO          |
| report_templates             | description                         | text                        | YES         |
| report_templates             | category                            | text                        | YES         |
| report_templates             | design_config                       | jsonb                       | NO          |
| report_templates             | default_sections                    | jsonb                       | NO          |
| report_templates             | cover_template_url                  | text                        | YES         |
| report_templates             | header_template_url                 | text                        | YES         |
| report_templates             | footer_template_url                 | text                        | YES         |
| report_templates             | is_public                           | boolean                     | YES         |
| report_templates             | organization_id                     | uuid                        | YES         |
| report_templates             | usage_count                         | integer                     | YES         |
| report_templates             | created_at                          | timestamp without time zone | YES         |
| report_templates             | updated_at                          | timestamp without time zone | YES         |
| report_templates             | created_by                          | uuid                        | YES         |
| report_templates             | metadata                            | jsonb                       | YES         |
| scraped_services             | id                                  | uuid                        | NO          |
| scraped_services             | organization_id                     | uuid                        | YES         |
| scraped_services             | name                                | character varying           | NO          |
| scraped_services             | description                         | text                        | YES         |
| scraped_services             | category                            | character varying           | YES         |
| scraped_services             | subcategory                         | character varying           | YES         |
| scraped_services             | eligibility_criteria                | ARRAY                       | YES         |
| scraped_services             | cost_structure                      | character varying           | YES         |
| scraped_services             | availability_schedule               | jsonb                       | YES         |
| scraped_services             | contact_info                        | jsonb                       | YES         |
| scraped_services             | outcomes_evidence                   | ARRAY                       | YES         |
| scraped_services             | geographical_coverage               | jsonb                       | YES         |
| scraped_services             | target_demographics                 | jsonb                       | YES         |
| scraped_services             | capacity_indicators                 | jsonb                       | YES         |
| scraped_services             | confidence_score                    | numeric                     | NO          |
| scraped_services             | source_url                          | text                        | YES         |
| scraped_services             | extraction_timestamp                | timestamp with time zone    | YES         |
| scraped_services             | validation_status                   | character varying           | YES         |
| scraped_services             | active                              | boolean                     | YES         |
| scraped_services             | created_at                          | timestamp with time zone    | YES         |
| scraped_services             | updated_at                          | timestamp with time zone    | YES         |
| scraper_health_metrics       | id                                  | uuid                        | NO          |
| scraper_health_metrics       | data_source_id                      | uuid                        | YES         |
| scraper_health_metrics       | metric_name                         | character varying           | NO          |
| scraper_health_metrics       | metric_value                        | numeric                     | YES         |
| scraper_health_metrics       | metric_unit                         | character varying           | YES         |
| scraper_health_metrics       | status                              | character varying           | YES         |
| scraper_health_metrics       | threshold_warning                   | numeric                     | YES         |
| scraper_health_metrics       | threshold_critical                  | numeric                     | YES         |
| scraper_health_metrics       | measurement_timestamp               | timestamp with time zone    | YES         |
| scraper_health_metrics       | alert_sent                          | boolean                     | YES         |
| scraper_health_metrics       | alert_sent_at                       | timestamp with time zone    | YES         |
| scraper_health_metrics       | notes                               | text                        | YES         |
| scraping_metadata            | id                                  | uuid                        | NO          |
| scraping_metadata            | organization_id                     | uuid                        | YES         |
| scraping_metadata            | source_type                         | character varying           | NO          |
| scraping_metadata            | source_url                          | text                        | NO          |
| scraping_metadata            | discovery_method                    | character varying           | NO          |
| scraping_metadata            | extraction_method                   | character varying           | NO          |
| scraping_metadata            | scraping_timestamp                  | timestamp with time zone    | YES         |
| scraping_metadata            | ai_processing_version               | character varying           | NO          |
| scraping_metadata            | confidence_scores                   | jsonb                       | NO          |
| scraping_metadata            | validation_status                   | character varying           | YES         |
| scraping_metadata            | data_lineage                        | jsonb                       | YES         |
| scraping_metadata            | quality_flags                       | jsonb                       | YES         |
| scraping_metadata            | last_updated                        | timestamp with time zone    | YES         |
| scraping_metadata            | created_at                          | timestamp with time zone    | YES         |
| service_impact               | id                                  | uuid                        | NO          |
| service_impact               | organization_id                     | uuid                        | NO          |
| service_impact               | tenant_id                           | uuid                        | NO          |
| service_impact               | project_id                          | uuid                        | YES         |
| service_impact               | service_area                        | text                        | NO          |
| service_impact               | reporting_period                    | text                        | NO          |
| service_impact               | period_start                        | date                        | NO          |
| service_impact               | period_end                          | date                        | NO          |
| service_impact               | total_participants                  | integer                     | YES         |
| service_impact               | new_participants                    | integer                     | YES         |
| service_impact               | returning_participants              | integer                     | YES         |
| service_impact               | completion_rate                     | numeric                     | YES         |
| service_impact               | retention_rate                      | numeric                     | YES         |
| service_impact               | activities_delivered                | integer                     | YES         |
| service_impact               | total_activity_hours                | numeric                     | YES         |
| service_impact               | on_country_hours                    | numeric                     | YES         |
| service_impact               | elder_involvement_hours             | numeric                     | YES         |
| service_impact               | outcomes_achieved                   | integer                     | YES         |
| service_impact               | outcomes_in_progress                | integer                     | YES         |
| service_impact               | target_achievement_rate             | numeric                     | YES         |
| service_impact               | cultural_connection_improved        | integer                     | YES         |
| service_impact               | skills_developed                    | integer                     | YES         |
| service_impact               | leadership_roles_assumed            | integer                     | YES         |
| service_impact               | school_reengagement                 | integer                     | YES         |
| service_impact               | reduced_justice_involvement         | integer                     | YES         |
| service_impact               | community_events_held               | integer                     | YES         |
| service_impact               | community_participation             | integer                     | YES         |
| service_impact               | partnerships_activated              | integer                     | YES         |
| service_impact               | service_referrals_made              | integer                     | YES         |
| service_impact               | referral_success_rate               | numeric                     | YES         |
| service_impact               | traditional_knowledge_sessions      | integer                     | YES         |
| service_impact               | language_use_sessions               | integer                     | YES         |
| service_impact               | cultural_protocols_maintained_rate  | numeric                     | YES         |
| service_impact               | elder_satisfaction_rate             | numeric                     | YES         |
| service_impact               | success_stories_count               | integer                     | YES         |
| service_impact               | key_achievements                    | ARRAY                       | YES         |
| service_impact               | challenges_faced                    | ARRAY                       | YES         |
| service_impact               | learnings_identified                | ARRAY                       | YES         |
| service_impact               | testimonials                        | ARRAY                       | YES         |
| service_impact               | photos_collected                    | integer                     | YES         |
| service_impact               | videos_produced                     | integer                     | YES         |
| service_impact               | documents_created                   | integer                     | YES         |
| service_impact               | stories_published                   | integer                     | YES         |
| service_impact               | budget_allocated                    | numeric                     | YES         |
| service_impact               | budget_spent                        | numeric                     | YES         |
| service_impact               | cost_per_participant                | numeric                     | YES         |
| service_impact               | outcome_ids                         | ARRAY                       | YES         |
| service_impact               | activity_ids                        | ARRAY                       | YES         |
| service_impact               | document_ids                        | ARRAY                       | YES         |
| service_impact               | story_ids                           | ARRAY                       | YES         |
| service_impact               | compiled_by                         | uuid                        | YES         |
| service_impact               | reviewed_by                         | uuid                        | YES         |
| service_impact               | approved_by                         | uuid                        | YES         |
| service_impact               | approval_date                       | date                        | YES         |
| service_impact               | created_at                          | timestamp with time zone    | YES         |
| service_impact               | updated_at                          | timestamp with time zone    | YES         |
| services                     | id                                  | uuid                        | NO          |
| services                     | slug                                | text                        | NO          |
| services                     | title                               | text                        | NO          |
| services                     | description                         | text                        | NO          |
| services                     | image_url                           | text                        | YES         |
| services                     | features                            | jsonb                       | YES         |
| services                     | icon_svg                            | text                        | YES         |
| services                     | display_order                       | integer                     | YES         |
| services                     | is_visible                          | boolean                     | YES         |
| services                     | created_at                          | timestamp with time zone    | YES         |
| services                     | updated_at                          | timestamp with time zone    | YES         |
| stories                      | id                                  | uuid                        | NO          |
| stories                      | tenant_id                           | uuid                        | NO          |
| stories                      | author_id                           | uuid                        | YES         |
| stories                      | title                               | text                        | NO          |
| stories                      | content                             | text                        | NO          |
| stories                      | summary                             | text                        | YES         |
| stories                      | media_url                           | text                        | YES         |
| stories                      | transcription                       | text                        | YES         |
| stories                      | video_embed_code                    | text                        | YES         |
| stories                      | story_image_url                     | text                        | YES         |
| stories                      | story_image_file                    | text                        | YES         |
| stories                      | themes                              | jsonb                       | YES         |
| stories                      | story_category                      | text                        | YES         |
| stories                      | story_type                          | text                        | YES         |
| stories                      | privacy_level                       | text                        | YES         |
| stories                      | is_public                           | boolean                     | YES         |
| stories                      | is_featured                         | boolean                     | YES         |
| stories                      | cultural_sensitivity_level          | text                        | YES         |
| stories                      | cultural_warnings                   | jsonb                       | YES         |
| stories                      | requires_elder_approval             | boolean                     | YES         |
| stories                      | elder_approved_by                   | uuid                        | YES         |
| stories                      | elder_approved_at                   | timestamp with time zone    | YES         |
| stories                      | sharing_permissions                 | jsonb                       | YES         |
| stories                      | cross_tenant_visibility             | ARRAY                       | YES         |
| stories                      | embedding                           | USER-DEFINED                | YES         |
| stories                      | ai_processed                        | boolean                     | YES         |
| stories                      | ai_processing_consent_verified      | boolean                     | YES         |
| stories                      | ai_confidence_scores                | jsonb                       | YES         |
| stories                      | ai_generated_summary                | boolean                     | YES         |
| stories                      | search_vector                       | tsvector                    | YES         |
| stories                      | community_status                    | text                        | YES         |
| stories                      | reviewed_by                         | uuid                        | YES         |
| stories                      | reviewed_at                         | timestamp with time zone    | YES         |
| stories                      | review_notes                        | text                        | YES         |
| stories                      | legacy_story_id                     | uuid                        | YES         |
| stories                      | airtable_record_id                  | text                        | YES         |
| stories                      | fellowship_phase                    | text                        | YES         |
| stories                      | fellow_id                           | uuid                        | YES         |
| stories                      | created_at                          | timestamp with time zone    | YES         |
| stories                      | updated_at                          | timestamp with time zone    | YES         |
| stories                      | cultural_themes                     | ARRAY                       | YES         |
| stories                      | legacy_storyteller_id               | uuid                        | YES         |
| stories                      | legacy_airtable_id                  | text                        | YES         |
| stories                      | legacy_fellow_id                    | uuid                        | YES         |
| stories                      | legacy_author                       | text                        | YES         |
| stories                      | migrated_at                         | timestamp with time zone    | YES         |
| stories                      | migration_quality_score             | integer                     | YES         |
| stories                      | ai_enhanced_content                 | text                        | YES         |
| stories                      | media_urls                          | ARRAY                       | YES         |
| stories                      | published_at                        | timestamp with time zone    | YES         |
| stories                      | status                              | text                        | YES         |
| stories                      | media_metadata                      | jsonb                       | YES         |
| stories                      | cultural_sensitivity_flag           | boolean                     | YES         |
| stories                      | traditional_knowledge_flag          | boolean                     | YES         |
| stories                      | story_stage                         | character varying           | YES         |
| stories                      | video_stage                         | character varying           | YES         |
| stories                      | source_links                        | jsonb                       | YES         |
| stories                      | storyteller_id                      | uuid                        | YES         |
| stories                      | transcript_id                       | uuid                        | YES         |
| stories                      | media_attachments                   | jsonb                       | YES         |
| stories                      | has_explicit_consent                | boolean                     | YES         |
| stories                      | consent_details                     | jsonb                       | YES         |
| stories                      | project_id                          | uuid                        | YES         |
| stories                      | organization_id                     | uuid                        | YES         |
| stories                      | location_id                         | uuid                        | YES         |
| stories                      | location_text                       | text                        | YES         |
| stories                      | latitude                            | numeric                     | YES         |
| stories                      | longitude                           | numeric                     | YES         |
| stories                      | service_id                          | uuid                        | YES         |
| stories                      | source_empathy_entry_id             | uuid                        | YES         |
| stories                      | sync_date                           | timestamp with time zone    | YES         |
| stories                      | is_archived                         | boolean                     | YES         |
| stories                      | archived_at                         | timestamp with time zone    | YES         |
| stories                      | archived_by                         | uuid                        | YES         |
| stories                      | archive_reason                      | text                        | YES         |
| stories                      | embeds_enabled                      | boolean                     | YES         |
| stories                      | sharing_enabled                     | boolean                     | YES         |
| stories                      | allowed_embed_domains               | ARRAY                       | YES         |
| stories                      | consent_withdrawn_at                | timestamp with time zone    | YES         |
| stories                      | consent_withdrawal_reason           | text                        | YES         |
| stories                      | anonymization_status                | text                        | YES         |
| stories                      | anonymization_requested_at          | timestamp with time zone    | YES         |
| stories                      | anonymized_at                       | timestamp with time zone    | YES         |
| stories                      | anonymized_fields                   | jsonb                       | YES         |
| stories                      | original_author_display             | text                        | YES         |
| stories                      | ownership_status                    | text                        | YES         |
| stories                      | original_author_id                  | uuid                        | YES         |
| stories                      | ownership_transferred_at            | timestamp with time zone    | YES         |
| stories                      | provenance_chain                    | jsonb                       | YES         |
| story_access_log             | id                                  | uuid                        | NO          |
| story_access_log             | story_id                            | uuid                        | NO          |
| story_access_log             | app_id                              | uuid                        | NO          |
| story_access_log             | access_type                         | text                        | NO          |
| story_access_log             | accessed_at                         | timestamp with time zone    | YES         |
| story_access_log             | accessor_ip                         | text                        | YES         |
| story_access_log             | accessor_user_agent                 | text                        | YES         |
| story_access_log             | access_context                      | jsonb                       | YES         |
| story_distributions          | id                                  | uuid                        | NO          |
| story_distributions          | story_id                            | uuid                        | NO          |
| story_distributions          | tenant_id                           | uuid                        | NO          |
| story_distributions          | platform                            | text                        | NO          |
| story_distributions          | platform_post_id                    | text                        | YES         |
| story_distributions          | distribution_url                    | text                        | YES         |
| story_distributions          | embed_domain                        | text                        | YES         |
| story_distributions          | status                              | text                        | YES         |
| story_distributions          | revoked_at                          | timestamp with time zone    | YES         |
| story_distributions          | revoked_by                          | uuid                        | YES         |
| story_distributions          | revocation_reason                   | text                        | YES         |
| story_distributions          | view_count                          | integer                     | YES         |
| story_distributions          | last_viewed_at                      | timestamp with time zone    | YES         |
| story_distributions          | click_count                         | integer                     | YES         |
| story_distributions          | consent_version                     | text                        | YES         |
| story_distributions          | consent_snapshot                    | jsonb                       | YES         |
| story_distributions          | webhook_url                         | text                        | YES         |
| story_distributions          | webhook_secret                      | text                        | YES         |
| story_distributions          | webhook_notified_at                 | timestamp with time zone    | YES         |
| story_distributions          | webhook_response                    | jsonb                       | YES         |
| story_distributions          | webhook_retry_count                 | integer                     | YES         |
| story_distributions          | created_at                          | timestamp with time zone    | YES         |
| story_distributions          | updated_at                          | timestamp with time zone    | YES         |
| story_distributions          | created_by                          | uuid                        | YES         |
| story_distributions          | metadata                            | jsonb                       | YES         |
| story_distributions          | notes                               | text                        | YES         |
| story_distributions          | expires_at                          | timestamp with time zone    | YES         |
| story_engagement_daily       | id                                  | uuid                        | NO          |
| story_engagement_daily       | story_id                            | uuid                        | NO          |
| story_engagement_daily       | storyteller_id                      | uuid                        | YES         |
| story_engagement_daily       | platform_name                       | text                        | NO          |
| story_engagement_daily       | date                                | date                        | NO          |
| story_engagement_daily       | view_count                          | integer                     | NO          |
| story_engagement_daily       | read_count                          | integer                     | NO          |
| story_engagement_daily       | share_count                         | integer                     | NO          |
| story_engagement_daily       | action_count                        | integer                     | NO          |
| story_engagement_daily       | total_read_time_seconds             | integer                     | NO          |
| story_engagement_daily       | avg_scroll_depth                    | integer                     | YES         |
| story_engagement_daily       | top_countries                       | jsonb                       | YES         |
| story_engagement_daily       | mobile_percent                      | integer                     | YES         |
| story_engagement_daily       | desktop_percent                     | integer                     | YES         |
| story_engagement_daily       | created_at                          | timestamp with time zone    | NO          |
| story_engagement_daily       | updated_at                          | timestamp with time zone    | NO          |
| story_engagement_events      | id                                  | uuid                        | NO          |
| story_engagement_events      | story_id                            | uuid                        | NO          |
| story_engagement_events      | storyteller_id                      | uuid                        | YES         |
| story_engagement_events      | platform_id                         | uuid                        | YES         |
| story_engagement_events      | platform_name                       | text                        | NO          |
| story_engagement_events      | event_type                          | text                        | NO          |
| story_engagement_events      | read_time_seconds                   | integer                     | YES         |
| story_engagement_events      | scroll_depth                        | integer                     | YES         |
| story_engagement_events      | referrer                            | text                        | YES         |
| story_engagement_events      | utm_source                          | text                        | YES         |
| story_engagement_events      | utm_medium                          | text                        | YES         |
| story_engagement_events      | utm_campaign                        | text                        | YES         |
| story_engagement_events      | country_code                        | text                        | YES         |
| story_engagement_events      | region                              | text                        | YES         |
| story_engagement_events      | city                                | text                        | YES         |
| story_engagement_events      | device_type                         | text                        | YES         |
| story_engagement_events      | browser                             | text                        | YES         |
| story_engagement_events      | session_id                          | text                        | YES         |
| story_engagement_events      | created_at                          | timestamp with time zone    | NO          |
| story_images                 | id                                  | uuid                        | NO          |
| story_images                 | story_id                            | uuid                        | NO          |
| story_images                 | storage_path                        | text                        | NO          |
| story_images                 | public_url                          | text                        | NO          |
| story_images                 | thumbnail_url                       | text                        | YES         |
| story_images                 | alt_text                            | text                        | YES         |
| story_images                 | caption                             | text                        | YES         |
| story_images                 | photographer_name                   | text                        | YES         |
| story_images                 | photographer_id                     | uuid                        | YES         |
| story_images                 | photo_location                      | text                        | YES         |
| story_images                 | photo_date                          | date                        | YES         |
| story_images                 | is_primary                          | boolean                     | YES         |
| story_images                 | display_order                       | integer                     | YES         |
| story_images                 | width                               | integer                     | YES         |
| story_images                 | height                              | integer                     | YES         |
| story_images                 | file_size                           | integer                     | YES         |
| story_images                 | mime_type                           | text                        | YES         |
| story_images                 | cultural_sensitivity_flag           | boolean                     | YES         |
| story_images                 | requires_elder_approval             | boolean                     | YES         |
| story_images                 | elder_approved                      | boolean                     | YES         |
| story_images                 | uploaded_at                         | timestamp without time zone | YES         |
| story_images                 | uploaded_by                         | uuid                        | YES         |
| story_images                 | metadata                            | jsonb                       | YES         |
| story_media                  | id                                  | uuid                        | NO          |
| story_media                  | story_id                            | uuid                        | NO          |
| story_media                  | media_type                          | text                        | NO          |
| story_media                  | file_path                           | text                        | NO          |
| story_media                  | supabase_bucket                     | text                        | NO          |
| story_media                  | file_name                           | text                        | NO          |
| story_media                  | file_size                           | bigint                      | YES         |
| story_media                  | media_embedding                     | USER-DEFINED                | YES         |
| story_media                  | ml_analysis                         | jsonb                       | YES         |
| story_media                  | requires_permission                 | boolean                     | YES         |
| story_media                  | people_in_media                     | ARRAY                       | YES         |
| story_media                  | all_permissions_obtained            | boolean                     | YES         |
| story_media                  | caption                             | text                        | YES         |
| story_media                  | alt_text                            | text                        | YES         |
| story_media                  | display_order                       | integer                     | YES         |
| story_media                  | is_public                           | boolean                     | YES         |
| story_media                  | is_featured                         | boolean                     | YES         |
| story_media                  | created_at                          | timestamp without time zone | YES         |
| story_media                  | updated_at                          | timestamp without time zone | YES         |
| story_media                  | created_by                          | uuid                        | YES         |
| story_media                  | metadata                            | jsonb                       | YES         |
| story_review_invitations     | id                                  | uuid                        | NO          |
| story_review_invitations     | story_id                            | uuid                        | NO          |
| story_review_invitations     | storyteller_id                      | uuid                        | YES         |
| story_review_invitations     | storyteller_email                   | text                        | YES         |
| story_review_invitations     | storyteller_phone                   | text                        | YES         |
| story_review_invitations     | storyteller_name                    | text                        | NO          |
| story_review_invitations     | token                               | text                        | NO          |
| story_review_invitations     | expires_at                          | timestamp with time zone    | NO          |
| story_review_invitations     | sent_via                            | text                        | NO          |
| story_review_invitations     | sent_at                             | timestamp with time zone    | YES         |
| story_review_invitations     | accepted_at                         | timestamp with time zone    | YES         |
| story_review_invitations     | created_by                          | uuid                        | NO          |
| story_review_invitations     | created_at                          | timestamp with time zone    | NO          |
| story_review_invitations     | updated_at                          | timestamp with time zone    | NO          |
| story_syndication_consent    | id                                  | uuid                        | NO          |
| story_syndication_consent    | story_id                            | uuid                        | NO          |
| story_syndication_consent    | storyteller_id                      | uuid                        | NO          |
| story_syndication_consent    | app_id                              | uuid                        | NO          |
| story_syndication_consent    | consent_granted                     | boolean                     | YES         |
| story_syndication_consent    | consent_granted_at                  | timestamp with time zone    | YES         |
| story_syndication_consent    | consent_revoked_at                  | timestamp with time zone    | YES         |
| story_syndication_consent    | consent_expires_at                  | timestamp with time zone    | YES         |
| story_syndication_consent    | share_full_content                  | boolean                     | YES         |
| story_syndication_consent    | share_summary_only                  | boolean                     | YES         |
| story_syndication_consent    | share_media                         | boolean                     | YES         |
| story_syndication_consent    | share_attribution                   | boolean                     | YES         |
| story_syndication_consent    | anonymous_sharing                   | boolean                     | YES         |
| story_syndication_consent    | cultural_restrictions               | jsonb                       | YES         |
| story_syndication_consent    | requires_cultural_approval          | boolean                     | YES         |
| story_syndication_consent    | cultural_approval_status            | text                        | YES         |
| story_syndication_consent    | cultural_approver_id                | uuid                        | YES         |
| story_syndication_consent    | created_at                          | timestamp with time zone    | YES         |
| story_syndication_consent    | updated_at                          | timestamp with time zone    | YES         |
| story_syndication_requests   | id                                  | uuid                        | NO          |
| story_syndication_requests   | story_id                            | uuid                        | NO          |
| story_syndication_requests   | project_id                          | uuid                        | NO          |
| story_syndication_requests   | app_id                              | uuid                        | NO          |
| story_syndication_requests   | requested_by                        | uuid                        | YES         |
| story_syndication_requests   | request_message                     | text                        | YES         |
| story_syndication_requests   | requested_at                        | timestamp with time zone    | YES         |
| story_syndication_requests   | status                              | text                        | YES         |
| story_syndication_requests   | responded_at                        | timestamp with time zone    | YES         |
| story_syndication_requests   | decline_reason                      | text                        | YES         |
| story_syndication_requests   | consent_id                          | uuid                        | YES         |
| story_syndication_requests   | expires_at                          | timestamp with time zone    | YES         |
| storyteller_analytics        | id                                  | uuid                        | NO          |
| storyteller_analytics        | storyteller_id                      | uuid                        | NO          |
| storyteller_analytics        | tenant_id                           | uuid                        | NO          |
| storyteller_analytics        | total_stories                       | integer                     | YES         |
| storyteller_analytics        | total_transcripts                   | integer                     | YES         |
| storyteller_analytics        | total_word_count                    | integer                     | YES         |
| storyteller_analytics        | total_engagement_score              | numeric                     | YES         |
| storyteller_analytics        | impact_reach                        | integer                     | YES         |
| storyteller_analytics        | primary_themes                      | ARRAY                       | YES         |
| storyteller_analytics        | theme_distribution                  | jsonb                       | YES         |
| storyteller_analytics        | theme_evolution                     | jsonb                       | YES         |
| storyteller_analytics        | storytelling_style                  | character varying           | YES         |
| storyteller_analytics        | emotional_tone_profile              | jsonb                       | YES         |
| storyteller_analytics        | cultural_elements_frequency         | jsonb                       | YES         |
| storyteller_analytics        | connection_count                    | integer                     | YES         |
| storyteller_analytics        | shared_narrative_count              | integer                     | YES         |
| storyteller_analytics        | collaboration_score                 | numeric                     | YES         |
| storyteller_analytics        | story_view_count                    | integer                     | YES         |
| storyteller_analytics        | story_share_count                   | integer                     | YES         |
| storyteller_analytics        | quote_citation_count                | integer                     | YES         |
| storyteller_analytics        | inspiration_impact_score            | numeric                     | YES         |
| storyteller_analytics        | last_calculated_at                  | timestamp with time zone    | YES         |
| storyteller_analytics        | created_at                          | timestamp with time zone    | YES         |
| storyteller_analytics        | updated_at                          | timestamp with time zone    | YES         |
| storyteller_connections      | id                                  | uuid                        | NO          |
| storyteller_connections      | storyteller_a_id                    | uuid                        | NO          |
| storyteller_connections      | storyteller_b_id                    | uuid                        | NO          |
| storyteller_connections      | tenant_id                           | uuid                        | NO          |
| storyteller_connections      | connection_strength                 | numeric                     | YES         |
| storyteller_connections      | connection_type                     | character varying           | NO          |
| storyteller_connections      | shared_themes                       | ARRAY                       | YES         |
| storyteller_connections      | theme_similarity_score              | numeric                     | YES         |
| storyteller_connections      | geographic_proximity_score          | numeric                     | YES         |
| storyteller_connections      | cultural_similarity_score           | numeric                     | YES         |
| storyteller_connections      | narrative_style_similarity          | numeric                     | YES         |
| storyteller_connections      | life_experience_similarity          | numeric                     | YES         |
| storyteller_connections      | professional_alignment_score        | numeric                     | YES         |
| storyteller_connections      | shared_locations                    | ARRAY                       | YES         |
| storyteller_connections      | similar_experiences                 | ARRAY                       | YES         |
| storyteller_connections      | complementary_skills                | ARRAY                       | YES         |
| storyteller_connections      | potential_collaboration_areas       | ARRAY                       | YES         |
| storyteller_connections      | mutual_themes_count                 | integer                     | YES         |
| storyteller_connections      | matching_quotes                     | ARRAY                       | YES         |
| storyteller_connections      | evidence_examples                   | jsonb                       | YES         |
| storyteller_connections      | ai_reasoning                        | text                        | YES         |
| storyteller_connections      | ai_confidence                       | numeric                     | YES         |
| storyteller_connections      | ai_model_version                    | character varying           | YES         |
| storyteller_connections      | calculated_at                       | timestamp with time zone    | YES         |
| storyteller_connections      | status                              | character varying           | YES         |
| storyteller_connections      | suggested_at                        | timestamp with time zone    | YES         |
| storyteller_connections      | viewed_at                           | timestamp with time zone    | YES         |
| storyteller_connections      | connected_at                        | timestamp with time zone    | YES         |
| storyteller_connections      | declined_at                         | timestamp with time zone    | YES         |
| storyteller_connections      | initiated_by                        | uuid                        | YES         |
| storyteller_connections      | is_mutual                           | boolean                     | YES         |
| storyteller_connections      | created_at                          | timestamp with time zone    | YES         |
| storyteller_connections      | updated_at                          | timestamp with time zone    | YES         |
| storyteller_dashboard_config | id                                  | uuid                        | NO          |
| storyteller_dashboard_config | storyteller_id                      | uuid                        | NO          |
| storyteller_dashboard_config | tenant_id                           | uuid                        | NO          |
| storyteller_dashboard_config | dashboard_layout                    | character varying           | YES         |
| storyteller_dashboard_config | enabled_widgets                     | jsonb                       | YES         |
| storyteller_dashboard_config | widget_positions                    | jsonb                       | YES         |
| storyteller_dashboard_config | widget_sizes                        | jsonb                       | YES         |
| storyteller_dashboard_config | theme_preferences                   | jsonb                       | YES         |
| storyteller_dashboard_config | public_dashboard                    | boolean                     | YES         |
| storyteller_dashboard_config | shared_with_network                 | boolean                     | YES         |
| storyteller_dashboard_config | analytics_sharing_level             | character varying           | YES         |
| storyteller_dashboard_config | notification_preferences            | jsonb                       | YES         |
| storyteller_dashboard_config | auto_refresh_enabled                | boolean                     | YES         |
| storyteller_dashboard_config | refresh_interval_minutes            | integer                     | YES         |
| storyteller_dashboard_config | last_refreshed_at                   | timestamp with time zone    | YES         |
| storyteller_dashboard_config | created_at                          | timestamp with time zone    | YES         |
| storyteller_dashboard_config | updated_at                          | timestamp with time zone    | YES         |
| storyteller_demographics     | id                                  | uuid                        | NO          |
| storyteller_demographics     | storyteller_id                      | uuid                        | NO          |
| storyteller_demographics     | tenant_id                           | uuid                        | NO          |
| storyteller_demographics     | current_location                    | jsonb                       | YES         |
| storyteller_demographics     | location_history                    | ARRAY                       | YES         |
| storyteller_demographics     | places_of_significance              | ARRAY                       | YES         |
| storyteller_demographics     | geographic_region                   | character varying           | YES         |
| storyteller_demographics     | cultural_background                 | ARRAY                       | YES         |
| storyteller_demographics     | languages_spoken                    | ARRAY                       | YES         |
| storyteller_demographics     | cultural_protocols_followed         | ARRAY                       | YES         |
| storyteller_demographics     | traditional_knowledge_areas         | ARRAY                       | YES         |
| storyteller_demographics     | professional_background             | ARRAY                       | YES         |
| storyteller_demographics     | areas_of_expertise                  | ARRAY                       | YES         |
| storyteller_demographics     | interests_and_passions              | ARRAY                       | YES         |
| storyteller_demographics     | skills_and_talents                  | ARRAY                       | YES         |
| storyteller_demographics     | significant_life_events             | ARRAY                       | YES         |
| storyteller_demographics     | challenges_overcome                 | ARRAY                       | YES         |
| storyteller_demographics     | achievements_and_milestones         | ARRAY                       | YES         |
| storyteller_demographics     | life_transitions                    | ARRAY                       | YES         |
| storyteller_demographics     | organizations_involved              | ARRAY                       | YES         |
| storyteller_demographics     | causes_supported                    | ARRAY                       | YES         |
| storyteller_demographics     | volunteer_work                      | ARRAY                       | YES         |
| storyteller_demographics     | community_roles                     | ARRAY                       | YES         |
| storyteller_demographics     | generation_category                 | character varying           | YES         |
| storyteller_demographics     | family_roles                        | ARRAY                       | YES         |
| storyteller_demographics     | mentorship_roles                    | ARRAY                       | YES         |
| storyteller_demographics     | location_sharing_level              | character varying           | YES         |
| storyteller_demographics     | demographic_sharing_level           | character varying           | YES         |
| storyteller_demographics     | cultural_info_sharing               | character varying           | YES         |
| storyteller_demographics     | data_sources                        | jsonb                       | YES         |
| storyteller_demographics     | ai_extracted_confidence             | numeric                     | YES         |
| storyteller_demographics     | manually_verified                   | boolean                     | YES         |
| storyteller_demographics     | last_updated_by                     | uuid                        | YES         |
| storyteller_demographics     | created_at                          | timestamp with time zone    | YES         |
| storyteller_demographics     | updated_at                          | timestamp with time zone    | YES         |
| storyteller_engagement       | id                                  | uuid                        | NO          |
| storyteller_engagement       | storyteller_id                      | uuid                        | NO          |
| storyteller_engagement       | tenant_id                           | uuid                        | NO          |
| storyteller_engagement       | period_start                        | timestamp with time zone    | NO          |
| storyteller_engagement       | period_end                          | timestamp with time zone    | NO          |
| storyteller_engagement       | period_type                         | character varying           | NO          |
| storyteller_engagement       | stories_created                     | integer                     | YES         |
| storyteller_engagement       | transcripts_processed               | integer                     | YES         |
| storyteller_engagement       | quotes_shared                       | integer                     | YES         |
| storyteller_engagement       | themes_explored                     | integer                     | YES         |
| storyteller_engagement       | media_items_uploaded                | integer                     | YES         |
| storyteller_engagement       | connections_made                    | integer                     | YES         |
| storyteller_engagement       | connections_accepted                | integer                     | YES         |
| storyteller_engagement       | recommendations_viewed              | integer                     | YES         |
| storyteller_engagement       | recommendations_acted_upon          | integer                     | YES         |
| storyteller_engagement       | profile_views                       | integer                     | YES         |
| storyteller_engagement       | story_views                         | integer                     | YES         |
| storyteller_engagement       | story_shares                        | integer                     | YES         |
| storyteller_engagement       | quote_citations                     | integer                     | YES         |
| storyteller_engagement       | comments_received                   | integer                     | YES         |
| storyteller_engagement       | comments_given                      | integer                     | YES         |
| storyteller_engagement       | login_days                          | integer                     | YES         |
| storyteller_engagement       | active_minutes                      | integer                     | YES         |
| storyteller_engagement       | features_used                       | ARRAY                       | YES         |
| storyteller_engagement       | page_views                          | integer                     | YES         |
| storyteller_engagement       | average_story_rating                | numeric                     | YES         |
| storyteller_engagement       | story_completion_rate               | numeric                     | YES         |
| storyteller_engagement       | ai_analysis_requests                | integer                     | YES         |
| storyteller_engagement       | high_impact_content_count           | integer                     | YES         |
| storyteller_engagement       | new_themes_discovered               | integer                     | YES         |
| storyteller_engagement       | skill_development_activities        | integer                     | YES         |
| storyteller_engagement       | tutorial_completions                | integer                     | YES         |
| storyteller_engagement       | collaborative_projects              | integer                     | YES         |
| storyteller_engagement       | community_contributions             | integer                     | YES         |
| storyteller_engagement       | mentoring_activities                | integer                     | YES         |
| storyteller_engagement       | engagement_score                    | numeric                     | YES         |
| storyteller_engagement       | growth_score                        | numeric                     | YES         |
| storyteller_engagement       | impact_score                        | numeric                     | YES         |
| storyteller_engagement       | consistency_score                   | numeric                     | YES         |
| storyteller_engagement       | created_at                          | timestamp with time zone    | YES         |
| storyteller_impact_metrics   | id                                  | uuid                        | NO          |
| storyteller_impact_metrics   | storyteller_id                      | uuid                        | NO          |
| storyteller_impact_metrics   | tenant_id                           | uuid                        | NO          |
| storyteller_impact_metrics   | total_content_views                 | integer                     | YES         |
| storyteller_impact_metrics   | unique_viewers                      | integer                     | YES         |
| storyteller_impact_metrics   | content_shares                      | integer                     | YES         |
| storyteller_impact_metrics   | content_bookmarks                   | integer                     | YES         |
| storyteller_impact_metrics   | quotes_cited_by_others              | integer                     | YES         |
| storyteller_impact_metrics   | stories_that_inspired_others        | integer                     | YES         |
| storyteller_impact_metrics   | mentorship_connections              | integer                     | YES         |
| storyteller_impact_metrics   | people_directly_impacted            | integer                     | YES         |
| storyteller_impact_metrics   | cultural_preservation_contributions | integer                     | YES         |
| storyteller_impact_metrics   | community_initiatives_started       | integer                     | YES         |
| storyteller_impact_metrics   | cross_cultural_connections          | integer                     | YES         |
| storyteller_impact_metrics   | intergenerational_bridges           | integer                     | YES         |
| storyteller_impact_metrics   | professional_opportunities_created  | integer                     | YES         |
| storyteller_impact_metrics   | learning_resources_contributed      | integer                     | YES         |
| storyteller_impact_metrics   | skills_taught_or_shared             | integer                     | YES         |
| storyteller_impact_metrics   | career_guidance_provided            | integer                     | YES         |
| storyteller_impact_metrics   | network_size                        | integer                     | YES         |
| storyteller_impact_metrics   | network_diversity_score             | numeric                     | YES         |
| storyteller_impact_metrics   | connection_quality_score            | numeric                     | YES         |
| storyteller_impact_metrics   | network_growth_rate                 | numeric                     | YES         |
| storyteller_impact_metrics   | average_content_rating              | numeric                     | YES         |
| storyteller_impact_metrics   | content_completion_rate             | numeric                     | YES         |
| storyteller_impact_metrics   | repeat_audience_percentage          | numeric                     | YES         |
| storyteller_impact_metrics   | content_longevity_score             | numeric                     | YES         |
| storyteller_impact_metrics   | overall_impact_score                | numeric                     | YES         |
| storyteller_impact_metrics   | cultural_impact_score               | numeric                     | YES         |
| storyteller_impact_metrics   | community_impact_score              | numeric                     | YES         |
| storyteller_impact_metrics   | inspirational_impact_score          | numeric                     | YES         |
| storyteller_impact_metrics   | first_impact_date                   | timestamp with time zone    | YES         |
| storyteller_impact_metrics   | peak_impact_date                    | timestamp with time zone    | YES         |
| storyteller_impact_metrics   | last_significant_impact             | timestamp with time zone    | YES         |
| storyteller_impact_metrics   | impact_velocity                     | numeric                     | YES         |
| storyteller_impact_metrics   | impact_consistency                  | numeric                     | YES         |
| storyteller_impact_metrics   | impact_trend                        | character varying           | YES         |
| storyteller_impact_metrics   | last_calculated_at                  | timestamp with time zone    | YES         |
| storyteller_impact_metrics   | created_at                          | timestamp with time zone    | YES         |
| storyteller_impact_metrics   | updated_at                          | timestamp with time zone    | YES         |
| storyteller_locations        | id                                  | uuid                        | NO          |
| storyteller_locations        | storyteller_id                      | uuid                        | NO          |
| storyteller_locations        | location_id                         | uuid                        | NO          |
| storyteller_locations        | tenant_id                           | uuid                        | NO          |
| storyteller_locations        | relationship_type                   | text                        | YES         |
| storyteller_locations        | significance                        | text                        | YES         |
| storyteller_locations        | is_primary                          | boolean                     | YES         |
| storyteller_locations        | created_at                          | timestamp with time zone    | YES         |
| storyteller_media_links      | id                                  | uuid                        | NO          |
| storyteller_media_links      | storyteller_id                      | uuid                        | NO          |
| storyteller_media_links      | title                               | character varying           | NO          |
| storyteller_media_links      | url                                 | text                        | NO          |
| storyteller_media_links      | description                         | text                        | YES         |
| storyteller_media_links      | link_type                           | character varying           | NO          |
| storyteller_media_links      | video_stage                         | character varying           | YES         |
| storyteller_media_links      | platform                            | character varying           | YES         |
| storyteller_media_links      | duration_seconds                    | integer                     | YES         |
| storyteller_media_links      | thumbnail_url                       | text                        | YES         |
| storyteller_media_links      | tags                                | ARRAY                       | YES         |
| storyteller_media_links      | is_primary                          | boolean                     | YES         |
| storyteller_media_links      | is_public                           | boolean                     | YES         |
| storyteller_media_links      | metadata                            | jsonb                       | YES         |
| storyteller_media_links      | created_at                          | timestamp with time zone    | YES         |
| storyteller_media_links      | updated_at                          | timestamp with time zone    | YES         |
| storyteller_milestones       | id                                  | uuid                        | NO          |
| storyteller_milestones       | storyteller_id                      | uuid                        | NO          |
| storyteller_milestones       | tenant_id                           | uuid                        | NO          |
| storyteller_milestones       | milestone_type                      | character varying           | NO          |
| storyteller_milestones       | milestone_title                     | character varying           | NO          |
| storyteller_milestones       | milestone_description               | text                        | YES         |
| storyteller_milestones       | achievement_value                   | integer                     | YES         |
| storyteller_milestones       | achievement_threshold               | integer                     | YES         |
| storyteller_milestones       | progress_percentage                 | numeric                     | YES         |
| storyteller_milestones       | status                              | character varying           | YES         |
| storyteller_milestones       | achieved_at                         | timestamp with time zone    | YES         |
| storyteller_milestones       | verified_at                         | timestamp with time zone    | YES         |
| storyteller_milestones       | supporting_data                     | jsonb                       | YES         |
| storyteller_milestones       | evidence_items                      | ARRAY                       | YES         |
| storyteller_milestones       | is_public                           | boolean                     | YES         |
| storyteller_milestones       | celebration_shared                  | boolean                     | YES         |
| storyteller_milestones       | badge_earned                        | character varying           | YES         |
| storyteller_milestones       | peer_congratulations                | integer                     | YES         |
| storyteller_milestones       | mentor_recognition                  | boolean                     | YES         |
| storyteller_milestones       | featured_milestone                  | boolean                     | YES         |
| storyteller_milestones       | created_at                          | timestamp with time zone    | YES         |
| storyteller_milestones       | updated_at                          | timestamp with time zone    | YES         |
| storyteller_organizations    | id                                  | uuid                        | NO          |
| storyteller_organizations    | storyteller_id                      | uuid                        | NO          |
| storyteller_organizations    | organization_id                     | uuid                        | NO          |
| storyteller_organizations    | tenant_id                           | uuid                        | NO          |
| storyteller_organizations    | role                                | text                        | YES         |
| storyteller_organizations    | relationship_type                   | text                        | YES         |
| storyteller_organizations    | start_date                          | date                        | YES         |
| storyteller_organizations    | end_date                            | date                        | YES         |
| storyteller_organizations    | is_active                           | boolean                     | YES         |
| storyteller_organizations    | created_at                          | timestamp with time zone    | YES         |
| storyteller_projects         | id                                  | uuid                        | NO          |
| storyteller_projects         | storyteller_id                      | uuid                        | NO          |
| storyteller_projects         | project_id                          | uuid                        | NO          |
| storyteller_projects         | tenant_id                           | uuid                        | NO          |
| storyteller_projects         | role                                | text                        | YES         |
| storyteller_projects         | involvement_level                   | text                        | YES         |
| storyteller_projects         | start_date                          | date                        | YES         |
| storyteller_projects         | end_date                            | date                        | YES         |
| storyteller_projects         | is_active                           | boolean                     | YES         |
| storyteller_projects         | created_at                          | timestamp with time zone    | YES         |
| storyteller_quotes           | id                                  | uuid                        | NO          |
| storyteller_quotes           | storyteller_id                      | uuid                        | NO          |
| storyteller_quotes           | tenant_id                           | uuid                        | NO          |
| storyteller_quotes           | quote_text                          | text                        | NO          |
| storyteller_quotes           | context_before                      | text                        | YES         |
| storyteller_quotes           | context_after                       | text                        | YES         |
| storyteller_quotes           | source_type                         | character varying           | NO          |
| storyteller_quotes           | source_id                           | uuid                        | NO          |
| storyteller_quotes           | source_title                        | character varying           | YES         |
| storyteller_quotes           | timestamp_in_source                 | integer                     | YES         |
| storyteller_quotes           | page_or_section                     | character varying           | YES         |
| storyteller_quotes           | emotional_impact_score              | numeric                     | YES         |
| storyteller_quotes           | wisdom_score                        | numeric                     | YES         |
| storyteller_quotes           | quotability_score                   | numeric                     | YES         |
| storyteller_quotes           | inspiration_score                   | numeric                     | YES         |
| storyteller_quotes           | themes                              | ARRAY                       | YES         |
| storyteller_quotes           | sentiment_score                     | numeric                     | YES         |
| storyteller_quotes           | quote_category                      | character varying           | YES         |
| storyteller_quotes           | citation_count                      | integer                     | YES         |
| storyteller_quotes           | share_count                         | integer                     | YES         |
| storyteller_quotes           | view_count                          | integer                     | YES         |
| storyteller_quotes           | inspiration_rating                  | numeric                     | YES         |
| storyteller_quotes           | is_public                           | boolean                     | YES         |
| storyteller_quotes           | requires_approval                   | boolean                     | YES         |
| storyteller_quotes           | approved_by                         | uuid                        | YES         |
| storyteller_quotes           | approved_at                         | timestamp with time zone    | YES         |
| storyteller_quotes           | created_at                          | timestamp with time zone    | YES         |
| storyteller_quotes           | updated_at                          | timestamp with time zone    | YES         |
| storyteller_recommendations  | id                                  | uuid                        | NO          |
| storyteller_recommendations  | storyteller_id                      | uuid                        | NO          |
| storyteller_recommendations  | tenant_id                           | uuid                        | NO          |
| storyteller_recommendations  | recommendation_type                 | character varying           | NO          |
| storyteller_recommendations  | recommended_entity_type             | character varying           | NO          |
| storyteller_recommendations  | recommended_entity_id               | uuid                        | YES         |
| storyteller_recommendations  | title                               | character varying           | NO          |
| storyteller_recommendations  | description                         | text                        | YES         |
| storyteller_recommendations  | reason                              | text                        | YES         |
| storyteller_recommendations  | potential_impact                    | text                        | YES         |
| storyteller_recommendations  | call_to_action                      | character varying           | YES         |
| storyteller_recommendations  | relevance_score                     | numeric                     | YES         |
| storyteller_recommendations  | impact_potential_score              | numeric                     | YES         |
| storyteller_recommendations  | confidence_score                    | numeric                     | YES         |
| storyteller_recommendations  | priority_score                      | numeric                     | YES         |
| storyteller_recommendations  | supporting_data                     | jsonb                       | YES         |
| storyteller_recommendations  | connection_context                  | jsonb                       | YES         |
| storyteller_recommendations  | success_indicators                  | ARRAY                       | YES         |
| storyteller_recommendations  | ai_model_version                    | character varying           | YES         |
| storyteller_recommendations  | generation_method                   | character varying           | YES         |
| storyteller_recommendations  | based_on_themes                     | ARRAY                       | YES         |
| storyteller_recommendations  | based_on_connections                | ARRAY                       | YES         |
| storyteller_recommendations  | based_on_activities                 | ARRAY                       | YES         |
| storyteller_recommendations  | status                              | character varying           | YES         |
| storyteller_recommendations  | viewed_at                           | timestamp with time zone    | YES         |
| storyteller_recommendations  | acted_upon_at                       | timestamp with time zone    | YES         |
| storyteller_recommendations  | dismissed_at                        | timestamp with time zone    | YES         |
| storyteller_recommendations  | engagement_score                    | numeric                     | YES         |
| storyteller_recommendations  | user_feedback                       | character varying           | YES         |
| storyteller_recommendations  | feedback_notes                      | text                        | YES         |
| storyteller_recommendations  | recommendation_outcome              | character varying           | YES         |
| storyteller_recommendations  | expires_at                          | timestamp with time zone    | YES         |
| storyteller_recommendations  | optimal_display_time                | timestamp with time zone    | YES         |
| storyteller_recommendations  | created_at                          | timestamp with time zone    | YES         |
| storyteller_recommendations  | updated_at                          | timestamp with time zone    | YES         |
| storyteller_themes           | id                                  | uuid                        | NO          |
| storyteller_themes           | storyteller_id                      | uuid                        | NO          |
| storyteller_themes           | theme_id                            | uuid                        | NO          |
| storyteller_themes           | tenant_id                           | uuid                        | NO          |
| storyteller_themes           | prominence_score                    | numeric                     | YES         |
| storyteller_themes           | frequency_count                     | integer                     | YES         |
| storyteller_themes           | first_occurrence                    | timestamp with time zone    | YES         |
| storyteller_themes           | last_occurrence                     | timestamp with time zone    | YES         |
| storyteller_themes           | source_stories                      | ARRAY                       | YES         |
| storyteller_themes           | source_transcripts                  | ARRAY                       | YES         |
| storyteller_themes           | key_quotes                          | ARRAY                       | YES         |
| storyteller_themes           | context_examples                    | jsonb                       | YES         |
| storyteller_themes           | created_at                          | timestamp with time zone    | YES         |
| storyteller_themes           | updated_at                          | timestamp with time zone    | YES         |
| syndicated_stories           | story_id                            | uuid                        | YES         |
| syndicated_stories           | title                               | text                        | YES         |
| syndicated_stories           | content                             | text                        | YES         |
| syndicated_stories           | storyteller_name                    | text                        | YES         |
| syndicated_stories           | storyteller_id                      | uuid                        | YES         |
| syndicated_stories           | story_type                          | text                        | YES         |
| syndicated_stories           | themes                              | jsonb                       | YES         |
| syndicated_stories           | story_date                          | timestamp with time zone    | YES         |
| syndicated_stories           | app_id                              | uuid                        | YES         |
| syndicated_stories           | requesting_app                      | text                        | YES         |
| syndicated_stories           | cultural_restrictions               | jsonb                       | YES         |
| syndicated_stories           | share_media                         | boolean                     | YES         |
| syndicated_stories           | consent_expires_at                  | timestamp with time zone    | YES         |
| tap_funky                    | oid                                 | oid                         | YES         |
| tap_funky                    | schema                              | name                        | YES         |
| tap_funky                    | name                                | name                        | YES         |
| tap_funky                    | owner                               | name                        | YES         |
| tap_funky                    | args                                | text                        | YES         |
| tap_funky                    | returns                             | text                        | YES         |
| tap_funky                    | langoid                             | oid                         | YES         |
| tap_funky                    | is_strict                           | boolean                     | YES         |
| tap_funky                    | kind                                | "char"                      | YES         |
| tap_funky                    | is_definer                          | boolean                     | YES         |
| tap_funky                    | returns_set                         | boolean                     | YES         |
| tap_funky                    | volatility                          | character                   | YES         |
| tap_funky                    | is_visible                          | boolean                     | YES         |
| team_members                 | id                                  | uuid                        | NO          |
| team_members                 | name                                | text                        | NO          |
| team_members                 | role                                | text                        | NO          |
| team_members                 | tribe                               | text                        | YES         |
| team_members                 | description                         | text                        | YES         |
| team_members                 | quote                               | text                        | YES         |
| team_members                 | avatar_url                          | text                        | YES         |
| team_members                 | display_order                       | integer                     | YES         |
| team_members                 | is_visible                          | boolean                     | YES         |
| team_members                 | created_at                          | timestamp with time zone    | YES         |
| team_members                 | updated_at                          | timestamp with time zone    | YES         |
| tenant_ai_policies           | id                                  | uuid                        | NO          |
| tenant_ai_policies           | tenant_id                           | uuid                        | NO          |
| tenant_ai_policies           | monthly_budget_usd                  | numeric                     | YES         |
| tenant_ai_policies           | daily_budget_usd                    | numeric                     | YES         |
| tenant_ai_policies           | per_request_max_usd                 | numeric                     | YES         |
| tenant_ai_policies           | current_month_usage_usd             | numeric                     | YES         |
| tenant_ai_policies           | current_day_usage_usd               | numeric                     | YES         |
| tenant_ai_policies           | last_reset_date                     | date                        | YES         |
| tenant_ai_policies           | allowed_models                      | ARRAY                       | YES         |
| tenant_ai_policies           | blocked_models                      | ARRAY                       | YES         |
| tenant_ai_policies           | default_model                       | text                        | YES         |
| tenant_ai_policies           | auto_downgrade_enabled              | boolean                     | YES         |
| tenant_ai_policies           | downgrade_threshold_pct             | integer                     | YES         |
| tenant_ai_policies           | downgrade_model                     | text                        | YES         |
| tenant_ai_policies           | requests_per_minute                 | integer                     | YES         |
| tenant_ai_policies           | requests_per_hour                   | integer                     | YES         |
| tenant_ai_policies           | allow_streaming                     | boolean                     | YES         |
| tenant_ai_policies           | allow_function_calling              | boolean                     | YES         |
| tenant_ai_policies           | allow_vision                        | boolean                     | YES         |
| tenant_ai_policies           | require_safety_check                | boolean                     | YES         |
| tenant_ai_policies           | block_on_safety_flag                | boolean                     | YES         |
| tenant_ai_policies           | created_at                          | timestamp with time zone    | YES         |
| tenant_ai_policies           | updated_at                          | timestamp with time zone    | YES         |
| tenants                      | id                                  | uuid                        | NO          |
| tenants                      | name                                | text                        | NO          |
| tenants                      | slug                                | text                        | NO          |
| tenants                      | domain                              | text                        | YES         |
| tenants                      | description                         | text                        | YES         |
| tenants                      | contact_email                       | text                        | YES         |
| tenants                      | website_url                         | text                        | YES         |
| tenants                      | settings                            | jsonb                       | YES         |
| tenants                      | cultural_protocols                  | jsonb                       | YES         |
| tenants                      | subscription_tier                   | text                        | YES         |
| tenants                      | status                              | text                        | YES         |
| tenants                      | onboarded_at                        | timestamp with time zone    | YES         |
| tenants                      | created_at                          | timestamp with time zone    | YES         |
| tenants                      | updated_at                          | timestamp with time zone    | YES         |
| tenants                      | legacy_org_id                       | uuid                        | YES         |
| tenants                      | location                            | text                        | YES         |
| testimonials                 | id                                  | uuid                        | NO          |
| testimonials                 | name                                | text                        | NO          |
| testimonials                 | role                                | text                        | NO          |
| testimonials                 | quote                               | text                        | NO          |
| testimonials                 | context                             | text                        | YES         |
| testimonials                 | avatar_url                          | text                        | YES         |
| testimonials                 | specialties                         | jsonb                       | YES         |
| testimonials                 | source                              | text                        | YES         |
| testimonials                 | impact_statement                    | text                        | YES         |
| testimonials                 | category                            | text                        | YES         |
| testimonials                 | display_order                       | integer                     | YES         |
| testimonials                 | is_visible                          | boolean                     | YES         |
| testimonials                 | created_at                          | timestamp with time zone    | YES         |
| testimonials                 | updated_at                          | timestamp with time zone    | YES         |
| theme_associations           | id                                  | uuid                        | NO          |
| theme_associations           | theme_id                            | uuid                        | YES         |
| theme_associations           | entity_type                         | character varying           | NO          |
| theme_associations           | entity_id                           | uuid                        | NO          |
| theme_associations           | strength                            | numeric                     | YES         |
| theme_associations           | context                             | text                        | YES         |
| theme_associations           | created_at                          | timestamp with time zone    | YES         |
| theme_evolution_tracking     | id                                  | uuid                        | NO          |
| theme_evolution_tracking     | tenant_id                           | uuid                        | NO          |
| theme_evolution_tracking     | theme_name                          | text                        | NO          |
| theme_evolution_tracking     | theme_category                      | text                        | YES         |
| theme_evolution_tracking     | first_appearance                    | date                        | NO          |
| theme_evolution_tracking     | peak_prominence_date                | date                        | YES         |
| theme_evolution_tracking     | current_frequency_score             | numeric                     | YES         |
| theme_evolution_tracking     | trend_direction                     | text                        | YES         |
| theme_evolution_tracking     | related_themes                      | ARRAY                       | YES         |
| theme_evolution_tracking     | storyteller_contributors            | ARRAY                       | YES         |
| theme_evolution_tracking     | geographic_distribution             | jsonb                       | YES         |
| theme_evolution_tracking     | community_response_indicators       | ARRAY                       | YES         |
| theme_evolution_tracking     | policy_influence_events             | ARRAY                       | YES         |
| theme_evolution_tracking     | resource_mobilization_evidence      | ARRAY                       | YES         |
| theme_evolution_tracking     | created_at                          | timestamp with time zone    | YES         |
| theme_evolution_tracking     | updated_at                          | timestamp with time zone    | YES         |
| themes                       | id                                  | uuid                        | NO          |
| themes                       | name                                | character varying           | NO          |
| themes                       | description                         | text                        | YES         |
| themes                       | category                            | character varying           | YES         |
| themes                       | color                               | character varying           | YES         |
| themes                       | weight                              | numeric                     | YES         |
| themes                       | usage_count                         | integer                     | YES         |
| themes                       | created_at                          | timestamp with time zone    | YES         |
| themes                       | updated_at                          | timestamp with time zone    | YES         |
| title_suggestions            | id                                  | uuid                        | NO          |
| title_suggestions            | created_at                          | timestamp with time zone    | YES         |
| title_suggestions            | story_id                            | uuid                        | YES         |
| title_suggestions            | transcript_id                       | uuid                        | YES         |
| title_suggestions            | suggestions                         | jsonb                       | NO          |
| title_suggestions            | selected_title                      | text                        | YES         |
| title_suggestions            | selected_at                         | timestamp with time zone    | YES         |
| title_suggestions            | selected_by                         | uuid                        | YES         |
| title_suggestions            | status                              | text                        | YES         |
| tour_requests                | id                                  | uuid                        | NO          |
| tour_requests                | name                                | text                        | NO          |
| tour_requests                | email                               | text                        | NO          |
| tour_requests                | phone                               | text                        | YES         |
| tour_requests                | location_text                       | text                        | NO          |
| tour_requests                | city                                | text                        | YES         |
| tour_requests                | country                             | text                        | YES         |
| tour_requests                | latitude                            | numeric                     | YES         |
| tour_requests                | longitude                           | numeric                     | YES         |
| tour_requests                | why_visit                           | text                        | NO          |
| tour_requests                | storytellers_description            | text                        | YES         |
| tour_requests                | organization_name                   | text                        | YES         |
| tour_requests                | organization_role                   | text                        | YES         |
| tour_requests                | how_can_help                        | ARRAY                       | YES         |
| tour_requests                | status                              | text                        | YES         |
| tour_requests                | notes                               | text                        | YES         |
| tour_requests                | ghl_contact_id                      | text                        | YES         |
| tour_requests                | created_at                          | timestamp with time zone    | YES         |
| tour_requests                | updated_at                          | timestamp with time zone    | YES         |
| tour_stops                   | id                                  | uuid                        | NO          |
| tour_stops                   | location_text                       | text                        | NO          |
| tour_stops                   | city                                | text                        | YES         |
| tour_stops                   | country                             | text                        | YES         |
| tour_stops                   | latitude                            | numeric                     | NO          |
| tour_stops                   | longitude                           | numeric                     | NO          |
| tour_stops                   | status                              | text                        | YES         |
| tour_stops                   | date_start                          | date                        | YES         |
| tour_stops                   | date_end                            | date                        | YES         |
| tour_stops                   | title                               | text                        | YES         |
| tour_stops                   | description                         | text                        | YES         |
| tour_stops                   | partner_organizations               | ARRAY                       | YES         |
| tour_stops                   | stories_collected                   | integer                     | YES         |
| tour_stops                   | storytellers_met                    | integer                     | YES         |
| tour_stops                   | highlights                          | text                        | YES         |
| tour_stops                   | cover_image_url                     | text                        | YES         |
| tour_stops                   | gallery_urls                        | ARRAY                       | YES         |
| tour_stops                   | created_at                          | timestamp with time zone    | YES         |
| tour_stops                   | updated_at                          | timestamp with time zone    | YES         |
| transcription_jobs           | id                                  | uuid                        | NO          |
| transcription_jobs           | created_at                          | timestamp with time zone    | YES         |
| transcription_jobs           | media_asset_id                      | uuid                        | YES         |
| transcription_jobs           | status                              | text                        | YES         |
| transcription_jobs           | priority                            | integer                     | YES         |
| transcription_jobs           | attempts                            | integer                     | YES         |
| transcription_jobs           | max_attempts                        | integer                     | YES         |
| transcription_jobs           | error_message                       | text                        | YES         |
| transcription_jobs           | started_at                          | timestamp with time zone    | YES         |
| transcription_jobs           | completed_at                        | timestamp with time zone    | YES         |
| transcription_jobs           | created_by                          | uuid                        | YES         |
| transcription_jobs           | metadata                            | jsonb                       | YES         |
| transcripts                  | id                                  | uuid                        | NO          |
| transcripts                  | storyteller_id                      | uuid                        | YES         |
| transcripts                  | tenant_id                           | uuid                        | NO          |
| transcripts                  | title                               | text                        | NO          |
| transcripts                  | transcript_content                  | text                        | NO          |
| transcripts                  | recording_date                      | timestamp with time zone    | YES         |
| transcripts                  | duration_seconds                    | integer                     | YES         |
| transcripts                  | ai_processing_consent               | boolean                     | YES         |
| transcripts                  | processing_status                   | text                        | YES         |
| transcripts                  | transcript_quality                  | text                        | YES         |
| transcripts                  | word_count                          | integer                     | YES         |
| transcripts                  | character_count                     | integer                     | YES         |
| transcripts                  | cultural_sensitivity                | text                        | YES         |
| transcripts                  | requires_elder_review               | boolean                     | YES         |
| transcripts                  | elder_reviewed_by                   | uuid                        | YES         |
| transcripts                  | elder_reviewed_at                   | timestamp with time zone    | YES         |
| transcripts                  | audio_url                           | text                        | YES         |
| transcripts                  | video_url                           | text                        | YES         |
| transcripts                  | media_metadata                      | jsonb                       | YES         |
| transcripts                  | legacy_transcript_id                | uuid                        | YES         |
| transcripts                  | legacy_story_id                     | uuid                        | YES         |
| transcripts                  | content_embedding                   | USER-DEFINED                | YES         |
| transcripts                  | search_vector                       | tsvector                    | YES         |
| transcripts                  | created_at                          | timestamp with time zone    | YES         |
| transcripts                  | updated_at                          | timestamp with time zone    | YES         |
| transcripts                  | ai_processing_date                  | timestamp with time zone    | YES         |
| transcripts                  | ai_model_version                    | text                        | YES         |
| transcripts                  | ai_confidence_score                 | numeric                     | YES         |
| transcripts                  | processing_consent                  | boolean                     | YES         |
| transcripts                  | ai_analysis_allowed                 | boolean                     | YES         |
| transcripts                  | anonymization_level                 | text                        | YES         |
| transcripts                  | privacy_level                       | text                        | YES         |
| transcripts                  | source_video_url                    | text                        | YES         |
| transcripts                  | source_video_title                  | character varying           | YES         |
| transcripts                  | source_video_platform               | character varying           | YES         |
| transcripts                  | source_video_duration               | integer                     | YES         |
| transcripts                  | source_video_thumbnail              | text                        | YES         |
| transcripts                  | media_asset_id                      | uuid                        | YES         |
| transcripts                  | text                                | text                        | YES         |
| transcripts                  | formatted_text                      | text                        | YES         |
| transcripts                  | segments                            | jsonb                       | YES         |
| transcripts                  | language                            | text                        | YES         |
| transcripts                  | status                              | text                        | YES         |
| transcripts                  | duration                            | double precision            | YES         |
| transcripts                  | confidence                          | double precision            | YES         |
| transcripts                  | created_by                          | uuid                        | YES         |
| transcripts                  | error_message                       | text                        | YES         |
| transcripts                  | metadata                            | jsonb                       | YES         |
| transcripts                  | project_id                          | uuid                        | YES         |
| transcripts                  | story_id                            | uuid                        | YES         |
| transcripts                  | location_id                         | uuid                        | YES         |
| transcripts                  | organization_id                     | uuid                        | YES         |
| transcripts                  | ai_processing_status                | text                        | YES         |
| transcripts                  | themes                              | ARRAY                       | YES         |
| transcripts                  | key_quotes                          | ARRAY                       | YES         |
| transcripts                  | ai_summary                          | text                        | YES         |
| transcripts                  | source_empathy_entry_id             | uuid                        | YES         |
| transcripts                  | sync_date                           | timestamp with time zone    | YES         |
| transcripts                  | content                             | text                        | YES         |
| users                        | id                                  | uuid                        | NO          |
| users                        | email                               | text                        | NO          |
| users                        | full_name                           | text                        | NO          |
| users                        | phone                               | text                        | YES         |
| users                        | role                                | text                        | NO          |
| users                        | permissions                         | ARRAY                       | YES         |
| users                        | department                          | text                        | YES         |
| users                        | position                            | text                        | YES         |
| users                        | bio                                 | text                        | YES         |
| users                        | is_active                           | boolean                     | YES         |
| users                        | is_verified                         | boolean                     | YES         |
| users                        | last_login_at                       | timestamp with time zone    | YES         |
| users                        | login_count                         | integer                     | YES         |
| users                        | avatar_url                          | text                        | YES         |
| users                        | preferences                         | jsonb                       | YES         |
| users                        | project_id                          | uuid                        | YES         |
| users                        | created_at                          | timestamp with time zone    | YES         |
| users                        | updated_at                          | timestamp with time zone    | YES         |
| users_public                 | id                                  | uuid                        | YES         |
| users_public                 | email                               | text                        | YES         |
| users_public                 | full_name                           | text                        | YES         |
| users_public                 | role                                | text                        | YES         |
| users_public                 | department                          | text                        | YES         |
| users_public                 | position                            | text                        | YES         |
| users_public                 | bio                                 | text                        | YES         |
| users_public                 | avatar_url                          | text                        | YES         |
| users_public                 | is_active                           | boolean                     | YES         |
| users_public                 | created_at                          | timestamp with time zone    | YES         |
| v_agent_usage_stats          | agent_name                          | text                        | YES         |
| v_agent_usage_stats          | day                                 | timestamp with time zone    | YES         |
| v_agent_usage_stats          | total_requests                      | bigint                      | YES         |
| v_agent_usage_stats          | successful                          | bigint                      | YES         |
| v_agent_usage_stats          | failed                              | bigint                      | YES         |
| v_agent_usage_stats          | avg_duration_ms                     | numeric                     | YES         |
| v_agent_usage_stats          | total_tokens                        | bigint                      | YES         |
| v_agent_usage_stats          | total_cost_usd                      | numeric                     | YES         |
| v_agent_usage_stats          | flagged                             | bigint                      | YES         |
| v_agent_usage_stats          | blocked                             | bigint                      | YES         |
| v_tenant_ai_usage_summary    | tenant_id                           | uuid                        | YES         |
| v_tenant_ai_usage_summary    | tenant_name                         | text                        | YES         |
| v_tenant_ai_usage_summary    | monthly_budget_usd                  | numeric                     | YES         |
| v_tenant_ai_usage_summary    | current_month_usage_usd             | numeric                     | YES         |
| v_tenant_ai_usage_summary    | budget_used_pct                     | numeric                     | YES         |
| v_tenant_ai_usage_summary    | daily_budget_usd                    | numeric                     | YES         |
| v_tenant_ai_usage_summary    | current_day_usage_usd               | numeric                     | YES         |
| v_tenant_ai_usage_summary    | allowed_models                      | ARRAY                       | YES         |
| v_tenant_ai_usage_summary    | auto_downgrade_enabled              | boolean                     | YES         |
| v_tenant_ai_usage_summary    | downgrade_threshold_pct             | integer                     | YES         |
| videos                       | id                                  | uuid                        | NO          |
| videos                       | title                               | text                        | NO          |
| videos                       | description                         | text                        | YES         |
| videos                       | video_url                           | text                        | NO          |
| videos                       | video_type                          | text                        | YES         |
| videos                       | video_id                            | text                        | YES         |
| videos                       | embed_code                          | text                        | YES         |
| videos                       | thumbnail_url                       | text                        | YES         |
| videos                       | tags                                | ARRAY                       | YES         |
| videos                       | category                            | text                        | YES         |
| videos                       | service_area                        | text                        | YES         |
| videos                       | source_blog_post_id                 | uuid                        | YES         |
| videos                       | source_empathy_entry_id             | uuid                        | YES         |
| videos                       | source_notion_page_id               | text                        | YES         |
| videos                       | duration                            | integer                     | YES         |
| videos                       | view_count                          | integer                     | YES         |
| videos                       | featured                            | boolean                     | YES         |
| videos                       | is_public                           | boolean                     | YES         |
| videos                       | privacy_level                       | text                        | YES         |
| videos                       | cultural_review_required            | boolean                     | YES         |
| videos                       | cultural_approved                   | boolean                     | YES         |
| videos                       | elder_approved                      | boolean                     | YES         |
| videos                       | status                              | text                        | YES         |
| videos                       | published_at                        | timestamp with time zone    | YES         |
| videos                       | created_at                          | timestamp with time zone    | YES         |
| videos                       | updated_at                          | timestamp with time zone    | YES         |
| webhook_delivery_log         | id                                  | uuid                        | NO          |
| webhook_delivery_log         | subscription_id                     | uuid                        | NO          |
| webhook_delivery_log         | event_type                          | text                        | NO          |
| webhook_delivery_log         | event_payload                       | jsonb                       | NO          |
| webhook_delivery_log         | attempt_number                      | integer                     | YES         |
| webhook_delivery_log         | delivered_at                        | timestamp with time zone    | YES         |
| webhook_delivery_log         | response_status                     | integer                     | YES         |
| webhook_delivery_log         | response_body                       | text                        | YES         |
| webhook_delivery_log         | response_time_ms                    | integer                     | YES         |
| webhook_delivery_log         | success                             | boolean                     | YES         |
| webhook_delivery_log         | error_message                       | text                        | YES         |
| webhook_delivery_log         | next_retry_at                       | timestamp with time zone    | YES         |
| webhook_delivery_log         | created_at                          | timestamp with time zone    | YES         |
| webhook_subscriptions        | id                                  | uuid                        | NO          |
| webhook_subscriptions        | app_id                              | uuid                        | NO          |
| webhook_subscriptions        | webhook_url                         | text                        | NO          |
| webhook_subscriptions        | secret_key                          | text                        | NO          |
| webhook_subscriptions        | events                              | ARRAY                       | NO          |
| webhook_subscriptions        | is_active                           | boolean                     | YES         |
| webhook_subscriptions        | last_triggered_at                   | timestamp with time zone    | YES         |
| webhook_subscriptions        | last_success_at                     | timestamp with time zone    | YES         |
| webhook_subscriptions        | last_failure_at                     | timestamp with time zone    | YES         |
| webhook_subscriptions        | failure_count                       | integer                     | YES         |
| webhook_subscriptions        | consecutive_failures                | integer                     | YES         |
| webhook_subscriptions        | max_consecutive_failures            | integer                     | YES         |
| webhook_subscriptions        | description                         | text                        | YES         |
| webhook_subscriptions        | created_at                          | timestamp with time zone    | YES         |
| webhook_subscriptions        | updated_at                          | timestamp with time zone    | YES         |