import { act, renderHook } from '@testing-library/react-native'

import { HttpStatus } from '@roundup/api'

import type { IAddMemberViewModel } from '../../src/squads/useAddMemberViewModel'
import type { ITestCore } from '../helpers/wrapper'

import { useAddMemberViewModel } from '../../src/squads/useAddMemberViewModel'
import { Fakes } from '../helpers/fakes'
import { SquadFixtures } from '../helpers/squad-fixtures'
import { TestCore } from '../helpers/wrapper'

/** The latest value of a hook under test. */
interface ICurrent {
  /** The view model as of the last render. */
  current: IAddMemberViewModel
}

/** What renderHook hands back for this view model. */
interface IRendered {
  /** Holds the latest view model. */
  result: ICurrent
}

/** The route adding a member to squad s1. */
const ADD = 'POST /api/v1/squads/s1/members'

/**
 * Add member test helpers. Static methods only.
 */
class AddFixtures {
  /**
   * Renders the view model for squad s1 with both caches filled.
   * @param core - The fakes to render in.
   * @returns The view hook.
   */
  static setup(core: ITestCore = TestCore.create()): Promise<IRendered> {
    SquadFixtures.seedList(core, [SquadFixtures.summary('s1')])

    SquadFixtures.seedDetail(core, SquadFixtures.detail('s1'))

    return renderHook(() => useAddMemberViewModel('s1'), { wrapper: core.wrapper })
  }

  /**
   * Types a number and submits it.
   * @param view - The view hook.
   * @param typed - The text to type.
   * @returns What submit resolved.
   */
  static async submitNumber(view: IRendered, typed: string): Promise<boolean> {
    let added = false

    await act(() => {
      view.result.current.setPhone(typed)
    })

    await act(async () => {
      added = await view.result.current.submit()
    })

    return added
  }
}

describe('useAddMemberViewModel', () => {
  it.each(['', '12345', '5876543210'])('rejects %j without a request', async (typed) => {
    const network = Fakes.stubNetwork({})
    const view = await AddFixtures.setup()

    expect(await AddFixtures.submitNumber(view, typed)).toBe(false)
    expect(view.result.current.error).toBe('errors.invalidPhone')
    expect(network.requests).toHaveLength(0)
  })

  it('adds the typed number as E.164 and invalidates the squad and the list', async () => {
    const network = Fakes.stubNetwork({
      [ADD]: {
        body: { data: SquadFixtures.member('u3'), success: true },
        status: HttpStatus.created,
      },
    })

    const core = TestCore.create()
    const view = await AddFixtures.setup(core)

    expect(await AddFixtures.submitNumber(view, '98765 43210')).toBe(true)
    expect(network.requests[0]?.body).toEqual({ phone: '+919876543210' })
    expect(network.requests).toHaveLength(1)
    expect(SquadFixtures.detailInvalidated(core, 's1')).toBe(true)
    expect(SquadFixtures.listInvalidated(core)).toBe(true)
  })

  it('adds a contact by its E.164 number', async () => {
    const network = Fakes.stubNetwork({
      [ADD]: {
        body: { data: SquadFixtures.member('u3'), success: true },
        status: HttpStatus.created,
      },
    })

    const { result } = await AddFixtures.setup()
    let added = false

    await act(async () => {
      added = await result.current.addNumber('+91 98765 43210')
    })

    expect(added).toBe(true)
    expect(network.requests[0]?.body).toEqual({ phone: '+919876543210' })
  })

  it.each([
    [HttpStatus.notFound, 'not found', 'errors.notOnRoundup'],
    [HttpStatus.conflict, 'user is already a member of this squad: u2', 'errors.alreadyInSquad'],
    [HttpStatus.conflict, 'squad is full: 50 members', 'errors.squadFull'],
    [HttpStatus.internalServerError, 'boom', 'errors.genericWithId'],
  ] as const)(
    'maps a %i saying %j to %s and leaves the cache alone',
    async (status, message, key) => {
      Fakes.stubNetwork({ [ADD]: Fakes.failure(status, message) })

      const core = TestCore.create()
      const view = await AddFixtures.setup(core)

      expect(await AddFixtures.submitNumber(view, '9876543210')).toBe(false)
      expect(view.result.current.error).toBe(key)
      expect(SquadFixtures.detailInvalidated(core, 's1')).toBe(false)
    },
  )

  it('says offline when there is no connection', async () => {
    Fakes.goOffline()

    const view = await AddFixtures.setup()

    await AddFixtures.submitNumber(view, '9876543210')

    expect(view.result.current.error).toBe('errors.offline')
  })
})
