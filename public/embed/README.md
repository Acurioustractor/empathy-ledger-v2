# Empathy Ledger Gallery Embed Widget

Embed Empathy Ledger galleries on external sites with full attribution and cultural safety controls.

## Quick Start

Add this HTML to your page:

```html
<div
  id="el-gallery"
  data-gallery-id="YOUR_GALLERY_ID"
  data-token="YOUR_EMBED_TOKEN">
</div>
<script src="https://empathyledger.org/embed/gallery.js"></script>
```

## Getting an Embed Token

1. Go to **Admin > Galleries** in Empathy Ledger
2. Select a gallery and open the **Syndication** tab
3. Click **Add Site** and select the target site
4. Configure permissions (full resolution, downloads, etc.)
5. Copy the generated embed token

## Configuration Options

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `data-gallery-id` | string | *required* | The UUID of the gallery to embed |
| `data-token` | string | *required* | Authentication token from syndication setup |
| `data-layout` | string | `"grid"` | Layout mode: `"grid"`, `"carousel"`, or `"slideshow"` |
| `data-theme` | string | `"light"` | Color theme: `"light"` or `"dark"` |
| `data-columns` | number | `3` | Number of columns for grid layout (1-6) |
| `data-show-captions` | boolean | `"true"` | Show photo titles and descriptions |
| `data-show-attribution` | boolean | `"true"` | Show storyteller attribution |
| `data-lightbox` | boolean | `"true"` | Enable click-to-expand lightbox |
| `data-autoplay` | boolean | `"false"` | Auto-advance carousel slides |
| `data-autoplay-interval` | number | `5000` | Autoplay interval in milliseconds |

## Layout Examples

### Grid Layout (Default)

```html
<div
  data-gallery-id="xxx"
  data-token="yyy"
  data-layout="grid"
  data-columns="4">
</div>
```

### Carousel Layout

```html
<div
  data-gallery-id="xxx"
  data-token="yyy"
  data-layout="carousel"
  data-autoplay="true"
  data-autoplay-interval="4000">
</div>
```

### Dark Theme with Lightbox Disabled

```html
<div
  data-gallery-id="xxx"
  data-token="yyy"
  data-theme="dark"
  data-lightbox="false">
</div>
```

## API Base URL

By default, the widget fetches from `https://empathyledger.org`. For development or custom deployments, set `window.EL_API_BASE` before the script loads:

```html
<script>
  window.EL_API_BASE = 'http://localhost:3000';
</script>
<script src="http://localhost:3000/embed/gallery.js"></script>
```

## Manual Initialization

The widget auto-initializes on DOMContentLoaded. For SPAs or dynamic content, initialize manually:

```javascript
// Initialize all galleries on the page
window.EmpathyLedgerGallery.init();

// Initialize a specific container
var container = document.getElementById('my-gallery');
window.EmpathyLedgerGallery.initGallery(container);
```

## API Response Format

The embed API (`/api/v1/galleries/{id}/embed`) returns:

```json
{
  "gallery": {
    "id": "uuid",
    "title": "Gallery Title",
    "description": "Description text",
    "coverImageUrl": "https://...",
    "photoCount": 12,
    "createdAt": "2026-01-20T..."
  },
  "photos": [
    {
      "id": "uuid",
      "url": "https://...",
      "thumbnailUrl": "https://...",
      "title": "Photo Title",
      "description": "Photo description",
      "isCover": false,
      "sortOrder": 0
    }
  ],
  "storytellers": [
    {
      "id": "uuid",
      "name": "Jane Doe",
      "avatarUrl": "https://...",
      "role": "photographer",
      "isPrimary": true
    }
  ],
  "permissions": {
    "allowDownload": false,
    "allowFullResolution": true
  },
  "attribution": {
    "source": "Empathy Ledger",
    "sourceUrl": "https://empathyledger.org"
  }
}
```

## Security

- **Token validation**: Each request validates the embed token against the database
- **Domain restrictions**: Tokens can be restricted to specific domains
- **CORS**: The API supports CORS for cross-origin requests
- **Usage tracking**: Each request logs the domain and increments usage count
- **Expiration**: Tokens can have an expiration date

## Cultural Safety

The syndication system respects Empathy Ledger's cultural safety protocols:

- **Elder approval**: Some galleries may require elder approval before syndication
- **Cultural notes**: Syndication consents can include cultural context notes
- **Revocation**: Gallery owners can revoke syndication at any time
- **Attribution**: Storyteller attribution is always displayed by default

## Troubleshooting

### "Missing gallery ID or token"
Ensure both `data-gallery-id` and `data-token` attributes are set.

### "Invalid or expired token"
The token may be expired, revoked, or incorrect. Request a new token from the Empathy Ledger admin.

### "Domain not authorized"
The current domain is not in the token's allowed domains list. Contact the gallery administrator.

### "Gallery not syndicated to this site"
The gallery hasn't been approved for syndication to this site. Request syndication from the admin panel.

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

The widget uses ES5 syntax for broad compatibility.
