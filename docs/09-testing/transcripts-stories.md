Testing Transcripts, Video Links, Stories, and Photos

Prerequisites
- Running dev server: `npm run dev`
- Supabase env configured in `.env.local` (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`)
- A test user profile ID (use the Admin Users API to list)

1) Identify a Test Profile (Storyteller)
- List users: `GET /api/admin/users`
  curl -s http://localhost:3000/api/admin/users | jq '.users[] | {id, email, displayName}'

- Optional: Mark user as storyteller or admin (PATCH values are flexible to your schema):
  curl -X PATCH \
    -H 'Content-Type: application/json' \
    -d '{"display_name":"Test Storyteller","is_storyteller":true,"is_admin":true}' \
    http://localhost:3000/api/admin/users/REPLACE_PROFILE_ID

2) Create a Transcript as Super Admin (with a Video URL)
- Use the admin endpoint (bypasses RLS via service role) to seed transcripts:
  curl -X POST \
    -H 'Content-Type: application/json' \
    -d '{
          "storyteller_id": "REPLACE_PROFILE_ID",
          "title": "Heart Health Story Transcript",
          "transcript_text": "This is a short transcript example for testing.",
          "source_video_url": "https://youtu.be/dQw4w9WgXcQ",
          "status": "completed",
          "metadata": {"seed": true}
        }' \
    http://localhost:3000/api/admin/transcripts

- Verify it appears on the storyteller dashboard:
  curl -s http://localhost:3000/api/storytellers/REPLACE_PROFILE_ID/dashboard | jq '.storyteller.stats, .storyteller.transcripts[0]'

3) Create a Story for the Same Profile
- Create a new story (minimum required: title, content, author_id):
  curl -X POST \
    -H 'Content-Type: application/json' \
    -d '{
          "title": "Community and Heart Health",
          "content": "A story about community, culture, and heart health.",
          "author_id": "REPLACE_PROFILE_ID",
          "status": "draft",
          "tags": ["health","community"],
          "cultural_sensitivity_level": "medium"
        }' \
    http://localhost:3000/api/stories

- Note the returned `id` as STORY_ID for the next steps.

4) Attach a Video Link to the Story
- Update the story with an embed (YouTube example):
  curl -X PUT \
    -H 'Content-Type: application/json' \
    -d '{
          "video_embed_code": "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/dQw4w9WgXcQ\" title=\"YouTube video player\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" referrerpolicy=\"strict-origin-when-cross-origin\" allowfullscreen></iframe>"
        }' \
    http://localhost:3000/api/stories/STORY_ID

5) Upload a Photo and Link It to the Story
- Upload an image (requires a local file path):
  curl -X POST \
    -F file=@/absolute/path/to/photo.jpg \
    -F title='Story Photo' \
    -F cultural_sensitivity_level=medium \
    http://localhost:3000/api/media

- From the response, capture the `asset.id` as MEDIA_ID.

- Link the media to the story via usage tracking:
  curl -X POST \
    -H 'Content-Type: application/json' \
    -d '{
          "used_in_type": "story",
          "used_in_id": "STORY_ID",
          "usage_context": "Hero image",
          "usage_role": "cover",
          "display_order": 0
        }' \
    http://localhost:3000/api/media/MEDIA_ID/usage

6) Optional: Link Media to Transcript or Profile
- To link the same image to a transcript or profile later, just change used_in_type/used_in_id:
  curl -X POST \
    -H 'Content-Type: application/json' \
    -d '{
          "used_in_type": "transcript",
          "used_in_id": "TRANSCRIPT_ID",
          "usage_context": "Related image"
        }' \
    http://localhost:3000/api/media/MEDIA_ID/usage

UI Pointers (for quick checks)
- Storyteller Dashboard API: `/api/storytellers/{id}/dashboard`
- Admin Media Review: `/admin/media-review`
- Admin Galleries (linking UI): `/admin/galleries`
- Stories list: `/stories` and Admin stories API: `/api/admin/content/stories`

Notes
- The admin transcripts API uses the service role key and is intended for development/testing to seed data quickly.
- When possible, prefer the upload + `/api/media/transcribe` flow to generate transcripts from actual media files.
