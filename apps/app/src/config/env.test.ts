import { env, EnvError, readEnv } from './env.ts'

describe('readEnv', () => {
  it('reads the API address', () => {
    expect(readEnv({ EXPO_PUBLIC_API_URL: 'http://localhost:8080' }).apiUrl).toBe(
      'http://localhost:8080',
    )
  })

  it('returns a frozen object', () => {
    expect(Object.isFrozen(readEnv({ EXPO_PUBLIC_API_URL: 'https://api.roundup.example' }))).toBe(
      true,
    )
  })

  it('fails with a clear message when the API address is missing', () => {
    expect(() => readEnv({ EXPO_PUBLIC_API_URL: undefined })).toThrow(
      /EXPO_PUBLIC_API_URL is not set.*make setup/,
    )
  })

  it('fails when the API address is empty', () => {
    expect(() => readEnv({ EXPO_PUBLIC_API_URL: '' })).toThrow(EnvError)
  })

  it('fails when the API address is not a URL', () => {
    expect(() => readEnv({ EXPO_PUBLIC_API_URL: 'localhost:8080' })).toThrow(
      /http:\/\/ or https:\/\//,
    )
  })

  it('fails on a trailing slash so paths join cleanly', () => {
    expect(() => readEnv({ EXPO_PUBLIC_API_URL: 'http://localhost:8080/' })).toThrow(
      /must not end with a slash/,
    )
  })

  it('fails on text that cannot be parsed at all', () => {
    expect(() => readEnv({ EXPO_PUBLIC_API_URL: 'not a url' })).toThrow(/not a valid URL/)
  })
})

describe('env', () => {
  it('is built from the process environment at startup', () => {
    expect(env.apiUrl).toBe('http://localhost:8080')
  })
})
