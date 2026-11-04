import { ApiError } from '@roundup/api'

import { Deps } from '../../src/di/deps'
import { Query } from '../../src/helpers/query'

describe('Query.shouldRetry', () => {
  it.each([0, 500, 502])('retries a status %i', (status) => {
    expect(Query.shouldRetry(0, new ApiError(status, 'failed'))).toBe(true)
  })

  it.each([400, 401, 404, 429])('does not retry a status %i', (status) => {
    expect(Query.shouldRetry(0, new ApiError(status, 'failed'))).toBe(false)
  })

  it('retries an error that is not an ApiError', () => {
    expect(Query.shouldRetry(0, new TypeError('boom'))).toBe(true)
  })

  it('gives up after two retries', () => {
    expect(Query.shouldRetry(2, new ApiError(500, 'failed'))).toBe(false)
  })
})

describe('Deps.create', () => {
  it('builds the platform store, the network source, a query client and the clock', () => {
    const deps = Deps.create()

    const retry = deps.queryClient.getDefaultOptions().queries?.retry

    expect(deps.session.cookie).toBe(false)
    expect(typeof retry).toBe('function')
    expect(typeof deps.network.getState).toBe('function')
    expect(Math.abs(deps.now() - Date.now())).toBeLessThan(1000)
  })
})
