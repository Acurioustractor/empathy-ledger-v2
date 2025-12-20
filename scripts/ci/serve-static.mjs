#!/usr/bin/env node

import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'

const args = process.argv.slice(2)
const dirArgIndex = args.indexOf('--dir')
const portArgIndex = args.indexOf('--port')

const directory = dirArgIndex >= 0 ? args[dirArgIndex + 1] : null
const port = portArgIndex >= 0 ? Number(args[portArgIndex + 1]) : 4173

if (!directory) {
  console.error('Usage: serve-static.mjs --dir <path> [--port <port>]')
  process.exit(2)
}

const root = path.resolve(process.cwd(), directory)
if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) {
  console.error(`Directory not found: ${root}`)
  process.exit(2)
}

const mimeTypes = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.css', 'text/css; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.webp', 'image/webp'],
])

function safeResolve(requestPath) {
  const decoded = decodeURIComponent(requestPath.split('?')[0] || '/')
  const normalized = path.posix.normalize(decoded)
  const joined = path.join(root, normalized)
  if (!joined.startsWith(root)) return null
  return joined
}

const server = http.createServer((req, res) => {
  if (!req.url) {
    res.writeHead(400)
    res.end('Bad Request')
    return
  }

  const requestPath = req.url === '/' ? '/index.html' : req.url
  const resolved = safeResolve(requestPath)
  if (!resolved) {
    res.writeHead(403)
    res.end('Forbidden')
    return
  }

  if (!fs.existsSync(resolved) || !fs.statSync(resolved).isFile()) {
    res.writeHead(404)
    res.end('Not Found')
    return
  }

  const ext = path.extname(resolved).toLowerCase()
  const contentType = mimeTypes.get(ext) || 'application/octet-stream'
  res.setHeader('Content-Type', contentType)
  res.setHeader('Cache-Control', 'no-store')

  fs.createReadStream(resolved).pipe(res)
})

server.listen(port, '127.0.0.1', () => {
  const file = path.relative(process.cwd(), root)
  console.log(`Serving ${file} at http://127.0.0.1:${port}`)
})
