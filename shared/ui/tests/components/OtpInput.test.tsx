import { fireEvent, screen } from '@testing-library/react-native'
import { TextInput } from 'react-native'

import { Countdown, OtpInput } from '../../src/components/OtpInput'
import { Render } from '../helpers/render'

describe('formatCountdown', () => {
  it.each([
    [42, '0:42'],
    [5, '0:05'],
    [60, '1:00'],
    [125, '2:05'],
  ] as const)('formats %i seconds as %s', (seconds, expected) => {
    expect(Countdown.format(seconds)).toBe(expected)
  })
})

describe('OtpInput', () => {
  it('is one field named by its label', async () => {
    await Render.withTheme(<OtpInput label="6-digit code" />)

    expect(screen.getByLabelText('6-digit code')).toBeOnTheScreen()
  })

  it('reports the digits typed', async () => {
    const onChangeText = jest.fn()

    await Render.withTheme(<OtpInput label="6-digit code" onChangeText={onChangeText} />)

    await fireEvent.changeText(screen.getByLabelText('6-digit code'), '482917')

    expect(onChangeText).toHaveBeenCalledWith('482917')
  })

  it('focuses the field on mount when asked, so the keyboard opens', async () => {
    await Render.withTheme(<OtpInput autoFocus label="6-digit code" />)

    expect(screen.getByLabelText('6-digit code')).toHaveProp('autoFocus', true)
  })

  it('focuses the field when the boxes are pressed', async () => {
    const focus = jest.spyOn(TextInput.prototype, 'focus')

    await Render.withTheme(<OtpInput label="6-digit code" value="4" />)

    await fireEvent.press(screen.getByText('4', { includeHiddenElements: true }))

    expect(focus).toHaveBeenCalledTimes(1)

    focus.mockRestore()
  })

  it('shows the countdown while the code cannot be resent', async () => {
    await Render.withTheme(<OtpInput label="6-digit code" resendIn={42} />)

    expect(screen.getByText('0:42')).toBeOnTheScreen()
    expect(screen.queryByRole('link', { name: 'Resend code' })).not.toBeOnTheScreen()
  })

  it('offers Resend code once the countdown ends', async () => {
    const onResend = jest.fn()

    await Render.withTheme(<OtpInput label="6-digit code" onResend={onResend} resendIn={0} />)

    await fireEvent.press(screen.getByRole('link', { name: 'Resend code' }))

    expect(onResend).toHaveBeenCalledTimes(1)
  })

  it('announces an error as an alert', async () => {
    await Render.withTheme(
      <OtpInput error="That code didn't work. Check it and try again." label="6-digit code" />,
    )

    expect(screen.getByRole('alert')).toBeOnTheScreen()
  })
})
