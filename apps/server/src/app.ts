import { Hono } from 'hono'
import { secureHeaders } from 'hono/secure-headers'
import { createReadStream } from 'node:fs'
import path from 'node:path'
import { Readable } from 'node:stream'

import type { ServerEnv } from './env.ts'

import { resolveFile } from './resolve-file.ts'

const CONTENT_TYPES: Readonly<Record<string, string>> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.ttf': 'font/ttf',
  '.woff2': 'font/woff2',
  '.map': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
}

const ONE_YEAR_SECONDS = 31_536_000

const cacheControlFor = (root: string, file: string): string => {
  const relative = path.relative(root, file).split(path.sep).join('/')

  // Files under _expo/static carry a content hash in their name, so they can never change.
  if (relative.startsWith('_expo/static/'))
    return `public, max-age=${String(ONE_YEAR_SECONDS)}, immutable`
  if (file.endsWith('.html')) return 'no-cache'

  return 'public, max-age=3600'
}

const send = (file: string, status: 200 | 404, cacheControl: string): Response => {
  const body = Readable.toWeb(createReadStream(file)) as ReadableStream<Uint8Array>

  return new Response(body, {
    status,
    headers: {
      'Content-Type': CONTENT_TYPES[path.extname(file)] ?? 'application/octet-stream',
      'Cache-Control': cacheControl,
    },
  })
}

export const createApp = ({
  apiOrigin,
  distDir,
}: Pick<ServerEnv, 'apiOrigin' | 'distDir'>): Hono => {
  const app = new Hono()

  // Expo's static export inlines a small bootstrap script and a reset stylesheet, so both
  // allow 'unsafe-inline'. Everything else stays on this origin.
  app.use(
    secureHeaders({
      contentSecurityPolicy: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        fontSrc: ["'self'", 'data:'],
        connectSrc: apiOrigin === undefined ? ["'self'"] : ["'self'", apiOrigin],
        baseUri: ["'self'"],
        frameAncestors: ["'none'"],
        objectSrc: ["'none'"],
      },
      xContentTypeOptions: 'nosniff',
      referrerPolicy: 'strict-origin-when-cross-origin',
    }),
  )

  app.get('/healthz', (context) => context.text('ok'))

  app.get('*', async (context) => {
    const file = await resolveFile(distDir, context.req.path)

    if (file !== undefined) return send(file, 200, cacheControlFor(distDir, file))

    const page = await resolveFile(distDir, '/+not-found')

    return page === undefined ? context.text('Not found', 404) : send(page, 404, 'no-cache')
  })

  return app
}
