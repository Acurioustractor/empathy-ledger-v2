-- Seed Interview Templates Table
-- Stores reusable question templates for organization and project interviews
-- Enables customization and evolution of seed interview process

CREATE TABLE IF NOT EXISTS seed_interview_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  template_type VARCHAR(50) CHECK (template_type IN ('organization', 'project', 'both')),

  -- Questions stored as JSONB array
  questions JSONB NOT NULL,
  -- Example structure:
  -- [
  --   {
  --     "id": "q1",
  --     "section": "Core Identity",
  --     "question": "What is your organization's mission?",
  --     "help_text": "What do you exist to do?",
  --     "required": true,
  --     "type": "textarea",
  --     "order": 1
  --   }
  -- ]

  -- Metadata
  is_default BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  version INTEGER DEFAULT 1,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),

  -- Only one default template per type
  CONSTRAINT unique_default_template UNIQUE NULLS NOT DISTINCT (template_type, is_default)
    WHERE is_default = TRUE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_seed_templates_type ON seed_interview_templates(template_type);
CREATE INDEX IF NOT EXISTS idx_seed_templates_default ON seed_interview_templates(template_type, is_default) WHERE is_default = TRUE;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_seed_interview_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER seed_interview_templates_updated_at
  BEFORE UPDATE ON seed_interview_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_seed_interview_templates_updated_at();

-- Enable RLS
ALTER TABLE seed_interview_templates ENABLE ROW LEVEL SECURITY;

-- Policies: Everyone can view active templates
CREATE POLICY "Anyone can view active templates"
  ON seed_interview_templates
  FOR SELECT
  USING (is_active = TRUE);

-- Policies: Only admins can manage templates
CREATE POLICY "Admins can manage templates"
  ON seed_interview_templates
  FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM profile_organizations po
      WHERE po.profile_id = auth.uid()
        AND po.role = 'admin'
        AND po.is_active = TRUE
    )
  );

-- Add helpful comments
COMMENT ON TABLE seed_interview_templates IS 'Reusable question templates for organization and project seed interviews';
COMMENT ON COLUMN seed_interview_templates.questions IS 'JSONB array of question objects with id, section, question text, help text, type, and order';

-- Insert Default Organization Template
INSERT INTO seed_interview_templates (
  name,
  description,
  template_type,
  questions,
  is_default,
  version
) VALUES (
  'Default Organization Seed Interview',
  'Standard questions for capturing organization context: mission, values, approach, impact methodology',
  'organization',
  '[
    {
      "id": "org_q1",
      "section": "Core Identity",
      "question": "What is your organization''s mission?",
      "help_text": "What do you exist to do?",
      "type": "textarea",
      "required": true,
      "order": 1
    },
    {
      "id": "org_q2",
      "section": "Core Identity",
      "question": "What is your vision?",
      "help_text": "What world are you working toward?",
      "type": "textarea",
      "required": false,
      "order": 2
    },
    {
      "id": "org_q3",
      "section": "Core Identity",
      "question": "What values guide your work?",
      "help_text": "List 3-5 core values",
      "type": "textarea",
      "required": true,
      "order": 3
    },
    {
      "id": "org_q4",
      "section": "Approach & Culture",
      "question": "How would you describe your approach to this work?",
      "help_text": "What makes your approach unique?",
      "type": "textarea",
      "required": true,
      "order": 4
    },
    {
      "id": "org_q5",
      "section": "Approach & Culture",
      "question": "What cultural frameworks or practices guide your work?",
      "help_text": "e.g., Dadirri, Two-way learning, OCAP principles",
      "type": "textarea",
      "required": false,
      "order": 5
    },
    {
      "id": "org_q6",
      "section": "Approach & Culture",
      "question": "What makes your approach different or unique?",
      "help_text": "How do you differ from other organizations?",
      "type": "textarea",
      "required": false,
      "order": 6
    },
    {
      "id": "org_q7",
      "section": "Impact & Measurement",
      "question": "What does impact mean for your organization?",
      "help_text": "Both immediate and long-term impact",
      "type": "textarea",
      "required": true,
      "order": 7
    },
    {
      "id": "org_q8",
      "section": "Impact & Measurement",
      "question": "What areas of life or systems do you focus on?",
      "help_text": "Individual, family, community, systems change?",
      "type": "checkboxes",
      "options": ["Individual wellbeing", "Family strengthening", "Community development", "Systems change", "Other"],
      "required": true,
      "order": 8
    },
    {
      "id": "org_q9",
      "section": "Impact & Measurement",
      "question": "How do you know when you''re making a difference?",
      "help_text": "What signs of success do you look for?",
      "type": "textarea",
      "required": true,
      "order": 9
    },
    {
      "id": "org_q10",
      "section": "Impact & Measurement",
      "question": "What would you celebrate as a major success?",
      "help_text": "Dream outcome for your work",
      "type": "textarea",
      "required": false,
      "order": 10
    },
    {
      "id": "org_q11",
      "section": "Resources (Optional)",
      "question": "Website URL",
      "help_text": "Your organization''s website",
      "type": "url",
      "required": false,
      "order": 11
    },
    {
      "id": "org_q12",
      "section": "Resources (Optional)",
      "question": "Theory of Change or Impact Framework URL",
      "help_text": "Link to existing document",
      "type": "url",
      "required": false,
      "order": 12
    },
    {
      "id": "org_q13",
      "section": "Resources (Optional)",
      "question": "Recent Impact Report URL",
      "help_text": "Link to annual report or impact report",
      "type": "url",
      "required": false,
      "order": 13
    }
  ]'::jsonb,
  TRUE,
  1
);

-- Insert Default Project Template
INSERT INTO seed_interview_templates (
  name,
  description,
  template_type,
  questions,
  is_default,
  version
) VALUES (
  'Default Project Seed Interview',
  'Standard questions for capturing project context: purpose, outcomes, success criteria, methodology',
  'project',
  '[
    {
      "id": "proj_q1",
      "section": "Purpose & Context",
      "question": "What is this project trying to achieve?",
      "help_text": "The main goal or purpose",
      "type": "textarea",
      "required": true,
      "order": 1
    },
    {
      "id": "proj_q2",
      "section": "Purpose & Context",
      "question": "Why does this project exist?",
      "help_text": "What need or opportunity prompted this project?",
      "type": "textarea",
      "required": true,
      "order": 2
    },
    {
      "id": "proj_q3",
      "section": "Purpose & Context",
      "question": "Who are you working with?",
      "help_text": "Target population or community",
      "type": "textarea",
      "required": true,
      "order": 3
    },
    {
      "id": "proj_q4",
      "section": "Success Definition",
      "question": "What does success look like for this project?",
      "help_text": "Describe the desired end state",
      "type": "textarea",
      "required": true,
      "order": 4
    },
    {
      "id": "proj_q5",
      "section": "Success Definition",
      "question": "How will you know when you''ve made a difference?",
      "help_text": "Specific indicators or signs of success",
      "type": "textarea",
      "required": true,
      "order": 5
    },
    {
      "id": "proj_q6",
      "section": "Success Definition",
      "question": "What specific changes are you hoping to see in people''s lives?",
      "help_text": "Tangible outcomes for participants",
      "type": "textarea",
      "required": true,
      "order": 6
    },
    {
      "id": "proj_q7",
      "section": "How It Works",
      "question": "How does this project work?",
      "help_text": "Describe your program model or approach",
      "type": "textarea",
      "required": true,
      "order": 7
    },
    {
      "id": "proj_q8",
      "section": "How It Works",
      "question": "What are the key activities or services?",
      "help_text": "Main things you do in this project",
      "type": "textarea",
      "required": true,
      "order": 8
    },
    {
      "id": "proj_q9",
      "section": "How It Works",
      "question": "What cultural approaches or protocols guide this project?",
      "help_text": "Cultural practices or frameworks",
      "type": "textarea",
      "required": false,
      "order": 9
    },
    {
      "id": "proj_q10",
      "section": "How It Works",
      "question": "Who leads the project?",
      "help_text": "Community-led, partnership, organization-led?",
      "type": "textarea",
      "required": false,
      "order": 10
    },
    {
      "id": "proj_q11",
      "section": "Outcomes & Timeline",
      "question": "What outcomes are you expecting?",
      "help_text": "Short-term, medium-term, and long-term",
      "type": "textarea",
      "required": true,
      "order": 11
    },
    {
      "id": "proj_q12",
      "section": "Outcomes & Timeline",
      "question": "What''s the project timeframe?",
      "help_text": "Duration and key phases",
      "type": "text",
      "required": false,
      "order": 12
    },
    {
      "id": "proj_q13",
      "section": "Outcomes & Timeline",
      "question": "What would you consider ''early wins'' vs ''long-term impact''?",
      "help_text": "Different levels of success",
      "type": "textarea",
      "required": false,
      "order": 13
    },
    {
      "id": "proj_q14",
      "section": "Existing Documents (Optional)",
      "question": "Paste existing project documents here",
      "help_text": "Theory of change, logic model, project description - AI will extract",
      "type": "textarea",
      "required": false,
      "order": 14
    }
  ]'::jsonb,
  TRUE,
  1
);

-- Log success
DO $$
BEGIN
  RAISE NOTICE 'Successfully created seed_interview_templates table and inserted % default templates',
    (SELECT COUNT(*) FROM seed_interview_templates WHERE is_default = TRUE);
END $$;
