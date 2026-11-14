import { act, renderHook, waitFor } from '@testing-library/react-native'

import { HttpStatus } from '@roundup/api'

import type { INominateViewModel } from '../../src/events/useNominateViewModel'
import type { ITestCore } from '../helpers/wrapper'

import { useNominateViewModel } from '../../src/events/useNominateViewModel'
import { EventFixtures, SESSION } from '../helpers/event-fixtures'
import { FakeLocation, Fakes } from '../helpers/fakes'
import { VenueFixtures } from '../helpers/venue-fixtures'

/** The squad's first page of favorites, and of visit history. */
const FAVORITES = '/api/v1/squads/s1/favorites?limit=25&photoWidth=200'
const HISTORY = '/api/v1/squads/s1/history?limit=25&photoWidth=200'

/** The first page of a search for "rooftop" near the fake location. */
const SEARCH = '/api/v1/venues?lat=12.9716&lng=77.5946&radius=3000&photoWidth=200&query=rooftop'

/** The answers every test needs: the session, the event, and the two tabs. */
const COMMON = {
  ...SESSION,
  'GET /api/v1/events/e1': Fakes.ok(EventFixtures.detail('e1')),
  [`GET ${FAVORITES}`]: Fakes.ok(VenueFixtures.favorites([VenueFixtures.favorite('f1')])),
  [`GET ${HISTORY}`]: Fakes.ok(VenueFixtures.history([VenueFixtures.visit('h1')])),
}

/**
 * Renders the view model with words a test can change by rerendering.
 * @param wrapper - The core providers of the test.
 * @returns The rendered hook.
 */
const renderNominate = (
  wrapper: ITestCore['wrapper'],
): ReturnType<typeof renderHook<INominateViewModel, string>> =>
  renderHook((query: string) => useNominateViewModel('e1', 's1', query), {
    initialProps: '',
    wrapper,
  })

describe('useNominateViewModel', () => {
  it('lists the squad favorites and the venues it has been to, and does not search without words', async () => {
    const network = Fakes.stubNetwork(COMMON)
    const location = new FakeLocation()
    const { wrapper } = await VenueFixtures.signedInCore(location)
    const { result } = await renderNominate(wrapper)

    await waitFor(() => {
      expect(result.current.favorites).toHaveLength(1)
      expect(result.current.history).toHaveLength(1)
    })

    expect(result.current.favorites[0]).toMatchObject({ id: 'f1', name: 'Venue f1', rating: 4.5 })

    expect(result.current.history[0]).toMatchObject({
      id: 'h1',
      lastVisitedOn: '18th Oct 2026',
      visitCount: 3,
    })

    expect(result.current.results).toEqual([])
    expect(result.current.searching).toBe(false)
    expect(result.current.favoritesLoading).toBe(false)
    expect(result.current.historyLoading).toBe(false)

    expect(network.requests.some((request) => request.path.startsWith('/api/v1/venues'))).toBe(
      false,
    )

    // Opening the sheet does not ask for location; only typing does.
    expect(location.asked).toBe(0)
  })

  it('searches near the person once there are words, and clears the results when they go', async () => {
    const network = Fakes.stubNetwork({
      ...COMMON,
      [`GET ${SEARCH}`]: Fakes.ok(VenueFixtures.page([VenueFixtures.venue('v1')])),
    })

    const { wrapper } = await VenueFixtures.signedInCore()
    const { rerender, result } = await renderNominate(wrapper)

    await rerender('  rooftop ')

    await waitFor(() => {
      expect(result.current.phase).toBe('ready')
    })

    await waitFor(() => {
      expect(result.current.results).toHaveLength(1)
    })

    expect(result.current.results[0]).toMatchObject({ id: 'v1', name: 'Venue v1' })
    expect(network.requests.filter((request) => request.path === SEARCH)).toHaveLength(1)

    await rerender('')

    expect(result.current.results).toEqual([])
    expect(result.current.searching).toBe(false)
  })

  it('reports a denied location, does not search, and still lists the tabs', async () => {
    const network = Fakes.stubNetwork(COMMON)
    const { wrapper } = await VenueFixtures.signedInCore(new FakeLocation('denied'))
    const { rerender, result } = await renderNominate(wrapper)

    await rerender('rooftop')

    await waitFor(() => {
      expect(result.current.phase).toBe('denied')
      expect(result.current.favorites).toHaveLength(1)
      expect(result.current.history).toHaveLength(1)
    })

    expect(result.current.results).toEqual([])
    expect(result.current.searching).toBe(false)

    expect(network.requests.some((request) => request.path.startsWith('/api/v1/venues'))).toBe(
      false,
    )
  })

  it('knows which places the event already has', async () => {
    Fakes.stubNetwork(COMMON)

    const { wrapper } = await VenueFixtures.signedInCore()
    const { result } = await renderNominate(wrapper)

    await waitFor(() => {
      expect(result.current.suggestedIds.has('p1')).toBe(true)
    })

    expect(result.current.suggestedIds.has('f1')).toBe(false)
  })

  it('suggests a place, writing the event answer into the cache and loading the squad list again', async () => {
    const gate = Promise.withResolvers<boolean>()

    const network = Fakes.stubNetwork({
      ...COMMON,
      'POST /api/v1/events/e1/nominations': {
        ...Fakes.ok(
          EventFixtures.detail('e1', {
            nominations: [
              ...EventFixtures.detail('e1').nominations!,
              { name: 'Venue f1', nominatedBy: 'u1', placeID: 'f1' },
            ],
          }),
        ),
        gate: gate.promise,
      },
      'GET /api/v1/squads/s1/events?limit=20': Fakes.ok(EventFixtures.page([])),
    })

    const { wrapper } = await VenueFixtures.signedInCore()
    const { result } = await renderNominate(wrapper)

    await waitFor(() => {
      expect(result.current.suggestedIds.has('p1')).toBe(true)
    })

    let sent: Promise<boolean> | undefined

    await act(() => {
      sent = result.current.nominate('f1')
    })

    expect(result.current.suggestingId).toBe('f1')

    let done: boolean | undefined

    await act(async () => {
      gate.resolve(true)
      done = await sent
    })

    expect(done).toBe(true)
    expect(result.current.suggestingId).toBeUndefined()
    expect(result.current.suggestedIds.has('f1')).toBe(true)
    expect(result.current.error).toBeUndefined()

    expect(network.requests.find((request) => request.path.endsWith('/nominations'))?.body).toEqual(
      { placeID: 'f1' },
    )

    // The answer went into the cache, so the event was not asked for again.
    expect(network.requests.filter((request) => request.path === '/api/v1/events/e1')).toHaveLength(
      1,
    )
  })

  it('sends nothing for a place that is already suggested', async () => {
    const network = Fakes.stubNetwork(COMMON)
    const { wrapper } = await VenueFixtures.signedInCore()
    const { result } = await renderNominate(wrapper)

    await waitFor(() => {
      expect(result.current.suggestedIds.has('p1')).toBe(true)
    })

    let done: boolean | undefined

    await act(async () => {
      done = await result.current.nominate('p1')
    })

    expect(done).toBe(false)
    expect(network.requests.some((request) => request.path.endsWith('/nominations'))).toBe(false)
  })

  it('maps a conflict on suggesting to its message', async () => {
    Fakes.stubNetwork({
      ...COMMON,
      'POST /api/v1/events/e1/nominations': Fakes.failure(HttpStatus.conflict, 'nope'),
    })

    const { wrapper } = await VenueFixtures.signedInCore()
    const { result } = await renderNominate(wrapper)

    await waitFor(() => {
      expect(result.current.favorites).toHaveLength(1)
    })

    let done: boolean | undefined

    await act(async () => {
      done = await result.current.nominate('f1')
    })

    expect(done).toBe(false)
    expect(result.current.error).toBe('errors.eventChanged')
    expect(result.current.suggestingId).toBeUndefined()
  })
})
