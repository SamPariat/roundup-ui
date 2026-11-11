import { act, renderHook, waitFor } from '@testing-library/react-native'

import { HttpStatus } from '@roundup/api'

import { useExploreViewModel } from '../../src/venues/useExploreViewModel'
import { FakeLocation, Fakes } from '../helpers/fakes'
import { VenueFixtures } from '../helpers/venue-fixtures'
import { TestCore } from '../helpers/wrapper'

/** The refresh answer every signed-in test needs. */
const REFRESH = { 'POST /api/v1/auth/refresh': Fakes.ok(Fakes.pair('a2', 'r2')) }

/**
 * Lists the search requests a test made.
 * @param network - The stubbed network.
 * @returns The path of every venue search, in order.
 */
const searches = (network: ReturnType<typeof Fakes.stubNetwork>): string[] =>
  network.requests
    .filter((request) => request.path.startsWith('/api/v1/venues'))
    .map((request) => request.path)

describe('useExploreViewModel', () => {
  afterEach(() => {
    jest.useRealTimers()
  })

  it('searches within 3 km of the person and maps the venues onto cards', async () => {
    const network = Fakes.stubNetwork({
      ...REFRESH,
      [`GET ${VenueFixtures.base}`]: Fakes.ok(
        VenueFixtures.page([VenueFixtures.venue('v1'), VenueFixtures.venue('v2')]),
      ),
    })

    const { wrapper } = await VenueFixtures.signedInCore()
    const { result } = await renderHook(() => useExploreViewModel(), { wrapper })

    await waitFor(() => {
      expect(result.current.venues).toHaveLength(2)
    })

    expect(result.current.phase).toBe('ready')
    expect(result.current.radiusKm).toBe(3)
    expect(result.current.venues[0]).toMatchObject({ id: 'v1', name: 'Venue v1', rating: 4.5 })
    expect(result.current.loading).toBe(false)
    expect(searches(network)).toEqual([VenueFixtures.base])
  })

  it('does not search, or load, while the location is denied', async () => {
    const network = Fakes.stubNetwork({ ...REFRESH })
    const { wrapper } = await VenueFixtures.signedInCore(new FakeLocation('denied'))
    const { result } = await renderHook(() => useExploreViewModel(), { wrapper })

    await waitFor(() => {
      expect(result.current.phase).toBe('denied')
    })

    expect(result.current.loading).toBe(false)
    expect(result.current.venues).toEqual([])
    expect(searches(network)).toEqual([])
  })

  it('searches again with the location once access is given', async () => {
    const location = new FakeLocation('denied')

    Fakes.stubNetwork({
      ...REFRESH,
      [`GET ${VenueFixtures.base}`]: Fakes.ok(VenueFixtures.page([VenueFixtures.venue('v1')])),
    })

    const { wrapper } = await VenueFixtures.signedInCore(location)
    const { result } = await renderHook(() => useExploreViewModel(), { wrapper })

    await waitFor(() => {
      expect(result.current.phase).toBe('denied')
    })

    location.permission = 'granted'

    await act(() => {
      result.current.retryLocation()
    })

    await waitFor(() => {
      expect(result.current.venues).toHaveLength(1)
    })
  })

  it('does not search while signed out', async () => {
    const network = Fakes.stubNetwork({})
    const { wrapper } = TestCore.create({ location: new FakeLocation() })
    const { result } = await renderHook(() => useExploreViewModel(), { wrapper })

    await waitFor(() => {
      expect(result.current.phase).toBe('ready')
    })

    expect(result.current.loading).toBe(false)
    expect(searches(network)).toEqual([])
  })

  it('searches for the typed words only once typing pauses', async () => {
    const network = Fakes.stubNetwork({
      ...REFRESH,
      [`GET ${VenueFixtures.base}`]: Fakes.ok(VenueFixtures.page([VenueFixtures.venue('v1')])),
      [`GET ${VenueFixtures.base}&query=rooftop+bar`]: Fakes.ok(
        VenueFixtures.page([VenueFixtures.venue('v9')]),
      ),
    })

    const { wrapper } = await VenueFixtures.signedInCore()
    const { result } = await renderHook(() => useExploreViewModel(), { wrapper })

    await waitFor(() => {
      expect(result.current.venues).toHaveLength(1)
    })

    jest.useFakeTimers()

    await act(() => {
      result.current.setQuery('roof')
    })

    await act(() => {
      jest.advanceTimersByTime(200)
    })

    await act(() => {
      result.current.setQuery('  rooftop bar ')
    })

    await act(() => {
      jest.advanceTimersByTime(200)
    })

    // Neither "roof" nor the first 200 ms of waiting sent a request.
    expect(searches(network)).toEqual([VenueFixtures.base])

    await act(() => {
      jest.advanceTimersByTime(400)
    })

    await waitFor(() => {
      expect(result.current.venues.map((venue) => venue.id)).toEqual(['v9'])
    })

    expect(searches(network)).toEqual([
      VenueFixtures.base,
      `${VenueFixtures.base}&query=rooftop+bar`,
    ])

    expect(result.current.query).toBe('  rooftop bar ')
  })

  it('sends the chosen kind as the type, and clears it when chosen again', async () => {
    const network = Fakes.stubNetwork({
      ...REFRESH,
      [`GET ${VenueFixtures.base}`]: Fakes.ok(VenueFixtures.page([VenueFixtures.venue('v1')])),
      [`GET ${VenueFixtures.base}&type=night_club`]: Fakes.ok(
        VenueFixtures.page([VenueFixtures.venue('v7')]),
      ),
    })

    const { wrapper } = await VenueFixtures.signedInCore()
    const { result } = await renderHook(() => useExploreViewModel(), { wrapper })

    await waitFor(() => {
      expect(result.current.venues).toHaveLength(1)
    })

    await act(() => {
      result.current.toggleFilter('night_club')
    })

    await waitFor(() => {
      expect(result.current.venues.map((venue) => venue.id)).toEqual(['v7'])
    })

    expect(result.current.filter).toBe('night_club')

    await act(() => {
      result.current.toggleFilter('night_club')
    })

    await waitFor(() => {
      expect(result.current.venues.map((venue) => venue.id)).toEqual(['v1'])
    })

    expect(result.current.filter).toBeUndefined()

    // Clearing the filter reads the first search's results again, as the cache is stale by then.
    expect(searches(network)).toEqual([
      VenueFixtures.base,
      `${VenueFixtures.base}&type=night_club`,
      VenueFixtures.base,
    ])
  })

  it('loads the next page with the cursor until the results end', async () => {
    const network = Fakes.stubNetwork({
      ...REFRESH,
      [`GET ${VenueFixtures.base}`]: Fakes.ok(
        VenueFixtures.page([VenueFixtures.venue('v1')], 'c1'),
      ),
      [`GET ${VenueFixtures.base}&cursor=c1`]: Fakes.ok(
        VenueFixtures.page([VenueFixtures.venue('v2')]),
      ),
    })

    const { wrapper } = await VenueFixtures.signedInCore()
    const { result } = await renderHook(() => useExploreViewModel(), { wrapper })

    await waitFor(() => {
      expect(result.current.hasMore).toBe(true)
    })

    await act(() => {
      result.current.loadMore()
    })

    await waitFor(() => {
      expect(result.current.venues.map((venue) => venue.id)).toEqual(['v1', 'v2'])
    })

    expect(result.current.hasMore).toBe(false)
    expect(result.current.loadingMore).toBe(false)

    await act(() => {
      result.current.loadMore()
    })

    expect(searches(network)).toHaveLength(2)
  })

  it('loads the results again on refresh', async () => {
    const network = Fakes.stubNetwork({
      ...REFRESH,
      [`GET ${VenueFixtures.base}`]: Fakes.ok(VenueFixtures.page([VenueFixtures.venue('v1')])),
    })

    const { wrapper } = await VenueFixtures.signedInCore()
    const { result } = await renderHook(() => useExploreViewModel(), { wrapper })

    await waitFor(() => {
      expect(result.current.venues).toHaveLength(1)
    })

    network.routes[`GET ${VenueFixtures.base}`] = Fakes.ok(
      VenueFixtures.page([VenueFixtures.venue('v5')]),
    )

    await act(async () => {
      await result.current.refresh()
    })

    await waitFor(() => {
      expect(result.current.venues.map((venue) => venue.id)).toEqual(['v5'])
    })
  })

  it('shows the request id of a server failure', async () => {
    Fakes.stubNetwork({
      ...REFRESH,
      [`GET ${VenueFixtures.base}`]: Fakes.failure(HttpStatus.internalServerError, 'boom'),
    })

    const { wrapper } = await VenueFixtures.signedInCore()
    const { result } = await renderHook(() => useExploreViewModel(), { wrapper })

    await waitFor(() => {
      expect(result.current.error).toBe('errors.genericWithId')
    })

    expect(result.current.requestId).toBe('req-1')
  })
})
