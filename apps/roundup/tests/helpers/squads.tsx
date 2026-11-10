import type { ComponentType, ReactElement } from 'react'

import { Stack } from 'expo-router'
import { fireEvent, screen } from 'expo-router/testing-library'

import type { IContactsSource, TContactsPermission } from '@roundup/core'

import type { IBackend } from './fakes'
import type { IStubMember, IStubSquad } from './squad-backend'

import { Render } from './render'
import SquadScreen from '@/app/(tabs)/squads/[squadId]'
import SquadsScreen from '@/app/(tabs)/squads/index'
import { AddPeopleModal } from '@/components/squads/AddPeopleModal.web'

/**
 * The squads stack of a test: the same screens as the app, in a Stack so going back and
 * dismissing to the list work as they do there, without headers.
 * @returns A headerless stack.
 */
const SquadsStack = (): ReactElement => <Stack screenOptions={{ headerShown: false }} />

/**
 * Squad test helpers. Static methods only.
 */
export class SquadsFixtures {
  /**
   * The signed-in person as a member.
   * @param role - Their role.
   * @returns The member, ID u1.
   */
  static me(role: IStubMember['role'] = 'ADMIN'): IStubMember {
    return { id: 'u1', name: 'Asha Rao', role }
  }

  /**
   * Another person as a member.
   * @param id - Their user ID.
   * @param name - Their name.
   * @param role - Their role.
   * @returns The member with that role.
   */
  static member(id: string, name: string, role: IStubMember['role'] = 'MEMBER'): IStubMember {
    return { id, name, role }
  }

  /**
   * A squad with the signed-in person and two others.
   * @param id - Goes in the squad's path.
   * @param name - Shown on its card and page.
   * @param role - The signed-in person's role in it.
   * @returns The squad, with Meera Iyer (a member) and Kabir Rao (an admin) beside them.
   */
  static squad(id: string, name: string, role: IStubMember['role'] = 'ADMIN'): IStubSquad {
    return {
      id,
      members: [
        SquadsFixtures.me(role),
        SquadsFixtures.member('u2', 'Meera Iyer'),
        SquadsFixtures.member('u3', 'Kabir Rao', 'ADMIN'),
      ],
      name,
    }
  }

  /**
   * A backend signed in as Asha Rao with the squads given.
   * @param squads - The squads on the "server".
   * @returns A backend that answers the squad routes from those squads.
   */
  static backend(squads: IStubSquad[]): IBackend {
    return { paths: [], squads, user: { name: 'Asha Rao' } }
  }

  /**
   * A contacts source whose answer and numbers the test chooses.
   * @param permission - What the person answers when asked for access.
   * @param numbers - The numbers in the "address book".
   * @returns The source, whose calls Jest records.
   */
  static contacts(permission: TContactsPermission, numbers: string[] = []): IContactsSource {
    return {
      phoneNumbers: jest.fn(() => Promise.resolve(numbers)),
      requestPermission: jest.fn(() => Promise.resolve(permission)),
    }
  }

  /**
   * Presses the floating New squad button.
   * @returns A promise that resolves once the press is handled.
   */
  static async pressNewSquad(): Promise<void> {
    await fireEvent.press(await screen.findByRole('button', { name: 'New squad' }))
  }

  /**
   * A page that shows the web Add people dialog for squad s1, to render as a route.
   * @param onClose - Called when the dialog asks to close.
   * @returns The page component.
   */
  static webAddPeople(onClose: () => void): ComponentType {
    /**
     * The route that shows the dialog.
     * @returns The web Add people dialog.
     */
    const Page = (): ReactElement => (
      <AddPeopleModal onClose={onClose} squadId="s1" squadName="Friday crew" />
    )

    return Page
  }

  /**
   * Opens the app at a squads route, signed in.
   * @param backend - What the stubbed backend answers.
   * @param url - Where the app opens.
   * @param contacts - The fake contacts source, if the test reads contacts.
   * @returns A promise that resolves once it has rendered.
   */
  static open(backend: IBackend, url: string, contacts?: IContactsSource): Promise<void> {
    return Render.app(
      {
        'squads/[squadId]': SquadScreen,
        'squads/_layout': SquadsStack,
        'squads/index': SquadsScreen,
      },
      { backend, saved: 'r1', url, ...(contacts === undefined ? {} : { contacts }) },
    )
  }
}
