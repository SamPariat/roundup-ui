import { fireEvent, screen } from '@testing-library/react-native'

import { Button } from '../../src/components/Button.tsx'
import { renderWithTheme } from '../helpers/render.tsx'

describe('Button', () => {
  it('is a button named by its text', async () => {
    await renderWithTheme(<Button>Create squad</Button>)

    expect(screen.getByRole('button', { name: 'Create squad' })).toBeEnabled()
  })

  it('calls onPress when pressed', async () => {
    const onPress = jest.fn()

    await renderWithTheme(<Button onPress={onPress}>Add member</Button>)

    await fireEvent.press(screen.getByRole('button', { name: 'Add member' }))

    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('is named by its label when it only has an icon', async () => {
    await renderWithTheme(<Button icon="close" label="Close" />)

    expect(screen.getByRole('button', { name: 'Close' })).toBeOnTheScreen()
  })

  it('does not fire when disabled', async () => {
    const onPress = jest.fn()

    await renderWithTheme(
      <Button disabled onPress={onPress}>
        Leave
      </Button>,
    )

    await fireEvent.press(screen.getByRole('button', { name: 'Leave' }))

    expect(screen.getByRole('button', { name: 'Leave' })).toBeDisabled()
    expect(onPress).not.toHaveBeenCalled()
  })

  it('is busy, disabled and announces its loading label while loading', async () => {
    const onPress = jest.fn()

    await renderWithTheme(
      <Button loading loadingLabel="Sending code…" onPress={onPress}>
        Send code
      </Button>,
    )

    const button = screen.getByRole('button', { name: 'Send code' })

    await fireEvent.press(button)

    expect(button).toBeBusy()
    expect(button).toBeDisabled()
    expect(screen.getByText('Sending code…')).toBeOnTheScreen()
    expect(onPress).not.toHaveBeenCalled()
  })
})
