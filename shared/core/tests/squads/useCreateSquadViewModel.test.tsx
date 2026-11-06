import { act, renderHook } from '@testing-library/react-native'

import type { ICreateSquadViewModel } from '../../src/squads/useCreateSquadViewModel'
import type { ITestCore } from '../helpers/wrapper'

import { useCreateSquadViewModel } from '../../src/squads/useCreateSquadViewModel'
import { Fakes } from '../helpers/fakes'
import { SquadFixtures } from '../helpers/squad-fixtures'
import { TestCore } from '../helpers/wrapper'

/** The latest value of a hook under test. */
interface ICurrent {
  /** The view model as of the last render. */
  current: ICreateSquadViewModel
}

/** What renderHook hands back for this view model. */
interface IRendered {
  /** Holds the latest view model. */
  result: ICurrent
}

/**
 * Create squad test helpers. Static methods only.
 */
class CreateFixtures {
  /**
   * Renders the view model inside a CoreProvider with fakes.
   * @param core - The fakes to render in.
   * @returns The view hook.
   */
  static setup(core: ITestCore = TestCore.create()): Promise<IRendered> {
    return renderHook(() => useCreateSquadViewModel(), { wrapper: core.wrapper })
  }

  /**
   * Types a name and submits it.
   * @param view - The view hook.
   * @param typed - The name to type.
   * @returns What submit resolved.
   */
  static async submitName(view: IRendered, typed: string): Promise<string | undefined> {
    let created: string | undefined

    await act(() => {
      view.result.current.setName(typed)
    })

    await act(async () => {
      created = await view.result.current.submit()
    })

    return created
  }
}

describe('useCreateSquadViewModel', () => {
  it.each(['', ' '.repeat(3), 'x'.repeat(51)])('rejects %j without a request', async (typed) => {
    const network = Fakes.stubNetwork({})
    const view = await CreateFixtures.setup()

    expect(await CreateFixtures.submitName(view, typed)).toBeUndefined()
    expect(view.result.current.error).toBe('errors.invalidSquadName')
    expect(network.requests).toHaveLength(0)
  })

  it('creates the squad with the trimmed name and puts it first in the cached list', async () => {
    const created = SquadFixtures.summary('s2')

    const network = Fakes.stubNetwork({
      'POST /api/v1/squads': { body: { data: created, success: true }, status: 201 },
    })

    const core = TestCore.create()

    SquadFixtures.seedList(core, [SquadFixtures.summary('s1')])

    core.queryClient.setQueryData(['/api/v1/users/me'], {
      data: { avatarURL: '', id: 'u1', name: 'Asha' },
      success: true,
    })

    const view = await CreateFixtures.setup(core)

    expect(await CreateFixtures.submitName(view, '  Weekend  ')).toBe('s2')
    expect(network.requests[0]?.body).toEqual({ name: 'Weekend' })
    expect(network.requests).toHaveLength(1)

    const [first, second] = SquadFixtures.listed(core)

    expect(first).toMatchObject({ id: 's2', memberCount: 1, role: 'ADMIN' })
    expect(first?.memberPreview).toEqual([expect.objectContaining({ name: 'Asha', userID: 'u1' })])
    expect(second?.id).toBe('s1')
  })

  it.each([
    [400, 'errors.invalidSquadName'],
    [500, 'errors.genericWithId'],
  ] as const)('maps a %i to %s', async (status, key) => {
    Fakes.stubNetwork({ 'POST /api/v1/squads': Fakes.failure(status, 'nope') })

    const view = await CreateFixtures.setup()

    expect(await CreateFixtures.submitName(view, 'Weekend')).toBeUndefined()
    expect(view.result.current.error).toBe(key)
    expect(view.result.current.busy).toBe(false)
  })

  it('says offline when there is no connection', async () => {
    Fakes.goOffline()

    const view = await CreateFixtures.setup()

    await CreateFixtures.submitName(view, 'Weekend')

    expect(view.result.current.error).toBe('errors.offline')
  })
})
