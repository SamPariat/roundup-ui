import { act, renderHook } from '@testing-library/react-native'

import { HttpStatus } from '@roundup/api'

import type { ISquadMembersViewModel } from '../../src/squads/useSquadMembersViewModel'
import type { ITestCore } from '../helpers/wrapper'

import { useSquadMembersViewModel } from '../../src/squads/useSquadMembersViewModel'
import { Fakes } from '../helpers/fakes'
import { SquadFixtures } from '../helpers/squad-fixtures'
import { TestCore } from '../helpers/wrapper'

/** The latest value of a hook under test. */
interface ICurrent {
  /** The view model as of the last render. */
  current: ISquadMembersViewModel
}

/** What renderHook hands back for this view model. */
interface IRendered {
  /** Holds the latest view model. */
  result: ICurrent
}

/**
 * Member actions test helpers. Static methods only.
 */
class MembersFixtures {
  /**
   * Renders the view model for squad s1 with u1 (me, admin) and u2 in both caches.
   * @param core - The fakes to render in.
   * @returns The view hook.
   */
  static setup(core: ITestCore): Promise<IRendered> {
    const summary = SquadFixtures.summary('s1', {
      memberCount: 2,
      memberPreview: [SquadFixtures.member('u1', 'ADMIN'), SquadFixtures.member('u2')],
    })

    SquadFixtures.seedList(core, [summary, SquadFixtures.summary('s0')])
    SquadFixtures.seedDetail(core, SquadFixtures.detail('s1'))

    return renderHook(() => useSquadMembersViewModel('s1'), { wrapper: core.wrapper })
  }

  /**
   * Runs one action.
   * @param action - The action to run.
   * @returns What the action resolved.
   */
  static async run(action: () => Promise<boolean>): Promise<boolean> {
    let done = false

    await act(async () => {
      done = await action()
    })

    return done
  }
}

describe('useSquadMembersViewModel', () => {
  it('makes a member an admin in the cached detail and list item', async () => {
    const network = Fakes.stubNetwork({
      'PATCH /api/v1/squads/s1/members/u2': Fakes.empty(HttpStatus.noContent),
    })

    const core = TestCore.create()
    const { result } = await MembersFixtures.setup(core)

    expect(await MembersFixtures.run(() => result.current.makeAdmin('u2'))).toBe(true)
    expect(network.requests[0]?.body).toEqual({ role: 'ADMIN' })
    expect(network.requests).toHaveLength(1)
    expect(SquadFixtures.cachedDetail(core, 's1')?.members[1]?.role).toBe('ADMIN')
    expect(SquadFixtures.listed(core)[0]?.memberPreview[1]?.role).toBe('ADMIN')
    expect(result.current.busyUserId).toBeUndefined()
  })

  it('makes an admin a plain member', async () => {
    const network = Fakes.stubNetwork({
      'PATCH /api/v1/squads/s1/members/u2': Fakes.empty(HttpStatus.noContent),
    })

    const core = TestCore.create()
    const { result } = await MembersFixtures.setup(core)

    await MembersFixtures.run(() => result.current.makeAdmin('u2'))
    await MembersFixtures.run(() => result.current.removeAdmin('u2'))

    expect(network.requests[1]?.body).toEqual({ role: 'MEMBER' })
    expect(SquadFixtures.cachedDetail(core, 's1')?.members[1]?.role).toBe('MEMBER')
  })

  it('shows needsAnAdmin on a 409 and keeps the cache', async () => {
    Fakes.stubNetwork({
      'PATCH /api/v1/squads/s1/members/u1': Fakes.failure(HttpStatus.conflict, 'last admin'),
    })

    const core = TestCore.create()
    const { result } = await MembersFixtures.setup(core)

    expect(await MembersFixtures.run(() => result.current.removeAdmin('u1'))).toBe(false)
    expect(result.current.error).toBe('errors.needsAnAdmin')
    expect(SquadFixtures.cachedDetail(core, 's1')?.members[0]?.role).toBe('ADMIN')
  })

  it('removes a member from the detail, the count and the preview', async () => {
    const network = Fakes.stubNetwork({
      'DELETE /api/v1/squads/s1/members/u2': Fakes.empty(HttpStatus.noContent),
    })

    const core = TestCore.create()
    const { result } = await MembersFixtures.setup(core)

    expect(await MembersFixtures.run(() => result.current.remove('u2'))).toBe(true)
    expect(network.requests).toHaveLength(1)

    const detail = SquadFixtures.cachedDetail(core, 's1')

    expect(detail?.members.map((member) => member.userID)).toEqual(['u1'])
    expect(detail?.memberCount).toBe(1)
    expect(SquadFixtures.listed(core)[0]).toMatchObject({ memberCount: 1 })
    expect(SquadFixtures.listed(core)[0]?.memberPreview).toHaveLength(1)
  })

  it('leaves by removing my own id, then drops the squad and its detail', async () => {
    const network = Fakes.stubNetwork({
      'DELETE /api/v1/squads/s1/members/u1': Fakes.empty(HttpStatus.noContent),
    })

    const core = TestCore.create()
    const { result } = await MembersFixtures.setup(core)

    expect(await MembersFixtures.run(() => result.current.leave())).toBe(true)

    expect(network.requests[0]).toMatchObject({
      method: 'DELETE',
      path: '/api/v1/squads/s1/members/u1',
    })

    expect(SquadFixtures.listed(core).map((squad) => squad.id)).toEqual(['s0'])
    expect(SquadFixtures.cachedDetail(core, 's1')).toBeUndefined()
  })

  it('cannot leave before the squad has loaded', async () => {
    const network = Fakes.stubNetwork({})

    const { result } = await renderHook(() => useSquadMembersViewModel('s1'), {
      wrapper: TestCore.create().wrapper,
    })

    expect(await MembersFixtures.run(() => result.current.leave())).toBe(false)
    expect(result.current.error).toBe('errors.generic')
    expect(network.requests).toHaveLength(0)
  })

  it('marks only the tapped member as busy while the request runs', async () => {
    const { promise: gate, resolve: release } = Promise.withResolvers<boolean>()

    Fakes.stubNetwork({
      'DELETE /api/v1/squads/s1/members/u2': { gate, status: HttpStatus.noContent },
    })

    const { result } = await MembersFixtures.setup(TestCore.create())
    let pending: Promise<boolean> = Promise.resolve(false)

    await act(() => {
      pending = result.current.remove('u2')
    })

    expect(result.current.busyUserId).toBe('u2')

    await act(async () => {
      release(true)
      await pending
    })

    expect(result.current.busyUserId).toBeUndefined()
  })

  it.each([
    [HttpStatus.notFound, 'errors.squadNotFound'],
    [HttpStatus.internalServerError, 'errors.genericWithId'],
  ] as const)('maps a %i on remove to %s', async (status, key) => {
    Fakes.stubNetwork({ 'DELETE /api/v1/squads/s1/members/u2': Fakes.failure(status, 'nope') })

    const { result } = await MembersFixtures.setup(TestCore.create())

    expect(await MembersFixtures.run(() => result.current.remove('u2'))).toBe(false)
    expect(result.current.error).toBe(key)
  })

  it('says offline when there is no connection', async () => {
    Fakes.goOffline()

    const { result } = await MembersFixtures.setup(TestCore.create())

    await MembersFixtures.run(() => result.current.remove('u2'))

    expect(result.current.error).toBe('errors.offline')
  })
})
