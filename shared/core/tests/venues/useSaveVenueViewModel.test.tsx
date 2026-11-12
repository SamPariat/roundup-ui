import { act, renderHook, waitFor } from '@testing-library/react-native'

import { HttpStatus } from '@roundup/api'

import { useSaveVenueViewModel } from '../../src/venues/useSaveVenueViewModel'
import { Fakes } from '../helpers/fakes'
import { VenueFixtures } from '../helpers/venue-fixtures'

/** The refresh answer every signed-in test needs. */
const REFRESH = { 'POST /api/v1/auth/refresh': Fakes.ok(Fakes.pair('a2', 'r2')) }

/** The two squads of the fixture: saved in s1, not in s2. */
const SAVED = VenueFixtures.detail('v1')

/** The same venue once it is saved in s2 as well. */
const SAVED_TWICE = VenueFixtures.detail('v1', {
  savedIn: [
    { saved: true, squadID: 's1', squadName: 'Friday crew' },
    { saved: true, squadID: 's2', squadName: 'Goa trip' },
  ],
})

describe('useSaveVenueViewModel', () => {
  it('lists the squads with a tick on those that have the venue', async () => {
    Fakes.stubNetwork({ ...REFRESH, 'GET /api/v1/venues/v1': Fakes.ok(SAVED) })

    const { wrapper } = await VenueFixtures.signedInCore()
    const { result } = await renderHook(() => useSaveVenueViewModel('v1'), { wrapper })

    await waitFor(() => {
      expect(result.current.squads).toHaveLength(2)
    })

    expect(result.current.squads.map((squad) => [squad.squadName, squad.saved])).toEqual([
      ['Friday crew', true],
      ['Goa trip', false],
    ])

    expect(result.current.loading).toBe(false)
    expect(result.current.busySquadId).toBeUndefined()
  })

  it('saves the venue in a squad and loads it again', async () => {
    const network = Fakes.stubNetwork({
      ...REFRESH,
      'GET /api/v1/venues/v1': Fakes.ok(SAVED),
      'POST /api/v1/squads/s2/favorites': Fakes.empty(HttpStatus.noContent),
    })

    const { wrapper } = await VenueFixtures.signedInCore()
    const { result } = await renderHook(() => useSaveVenueViewModel('v1'), { wrapper })

    await waitFor(() => {
      expect(result.current.squads).toHaveLength(2)
    })

    network.routes['GET /api/v1/venues/v1'] = Fakes.ok(SAVED_TWICE)

    let done: boolean | undefined

    await act(async () => {
      done = await result.current.toggle(result.current.squads[1]!)
    })

    expect(done).toBe(true)

    expect(
      network.requests.find((request) => request.path === '/api/v1/squads/s2/favorites')?.body,
    ).toEqual({
      placeID: 'v1',
    })

    await waitFor(() => {
      expect(result.current.squads.map((squad) => squad.saved)).toEqual([true, true])
    })
  })

  it('removes the venue from a squad that has it', async () => {
    const network = Fakes.stubNetwork({
      ...REFRESH,
      'DELETE /api/v1/squads/s1/favorites/v1': Fakes.empty(HttpStatus.noContent),
      'GET /api/v1/venues/v1': Fakes.ok(SAVED),
    })

    const { wrapper } = await VenueFixtures.signedInCore()
    const { result } = await renderHook(() => useSaveVenueViewModel('v1'), { wrapper })

    await waitFor(() => {
      expect(result.current.squads).toHaveLength(2)
    })

    network.routes['GET /api/v1/venues/v1'] = Fakes.ok(
      VenueFixtures.detail('v1', {
        savedIn: [
          { saved: false, squadID: 's1', squadName: 'Friday crew' },
          { saved: false, squadID: 's2', squadName: 'Goa trip' },
        ],
      }),
    )

    await act(async () => {
      await result.current.toggle(result.current.squads[0]!)
    })

    expect(network.requests.map((request) => `${request.method} ${request.path}`)).toContain(
      'DELETE /api/v1/squads/s1/favorites/v1',
    )

    await waitFor(() => {
      expect(result.current.squads.map((squad) => squad.saved)).toEqual([false, false])
    })
  })

  it('names the squad being saved to while the request runs', async () => {
    /**
     *
     */
    const { promise: gate, resolve: release } = Promise.withResolvers<boolean>()

    Fakes.stubNetwork({
      ...REFRESH,
      'GET /api/v1/venues/v1': Fakes.ok(SAVED),
      'POST /api/v1/squads/s2/favorites': { gate, status: HttpStatus.noContent },
    })

    const { wrapper } = await VenueFixtures.signedInCore()
    const { result } = await renderHook(() => useSaveVenueViewModel('v1'), { wrapper })

    await waitFor(() => {
      expect(result.current.squads).toHaveLength(2)
    })

    let pending: Promise<boolean> = Promise.resolve(false)

    await act(() => {
      pending = result.current.toggle(result.current.squads[1]!)
    })

    expect(result.current.busySquadId).toBe('s2')

    await act(async () => {
      release(true)
      await pending
    })

    expect(result.current.busySquadId).toBeUndefined()
  })

  it('shows an error and resolves false when saving fails', async () => {
    Fakes.stubNetwork({
      ...REFRESH,
      'GET /api/v1/venues/v1': Fakes.ok(SAVED),
      'POST /api/v1/squads/s2/favorites': Fakes.failure(HttpStatus.notFound, 'squad or venue'),
    })

    const { wrapper } = await VenueFixtures.signedInCore()
    const { result } = await renderHook(() => useSaveVenueViewModel('v1'), { wrapper })

    await waitFor(() => {
      expect(result.current.squads).toHaveLength(2)
    })

    let done: boolean | undefined

    await act(async () => {
      done = await result.current.toggle(result.current.squads[1]!)
    })

    expect(done).toBe(false)
    expect(result.current.error).toBe('errors.venueNotFound')
    expect(result.current.busySquadId).toBeUndefined()
  })
})
