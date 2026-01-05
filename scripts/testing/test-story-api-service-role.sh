#!/bin/bash
# Test Sprint 2 Story Creation API with Service Role (bypasses RLS)

echo "🧪 Testing Story Creation API with Service Role..."

# Get service role key from .env.local
SERVICE_ROLE_KEY=$(grep "^SUPABASE_SERVICE_ROLE_KEY=" .env.local | cut -d'=' -f2)

curl -X POST http://localhost:3030/api/stories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
  -d '{
    "title": "Sprint 2 Test Story - Service Role",
    "content": "This is a comprehensive test of all the new Sprint 2 fields including cultural sensitivity protocols, Elder review workflows, and automated word count tracking. Testing with more content to verify word count calculation works correctly.",
    "storyteller_id": "ee202ace-d18b-4d9f-bf2a-c700eb3480fa",
    "excerpt": "A comprehensive test story for Sprint 2 features",
    "story_type": "text",
    "location": "Traditional Territory - Test Location",
    "tags": ["test", "sprint2", "cultural-protocols"],
    "cultural_sensitivity_level": "moderate",
    "requires_elder_review": false,
    "privacy_level": "public",
    "is_public": true,
    "enable_ai_processing": true,
    "notify_community": true,
    "language": "en",
    "has_explicit_consent": true
  }' | python3 -m json.tool

echo ""
echo "✅ Test complete"
