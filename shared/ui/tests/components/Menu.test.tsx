import { fireEvent, screen } from '@testing-library/react-native'

import type { IMenuItem } from '../../src/components/Menu'

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
}

describe('Menu', () => {
  it('draws nothing while closed', async () => {
    await Render.withTheme(
      <Menu
        items={MenuFixtures.items([])}
        label="Squad options"
        onClose={jest.fn()}
        visible={false}
      />,
    )

    expect(screen.queryByLabelText('Squad options')).toBeNull()
  })

  it('lists its actions as menu items, destructive ones last', async () => {
    await Render.withTheme(
      <Menu items={MenuFixtures.items([])} label="Squad options" onClose={jest.fn()} visible />,
    )

    expect(screen.getByLabelText('Squad options')).toHaveProp('role', 'menu')

    const names = screen
      .getAllByRole('menuitem')
      .map((item) => String(item.props['accessibilityLabel']))

    expect(names).toEqual(['Rename squad', 'Leave squad'])
  })

  it('closes, then runs the action that was picked', async () => {
    const ran: string[] = []
    const onClose = jest.fn()

    await Render.withTheme(
      <Menu items={MenuFixtures.items(ran)} label="Squad options" onClose={onClose} visible />,
    )

    await fireEvent.press(screen.getByRole('menuitem', { name: 'Rename squad' }))

    expect(onClose).toHaveBeenCalledTimes(1)
    expect(ran).toEqual(['rename'])
  })
})
