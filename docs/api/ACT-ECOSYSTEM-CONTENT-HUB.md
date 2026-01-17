# ACT Ecosystem Content Hub API

Empathy Ledger serves as the central content repository for the entire ACT ecosystem. This API enables any ACT site to pull media content (photos, videos, audio) with cultural safety metadata.

## Ecosystem Sites

- **JusticeHub** - Legal advocacy platform
- **ACT Farm** - Agricultural initiatives
- **The Harvest** - Food systems
- **Goods on Country** - Indigenous commerce
- **ACT Placemat** - Community mapping
- **ACT Studio** - Creative production

## Base URL

```
Production: https://empathyledger.com/api/v1/content-hub
Development: http://localhost:3001/api/v1/content-hub
```

## Authentication

| Level | Header | Access |
|-------|--------|--------|
| Anonymous | None | Public content only |
| Community | `Authorization: Bearer <token>` | Public + community content |
| Ecosystem | `X-API-Key: <api-key>` | All content (for ACT sites) |

Request an API key via the ACT admin portal.

---

## GET /media

Fetch media assets with filtering.

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `organization_id` | UUID | Filter by organization |
| `project_code` | string | Filter by ACT project (e.g., `justicehub`, `act-farm`) |
| `type` | string | Media type: `image`, `video`, `audio` |
| `theme` | string | Narrative theme filter |
| `elder_approved` | boolean | Filter to elder-approved content only |
| `cultural_tags` | string | Comma-separated tags (e.g., `healing,culture,country`) |
| `page` | number | Page number (default: 1) |
| `limit` | number | Results per page (max: 50, default: 20) |

### Response

```json
{
  "media": [
    {
      "id": "uuid",
      "url": "https://...",
      "thumbnailUrl": "https://...",
      "title": "Youth Mentorship Program",
      "description": "Community mentorship in action...",
      "altText": "Young people in cultural activity",
      "mediaType": "image",
      "width": 1920,
      "height": 1080,
      "duration": null,
      "organizationId": "uuid",
      "projectCode": "justicehub",
      "elderApproved": true,
      "consentObtained": true,
      "culturalTags": ["healing", "youth", "mentorship"],
      "culturalSensitivity": "standard",
      "attributionText": "Photo by Oonchiumpa",
      "uploaderName": "Sarah Thompson",
      "createdAt": "2026-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "hasMore": true
  },
  "ecosystem": {
    "source": "empathy-ledger",
    "version": "v1",
    "accessLevel": "ecosystem",
    "filters": {
      "organizationId": "uuid",
      "projectCode": "justicehub",
      "mediaType": "image",
      "theme": null,
      "elderApproved": true
    }
  }
}
```

---

## Usage Examples

### Fetch all photos for an organization

```bash
curl "https://empathyledger.com/api/v1/content-hub/media?organization_id=UUID&type=image" \
  -H "X-API-Key: your-api-key"
```

### Fetch elder-approved videos for JusticeHub

```bash
curl "https://empathyledger.com/api/v1/content-hub/media?project_code=justicehub&type=video&elder_approved=true" \
  -H "X-API-Key: your-api-key"
```

### Fetch content by cultural tags

```bash
curl "https://empathyledger.com/api/v1/content-hub/media?cultural_tags=healing,country&elder_approved=true" \
  -H "X-API-Key: your-api-key"
```

---

## Integration Guide

### TypeScript/JavaScript

```typescript
// Service class for ACT sites
class EmpathyLedgerClient {
  private baseUrl = 'https://empathyledger.com';
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async fetchMedia(options: {
    organizationId?: string;
    projectCode?: string;
    type?: 'image' | 'video' | 'audio';
    elderApproved?: boolean;
  }) {
    const params = new URLSearchParams();

    if (options.organizationId) params.append('organization_id', options.organizationId);
    if (options.projectCode) params.append('project_code', options.projectCode);
    if (options.type) params.append('type', options.type);
    if (options.elderApproved) params.append('elder_approved', 'true');

    const response = await fetch(
      `${this.baseUrl}/api/v1/content-hub/media?${params}`,
      {
        headers: { 'X-API-Key': this.apiKey }
      }
    );

    return response.json();
  }
}

// Usage
const client = new EmpathyLedgerClient(process.env.EL_API_KEY);
const photos = await client.fetchMedia({
  projectCode: 'act-farm',
  type: 'image',
  elderApproved: true,
});
```

### Python

```python
import requests

class EmpathyLedgerClient:
    def __init__(self, api_key: str):
        self.base_url = "https://empathyledger.com"
        self.api_key = api_key

    def fetch_media(
        self,
        organization_id: str = None,
        project_code: str = None,
        media_type: str = None,
        elder_approved: bool = False,
    ):
        params = {}
        if organization_id:
            params["organization_id"] = organization_id
        if project_code:
            params["project_code"] = project_code
        if media_type:
            params["type"] = media_type
        if elder_approved:
            params["elder_approved"] = "true"

        response = requests.get(
            f"{self.base_url}/api/v1/content-hub/media",
            params=params,
            headers={"X-API-Key": self.api_key},
        )
        return response.json()

# Usage
client = EmpathyLedgerClient(os.environ["EL_API_KEY"])
videos = client.fetch_media(project_code="the-harvest", media_type="video")
```

---

## Cultural Safety

All content in Empathy Ledger follows cultural safety protocols:

| Field | Description |
|-------|-------------|
| `elderApproved` | Content has been reviewed by community elders |
| `consentObtained` | Appropriate consent obtained from participants |
| `culturalSensitivity` | Level: `standard`, `sensitive`, `restricted` |
| `culturalTags` | Tags for cultural categorization |
| `attributionText` | Required attribution when displaying |

**Important:** Always display `attributionText` when present. Respect `culturalSensitivity` levels in your UI.

---

## Organization Registration

To register your organization in Empathy Ledger:

1. Create an organization profile in EL admin
2. Get your `organization_id` UUID
3. Tag uploaded content with your organization
4. Content will appear in ecosystem API queries

---

## Rate Limits

| Level | Requests/minute |
|-------|-----------------|
| Anonymous | 10 |
| Community | 60 |
| Ecosystem | 300 |

---

## Changelog

### v1 (2026-01-17)
- Initial release
- Organization and project filtering
- Cultural safety metadata
- Elder-approved content filter
- Cultural tags filtering
