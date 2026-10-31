import { fireEvent, screen } from '@testing-library/react-native'

import { Toast } from '../../src/components/Toast.tsx'
import { renderWithTheme } from '../helpers/render.tsx'

describe('Toast', () => {
  it('is a status message by default', async () => {
    await renderWithTheme(<Toast tone="success">Squad saved</Toast>)

    expect(screen.getByRole('status')).toHaveTextContent('Squad saved')
  })

  it('is an alert for errors so it interrupts', async () => {
    await renderWithTheme(<Toast tone="error">That code didn&apos;t work.</Toast>)

    expect(screen.getByRole('alert')).toBeOnTheScreen()
  })

  it('offers its action as a button', async () => {
    const onAction = jest.fn()

    await renderWithTheme(
      <Toast action="Undo" onAction={onAction}>
        Removed Meera
      </Toast>,
    )

    await fireEvent.press(screen.getByRole('button', { name: 'Undo' }))

    expect(onAction).toHaveBeenCalledTimes(1)
  })
})
