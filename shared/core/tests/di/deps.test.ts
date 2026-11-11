import { QueryClient } from '@tanstack/react-query'

import { ApiError, getListSquadsQueryKey, HttpStatus } from '@roundup/api'

import { Deps } from '../../src/di/deps'
import { ErrorKey } from '../../src/helpers/error-key'
import { Notice } from '../../src/helpers/notice'
import { OtpCode } from '../../src/helpers/otp-code'
import { Phone } from '../../src/helpers/phone'
import { Query } from '../../src/helpers/query'
import { Squads } from '../../src/helpers/squads'
import { Venues } from '../../src/helpers/venues'

/** The retry policy under test. */
const query = new Query()

describe('Query.shouldRetry', () => {
  it.each([HttpStatus.noResponse, HttpStatus.internalServerError, HttpStatus.badGateway])(
    'retries a status %i',
    (status) => {
      expect(query.shouldRetry(0, new ApiError(status, 'failed'))).toBe(true)
    },
  )

  it.each([
    HttpStatus.badRequest,
    HttpStatus.unauthorized,
    HttpStatus.notFound,
    HttpStatus.tooManyRequests,
  ])('does not retry a status %i', (status) => {
    expect(query.shouldRetry(0, new ApiError(status, 'failed'))).toBe(false)
  })

  it('retries an error that is not an ApiError', () => {
    expect(query.shouldRetry(0, new TypeError('boom'))).toBe(true)
  })

  it('gives up after two retries', () => {
    expect(query.shouldRetry(2, new ApiError(HttpStatus.internalServerError, 'failed'))).toBe(false)
  })
})

describe('Deps.create', () => {
  it('builds the platform store, the network source, the contacts source, the location source, a query client and the clock', () => {
    const deps = Deps.create()

    const retry = deps.queryClient.getDefaultOptions().queries?.retry

    expect(deps.session.cookie).toBe(false)
    expect(typeof retry).toBe('function')
    expect(typeof deps.network.getState).toBe('function')
    expect(typeof deps.contacts.requestPermission).toBe('function')
    expect(typeof deps.location.requestPermission).toBe('function')
    expect(Math.abs(deps.now() - Date.now())).toBeLessThan(1000)
  })

  it('creates one of each helper', () => {
    const { helpers } = Deps.create()

    expect(helpers.code).toBeInstanceOf(OtpCode)
    expect(helpers.errors).toBeInstanceOf(ErrorKey)
    expect(helpers.notice).toBeInstanceOf(Notice)
    expect(helpers.phone).toBeInstanceOf(Phone)
    expect(helpers.query).toBeInstanceOf(Query)
    expect(helpers.squads).toBeInstanceOf(Squads)
    expect(helpers.venues).toBeInstanceOf(Venues)
  })

  it('builds the squad helpers on the query client a test passes', async () => {
    // No garbage collection, whose timer would keep Jest alive.
    const queryClient = new QueryClient({ defaultOptions: { queries: { gcTime: Infinity } } })

    queryClient.setQueryData(getListSquadsQueryKey(), { squads: [] })

    await Deps.create({ queryClient }).helpers.squads.changed()

    expect(queryClient.getQueryState(getListSquadsQueryKey())?.isInvalidated).toBe(true)
  })

  it('keeps the helpers a test passes', () => {
    const helpers = Deps.create().helpers

    expect(Deps.create({ helpers }).helpers).toBe(helpers)
  })
})
