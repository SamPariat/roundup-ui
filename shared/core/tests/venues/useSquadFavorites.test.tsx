import { act, renderHook, waitFor } from '@testing-library/react-native'

import { HttpStatus } from '@roundup/api'

import { useSquadFavorites } from '../../src/venues/useSquadFavorites'
import { Fakes } from '../helpers/fakes'
import { VenueFixtures } from '../helpers/venue-fixtures'

/** The answers every signed-in test needs: a refreshed session and the person's profile. */
const SESSION = {
  'GET /api/v1/users/me': Fakes.ok({
    avatarURL: '',
    createdAt: '2026-01-01T00:00:00Z',
    id: 'u1',
    name: 'Asha',
    phone: '+919876543210',
    updatedAt: '2026-01-01T00:00:00Z',
  }),
  'POST /api/v1/auth/refresh': Fakes.ok(Fakes.pair('a2', 'r2')),
}

/** The first page of a squad's favorites. */
const FIRST = '/api/v1/squads/s1/favorites?limit=25'

describe('useSquadFavorites', () => {
  it('maps the favorites onto rows with a thumbnail, the savers and when it was saved', async () => {
    Fakes.stubNetwork({
      ...SESSION,
      [`GET ${FIRST}`]: Fakes.ok(
        VenueFixtures.favorites([
          VenueFixtures.favorite('v1', {
            savedBy: [
              { avatarURL: '', name: 'Asha', userID: 'u1' },
              { avatarURL: 'https://img/m.png', name: 'Meera', userID: 'u2' },
            ],
            savedByMe: true,
          }),
        ]),
      ),
    })

    const { wrapper } = await VenueFixtures.signedInCore()
    const { result } = await renderHook(() => useSquadFavorites('s1'), { wrapper })

    await waitFor(() => {
      expect(result.current.favorites).toHaveLength(1)
    })

    expect(result.current.favorites[0]).toMatchObject({
      address: 'v1 MG Road',
      id: 'v1',
      name: 'Venue v1',
      rating: 4.5,
      savedByMe: true,
      savedOn: '18 Oct',
    })

    expect(result.current.favorites[0]?.photo).toBe(
      'https://lh3.googleusercontent.com/place-photos/v1=s4800-w800',
    )

    await waitFor(() => {
      expect(result.current.favorites[0]?.savers).toEqual([
        { id: 'u1', isMe: true, name: 'Asha' },
        { id: 'u2', isMe: false, name: 'Meera', src: 'https://img/m.png' },
      ])
    })

    expect(result.current.complete).toBe(true)
  })

  it('is not complete while there are more pages, and loads the next one on loadMore', async () => {
    const network = Fakes.stubNetwork({
      ...SESSION,
      [`GET ${FIRST}`]: Fakes.ok(VenueFixtures.favorites([VenueFixtures.favorite('v1')], 'c2')),
      [`GET ${FIRST}&cursor=c2`]: Fakes.ok(VenueFixtures.favorites([VenueFixtures.favorite('v2')])),
    })

    const { wrapper } = await VenueFixtures.signedInCore()
    const { result } = await renderHook(() => useSquadFavorites('s1'), { wrapper })

    await waitFor(() => {
      expect(result.current.favorites).toHaveLength(1)
    })

    expect(result.current.hasMore).toBe(true)
    expect(result.current.complete).toBe(false)

    await act(() => {
      result.current.loadMore()
      result.current.loadMore()
    })

    await waitFor(() => {
      expect(result.current.favorites.map((row) => row.id)).toEqual(['v1', 'v2'])
    })

    expect(result.current.complete).toBe(true)

    expect(network.requests.filter((request) => request.path.includes('cursor=c2'))).toHaveLength(1)
  })

  it('removes the save of the signed-in person and loads the list again', async () => {
    const network = Fakes.stubNetwork({
      ...SESSION,
      [`GET ${FIRST}`]: Fakes.ok(
        VenueFixtures.favorites([VenueFixtures.favorite('v1', { savedByMe: true })]),
      ),
      'DELETE /api/v1/squads/s1/favorites/v1': Fakes.empty(HttpStatus.noContent),
    })

    const { wrapper } = await VenueFixtures.signedInCore()
    const { result } = await renderHook(() => useSquadFavorites('s1'), { wrapper })

    await waitFor(() => {
      expect(result.current.favorites).toHaveLength(1)
    })

    network.routes[`GET ${FIRST}`] = Fakes.ok(VenueFixtures.favorites([]))

    let done: boolean | undefined

    await act(async () => {
      done = await result.current.remove(result.current.favorites[0]!)
    })

    expect(done).toBe(true)

    await waitFor(() => {
      expect(result.current.favorites).toEqual([])
    })

    expect(result.current.removingId).toBeUndefined()
  })

  it('keeps the row and says why when the removal fails', async () => {
    Fakes.stubNetwork({
      ...SESSION,
      [`GET ${FIRST}`]: Fakes.ok(
        VenueFixtures.favorites([VenueFixtures.favorite('v1', { savedByMe: true })]),
      ),
      'DELETE /api/v1/squads/s1/favorites/v1': Fakes.failure(HttpStatus.notFound, 'not saved'),
    })

    const { wrapper } = await VenueFixtures.signedInCore()
    const { result } = await renderHook(() => useSquadFavorites('s1'), { wrapper })

    await waitFor(() => {
      expect(result.current.favorites).toHaveLength(1)
    })

    let done: boolean | undefined

    await act(async () => {
      done = await result.current.remove(result.current.favorites[0]!)
    })

    expect(done).toBe(false)
    expect(result.current.error).toBeDefined()
    expect(result.current.favorites).toHaveLength(1)
  })
})
