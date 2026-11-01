import { fireEvent, screen } from '@testing-library/react-native'
import { Text } from 'react-native'

import { useTheme } from '@roundup/ui'

import { Toolbar } from '../../src/components/Toolbar.tsx'
import { renderInCatalog } from '../helpers/render.tsx'

/**
 * Prints the chosen theme preference, so a test can see the toolbar change it.
 * @returns The preference as text.
 */
const Preference = () => <Text>{`preference: ${useTheme().preference}`}</Text>

describe('Toolbar', () => {
  it('switches the theme', async () => {
    await renderInCatalog(
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
    await renderInCatalog(<Toolbar />)

    expect(screen.queryByRole('button', { name: '360' })).not.toBeOnTheScreen()
  })
})
