#!/bin/bash
# Test Sprint 2 Story Creation API with all fixes applied

echo "🧪 Testing Story Creation API (Final)..."

curl -X POST http://localhost:3030/api/stories \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Sprint 2 API Test - All Systems",
    "content": "This is a final comprehensive test of the Sprint 2 story creation API with all RLS fixes, audit logging enabled, and proper schema field mapping. Testing word count auto-calculation and all new fields.",
    "storyteller_id": "ee202ace-d18b-4d9f-bf2a-c700eb3480fa",
    "tenant_id": "5cbeb68f-9cae-46f6-b292-6dbb4520a7b1",
    "excerpt": "Final API test with all systems operational",
    "story_type": "text",
    "location": "API Test Location",
    "tags": ["test", "sprint2", "api-final"],
    "cultural_sensitivity_level": "standard",
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
