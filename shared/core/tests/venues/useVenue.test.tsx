import { renderHook, waitFor } from '@testing-library/react-native'

import { HttpStatus } from '@roundup/api'

import { useVenue } from '../../src/venues/useVenue'
import { Fakes } from '../helpers/fakes'
import { VenueFixtures } from '../helpers/venue-fixtures'
import { TestCore } from '../helpers/wrapper'

/** The refresh answer every signed-in test needs. */
const REFRESH = { 'POST /api/v1/auth/refresh': Fakes.ok(Fakes.pair('a2', 'r2')) }

describe('useVenue', () => {
  it('maps the detail onto what the page shows', async () => {
    Fakes.stubNetwork({
      ...REFRESH,
      'GET /api/v1/venues/v1': Fakes.ok(VenueFixtures.detail('v1')),
    })

    const { wrapper } = await VenueFixtures.signedInCore()
    const { result } = await renderHook(() => useVenue('v1'), { wrapper })

    await waitFor(() => {
      expect(result.current.venue).toBeDefined()
    })

    expect(result.current.loading).toBe(false)

    expect(result.current.venue).toMatchObject({
      id: 'v1',
      name: 'Venue v1',
      phone: '+91 80 1234 5678',
      review: { author: 'Meera' },
      summary: 'A rooftop with a view.',
    })

    expect(result.current.venue?.savedIn.map((squad) => squad.squadId)).toEqual(['s1', 's2'])
    expect(result.current.venue?.hoursToday).toBeDefined()
  })

  it('reports a venue that does not exist', async () => {
    Fakes.stubNetwork({
      ...REFRESH,
      'GET /api/v1/venues/gone': Fakes.failure(HttpStatus.notFound, 'venue not found'),
    })

    const { wrapper } = await VenueFixtures.signedInCore()
    const { result } = await renderHook(() => useVenue('gone'), { wrapper })

    await waitFor(() => {
      expect(result.current.notFound).toBe(true)
    })

    expect(result.current.error).toBe('errors.venueNotFound')
    expect(result.current.venue).toBeUndefined()
  })

  it('shows the request id of a server failure', async () => {
    Fakes.stubNetwork({
      ...REFRESH,
      'GET /api/v1/venues/v1': Fakes.failure(HttpStatus.internalServerError, 'boom'),
    })

    const { wrapper } = await VenueFixtures.signedInCore()
    const { result } = await renderHook(() => useVenue('v1'), { wrapper })

    await waitFor(() => {
      expect(result.current.error).toBe('errors.genericWithId')
    })

    expect(result.current.requestId).toBe('req-1')
    expect(result.current.notFound).toBe(false)
  })

  it('does not load while signed out', async () => {
    const network = Fakes.stubNetwork({})
    const { wrapper } = TestCore.create()
    const { result } = await renderHook(() => useVenue('v1'), { wrapper })

    expect(result.current.loading).toBe(false)
    expect(network.requests).toHaveLength(0)
  })
})
