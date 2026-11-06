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
   * Renders the view model for squad s1, with u1 (me, admin) and u2, and the list cached.
   * @param core - The fakes to render in.
   * @returns The view hook.
   */
  static setup(core: ITestCore): Promise<IRendered> {
    SquadFixtures.seedList(core, [SquadFixtures.summary('s1')])
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
  it('makes a member an admin and invalidates the squad and the list', async () => {
    const network = Fakes.stubNetwork({
      'PATCH /api/v1/squads/s1/members/u2': Fakes.empty(HttpStatus.noContent),
    })

    const core = TestCore.create()
    const { result } = await MembersFixtures.setup(core)

    expect(await MembersFixtures.run(() => result.current.makeAdmin('u2'))).toBe(true)
    expect(network.requests[0]?.body).toEqual({ role: 'ADMIN' })
    expect(network.requests).toHaveLength(1)
    expect(SquadFixtures.detailInvalidated(core, 's1')).toBe(true)
    expect(SquadFixtures.listInvalidated(core)).toBe(true)
    expect(result.current.busyUserId).toBeUndefined()
  })

  it('makes an admin a plain member', async () => {
    const network = Fakes.stubNetwork({
      'PATCH /api/v1/squads/s1/members/u2': Fakes.empty(HttpStatus.noContent),
    })

    const core = TestCore.create()
    const { result } = await MembersFixtures.setup(core)

    expect(await MembersFixtures.run(() => result.current.removeAdmin('u2'))).toBe(true)
    expect(network.requests[0]?.body).toEqual({ role: 'MEMBER' })
    expect(SquadFixtures.detailInvalidated(core, 's1')).toBe(true)
  })

  it('shows needsAnAdmin on a 409 and leaves the cache alone', async () => {
    Fakes.stubNetwork({
      'PATCH /api/v1/squads/s1/members/u1': Fakes.failure(HttpStatus.conflict, 'last admin'),
    })

    const core = TestCore.create()
    const { result } = await MembersFixtures.setup(core)

    expect(await MembersFixtures.run(() => result.current.removeAdmin('u1'))).toBe(false)
    expect(result.current.error).toBe('errors.needsAnAdmin')
    expect(SquadFixtures.detailInvalidated(core, 's1')).toBe(false)
    expect(SquadFixtures.listInvalidated(core)).toBe(false)
  })

  it('removes a member and invalidates the squad and the list', async () => {
    const network = Fakes.stubNetwork({
      'DELETE /api/v1/squads/s1/members/u2': Fakes.empty(HttpStatus.noContent),
    })

    const core = TestCore.create()
    const { result } = await MembersFixtures.setup(core)

    expect(await MembersFixtures.run(() => result.current.remove('u2'))).toBe(true)
    expect(network.requests).toHaveLength(1)
    expect(SquadFixtures.detailInvalidated(core, 's1')).toBe(true)
    expect(SquadFixtures.listInvalidated(core)).toBe(true)
  })

  it('leaves by removing my own id, then drops the detail and invalidates the list', async () => {
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

    expect(core.queryClient.getQueryData(['/api/v1/squads/s1'])).toBeUndefined()
    expect(SquadFixtures.listInvalidated(core)).toBe(true)
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
