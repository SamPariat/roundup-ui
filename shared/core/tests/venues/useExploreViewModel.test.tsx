import { act, renderHook, waitFor } from '@testing-library/react-native'

import { HttpStatus } from '@roundup/api'

import type { IExploreInputs, IExploreViewModel } from '../../src/venues/useExploreViewModel'
import type { ITestCore } from '../helpers/wrapper'

import { useExploreViewModel } from '../../src/venues/useExploreViewModel'
import { FakeLocation, Fakes } from '../helpers/fakes'
import { VenueFixtures } from '../helpers/venue-fixtures'
import { TestCore } from '../helpers/wrapper'

/** The refresh answer every signed-in test needs. */
const REFRESH = { 'POST /api/v1/auth/refresh': Fakes.ok(Fakes.pair('a2', 'r2')) }

/** The inputs of a search that has just opened: no words, no kind of place, 3 km. */
const DEFAULTS: IExploreInputs = { filter: undefined, query: '', radiusKm: 3 }

/**
 * Renders the view model with inputs a test can change by rerendering.
 * @param wrapper - The core providers of the test.
 * @returns The rendered hook.
 */
const renderExplore = (
  wrapper: ITestCore['wrapper'],
): ReturnType<typeof renderHook<IExploreViewModel, IExploreInputs>> =>
  renderHook((inputs: IExploreInputs) => useExploreViewModel(inputs), {
    initialProps: DEFAULTS,
    wrapper,
  })

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
    const { result } = await renderExplore(wrapper)

    await waitFor(() => {
      expect(result.current.venues).toHaveLength(2)
    })

    expect(result.current.phase).toBe('ready')
    expect(result.current.venues[0]).toMatchObject({ id: 'v1', name: 'Venue v1', rating: 4.5 })
    expect(result.current.loading).toBe(false)
    expect(searches(network)).toEqual([VenueFixtures.base])
  })

  it('searches again from the first page within the radius the person picks', async () => {
    const network = Fakes.stubNetwork({
      ...REFRESH,
      [`GET ${VenueFixtures.base}`]: Fakes.ok(VenueFixtures.page([VenueFixtures.venue('v1')])),
      [`GET ${VenueFixtures.base.replace('radius=3000', 'radius=10000')}`]: Fakes.ok(
        VenueFixtures.page([VenueFixtures.venue('v1'), VenueFixtures.venue('v2')]),
      ),
    })

    const { wrapper } = await VenueFixtures.signedInCore()
    const { rerender, result } = await renderExplore(wrapper)

    await waitFor(() => {
      expect(result.current.venues).toHaveLength(1)
    })

    await rerender({ ...DEFAULTS, radiusKm: 10 })

    await waitFor(() => {
      expect(result.current.venues).toHaveLength(2)
    })

    expect(searches(network)).toEqual([
      VenueFixtures.base,
      VenueFixtures.base.replace('radius=3000', 'radius=10000'),
    ])
  })

  it('does not search, or load, while the location is denied', async () => {
    const network = Fakes.stubNetwork({ ...REFRESH })
    const { wrapper } = await VenueFixtures.signedInCore(new FakeLocation('denied'))
    const { result } = await renderExplore(wrapper)

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
    const { result } = await renderExplore(wrapper)

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
    const { result } = await renderExplore(wrapper)

    await waitFor(() => {
      expect(result.current.phase).toBe('ready')
    })

    expect(result.current.loading).toBe(false)
    expect(searches(network)).toEqual([])
  })

  it('searches for the words it is given, trimmed', async () => {
    const network = Fakes.stubNetwork({
      ...REFRESH,
      [`GET ${VenueFixtures.base}`]: Fakes.ok(VenueFixtures.page([VenueFixtures.venue('v1')])),
      [`GET ${VenueFixtures.base}&query=rooftop+bar`]: Fakes.ok(
        VenueFixtures.page([VenueFixtures.venue('v9')]),
      ),
    })

    const { wrapper } = await VenueFixtures.signedInCore()
    const { rerender, result } = await renderExplore(wrapper)

    await waitFor(() => {
      expect(result.current.venues).toHaveLength(1)
    })

    await rerender({ ...DEFAULTS, query: '  rooftop bar ' })

    await waitFor(() => {
      expect(result.current.venues.map((venue) => venue.id)).toEqual(['v9'])
    })

    expect(searches(network)).toEqual([
      VenueFixtures.base,
      `${VenueFixtures.base}&query=rooftop+bar`,
    ])
  })

  it('opens with the words, the kind and the radius it is given', async () => {
    const network = Fakes.stubNetwork({
      ...REFRESH,
      [`GET ${VenueFixtures.base.replace('radius=3000', 'radius=10000')}&query=brew&type=cafe`]:
        Fakes.ok(VenueFixtures.page([VenueFixtures.venue('v3')])),
    })

    const { wrapper } = await VenueFixtures.signedInCore()

    const { result } = await renderHook(
      () => useExploreViewModel({ filter: 'cafe', query: 'brew', radiusKm: 10 }),
      { wrapper },
    )

    await waitFor(() => {
      expect(result.current.venues.map((venue) => venue.id)).toEqual(['v3'])
    })

    expect(searches(network)).toHaveLength(1)
  })

  it('sends the chosen kind as the type, and stops when it is cleared', async () => {
    const network = Fakes.stubNetwork({
      ...REFRESH,
      [`GET ${VenueFixtures.base}`]: Fakes.ok(VenueFixtures.page([VenueFixtures.venue('v1')])),
      [`GET ${VenueFixtures.base}&type=night_club`]: Fakes.ok(
        VenueFixtures.page([VenueFixtures.venue('v7')]),
      ),
    })

    const { wrapper } = await VenueFixtures.signedInCore()
    const { rerender, result } = await renderExplore(wrapper)

    await waitFor(() => {
      expect(result.current.venues).toHaveLength(1)
    })

    await rerender({ ...DEFAULTS, filter: 'night_club' })

    await waitFor(() => {
      expect(result.current.venues.map((venue) => venue.id)).toEqual(['v7'])
    })

    await rerender(DEFAULTS)

    await waitFor(() => {
      expect(result.current.venues.map((venue) => venue.id)).toEqual(['v1'])
    })

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
    const { result } = await renderExplore(wrapper)

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
    const { result } = await renderExplore(wrapper)

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
    const { result } = await renderExplore(wrapper)

    await waitFor(() => {
      expect(result.current.error).toBe('errors.genericWithId')
    })

    expect(result.current.requestId).toBe('req-1')
  })
})
