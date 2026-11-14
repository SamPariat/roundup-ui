import { renderHook, waitFor } from '@testing-library/react-native'

import { HttpStatus } from '@roundup/api'

import { useSquad } from '../../src/squads/useSquad'
import { Fakes } from '../helpers/fakes'
import { SquadFixtures } from '../helpers/squad-fixtures'

/** The refresh answer every signed-in test needs. */
const REFRESH = { 'POST /api/v1/auth/refresh': Fakes.ok(Fakes.pair('a2', 'r2')) }

describe('useSquad', () => {
  it('leaves the creator out once they have left the squad', async () => {
    Fakes.stubNetwork({
      ...REFRESH,
      'GET /api/v1/squads/s1': Fakes.ok(
        SquadFixtures.detail('s1', { createdBy: 'gone', createdByName: null }),
      ),
    })

    const { wrapper } = await SquadFixtures.signedInCore()
    const { result } = await renderHook(() => useSquad('s1'), { wrapper })

    await waitFor(() => {
      expect(result.current.squad).toBeDefined()
    })

    expect(result.current.squad?.createdByMe).toBe(false)
    expect(result.current.squad?.createdByName).toBeUndefined()
  })

  it('loads the squad, its members and the permissions', async () => {
    Fakes.stubNetwork({
      ...REFRESH,
      'GET /api/v1/squads/s1': Fakes.ok(SquadFixtures.detail('s1')),
    })

    const { wrapper } = await SquadFixtures.signedInCore()
    const { result } = await renderHook(() => useSquad('s1'), { wrapper })

    await waitFor(() => {
      expect(result.current.squad).toBeDefined()
    })

    expect(result.current.squad).toEqual({
      createdByMe: true,
      createdByName: 'Name u1',
      createdOn: '1st Jan 2026',
      id: 's1',
      memberCount: 2,
      name: 'Squad s1',
    })

    expect(result.current.myRole).toBe('ADMIN')
    expect(result.current.permissions?.canEditSquad).toBe(true)
    expect(result.current.loading).toBe(false)
    expect(result.current.notFound).toBe(false)

    expect(result.current.members).toEqual([
      { id: 'u1', isMe: true, name: 'Name u1', role: 'ADMIN' },
      { id: 'u2', isMe: false, name: 'Name u2', role: 'MEMBER' },
    ])
  })

  it('reports not found on a 404', async () => {
    Fakes.stubNetwork({
      ...REFRESH,
      'GET /api/v1/squads/s1': Fakes.failure(HttpStatus.notFound, 'squad not found'),
    })

    const { wrapper } = await SquadFixtures.signedInCore()
    const { result } = await renderHook(() => useSquad('s1'), { wrapper })

    await waitFor(() => {
      expect(result.current.notFound).toBe(true)
    })

    expect(result.current.squad).toBeUndefined()
    expect(result.current.members).toEqual([])
    expect(result.current.error).toBe('errors.squadNotFound')
  })

  it('shows the request id of a server failure without calling it not found', async () => {
    Fakes.stubNetwork({
      ...REFRESH,
      'GET /api/v1/squads/s1': Fakes.failure(HttpStatus.internalServerError, 'boom'),
    })

    const { wrapper } = await SquadFixtures.signedInCore()
    const { result } = await renderHook(() => useSquad('s1'), { wrapper })

    await waitFor(() => {
      expect(result.current.error).toBe('errors.genericWithId')
    })

    expect(result.current.notFound).toBe(false)
    expect(result.current.requestId).toBe('req-1')
  })

  it('loads nothing without an id', async () => {
    const network = Fakes.stubNetwork(REFRESH)
    const { wrapper } = await SquadFixtures.signedInCore()
    const { result } = await renderHook(() => useSquad(), { wrapper })

    expect(result.current.loading).toBe(false)
    expect(result.current.squad).toBeUndefined()
    expect(result.current.notFound).toBe(false)

    expect(network.requests.filter((request) => request.path.startsWith('/api/v1/squads'))).toEqual(
      [],
    )
  })
})
