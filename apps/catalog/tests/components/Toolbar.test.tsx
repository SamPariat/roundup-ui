import { fireEvent, screen } from '@testing-library/react-native'
import { Text } from 'react-native'

import { useTheme } from '@roundup/ui'

import { Toolbar } from '../../src/components/Toolbar'
import { RenderHelper } from '../helpers/render'

/**
 * Prints the chosen theme preference, so a test can see the toolbar change it.
 * @returns The preference as text.
 */
const Preference = () => <Text>{`preference: ${useTheme().preference}`}</Text>

describe('Toolbar', () => {
  it('switches the theme', async () => {
    await RenderHelper.inCatalog(
      <>
        <Toolbar />
        <Preference />
      </>,
    )

    expect(screen.getByText('preference: system')).toBeOnTheScreen()

    await fireEvent.press(screen.getByRole('radio', { name: /light/i }))

    expect(screen.getByText('preference: light')).toBeOnTheScreen()
  })

  it('leaves the preview width to the web, where windows can be resized', async () => {
    await RenderHelper.inCatalog(<Toolbar />)

    expect(screen.queryByRole('button', { name: '360' })).not.toBeOnTheScreen()
  })
})
