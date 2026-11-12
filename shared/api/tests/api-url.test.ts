import { ApiUrl } from '../src/api-url'

describe('ApiUrl.of', () => {
  it('joins a path on the API to its base address', () => {
    expect(ApiUrl.of('/api/v1/venues/photo/abc')).toBe(
      'http://localhost:8080/api/v1/venues/photo/abc',
    )
  })
})
