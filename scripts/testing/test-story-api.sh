#!/bin/bash
# Test Sprint 2 Story Creation API

echo "🧪 Testing Story Creation API..."

curl -X POST http://localhost:3030/api/stories \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Sprint 2 Test Story",
    "content": "This is a comprehensive test of all the new Sprint 2 fields including cultural sensitivity protocols, Elder review workflows, and automated word count tracking.",
    "storyteller_id": "ee202ace-d18b-4d9f-bf2a-c700eb3480fa",
    "excerpt": "A comprehensive test story for Sprint 2 features",
    "story_type": "text",
    "location": "Traditional Territory - Test Location",
    "tags": ["test", "sprint2", "cultural-protocols"],
    "cultural_sensitivity_level": "moderate",
    "requires_elder_review": false,
    "visibility": "public",
    "enable_ai_processing": true,
    "notify_community": true,
    "language": "en",
    "has_explicit_consent": true
  }'

echo ""
echo "✅ Test complete"
