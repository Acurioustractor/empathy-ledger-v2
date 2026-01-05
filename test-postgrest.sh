#!/bin/bash

ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bnVheXpzbHVrYW1penJsaHdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyNDQ4NTAsImV4cCI6MjA3MTgyMDg1MH0.UV8JOXSwANMl72lRjw-9d4CKniHSlDk9hHZpKHYN6Bs"

echo "Testing storytellers table..."
curl -s "https://yvnuayzslukamizrlhwb.supabase.co/rest/v1/storytellers?select=id,display_name&limit=3" \
  -H "apikey: ${ANON_KEY}" \
  -H "Authorization: Bearer ${ANON_KEY}"

echo -e "\n\nTesting stories with storytellers join..."
curl -s "https://yvnuayzslukamizrlhwb.supabase.co/rest/v1/stories?select=id,title,storyteller:storytellers(display_name)&status=eq.published&is_public=eq.true&limit=2" \
  -H "apikey: ${ANON_KEY}" \
  -H "Authorization: Bearer ${ANON_KEY}"
