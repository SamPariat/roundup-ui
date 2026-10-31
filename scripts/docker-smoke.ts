// Checks a running web container (make docker-up, or the CI docker job) from the outside.
// Usage: node scripts/docker-smoke.ts [base-url]   (default http://localhost:8081)
const base = process.argv[2] ?? 'http://localhost:8081'

const ONE_YEAR_CACHE = 'public, max-age=31536000, immutable'

/** A failed expectation, worded with what was seen. */
class SmokeError extends Error {}

/**
 * Throws when a condition does not hold.
 * @param condition - What must be true.
 * @param message - What went wrong, shown when it is false.
 */
const ensure = (condition: boolean, message: string): void => {
  if (!condition) throw new SmokeError(message)
}

/**
 * Fetches a path without following redirects, so a 308 shows up as a failure.
 * @param path - The URL path to request.
 * @returns The response.
 */
const get = (path: string): Promise<Response> => fetch(`${base}${path}`, { redirect: 'manual' })

/**
 * Asserts an HTML page: the status, the content type and the no-cache header.
 * @param path - The URL path to request.
 * @param status - The expected status.
 * @returns The page body.
 */
const checkPage = async (path: string, status: number): Promise<string> => {
  const response = await get(path)
  const body = await response.text()

  ensure(
    response.status === status,
    `${path}: expected ${String(status)}, got ${String(response.status)}`,
  )

  ensure(
    (response.headers.get('content-type') ?? '').startsWith('text/html'),
    `${path}: expected HTML, got ${String(response.headers.get('content-type'))}`,
  )

  ensure(
    response.headers.get('cache-control') === 'no-cache',
    `${path}: expected cache-control no-cache, got ${String(response.headers.get('cache-control'))}`,
  )

  ensure(body.includes('<html'), `${path}: body is not an HTML document`)

  return body
}

/**
 * Asserts the headers every page carries.
 * @param path - The URL path to request.
 */
const checkSecurityHeaders = async (path: string): Promise<void> => {
  const { headers } = await get(path)
  const csp = headers.get('content-security-policy') ?? ''

  ensure(headers.get('x-content-type-options') === 'nosniff', `${path}: x-content-type-options`)

  ensure(
    headers.get('referrer-policy') === 'strict-origin-when-cross-origin',
    `${path}: referrer-policy`,
  )

  ensure(csp.includes("default-src 'self'"), `${path}: csp default-src`)
  ensure(csp.includes("frame-ancestors 'none'"), `${path}: csp frame-ancestors`)
  ensure(csp.includes("object-src 'none'"), `${path}: csp object-src`)
  ensure(!csp.includes('__API_ORIGIN__'), `${path}: csp still has the API origin placeholder`)
}

/**
 * Finds a hashed bundle under _expo/static from the home page's script tags.
 * @param html - The home page.
 * @returns The bundle's URL path.
 */
const findBundle = (html: string): string => {
  const match = /src="(\/_expo\/static\/[^"]+\.js)"/.exec(html)

  ensure(match?.[1] !== undefined, 'no /_expo/static script on the home page')

  return match?.[1] ?? ''
}

/**
 * Asserts that a clean URL serves an HTML page with status 200 and no redirect.
 * @param path - The URL path to request.
 */
const checkCleanUrl = async (path: string): Promise<void> => {
  await checkPage(path, 200)
}

/** Asserts that an unknown path serves the export's not-found page with status 404. */
const checkNotFound = async (): Promise<void> => {
  const notFound = await checkPage('/nope', 404)
  const reference = await get('/+not-found.html')

  ensure(reference.status === 200, 'the export has no +not-found.html')
  ensure(notFound === (await reference.text()), '/nope did not serve +not-found.html')
}

/** Asserts that a hashed bundle is cached for a year. */
const checkHashedAsset = async (): Promise<void> => {
  const home = await get('/')
  const bundle = findBundle(await home.text())
  const response = await get(bundle)
  const cacheControl = response.headers.get('cache-control')

  ensure(response.status === 200, `${bundle}: expected 200, got ${String(response.status)}`)
  ensure(cacheControl === ONE_YEAR_CACHE, `${bundle}: cache-control was ${String(cacheControl)}`)
}

/** Asserts that the health endpoint answers 200. */
const checkHealth = async (): Promise<void> => {
  const response = await get('/health')

  ensure(response.status === 200, `/health: expected 200, got ${String(response.status)}`)
}

/** The named checks, run in order: a title, the check and the path it receives. */
const checks: readonly (readonly [string, (path: string) => Promise<void>, string])[] = [
  ['/ returns 200 HTML', checkCleanUrl, '/'],
  ['/squads returns 200 HTML without a redirect', checkCleanUrl, '/squads'],
  ['/explore returns 200 HTML without a redirect', checkCleanUrl, '/explore'],
  ['/profile returns 200 HTML without a redirect', checkCleanUrl, '/profile'],
  ['/nope returns 404 with the not-found page', checkNotFound, '/nope'],
  ['hashed assets are cached for a year, immutable', checkHashedAsset, '/'],
  ['security headers on a page', checkSecurityHeaders, '/squads'],
  ['security headers on the not-found page', checkSecurityHeaders, '/nope'],
  ['/health returns 200', checkHealth, '/health'],
]

let failed = 0

for (const [name, run, path] of checks) {
  try {
    await run(path)
    console.log(`ok    ${name}`)
  } catch (error) {
    failed += 1
    console.log(`FAIL  ${name}: ${error instanceof Error ? error.message : String(error)}`)
  }
}

console.log(
  `${String(checks.length - failed)}/${String(checks.length)} checks passed against ${base}`,
)

process.exitCode = failed === 0 ? 0 : 1
