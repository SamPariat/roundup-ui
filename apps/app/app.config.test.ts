import { parseAppEnv } from './app.config.ts'

describe('parseAppEnv', () => {
  it.each(['beta', 'prod'] as const)('accepts %s', (value) => {
    expect(parseAppEnv(value)).toBe(value)
  })

  it.each([undefined, '', 'dev', 'production', 'Beta'])('rejects %s', (value) => {
    expect(() => parseAppEnv(value)).toThrow(/APP_ENV must be "beta" or "prod"/)
  })
})
