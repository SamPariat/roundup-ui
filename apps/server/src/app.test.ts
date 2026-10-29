import type { Hono } from 'hono'

import { createApp } from './app.ts'
import { makeDist } from './test/fixture.ts'

describe('web server', () => {
  let app: Hono
  let dist: Awaited<ReturnType<typeof makeDist>> | undefined

  beforeAll(async () => {
    dist = await makeDist()
    app = createApp({ distDir: dist.dir, apiOrigin: 'https://api.roundup.example' })
  })

  afterAll(async () => {
    await dist?.cleanup()
  })

  it('answers the health check', async () => {
    const response = await app.request('/healthz')

    expect(response.status).toBe(200)
    expect(await response.text()).toBe('ok')
  })

  it('serves a clean URL without a fallback to the home page', async () => {
    const response = await app.request('/squads')

    expect(response.status).toBe(200)
    expect(await response.text()).toContain('<title>squads</title>')
  })

  it('serves a dynamic route', async () => {
    const response = await app.request('/squads/42')

    expect(await response.text()).toContain('<title>squad</title>')
  })

  it('shows the export 404 page with a 404 status for an unknown path', async () => {
    const response = await app.request('/nowhere')

    expect(response.status).toBe(404)
    expect(await response.text()).toContain('<title>missing</title>')
  })

  it('never lets HTML be cached', async () => {
    const response = await app.request('/squads')

    expect(response.headers.get('Cache-Control')).toBe('no-cache')
  })

  it('caches hashed assets for a year', async () => {
    const response = await app.request('/_expo/static/js/web/entry-abc123.js')

    expect(response.headers.get('Cache-Control')).toBe('public, max-age=31536000, immutable')
    expect(response.headers.get('Content-Type')).toContain('text/javascript')
  })

  it('sends security headers', async () => {
    const response = await app.request('/')

    expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff')
    expect(response.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin')
    expect(response.headers.get('Content-Security-Policy')).toContain(
      "connect-src 'self' https://api.roundup.example",
    )
  })

  it('does not serve files outside the export', async () => {
    const response = await app.request('/%2e%2e/%2e%2e/etc/passwd')

    expect(response.status).toBe(404)
  })
})
