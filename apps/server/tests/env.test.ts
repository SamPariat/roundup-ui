import path from 'node:path'

import { readServerEnv, ServerEnvError } from '../src/env.ts'

describe('readServerEnv', () => {
  it('defaults to port 3000 and the sibling app export', () => {
    const env = readServerEnv({}, '/srv/apps/server')

    expect(env.port).toBe(3000)
    expect(env.distDir).toBe(path.resolve('/srv/apps/server', '../app/dist'))
    expect(env.apiOrigin).toBeUndefined()
  })

  it('reads PORT, DIST_DIR and API_ORIGIN', () => {
    const env = readServerEnv(
      { PORT: '8081', DIST_DIR: '/app/dist', API_ORIGIN: 'https://api.roundup.example/v1' },
      '/srv',
    )

    expect(env).toEqual({
      port: 8081,
      distDir: '/app/dist',
      apiOrigin: 'https://api.roundup.example',
    })
  })

  it.each(['abc', '0', '70000', '80.5'])('rejects PORT=%s', (port) => {
    expect(() => readServerEnv({ PORT: port }, '/srv')).toThrow(ServerEnvError)
  })

  it('rejects an API_ORIGIN that is not a URL', () => {
    expect(() => readServerEnv({ API_ORIGIN: 'not a url' }, '/srv')).toThrow(/API_ORIGIN/)
  })
})
