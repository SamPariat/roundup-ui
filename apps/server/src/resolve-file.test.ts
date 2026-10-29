import path from 'node:path'

import { resolveFile } from './resolve-file.ts'
import { makeDist } from './test/fixture.ts'

describe('resolveFile', () => {
  let dir = ''
  let dist: Awaited<ReturnType<typeof makeDist>> | undefined

  beforeAll(async () => {
    dist = await makeDist()
    dir = dist.dir
  })

  afterAll(async () => {
    await dist?.cleanup()
  })

  it.each([
    ['/', 'index.html'],
    ['/squads', 'squads.html'],
    ['/explore', 'explore/index.html'],
    ['/squads/42', 'squads/[id].html'],
    ['/squads/42/members', 'squads/[id]/members.html'],
    ['/favicon.svg', 'favicon.svg'],
    ['/_expo/static/js/web/entry-abc123.js', '_expo/static/js/web/entry-abc123.js'],
  ])('maps %s to %s', async (url, expected) => {
    expect(await resolveFile(dir, url)).toBe(path.join(dir, expected))
  })

  it.each(['/nope', '/squads/42/nope', '/explore/extra'])('finds nothing for %s', async (url) => {
    expect(await resolveFile(dir, url)).toBeUndefined()
  })

  it.each(['/../secret', '/squads/../../etc/passwd', '/%2e%2e/secret', '/a%00b', '/%E0%A4%A'])(
    'refuses to leave the export for %s',
    async (url) => {
      expect(await resolveFile(dir, url)).toBeUndefined()
    },
  )
})
