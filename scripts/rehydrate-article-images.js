const dotenv = require('dotenv')
const path = require('path')
const { createHash } = require('crypto')
const { existsSync } = require('fs')
const os = require('os')
const { execFile } = require('child_process')
const { promisify } = require('util')
const fs = require('fs/promises')
const { createClient } = require('@supabase/supabase-js')

dotenv.config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const MEDIA_BUCKET = process.env.MEDIA_BUCKET || 'media'
const JUSTICEHUB_PUBLIC_DIR =
  process.env.JUSTICEHUB_PUBLIC_DIR || '/Users/benknight/Code/JusticeHub/public'

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing Supabase credentials (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY).')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false }
})

const execFileAsync = promisify(execFile)

const EXT_BY_CONTENT_TYPE = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/pjpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/svg+xml': '.svg',
  'image/avif': '.avif',
  'image/heic': '.heic'
}

const CONTENT_TYPE_BY_EXT = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.avif': 'image/avif',
  '.heic': 'image/heic'
}

function extractImageUrls(content) {
  if (!content) return []
  const urls = new Set()
  const htmlRegex = /<img[^>]+src=["']([^"']+)["']/gi
  const dataSrcRegex = /<img[^>]+data-src=["']([^"']+)["']/gi
  const anyDataSrcRegex = /data-src=["']([^"']+)["']/gi
  let match

  while ((match = htmlRegex.exec(content)) !== null) {
    if (match[1]) urls.add(match[1])
  }

  while ((match = dataSrcRegex.exec(content)) !== null) {
    if (match[1]) urls.add(match[1])
  }

  while ((match = anyDataSrcRegex.exec(content)) !== null) {
    if (match[1]) urls.add(match[1])
  }

  // Manual parse for markdown image URLs to support parentheses in paths
  const marker = '!['
  let index = 0
  while (index < content.length) {
    const start = content.indexOf(marker, index)
    if (start === -1) break
    const openBracket = content.indexOf('](', start)
    if (openBracket === -1) {
      index = start + marker.length
      continue
    }
    let cursor = openBracket + 2
    let depth = 1
    let url = ''
    while (cursor < content.length) {
      const char = content[cursor]
      if (char === '(') depth += 1
      if (char === ')') depth -= 1
      if (depth === 0) break
      url += char
      cursor += 1
    }
    if (url) urls.add(url.trim())
    index = cursor + 1
  }

  return Array.from(urls)
}

function normalizeUrl(url) {
  if (!url) return null
  if (url.startsWith('//')) return `https:${url}`
  return url
}

function isSupabaseHosted(url) {
  return url.includes('/storage/v1/object/public/')
}

function isDataUrl(url) {
  return url.startsWith('data:')
}

function guessExtension(url, contentType) {
  if (contentType && EXT_BY_CONTENT_TYPE[contentType]) {
    return EXT_BY_CONTENT_TYPE[contentType]
  }
  try {
    const parsed = new URL(url)
    const ext = path.extname(parsed.pathname)
    if (ext) return ext
  } catch {
    const ext = path.extname(url)
    if (ext) return ext
  }
  return '.jpg'
}

function guessContentType(url) {
  try {
    const parsed = new URL(url)
    const ext = path.extname(parsed.pathname).toLowerCase()
    if (ext && CONTENT_TYPE_BY_EXT[ext]) return CONTENT_TYPE_BY_EXT[ext]
  } catch {
    const ext = path.extname(url).toLowerCase()
    if (ext && CONTENT_TYPE_BY_EXT[ext]) return CONTENT_TYPE_BY_EXT[ext]
  }
  return null
}

function getLocalPathForRelativeUrl(url) {
  if (!url.startsWith('/')) return null
  const candidate = path.join(JUSTICEHUB_PUBLIC_DIR, url)
  return existsSync(candidate) ? candidate : null
}

async function convertAvifToJpeg(localPath) {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'act-avif-'))
  const target = path.join(tmpDir, `${path.basename(localPath, path.extname(localPath))}.jpg`)
  await execFileAsync('sips', ['-s', 'format', 'jpeg', localPath, '--out', target])
  const buffer = await fs.readFile(target)
  return { buffer, contentType: 'image/jpeg' }
}

async function downloadImage(url, sourceUrl) {
  const localPath = getLocalPathForRelativeUrl(url)
  if (localPath) {
    const ext = path.extname(localPath).toLowerCase()
    if (ext === '.avif') {
      return await convertAvifToJpeg(localPath)
    }
    const buffer = await fs.readFile(localPath)
    const contentType = CONTENT_TYPE_BY_EXT[ext] || null
    return { buffer, contentType }
  }

  let fetchUrl = url
  if (url.startsWith('/') && sourceUrl) {
    try {
      fetchUrl = new URL(url, sourceUrl).toString()
    } catch {
      fetchUrl = url
    }
  }

  const attemptFetch = async targetUrl => {
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'ACT Empathy Ledger Image Sync',
        ...(sourceUrl ? { Referer: sourceUrl } : {})
      }
    })
    if (!response.ok) {
      throw new Error(`Failed to download ${targetUrl} (${response.status})`)
    }
    const arrayBuffer = await response.arrayBuffer()
    const contentType = response.headers.get('content-type') || guessContentType(targetUrl)
    return { buffer: Buffer.from(arrayBuffer), contentType }
  }

  try {
    return await attemptFetch(fetchUrl)
  } catch (err) {
    if (fetchUrl.includes('%25')) {
      try {
        const decoded = decodeURIComponent(fetchUrl)
        return await attemptFetch(decoded)
      } catch (retryErr) {
        throw retryErr
      }
    }
    throw err
  }
}

function buildStoragePath(slug, url, contentType) {
  const safeSlug = slug || 'untitled'
  const hash = createHash('sha1').update(url).digest('hex').slice(0, 16)
  const ext = guessExtension(url, contentType)
  return `photos/articles/${safeSlug}/${hash}${ext}`
}

async function uploadToSupabase(storagePath, buffer, contentType) {
  const { error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(storagePath, buffer, {
      contentType: contentType || undefined,
      upsert: false
    })

  if (error && !String(error.message).includes('The resource already exists')) {
    throw new Error(error.message)
  }

  return `${SUPABASE_URL}/storage/v1/object/public/${MEDIA_BUCKET}/${storagePath}`
}

function replaceAll(content, replacements) {
  let updated = content
  for (const [original, nextUrl] of replacements.entries()) {
    updated = updated.split(original).join(nextUrl)
  }
  return updated
}

async function main() {
  const { data: articles, error } = await supabase
    .from('articles')
    .select('id, slug, content, import_metadata, source_url')
    .eq('status', 'published')

  if (error) {
    console.error('Failed to load articles:', error.message)
    process.exit(1)
  }

  const urlCache = new Map()
  let updatedCount = 0
  let replacedCount = 0

  for (const article of articles || []) {
    const content = article.content || ''
    const importMeta = article.import_metadata || {}
    const featuredUrl = importMeta?.featuredImageUrl || null

    const urls = new Set(extractImageUrls(content))
    if (featuredUrl) urls.add(featuredUrl)

    if (urls.size === 0) {
      continue
    }

    const replacements = new Map()

    for (const rawUrl of urls) {
      if (!rawUrl) continue
      const normalized = normalizeUrl(rawUrl)
      if (!normalized || isDataUrl(normalized) || isSupabaseHosted(normalized)) {
        continue
      }

      if (urlCache.has(normalized)) {
        replacements.set(rawUrl, urlCache.get(normalized))
        continue
      }

      try {
        const { buffer, contentType } = await downloadImage(normalized, article.source_url)
        const storagePath = buildStoragePath(article.slug, normalized, contentType)
        const publicUrl = await uploadToSupabase(storagePath, buffer, contentType)
        urlCache.set(normalized, publicUrl)
        replacements.set(rawUrl, publicUrl)
        replacedCount += 1
        console.log(`✅ ${article.slug}: ${rawUrl} -> ${publicUrl}`)
      } catch (err) {
        console.warn(`⚠️  ${article.slug}: failed to rehost ${rawUrl}: ${err.message}`)
      }
    }

    if (replacements.size === 0) {
      continue
    }

    const nextContent = replaceAll(content, replacements)
    const nextImportMeta = { ...importMeta }
    if (featuredUrl && replacements.has(featuredUrl)) {
      nextImportMeta.featuredImageUrl = replacements.get(featuredUrl)
    }
    nextImportMeta.rehosted_images = Object.fromEntries(replacements.entries())
    nextImportMeta.rehosted_at = new Date().toISOString()

    const { error: updateError } = await supabase
      .from('articles')
      .update({
        content: nextContent,
        import_metadata: nextImportMeta,
        updated_at: new Date().toISOString()
      })
      .eq('id', article.id)

    if (updateError) {
      console.warn(`⚠️  ${article.slug}: failed to update article: ${updateError.message}`)
    } else {
      updatedCount += 1
    }
  }

  console.log(`\n✅ Done. Articles updated: ${updatedCount}, images rehosted: ${replacedCount}`)
}

main().catch(err => {
  console.error('Unexpected error:', err)
  process.exit(1)
})
