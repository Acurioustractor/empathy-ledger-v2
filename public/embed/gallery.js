/**
 * Empathy Ledger Gallery Embed Widget
 *
 * Usage:
 * <div id="el-gallery" data-gallery-id="xxx" data-token="yyy"></div>
 * <script src="https://empathyledger.org/embed/gallery.js"></script>
 *
 * Options (data attributes):
 * - data-gallery-id: Required. The gallery UUID
 * - data-token: Required. The embed token for authentication
 * - data-theme: Optional. "light" (default) or "dark"
 * - data-columns: Optional. Number of columns (1-6, default 3)
 * - data-show-captions: Optional. "true" or "false" (default "true")
 * - data-show-attribution: Optional. "true" or "false" (default "true")
 */
(function() {
  'use strict';

  // Configuration
  var API_BASE = window.EL_API_BASE || 'https://empathyledger.org';
  var CONTAINER_SELECTOR = '[data-gallery-id]';

  // Styles injected into the page
  var STYLES = `
    .el-gallery-container {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      max-width: 100%;
      margin: 0 auto;
    }
    .el-gallery-container * {
      box-sizing: border-box;
    }
    .el-gallery-header {
      margin-bottom: 1.5rem;
    }
    .el-gallery-title {
      font-size: 1.5rem;
      font-weight: 600;
      margin: 0 0 0.5rem 0;
      color: #1a1a1a;
    }
    .el-gallery-description {
      color: #666;
      margin: 0;
      line-height: 1.5;
    }
    .el-gallery-grid {
      display: grid;
      gap: 1rem;
    }
    .el-gallery-grid[data-columns="1"] { grid-template-columns: 1fr; }
    .el-gallery-grid[data-columns="2"] { grid-template-columns: repeat(2, 1fr); }
    .el-gallery-grid[data-columns="3"] { grid-template-columns: repeat(3, 1fr); }
    .el-gallery-grid[data-columns="4"] { grid-template-columns: repeat(4, 1fr); }
    .el-gallery-grid[data-columns="5"] { grid-template-columns: repeat(5, 1fr); }
    .el-gallery-grid[data-columns="6"] { grid-template-columns: repeat(6, 1fr); }
    @media (max-width: 768px) {
      .el-gallery-grid[data-columns="3"],
      .el-gallery-grid[data-columns="4"],
      .el-gallery-grid[data-columns="5"],
      .el-gallery-grid[data-columns="6"] {
        grid-template-columns: repeat(2, 1fr);
      }
    }
    @media (max-width: 480px) {
      .el-gallery-grid {
        grid-template-columns: 1fr !important;
      }
    }
    .el-gallery-item {
      position: relative;
      overflow: hidden;
      border-radius: 8px;
      background: #f5f5f5;
    }
    .el-gallery-item img {
      width: 100%;
      height: auto;
      display: block;
      aspect-ratio: 4/3;
      object-fit: cover;
      transition: transform 0.3s ease;
    }
    .el-gallery-item:hover img {
      transform: scale(1.05);
    }
    .el-gallery-caption {
      padding: 0.75rem;
      background: rgba(255, 255, 255, 0.95);
    }
    .el-gallery-caption-title {
      font-size: 0.875rem;
      font-weight: 500;
      margin: 0 0 0.25rem 0;
      color: #1a1a1a;
    }
    .el-gallery-caption-desc {
      font-size: 0.75rem;
      color: #666;
      margin: 0;
      line-height: 1.4;
    }
    .el-gallery-attribution {
      margin-top: 1.5rem;
      padding-top: 1rem;
      border-top: 1px solid #eee;
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      align-items: center;
    }
    .el-gallery-storyteller {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .el-gallery-storyteller-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #ddd;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      color: #666;
    }
    .el-gallery-storyteller-avatar img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
    }
    .el-gallery-storyteller-info {
      font-size: 0.75rem;
    }
    .el-gallery-storyteller-name {
      font-weight: 500;
      color: #1a1a1a;
    }
    .el-gallery-storyteller-role {
      color: #888;
      text-transform: capitalize;
    }
    .el-gallery-footer {
      margin-top: 1rem;
      padding-top: 0.75rem;
      border-top: 1px solid #eee;
      text-align: center;
    }
    .el-gallery-powered {
      font-size: 0.625rem;
      color: #999;
      text-decoration: none;
    }
    .el-gallery-powered:hover {
      color: #666;
    }
    .el-gallery-loading {
      text-align: center;
      padding: 2rem;
      color: #666;
    }
    .el-gallery-error {
      text-align: center;
      padding: 2rem;
      color: #c00;
      background: #fff5f5;
      border-radius: 8px;
    }
    /* Dark theme */
    .el-gallery-container.el-theme-dark {
      background: #1a1a1a;
      padding: 1.5rem;
      border-radius: 12px;
    }
    .el-theme-dark .el-gallery-title { color: #fff; }
    .el-theme-dark .el-gallery-description { color: #aaa; }
    .el-theme-dark .el-gallery-item { background: #333; }
    .el-theme-dark .el-gallery-caption { background: rgba(26, 26, 26, 0.95); }
    .el-theme-dark .el-gallery-caption-title { color: #fff; }
    .el-theme-dark .el-gallery-caption-desc { color: #aaa; }
    .el-theme-dark .el-gallery-attribution { border-color: #333; }
    .el-theme-dark .el-gallery-storyteller-name { color: #fff; }
    .el-theme-dark .el-gallery-footer { border-color: #333; }
    .el-theme-dark .el-gallery-loading { color: #aaa; }
    .el-theme-dark .el-gallery-error { background: #2a1a1a; color: #ff6b6b; }
  `;

  // Inject styles once
  function injectStyles() {
    if (document.getElementById('el-gallery-styles')) return;
    var style = document.createElement('style');
    style.id = 'el-gallery-styles';
    style.textContent = STYLES;
    document.head.appendChild(style);
  }

  // Fetch gallery data from API
  function fetchGallery(galleryId, token) {
    var url = API_BASE + '/api/v1/galleries/' + galleryId + '/embed?token=' + encodeURIComponent(token);

    return fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    })
    .then(function(response) {
      if (!response.ok) {
        return response.json().then(function(data) {
          throw new Error(data.error || 'Failed to load gallery');
        });
      }
      return response.json();
    });
  }

  // Get initials for avatar fallback
  function getInitials(name) {
    if (!name) return '?';
    var parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  // Render the gallery
  function renderGallery(container, data, options) {
    var gallery = data.gallery;
    var photos = data.photos || [];
    var storytellers = data.storytellers || [];

    var html = [];

    // Header
    if (gallery.title || gallery.description) {
      html.push('<div class="el-gallery-header">');
      if (gallery.title) {
        html.push('<h2 class="el-gallery-title">' + escapeHtml(gallery.title) + '</h2>');
      }
      if (gallery.description) {
        html.push('<p class="el-gallery-description">' + escapeHtml(gallery.description) + '</p>');
      }
      html.push('</div>');
    }

    // Photo grid
    if (photos.length > 0) {
      html.push('<div class="el-gallery-grid" data-columns="' + options.columns + '">');
      photos.forEach(function(photo) {
        html.push('<div class="el-gallery-item">');
        html.push('<img src="' + escapeHtml(photo.url) + '" alt="' + escapeHtml(photo.title || '') + '" loading="lazy" />');
        if (options.showCaptions && (photo.title || photo.description)) {
          html.push('<div class="el-gallery-caption">');
          if (photo.title) {
            html.push('<p class="el-gallery-caption-title">' + escapeHtml(photo.title) + '</p>');
          }
          if (photo.description) {
            html.push('<p class="el-gallery-caption-desc">' + escapeHtml(photo.description) + '</p>');
          }
          html.push('</div>');
        }
        html.push('</div>');
      });
      html.push('</div>');
    } else {
      html.push('<div class="el-gallery-loading">No photos in this gallery</div>');
    }

    // Attribution
    if (options.showAttribution && storytellers.length > 0) {
      html.push('<div class="el-gallery-attribution">');
      storytellers.forEach(function(st) {
        html.push('<div class="el-gallery-storyteller">');
        html.push('<div class="el-gallery-storyteller-avatar">');
        if (st.avatar_url) {
          html.push('<img src="' + escapeHtml(st.avatar_url) + '" alt="" />');
        } else {
          html.push(getInitials(st.display_name));
        }
        html.push('</div>');
        html.push('<div class="el-gallery-storyteller-info">');
        html.push('<div class="el-gallery-storyteller-name">' + escapeHtml(st.display_name || 'Anonymous') + '</div>');
        if (st.role) {
          html.push('<div class="el-gallery-storyteller-role">' + escapeHtml(st.role.replace(/_/g, ' ')) + '</div>');
        }
        html.push('</div>');
        html.push('</div>');
      });
      html.push('</div>');
    }

    // Footer
    html.push('<div class="el-gallery-footer">');
    html.push('<a href="https://empathyledger.org" class="el-gallery-powered" target="_blank" rel="noopener">');
    html.push('Powered by Empathy Ledger');
    html.push('</a>');
    html.push('</div>');

    container.innerHTML = html.join('');
  }

  // HTML escape utility
  function escapeHtml(text) {
    if (!text) return '';
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Initialize a single gallery container
  function initGallery(container) {
    var galleryId = container.getAttribute('data-gallery-id');
    var token = container.getAttribute('data-token');

    if (!galleryId || !token) {
      container.innerHTML = '<div class="el-gallery-error">Missing gallery ID or token</div>';
      return;
    }

    var options = {
      theme: container.getAttribute('data-theme') || 'light',
      columns: parseInt(container.getAttribute('data-columns'), 10) || 3,
      showCaptions: container.getAttribute('data-show-captions') !== 'false',
      showAttribution: container.getAttribute('data-show-attribution') !== 'false'
    };

    // Clamp columns
    options.columns = Math.max(1, Math.min(6, options.columns));

    // Add container class
    container.className = 'el-gallery-container' + (options.theme === 'dark' ? ' el-theme-dark' : '');
    container.innerHTML = '<div class="el-gallery-loading">Loading gallery...</div>';

    fetchGallery(galleryId, token)
      .then(function(data) {
        renderGallery(container, data, options);
      })
      .catch(function(error) {
        container.innerHTML = '<div class="el-gallery-error">' + escapeHtml(error.message) + '</div>';
      });
  }

  // Initialize all galleries on page
  function init() {
    injectStyles();
    var containers = document.querySelectorAll(CONTAINER_SELECTOR);
    containers.forEach(initGallery);
  }

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose for manual initialization
  window.EmpathyLedgerGallery = {
    init: init,
    initGallery: initGallery
  };
})();
