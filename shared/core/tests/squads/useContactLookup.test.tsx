import { act, renderHook } from '@testing-library/react-native'

import type { IContactMatch } from '../../src/squads/types'
import type { IContactLookup } from '../../src/squads/useContactLookup'
import type { ITestCore } from '../helpers/wrapper'

import { useContactLookup } from '../../src/squads/useContactLookup'
import { Fakes } from '../helpers/fakes'
import { SquadFixtures } from '../helpers/squad-fixtures'
import { TestCore } from '../helpers/wrapper'

/** The route looking numbers up. */
const LOOKUP = 'POST /api/v1/users/lookup'

/** The latest value of a hook under test. */
interface ICurrent {
  /** The view model as of the last render. */
  current: IContactLookup
}

/** What renderHook hands back for this view model. */
interface IRendered {
  /** Holds the latest view model. */
  result: ICurrent
}

/**
 * Contact lookup test helpers. Static methods only.
 */
class LookupFixtures {
  /**
   * Renders the view model for squad s1, whose members are u1 and u2.
   * @param core - The fakes to render in.
   * @returns The view hook.
   */
  static setup(core: ITestCore = TestCore.create()): Promise<IRendered> {
    SquadFixtures.seedDetail(core, SquadFixtures.detail('s1'))

    return renderHook(() => useContactLookup('s1'), { wrapper: core.wrapper })
  }

  /**
   * Builds a user the lookup found.
   * @param id - Which user; the name is built from it.
   * @param phone - Their number.
   * @param avatarURL - Their photo URL.
   * @returns The user as the API sends it.
   */
  static user(id: string, phone: string, avatarURL = ''): Record<string, string> {
    return { avatarURL, id, name: `Name ${id}`, phone }
  }

  /**
   * Builds valid, distinct Indian mobile numbers.
   * @param count - How many.
   * @returns The numbers in E.164.
   */
  static numbers(count: number): string[] {
    return Array.from({ length: count }, (_, index) => `+91${9_000_000_000 + index}`)
  }

  /**
   * Runs a lookup.
   * @param view - The view hook.
   * @param numbers - The numbers to look up.
   * @returns What the lookup resolved.
   */
  static async lookup(view: IRendered, numbers: string[]): Promise<IContactMatch[] | undefined> {
    let found: IContactMatch[] | undefined

    await act(async () => {
      found = await view.result.current.lookup(numbers)
    })

    return found
  }
}

describe('useContactLookup', () => {
  it('returns the people on Roundup, leaving out squad members and invalid numbers', async () => {
    const network = Fakes.stubNetwork({
      [LOOKUP]: Fakes.ok({
        users: [
          LookupFixtures.user('u2', '+919876543210'),
          LookupFixtures.user('u5', '+919876543211', 'https://img/u5.png'),
          LookupFixtures.user('u6', '+919876543212'),
        ],
      }),
    })

    const view = await LookupFixtures.setup()

    const found = await LookupFixtures.lookup(view, [
      '98765 43210',
      '+91 98765 43211',
      '+919876543212',
      'abc',
      '12345',
    ])

    expect(network.requests[0]?.body).toEqual({
      phones: ['+919876543210', '+919876543211', '+919876543212'],
    })

    expect(found).toEqual([
      { id: 'u5', name: 'Name u5', phone: '+919876543211', src: 'https://img/u5.png' },
      { id: 'u6', name: 'Name u6', phone: '+919876543212' },
    ])
  })

  it('sends repeated numbers once', async () => {
    const network = Fakes.stubNetwork({ [LOOKUP]: Fakes.ok({ users: [] }) })
    const view = await LookupFixtures.setup()

    await LookupFixtures.lookup(view, ['9876543210', '+919876543210', '98765-43210'])

    expect(network.requests[0]?.body).toEqual({ phones: ['+919876543210'] })
  })

  it('asks in batches of 500 and merges the answers', async () => {
    const network = Fakes.stubNetwork({ [LOOKUP]: Fakes.ok({ users: [] }) })
    const view = await LookupFixtures.setup()
    const numbers = LookupFixtures.numbers(1201)

    await LookupFixtures.lookup(view, numbers)

    const sizes = network.requests.map(
      (request) =>
        (
          request.body as {
            /**
             *
             */
            phones: string[]
          }
        ).phones.length,
    )

    expect(sizes).toEqual([500, 500, 201])
  })

  it('merges the people found in every batch', async () => {
    const network = Fakes.stubNetwork({
      [LOOKUP]: Fakes.ok({ users: [LookupFixtures.user('u5', '+919000000000')] }),
    })

    const view = await LookupFixtures.setup()

    const found = await LookupFixtures.lookup(view, LookupFixtures.numbers(501))

    expect(found).toHaveLength(2)
    expect(network.requests).toHaveLength(2)
  })

  it('sends no request when no number is valid', async () => {
    const network = Fakes.stubNetwork({})
    const view = await LookupFixtures.setup()

    expect(await LookupFixtures.lookup(view, ['abc', '123'])).toEqual([])
    expect(network.requests).toHaveLength(0)
  })

  it('shows the request id of a server failure', async () => {
    Fakes.stubNetwork({ [LOOKUP]: Fakes.failure(500, 'boom') })

    const view = await LookupFixtures.setup()

    expect(await LookupFixtures.lookup(view, ['9876543210'])).toBeUndefined()
    expect(view.result.current.error).toBe('errors.genericWithId')
    expect(view.result.current.requestId).toBe('req-1')
  })

  it('says offline when there is no connection', async () => {
    Fakes.goOffline()

    const view = await LookupFixtures.setup()

    await LookupFixtures.lookup(view, ['9876543210'])

    expect(view.result.current.error).toBe('errors.offline')
  })
})
