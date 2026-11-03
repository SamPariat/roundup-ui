import { ApiError } from '@roundup/api'

import { ErrorHelper } from '../../src/helpers/error-helper'

describe('ErrorHelper.toMessage', () => {
  it.each([
    [0, 'phone', 'errors.offline'],
    [400, 'phone', 'errors.invalidPhone'],
    [400, 'name', 'errors.invalidName'],
    [400, 'code', 'errors.wrongCode'],
    [401, 'code', 'errors.wrongCode'],
    [429, 'code', 'errors.codeExpired'],
    [429, 'phone', 'errors.tooManyRequests'],
    [500, 'phone', 'errors.generic'],
  ] as const)('maps %i on %s to %s', (status, context, key) => {
    expect(ErrorHelper.toMessage(new ApiError(status, 'x'), context).key).toBe(key)
  })

  it('quotes the request id on an unexpected failure', () => {
    expect(ErrorHelper.toMessage(new ApiError(500, 'x', 'req-3'), 'name')).toEqual({
      key: 'errors.genericWithId',
      requestId: 'req-3',
    })
  })

  it('treats anything else as generic', () => {
    expect(ErrorHelper.toMessage(new Error('boom'), 'name').key).toBe('errors.generic')
  })
})
