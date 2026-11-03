import { ApiError } from '@roundup/api'

import { createDeps } from '../../src/di/deps'
import { QueryHelper } from '../../src/helpers/query-helper'

describe('QueryHelper.shouldRetry', () => {
  it.each([0, 500, 502])('retries a status %i', (status) => {
    expect(QueryHelper.shouldRetry(0, new ApiError(status, 'failed'))).toBe(true)
  })

  it.each([400, 401, 404, 429])('does not retry a status %i', (status) => {
    expect(QueryHelper.shouldRetry(0, new ApiError(status, 'failed'))).toBe(false)
  })

  it('retries an error that is not an ApiError', () => {
    expect(QueryHelper.shouldRetry(0, new TypeError('boom'))).toBe(true)
  })

  it('gives up after two retries', () => {
    expect(QueryHelper.shouldRetry(2, new ApiError(500, 'failed'))).toBe(false)
  })
})

describe('createDeps', () => {
  it('builds the platform store, a query client and the clock', () => {
    const deps = createDeps()

    const retry = deps.queryClient.getDefaultOptions().queries?.retry

    expect(deps.session.cookie).toBe(false)
    expect(typeof retry).toBe('function')
    expect(Math.abs(deps.now() - Date.now())).toBeLessThan(1000)
  })
})
