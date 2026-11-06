import { act, renderHook } from '@testing-library/react-native'

import { HttpStatus } from '@roundup/api'

import type { IRenameSquadViewModel } from '../../src/squads/useRenameSquadViewModel'
import type { ITestCore } from '../helpers/wrapper'

import { useRenameSquadViewModel } from '../../src/squads/useRenameSquadViewModel'
import { Fakes } from '../helpers/fakes'
import { SquadFixtures } from '../helpers/squad-fixtures'
import { TestCore } from '../helpers/wrapper'

/** The latest value of a hook under test. */
interface ICurrent {
  /** The view model as of the last render. */
  current: IRenameSquadViewModel
}

/** What renderHook hands back for this view model. */
interface IRendered {
  /** Holds the latest view model. */
  result: ICurrent
}

/**
 * Rename squad test helpers. Static methods only.
 */
class RenameFixtures {
  /**
   * Renders the view model for squad s1, named "Squad s1", with both caches filled.
   * @param core - The fakes to render in.
   * @returns The view hook.
   */
  static setup(core: ITestCore = TestCore.create()): Promise<IRendered> {
    SquadFixtures.seedList(core, [SquadFixtures.summary('s1')])
    SquadFixtures.seedDetail(core, SquadFixtures.detail('s1'))

    return renderHook(() => useRenameSquadViewModel('s1', 'Squad s1'), { wrapper: core.wrapper })
  }

  /**
   * Types a name and submits it.
   * @param view - The view hook.
   * @param typed - The name to type.
   * @returns What submit resolved.
   */
  static async submitName(view: IRendered, typed: string): Promise<boolean | undefined> {
    let saved: boolean | undefined

    await act(() => {
      view.result.current.setName(typed)
    })

    await act(async () => {
      saved = await view.result.current.submit()
    })

    return saved
  }
}

describe('useRenameSquadViewModel', () => {
  it('starts with the current name', async () => {
    const { result } = await RenameFixtures.setup()

    expect(result.current.name).toBe('Squad s1')
  })

  it.each(['', ' '.repeat(3), 'x'.repeat(51)])('rejects %j without a request', async (typed) => {
    const network = Fakes.stubNetwork({})
    const view = await RenameFixtures.setup()

    expect(await RenameFixtures.submitName(view, typed)).toBe(false)
    expect(view.result.current.error).toBe('errors.invalidSquadName')
    expect(network.requests).toHaveLength(0)
  })

  it('counts an unchanged name as saved without a request', async () => {
    const network = Fakes.stubNetwork({})
    const view = await RenameFixtures.setup()

    expect(await RenameFixtures.submitName(view, ' Squad s1 ')).toBe(true)
    expect(network.requests).toHaveLength(0)
  })

  it('saves a new name and updates the cached detail and list item', async () => {
    const network = Fakes.stubNetwork({
      'PATCH /api/v1/squads/s1': Fakes.ok({ ...SquadFixtures.summary('s1'), name: 'Weekend' }),
    })

    const core = TestCore.create()
    const view = await RenameFixtures.setup(core)

    expect(await RenameFixtures.submitName(view, '  Weekend ')).toBe(true)
    expect(network.requests[0]?.body).toEqual({ name: 'Weekend' })
    expect(network.requests).toHaveLength(1)
    expect(SquadFixtures.cachedDetail(core, 's1')?.name).toBe('Weekend')
    expect(SquadFixtures.cachedDetail(core, 's1')?.members).toHaveLength(2)
    expect(SquadFixtures.listed(core)[0]).toMatchObject({ memberCount: 1, name: 'Weekend' })
  })

  it.each([
    [HttpStatus.badRequest, 'errors.invalidSquadName'],
    [HttpStatus.internalServerError, 'errors.genericWithId'],
  ] as const)('maps a %i to %s and keeps the cache', async (status, key) => {
    Fakes.stubNetwork({ 'PATCH /api/v1/squads/s1': Fakes.failure(status, 'nope') })

    const core = TestCore.create()
    const view = await RenameFixtures.setup(core)

    expect(await RenameFixtures.submitName(view, 'Weekend')).toBe(false)
    expect(view.result.current.error).toBe(key)
    expect(SquadFixtures.listed(core)[0]?.name).toBe('Squad s1')
  })

  it('says offline when there is no connection', async () => {
    Fakes.goOffline()

    const view = await RenameFixtures.setup()

    await RenameFixtures.submitName(view, 'Weekend')

    expect(view.result.current.error).toBe('errors.offline')
  })
})
