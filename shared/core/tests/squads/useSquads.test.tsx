import { QueryClient } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react-native'

import type { SquadSummary } from '@roundup/api'

import { HttpStatus } from '@roundup/api'

import type { ISquadCard } from '../../src/squads/types'

import { Deps } from '../../src/di/deps'
import { Squads } from '../../src/helpers/squads'
import { useSquads } from '../../src/squads/useSquads'
import { Fakes } from '../helpers/fakes'
import { SquadFixtures } from '../helpers/squad-fixtures'
import { TestCore } from '../helpers/wrapper'

/** Squad helpers that mark every card they map, to show which helpers a hook used. */
class TaggedSquads extends Squads {
  /**
   * Maps a list item as the real helpers do, then marks its name.
   * @param summary - The list item.
   * @returns The card, its name tagged.
   */
  override toCard(summary: SquadSummary): ISquadCard {
    return { ...super.toCard(summary), name: `tagged ${summary.name}` }
  }
}

/** The refresh answer every signed-in test needs. */
const REFRESH = { 'POST /api/v1/auth/refresh': Fakes.ok(Fakes.pair('a2', 'r2')) }

describe('useSquads', () => {
  it('maps the first page onto card props', async () => {
    const network = Fakes.stubNetwork({
      ...REFRESH,
      'GET /api/v1/squads?limit=25': Fakes.ok(
        SquadFixtures.page([
          SquadFixtures.summary('s1', {
            avatarURL: 'https://img/s1.png',
            memberCount: 6,
            memberPreview: [
              SquadFixtures.member('u1', 'ADMIN', 'https://img/u1.png'),
              SquadFixtures.member('u2'),
            ],
          }),
          SquadFixtures.summary('s2'),
        ]),
      ),
    })

    const { wrapper } = await SquadFixtures.signedInCore()
    const { result } = await renderHook(() => useSquads(), { wrapper })

    await waitFor(() => {
      expect(result.current.squads).toHaveLength(2)
    })

    expect(result.current.squads[0]).toEqual({
      avatarURL: 'https://img/s1.png',
      id: 's1',
      memberCount: 6,
      members: [
        { id: 'u1', name: 'Name u1', src: 'https://img/u1.png' },
        { id: 'u2', name: 'Name u2' },
      ],
      name: 'Squad s1',
      role: 'ADMIN',
    })

    expect(result.current.squads[1]).not.toHaveProperty('avatarURL')
    expect(result.current.hasMore).toBe(false)
    expect(result.current.loading).toBe(false)

    expect(
      network.requests.filter((request) => request.path.startsWith('/api/v1/squads')),
    ).toHaveLength(1)
  })

  it('loads the next page with the cursor until the list ends', async () => {
    Fakes.stubNetwork({
      ...REFRESH,
      'GET /api/v1/squads?limit=25': Fakes.ok(
        SquadFixtures.page([SquadFixtures.summary('s1')], 'c1'),
      ),
      'GET /api/v1/squads?limit=25&cursor=c1': Fakes.ok(
        SquadFixtures.page([SquadFixtures.summary('s2')]),
      ),
    })

    const { wrapper } = await SquadFixtures.signedInCore()
    const { result } = await renderHook(() => useSquads(), { wrapper })

    await waitFor(() => {
      expect(result.current.hasMore).toBe(true)
    })

    await act(() => {
      result.current.loadMore()
    })

    await waitFor(() => {
      expect(result.current.squads.map((squad) => squad.id)).toEqual(['s1', 's2'])
    })

    expect(result.current.hasMore).toBe(false)
    expect(result.current.loadingMore).toBe(false)
  })

  it('does not ask for a page when the list has ended', async () => {
    const network = Fakes.stubNetwork({
      ...REFRESH,
      'GET /api/v1/squads?limit=25': Fakes.ok(SquadFixtures.page([])),
    })

    const { wrapper } = await SquadFixtures.signedInCore()
    const { result } = await renderHook(() => useSquads(), { wrapper })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await act(() => {
      result.current.loadMore()
    })

    expect(result.current.squads).toEqual([])
    expect(network.requests.filter((request) => request.path.includes('cursor'))).toHaveLength(0)
  })

  it('does not load while signed out', async () => {
    const network = Fakes.stubNetwork({})
    const { wrapper } = TestCore.create()
    const { result } = await renderHook(() => useSquads(), { wrapper })

    expect(result.current.loading).toBe(false)
    expect(network.requests).toHaveLength(0)
  })

  it('loads the list again on refresh', async () => {
    const network = Fakes.stubNetwork({
      ...REFRESH,
      'GET /api/v1/squads?limit=25': Fakes.ok(SquadFixtures.page([SquadFixtures.summary('s1')])),
    })

    const { wrapper } = await SquadFixtures.signedInCore()
    const { result } = await renderHook(() => useSquads(), { wrapper })

    await waitFor(() => {
      expect(result.current.squads).toHaveLength(1)
    })

    network.routes['GET /api/v1/squads?limit=25'] = Fakes.ok(
      SquadFixtures.page([SquadFixtures.summary('s9')]),
    )

    await act(async () => {
      await result.current.refresh()
    })

    await waitFor(() => {
      expect(result.current.squads.map((squad) => squad.id)).toEqual(['s9'])
    })
  })

  it('shows the request id of a server failure', async () => {
    Fakes.stubNetwork({
      ...REFRESH,
      'GET /api/v1/squads?limit=25': Fakes.failure(HttpStatus.internalServerError, 'boom'),
    })

    const { wrapper } = await SquadFixtures.signedInCore()
    const { result } = await renderHook(() => useSquads(), { wrapper })

    await waitFor(() => {
      expect(result.current.error).toBe('errors.genericWithId')
    })

    expect(result.current.requestId).toBe('req-1')
  })

  it('maps the cards with the squad helpers useDeps gives it', async () => {
    Fakes.stubNetwork({
      ...REFRESH,
      'GET /api/v1/squads?limit=25': Fakes.ok(SquadFixtures.page([SquadFixtures.summary('s1')])),
    })

    // No garbage collection, whose timer would keep Jest alive.
    const queryClient = new QueryClient({
      defaultOptions: { queries: { gcTime: Infinity, retry: false } },
    })

    const helpers = {
      ...Deps.create({ queryClient }).helpers,
      squads: new TaggedSquads(queryClient),
    }

    const core = TestCore.create({ helpers, queryClient })

    await core.store.save('r1')
    const { result } = await renderHook(() => useSquads(), { wrapper: core.wrapper })

    await waitFor(() => {
      expect(result.current.squads[0]?.name).toBe('tagged Squad s1')
    })
  })
})
