import { act, fireEvent, screen } from '@testing-library/react-native'
import { createRef } from 'react'

import type { IMenuHandle, IMenuItem } from '../../src/components/Menu'

import { Menu } from '../../src/components/Menu'
import { Render } from '../helpers/render'

/**
 * Menu test helpers. Static methods only.
 */
class MenuFixtures {
  /**
   * Builds a rename row and a leave row, recording which ran.
   * @param ran - Where each picked row's label is recorded.
   * @returns The two items, the destructive one first so the Menu has to move it last.
   */
  static items(ran: string[]): IMenuItem[] {
    return [
      {
        destructive: true,
        icon: 'logout',
        label: 'Leave squad',
        /** Records that Leave squad ran. */
        onPress: () => {
          ran.push('leave')
        },
      },
      {
        icon: 'edit',
        label: 'Rename squad',
        /** Records that Rename squad ran. */
        onPress: () => {
          ran.push('rename')
        },
      },
    ]
  }

  /**
   * Renders the menu and presses its ⋯ button.
   * @param ran - Where each picked row's label is recorded.
   * @returns A promise that resolves once the menu is open.
   */
  static async open(ran: string[] = []): Promise<void> {
    await Render.withTheme(<Menu items={MenuFixtures.items(ran)} label="Squad options" />)
    await fireEvent.press(screen.getByRole('button', { name: 'Squad options' }))
  }
}

describe('Menu', () => {
  it('shows only its ⋯ button until pressed', async () => {
    await Render.withTheme(<Menu items={MenuFixtures.items([])} label="Squad options" />)

    expect(screen.getByRole('button', { name: 'Squad options' })).toBeOnTheScreen()
    expect(screen.queryByRole('menuitem')).toBeNull()
  })

  it('opens with its actions as menu items, destructive ones last', async () => {
    await MenuFixtures.open()

    const names = screen
      .getAllByRole('menuitem')
      .map((item) => String(item.props['accessibilityLabel']))

    expect(names).toEqual(['Rename squad', 'Leave squad'])
  })

  it('closes, then runs the action that was picked', async () => {
    const ran: string[] = []

    await MenuFixtures.open(ran)
    await fireEvent.press(screen.getByRole('menuitem', { name: 'Rename squad' }))

    expect(screen.queryByRole('menuitem')).toBeNull()
    expect(ran).toEqual(['rename'])
  })

  it('opens from its handle at an anchor, for a ⋯ button it does not draw', async () => {
    const menu = createRef<IMenuHandle>()

    await Render.withTheme(
      <Menu
        anchor={{ right: 16, top: 100 }}
        items={MenuFixtures.items([])}
        label="Squad options"
        ref={menu}
      />,
    )

    expect(screen.queryByRole('button', { name: 'Squad options' })).toBeNull()

    await act(() => {
      menu.current?.open()
    })

    expect(screen.getAllByRole('menuitem')).toHaveLength(2)
  })
})
