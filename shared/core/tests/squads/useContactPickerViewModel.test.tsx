import { act, renderHook, waitFor } from '@testing-library/react-native'

import { HttpStatus } from '@roundup/api'

import type { IContactPickerViewModel } from '../../src/squads/useContactPickerViewModel'

import { useContactPickerViewModel } from '../../src/squads/useContactPickerViewModel'
import { FakeContacts, Fakes } from '../helpers/fakes'
import { SquadFixtures } from '../helpers/squad-fixtures'
import { TestCore } from '../helpers/wrapper'

/** The route looking numbers up. */
const LOOKUP = 'POST /api/v1/users/lookup'

/** The route adding a member to squad s1. */
const ADD = 'POST /api/v1/squads/s1/members'

/** The latest value of the hook under test. */
interface IRendered {
  /** Holds the latest view model. */
  result: {
    /** The view model as of the last render. */
    current: IContactPickerViewModel
  }
}

/**
 * Contact picker test helpers. Static methods only.
 */
class PickerFixtures {
  /**
   * Renders the picker for squad s1 with a fake address book.
   * @param contacts - The fake address book.
   * @returns The rendered hook.
   */
  static setup(contacts: FakeContacts): Promise<IRendered> {
    const core = TestCore.create({ contacts })

    SquadFixtures.seedDetail(core, SquadFixtures.detail('s1'))

    return renderHook(() => useContactPickerViewModel('s1'), { wrapper: core.wrapper })
  }

  /**
   * Builds a user the lookup found.
   * @param id - Which user.
   * @param phone - Their number.
   * @returns The user as the API sends it.
   */
  static user(id: string, phone: string): Record<string, string> {
    return { avatarURL: '', id, name: `Name ${id}`, phone }
  }
}

describe('useContactPickerViewModel', () => {
  it('asks for access, reads the numbers and lists the people on Roundup', async () => {
    const contacts = new FakeContacts('granted', ['98765 43210', '98765 43211'])

    Fakes.stubNetwork({
      [LOOKUP]: Fakes.ok({
        users: [
          PickerFixtures.user('u5', '+919876543210'),
          PickerFixtures.user('u6', '+919876543211'),
        ],
      }),
    })

    const view = await PickerFixtures.setup(contacts)

    await waitFor(() => {
      expect(view.result.current.phase).toBe('ready')
    })

    expect(contacts.asked).toBe(1)
    expect(view.result.current.people.map((person) => person.id)).toEqual(['u5', 'u6'])
  })

  it('reads no numbers and looks nobody up when access is denied', async () => {
    const contacts = new FakeContacts('denied', ['98765 43210'])
    const network = Fakes.stubNetwork({})
    const view = await PickerFixtures.setup(contacts)

    await waitFor(() => {
      expect(view.result.current.phase).toBe('denied')
    })

    expect(contacts.reads).toBe(0)
    expect(network.requests).toEqual([])
  })

  it('narrows the people by the search text', async () => {
    Fakes.stubNetwork({
      [LOOKUP]: Fakes.ok({
        users: [
          PickerFixtures.user('u5', '+919876543210'),
          PickerFixtures.user('u6', '+919876543211'),
        ],
      }),
    })

    const view = await PickerFixtures.setup(new FakeContacts('granted', ['9876543210']))

    await waitFor(() => {
      expect(view.result.current.phase).toBe('ready')
    })

    await act(() => {
      view.result.current.setQuery('u6')
    })

    expect(view.result.current.people.map((person) => person.id)).toEqual(['u6'])
  })

  it('adds everyone ticked and drops them from the list', async () => {
    const network = Fakes.stubNetwork({
      [ADD]: Fakes.empty(HttpStatus.noContent),
      [LOOKUP]: Fakes.ok({
        users: [
          PickerFixtures.user('u5', '+919876543210'),
          PickerFixtures.user('u6', '+919876543211'),
        ],
      }),
      'GET /api/v1/squads/s1': Fakes.ok(SquadFixtures.detail('s1')),
      'GET /api/v1/squads?limit=25': Fakes.ok(SquadFixtures.page([])),
    })

    const view = await PickerFixtures.setup(new FakeContacts('granted', ['9876543210']))

    await waitFor(() => {
      expect(view.result.current.phase).toBe('ready')
    })

    await act(() => {
      view.result.current.toggle('u5')
    })

    expect(view.result.current.isPicked('u5')).toBe(true)
    expect(view.result.current.pickedCount).toBe(1)

    let added = false

    await act(async () => {
      added = await view.result.current.add()
    })

    expect(added).toBe(true)

    expect(
      network.requests.filter((request) => request.path === '/api/v1/squads/s1/members'),
    ).toHaveLength(1)

    expect(view.result.current.people.map((person) => person.id)).toEqual(['u6'])
    expect(view.result.current.pickedCount).toBe(0)
  })
})
